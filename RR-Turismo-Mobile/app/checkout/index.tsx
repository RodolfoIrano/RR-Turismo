// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de CHECKOUT (finalizar a reserva), redesenhada: limpa e
// moderna, com as informações ESCONDIDAS até a pessoa precisar.
//
//   - Resumo da viagem sempre no topo;
//   - "Seus dados": seção que abre/fecha;
//   - "Forma de pagamento" (estilo lojas online): lista com PIX (QR Code
//     + copia e cola), Cartão de crédito, Cartão de débito e Boleto.
//     Só depois de escolher aparece o que a forma precisa: QR Code,
//     formulário do cartão com a BANDEIRA (Visa, Mastercard, Elo...),
//     cartões salvos, parcelas (só no crédito) ou o código do boleto;
//   - "Tem um cupom?": um link discreto que abre o campo do cupom;
//   - Barra fixa embaixo com o total e o botão de finalizar.
//
// LOGIN: quem não está logado é levado ao login ao entrar aqui e
// volta direto para o checkout depois de entrar.
//
// Ao confirmar, o app também mostra uma NOTIFICAÇÃO de compra confirmada
// (services/notificacaoService.ts) - se o aparelho não permitir, a compra
// segue normalmente.
//
// O pagamento continua SIMULADO (não há gateway real); todo o resto
// (cartões salvos, parcelas, cupom SOAP, criação das reservas) é real.
// ============================================================
import { Mascara } from "../../utils/mascaras";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Switch, ActivityIndicator,
  KeyboardAvoidingView, Platform, Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Text, TextInput } from "../../components/TextoTraduzido";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { shadows } from "../../constants/shadows";
import Input from "../../components/Input";
import SecaoRecolhivel from "../../components/SecaoRecolhivel";
import BarraDeTotal from "../../components/BarraDeTotal";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTraducao } from "../../traducoes/TraducaoContext";
import { CheckoutCard, CheckoutCustomer, SavedCard, InstallmentOption, MetodoDePagamento } from "../../types";
import QrCodePix from "../../components/QrCodePix";
import { gerarPixCopiaECola, gerarLinhaDigitavelBoleto, vencimentoDoBoleto, DIAS_BOLETO } from "../../services/pixService";
import { avisarCompraConfirmada, agendarLembreteDaViagem } from "../../services/notificacaoService";
import * as paymentService from "../../services/paymentService";
import * as bookingService from "../../services/bookingService";
import * as cartaoService from "../../services/cartaoService";
import { calcularDesconto, ResultadoDesconto } from "../../services/descontoService";
import { calcularOpcoesDeParcelamento, formatarMoeda } from "../../services/installmentService";
import {
  detectarBandeira,
  formatarNumeroCartao,
  NOME_BANDEIRA,
  COR_BANDEIRA,
  BANDEIRAS_DE_ESCOLHA,
  CardBrand,
} from "../../services/cardBrandService";

type PaymentMethod = MetodoDePagamento;
type SecaoAberta = "dados" | "pagamento" | null;

export default function Checkout() {
  const router = useRouter();
  const { t } = useTraducao();
  const { items, getTripForItem, total, clearCart } = useCart();
  const { user, isAuthenticated, restaurandoSessao } = useAuth();

  // ----------------------------------------------------------
  // LOGIN SÓ AQUI: visitante que chega ao checkout é levado ao
  // login (e volta para cá depois de entrar ou criar a conta).
  // ----------------------------------------------------------
  useEffect(() => {
    if (!restaurandoSessao && !isAuthenticated) {
      router.replace({ pathname: "/(auth)/login", params: { retornarPara: "/checkout" } });
    }
  }, [restaurandoSessao, isAuthenticated, router]);

  // ----------------------------------------------------------
  // SEÇÕES ABERTAS (só uma por vez) E CUPOM
  // ----------------------------------------------------------
  const [secaoAberta, setSecaoAberta] = useState<SecaoAberta>("dados");
  const alternar = (secao: Exclude<SecaoAberta, null>) =>
    setSecaoAberta((atual) => (atual === secao ? null : secao));

  // ----------------------------------------------------------
  // CUPOM DE DESCONTO (calculado pelo serviço SOAP no backend)
  // ----------------------------------------------------------
  const [cupomAberto, setCupomAberto] = useState(false);
  const [percentualCupom, setPercentualCupom] = useState("");
  const [aplicandoCupom, setAplicandoCupom] = useState(false);
  const [descontoAplicado, setDescontoAplicado] = useState<ResultadoDesconto | null>(null);
  const [erroCupom, setErroCupom] = useState<string | null>(null);

  const totalFinal = descontoAplicado ? descontoAplicado.precoComDescontoCentavos / 100 : total;

  async function handleAplicarCupom() {
    const percentual = Number(percentualCupom);
    if (!percentualCupom || Number.isNaN(percentual) || percentual <= 0 || percentual > 100) {
      setErroCupom("Digite um percentual válido, entre 1 e 100.");
      return;
    }
    setErroCupom(null);
    setAplicandoCupom(true);
    try {
      setDescontoAplicado(await calcularDesconto(total, percentual));
    } catch {
      setErroCupom("Não foi possível aplicar o desconto agora. Tente novamente.");
    } finally {
      setAplicandoCupom(false);
    }
  }

  function handleRemoverCupom() {
    setDescontoAplicado(null);
    setPercentualCupom("");
    setErroCupom(null);
  }

  // ----------------------------------------------------------
  // DADOS DO CLIENTE (pré-preenchidos com a conta, quando houver)
  // ----------------------------------------------------------
  const [customer, setCustomer] = useState<CheckoutCustomer>({ name: "", email: "", cpf: "", phone: "" });

  useEffect(() => {
    if (user) {
      setCustomer((atual) => ({
        ...atual,
        name: atual.name || user.name || "",
        email: atual.email || user.email || "",
      }));
    }
  }, [user]);

  const dadosValidos = paymentService.validateCustomer(customer) === null;

  // ----------------------------------------------------------
  // PAGAMENTO: método, cartões salvos, cartão novo, parcelas
  // ----------------------------------------------------------
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cartoesSalvos, setCartoesSalvos] = useState<SavedCard[]>([]);
  const [carregandoCartoes, setCarregandoCartoes] = useState(true);
  const [cartaoSelecionadoId, setCartaoSelecionadoId] = useState<string | null>(null);
  const [mostrarFormularioNovoCartao, setMostrarFormularioNovoCartao] = useState(false);
  const [salvarNovoCartao, setSalvarNovoCartao] = useState(true);

  const carregarCartoesSalvos = useCallback(async () => {
    setCarregandoCartoes(true);
    try {
      const cartoes = await cartaoService.listarCartoesSalvos();
      setCartoesSalvos(cartoes);
      if (cartoes.length > 0) setCartaoSelecionadoId((atual) => atual ?? cartoes[0].id);
    } catch {
      setCartoesSalvos([]);
    } finally {
      setCarregandoCartoes(false);
    }
  }, []);

  useEffect(() => {
    carregarCartoesSalvos();
  }, [carregarCartoesSalvos]);

  const [card, setCard] = useState<CheckoutCard>({ number: "", name: "", expiry: "", cvv: "" });
  const bandeiraDetectada = detectarBandeira(card.number);

  // Bandeira escolhida nos botões. Ao digitar o número, o app já marca a certa
  // (e a pessoa pode trocar).
  const [bandeiraEscolhida, setBandeiraEscolhida] = useState<CardBrand | null>(null);
  useEffect(() => {
    if (bandeiraDetectada !== "unknown") setBandeiraEscolhida(bandeiraDetectada);
  }, [bandeiraDetectada]);
  const bandeiraDoVisual: CardBrand = bandeiraEscolhida ?? bandeiraDetectada;

  const opcoesDeParcelamento: InstallmentOption[] = calcularOpcoesDeParcelamento(totalFinal);
  const [parcelasEscolhidas, setParcelasEscolhidas] = useState(1);
  const opcaoEscolhida =
    opcoesDeParcelamento.find((o) => o.installments === parcelasEscolhidas) ?? opcoesDeParcelamento[0];

  // Cartão novo é usado se não há salvos OU se a pessoa abriu o formulário.
  const ehCartao = method === "credit_card" || method === "debit_card";
  const ehDebito = method === "debit_card";
  const usandoCartaoNovo = ehCartao && (mostrarFormularioNovoCartao || cartoesSalvos.length === 0);

  // Códigos de TESTE do Pix e do boleto (mudam só quando o total muda).
  const pixCopiaECola = useMemo(() => gerarPixCopiaECola(totalFinal), [totalFinal]);
  const boletoCodigo = useMemo(() => gerarLinhaDigitavelBoleto(totalFinal), [totalFinal]);
  const [copiado, setCopiado] = useState<string | null>(null);

  async function copiar(texto: string, qual: string) {
    try {
      await Clipboard.setStringAsync(texto);
    } catch {
      // Sem área de transferência: abre o "Compartilhar" para a pessoa copiar de lá.
      await Share.share({ message: texto }).catch(() => {});
    }
    setCopiado(qual);
    setTimeout(() => setCopiado(null), 1800);
  }

  // Resumo mostrado na seção fechada.
  const cartaoEscolhido = cartoesSalvos.find((c) => c.id === cartaoSelecionadoId);
  const nomeDoCartao = ehDebito ? "Cartão de débito" : t.checkout.cartaoCredito;
  const resumoPagamento =
    method === "pix"
      ? t.checkout.pix
      : method === "boleto"
      ? "Boleto bancário"
      : ehCartao
      ? usandoCartaoNovo
        ? ehDebito
          ? `${nomeDoCartao} • à vista`
          : `${nomeDoCartao} • ${opcaoEscolhida.installments}x`
        : `${nomeDoCartao} •••• ${cartaoEscolhido?.lastDigits ?? ""}`
      : "Escolha como pagar";

  // ----------------------------------------------------------
  // FINALIZAÇÃO DA RESERVA
  // ----------------------------------------------------------
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalPessoas = items.reduce((soma, i) => soma + i.quantity, 0);
  const primeiraViagem = items[0] ? getTripForItem(items[0].tripId) : undefined;

  // Texto do comprovante: "Cartão de débito Visa final 1111", "Pix", "Boleto"...
  function descricaoDoPagamento(): string {
    if (method === "pix") return "Pix";
    if (method === "boleto") return "Boleto";
    const bandeira = NOME_BANDEIRA[bandeiraDoVisual];
    const final4 = usandoCartaoNovo ? card.number.replace(/\D/g, "").slice(-4) : cartaoEscolhido?.lastDigits ?? "";
    const parcelas = method === "credit_card" && usandoCartaoNovo && opcaoEscolhida.installments > 1
      ? ` em ${opcaoEscolhida.installments}x` : "";
    return `${nomeDoCartao} ${bandeira} final ${final4}${parcelas}`;
  }

  async function handleFinish() {
    if (!isAuthenticated || !user) {
      router.replace({ pathname: "/(auth)/login", params: { retornarPara: "/checkout" } });
      return;
    }

    setError(null);

    const erroCliente = paymentService.validateCustomer(customer);
    if (erroCliente) {
      setSecaoAberta("dados");
      setError(erroCliente);
      return;
    }

    if (!method) {
      setSecaoAberta("pagamento");
      setError("Escolha a forma de pagamento.");
      return;
    }

    if (usandoCartaoNovo) {
      const erroCartao = paymentService.validateCard(card, bandeiraEscolhida);
      if (erroCartao) {
        setSecaoAberta("pagamento");
        setError(erroCartao);
        return;
      }
    } else if (ehCartao && !cartaoSelecionadoId) {
      setSecaoAberta("pagamento");
      setError("Selecione um cartão ou cadastre um novo.");
      return;
    }

    if (items.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    setLoading(true);
    try {
      // Guarda o cartão novo (só token, bandeira e últimos dígitos - nunca o número completo).
      if (usandoCartaoNovo && salvarNovoCartao) {
        try {
          await cartaoService.salvarCartao(card);
        } catch {
          // Não conseguir salvar o cartão não impede a compra.
        }
      }

      // Pagamento simulado (ainda sem gateway real).
      const idPrincipal = await bookingService.generateBookingId(user.id);
      const pagamento = await paymentService.processPayment(idPrincipal, method, totalFinal);
      if (pagamento.status !== "approved") {
        setError("Pagamento não aprovado. Verifique os dados e tente novamente.");
        return;
      }

      // Uma reserva POR viagem do carrinho. O desconto (se houver) é
      // repartido proporcionalmente entre elas.
      const fator = total > 0 ? totalFinal / total : 1;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const viagem = getTripForItem(item.tripId);
        if (!viagem) continue;
        await bookingService.createBooking(user.id, {
          id: i === 0 ? idPrincipal : await bookingService.generateBookingId(user.id),
          userId: user.id,
          tripId: viagem.id,
          guideId: viagem.guideId,
          people: item.quantity,
          date: new Date().toISOString(),
          dataIda: viagem.dataIda,
          dataVolta: viagem.dataVolta,
          total: viagem.price * item.quantity * fator,
          status: "Confirmada",
          paymentMethod: method,
          paymentLabel: descricaoDoPagamento(),
          installments: method === "credit_card" ? (usandoCartaoNovo ? opcaoEscolhida.installments : 1) : 1,
        });
      }

      clearCart();
      // Notificações (nunca atrapalham a compra se falharem).
      avisarCompraConfirmada(idPrincipal, items.map((i) => getTripForItem(i.tripId)?.title ?? "Viagem"));
      items.forEach((i) => {
        const v = getTripForItem(i.tripId);
        if (v) agendarLembreteDaViagem(v.title, v.dataIda);
      });
      router.replace({ pathname: "/booking/success", params: { bookingId: idPrincipal, tripId: items[0]?.tripId } });
    } catch {
      setError("Não foi possível concluir sua reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------
  // TELA
  // ----------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: true, title: t.checkout.titulo }} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">

          {/* ---------- Aviso: pagamento de teste ---------- */}
          <View style={styles.avisoTeste}>
            <Ionicons name="flask-outline" size={18} color="#8A6D00" />
            <Text style={styles.avisoTesteTexto}>
              Ambiente de teste: nenhuma cobrança real é feita e os dados do cartão não são guardados.
            </Text>
          </View>

          {/* ---------- Revise sua compra (todas as viagens do carrinho) ---------- */}
          <View style={styles.resumo}>
            <Text style={styles.resumoTitulo}>Revise sua compra</Text>
            {items.map((item) => {
              const viagem = getTripForItem(item.tripId);
              if (!viagem) return null;
              return (
                <View key={item.tripId} style={styles.resumoLinha}>
                  <Image source={{ uri: viagem.images[0] }} style={styles.resumoImagem} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resumoNome} numberOfLines={2}>{viagem.title}</Text>
                    <Text style={typography.caption} numberOfLines={1}>{viagem.location}</Text>
                    <Text style={styles.resumoPessoas}>
                      {item.quantity} {item.quantity === 1 ? "pessoa" : "pessoas"} × {formatarMoeda(viagem.price)}
                    </Text>
                  </View>
                  <Text style={styles.resumoSubtotal}>{formatarMoeda(viagem.price * item.quantity)}</Text>
                </View>
              );
            })}
          </View>

          {/* ---------- Seus dados ---------- */}
          <SecaoRecolhivel
            icone="person-outline"
            titulo={t.checkout.dadosCliente}
            resumo={dadosValidos ? customer.name : "Preencha seus dados"}
            concluida={dadosValidos}
            aberta={secaoAberta === "dados"}
            aoAlternar={() => alternar("dados")}
          >
            <Input label={t.checkout.nome} placeholder="Seu nome completo" value={customer.name}
              onChangeText={(v) => setCustomer({ ...customer, name: v })} />
            <Input label={t.autenticacao.email} placeholder="seuemail@exemplo.com" keyboardType="email-address"
              autoCapitalize="none" value={customer.email}
              onChangeText={(v) => setCustomer({ ...customer, email: v })} />
            <Input label="CPF" placeholder="000.000.000-00" keyboardType="numeric" maxLength={14}
              value={customer.cpf}
              onChangeText={(v) => setCustomer({ ...customer, cpf: Mascara.cpf(v) })} />
            <Input label={t.checkout.telefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" maxLength={15}
              value={customer.phone} onChangeText={(v) => setCustomer({ ...customer, phone: Mascara.telefone(v) })} />
          </SecaoRecolhivel>

          {/* ---------- Forma de pagamento ---------- */}
          <SecaoRecolhivel
            icone="card-outline"
            titulo={t.checkout.formaPagamento}
            resumo={resumoPagamento}
            concluida={method !== null}
            aberta={secaoAberta === "pagamento"}
            aoAlternar={() => alternar("pagamento")}
          >
            {/* Lista de formas de pagamento (uma por linha). O conteúdo só aparece depois de escolher. */}
            <View style={styles.metodos}>
              <OpcaoDePagamento icone="flash" rotulo="Pix" detalhe="Aprovação na hora" selo="Recomendado"
                ativa={method === "pix"} aoPressionar={() => setMethod("pix")} />
              <OpcaoDePagamento icone="card" rotulo={t.checkout.cartaoCredito} detalhe="Até 6x sem juros"
                ativa={method === "credit_card"} aoPressionar={() => setMethod("credit_card")} />
              <OpcaoDePagamento icone="card-outline" rotulo="Cartão de débito" detalhe="À vista, sai da conta na hora"
                ativa={method === "debit_card"} aoPressionar={() => setMethod("debit_card")} />
              <OpcaoDePagamento icone="barcode-outline" rotulo="Boleto" detalhe={`Vence em ${DIAS_BOLETO} dias`}
                ativa={method === "boleto"} aoPressionar={() => setMethod("boleto")} />
            </View>

            {method === "pix" && (
              <View style={styles.painelPix}>
                <Text style={styles.painelTitulo}>Pague com Pix</Text>
                <View style={{ alignItems: "center", marginVertical: spacing.md }}>
                  <QrCodePix texto={pixCopiaECola} tamanho={200} />
                </View>
                <Text style={styles.passo}>1. Abra o app do seu banco e escolha Pix.</Text>
                <Text style={styles.passo}>2. Escaneie o QR Code ou use o Pix copia e cola.</Text>
                <Text style={styles.passo}>3. Confira o valor de {formatarMoeda(totalFinal)} e confirme.</Text>

                <Text style={[styles.subtitulo, { marginTop: spacing.md }]}>Pix copia e cola</Text>
                <View style={styles.codigoCaixa}>
                  <Text style={styles.codigoTexto} numberOfLines={2} selectable>{pixCopiaECola}</Text>
                </View>
                <TouchableOpacity style={styles.botaoCopiar} onPress={() => copiar(pixCopiaECola, "pix")}>
                  <Ionicons name={copiado === "pix" ? "checkmark" : "copy-outline"} size={18} color={colors.textInverse} />
                  <Text style={styles.botaoCopiarTexto}>{copiado === "pix" ? "Copiado!" : "Copiar código Pix"}</Text>
                </TouchableOpacity>
                <Text style={styles.notaTeste}>
                  Este QR Code é de teste e não recebe pagamento. Toque em “{t.checkout.finalizarReserva}” para simular o Pix aprovado.
                </Text>
              </View>
            )}

            {method === "boleto" && (
              <View style={styles.painelPix}>
                <Text style={styles.painelTitulo}>Pague com boleto</Text>
                <Text style={styles.passo}>Vencimento: {vencimentoDoBoleto()}</Text>
                <Text style={[styles.subtitulo, { marginTop: spacing.md }]}>Linha digitável</Text>
                <View style={styles.codigoCaixa}>
                  <Text style={styles.codigoTexto} selectable>{boletoCodigo}</Text>
                </View>
                <TouchableOpacity style={styles.botaoCopiar} onPress={() => copiar(boletoCodigo, "boleto")}>
                  <Ionicons name={copiado === "boleto" ? "checkmark" : "copy-outline"} size={18} color={colors.textInverse} />
                  <Text style={styles.botaoCopiarTexto}>{copiado === "boleto" ? "Copiado!" : "Copiar código do boleto"}</Text>
                </TouchableOpacity>
                <Text style={styles.notaTeste}>
                  Este boleto é de teste e não pode ser pago em banco nenhum. Toque em “{t.checkout.finalizarReserva}” para simular o pagamento.
                </Text>
              </View>
            )}

            {ehCartao && (
              <View>
                {/* Cartões salvos (compactos) */}
                {carregandoCartoes ? (
                  <ActivityIndicator style={{ marginVertical: spacing.md }} color={colors.primary} />
                ) : (
                  cartoesSalvos.length > 0 && (
                    <View style={{ marginTop: spacing.md }}>
                      <Text style={styles.subtitulo}>{t.checkout.meusCartoes}</Text>
                      {cartoesSalvos.map((cartao) => (
                        <CartaoSalvoItem
                          key={cartao.id}
                          cartao={cartao}
                          selecionado={!mostrarFormularioNovoCartao && cartaoSelecionadoId === cartao.id}
                          onSelecionar={() => {
                            setCartaoSelecionadoId(cartao.id);
                            setMostrarFormularioNovoCartao(false);
                          }}
                          onExcluir={async () => {
                            await cartaoService.excluirCartaoSalvo(cartao.id);
                            carregarCartoesSalvos();
                          }}
                        />
                      ))}
                    </View>
                  )
                )}

                {/* Link "adicionar novo cartão": o formulário fica escondido até tocar. */}
                {cartoesSalvos.length > 0 && (
                  <TouchableOpacity style={styles.linkAcao}
                    onPress={() => setMostrarFormularioNovoCartao((v) => !v)}>
                    <Ionicons name={mostrarFormularioNovoCartao ? "chevron-up" : "add-circle-outline"}
                      size={18} color={colors.primary} />
                    <Text style={styles.linkAcaoTexto}>{t.checkout.adicionarCartao}</Text>
                  </TouchableOpacity>
                )}

                {usandoCartaoNovo && (
                  <View style={{ marginTop: spacing.sm }}>
                    <View style={[styles.cartaoVisual, { backgroundColor: COR_BANDEIRA[bandeiraDoVisual] }]}>
                      <View style={styles.cartaoVisualTopo}>
                        <Text style={styles.cartaoVisualBandeira}>
                          {bandeiraEscolhida ? NOME_BANDEIRA[bandeiraEscolhida] : "Escolha a bandeira"}
                        </Text>
                        <Text style={styles.cartaoVisualTipo}>{ehDebito ? "DÉBITO" : "CRÉDITO"}</Text>
                      </View>
                      <Text style={styles.cartaoVisualNumero}>
                        {card.number ? formatarNumeroCartao(card.number) : "•••• •••• •••• ••••"}
                      </Text>
                      <View style={styles.cartaoVisualRodape}>
                        <Text style={styles.cartaoVisualTextoMenor}>
                          {card.name || t.checkout.nomeNoCartao.toUpperCase()}
                        </Text>
                        <Text style={styles.cartaoVisualTextoMenor}>{card.expiry || "MM/AA"}</Text>
                      </View>
                    </View>

                    <Text style={styles.subtitulo}>Bandeira do cartão</Text>
                    <View style={styles.bandeiras}>
                      {BANDEIRAS_DE_ESCOLHA.map((b) => {
                        const ativa = bandeiraEscolhida === b;
                        return (
                          <TouchableOpacity key={b} onPress={() => setBandeiraEscolhida(b)}
                            style={[styles.bandeira, ativa && styles.bandeiraAtiva]}
                            accessibilityRole="radio" accessibilityState={{ selected: ativa }}>
                            <Text style={[styles.bandeiraTexto, ativa && { color: colors.secondary }]}>
                              {b === "amex" ? "Amex" : NOME_BANDEIRA[b]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Input label={t.checkout.numeroCartao} placeholder="0000 0000 0000 0000" keyboardType="numeric"
                      value={card.number} onChangeText={(v) => setCard({ ...card, number: formatarNumeroCartao(v) })} />
                    <Input label={t.checkout.nomeNoCartao} placeholder="Nome impresso no cartão" value={card.name}
                      onChangeText={(v) => setCard({ ...card, name: v })} />
                    <View style={{ flexDirection: "row", gap: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <Input label={t.checkout.validade} placeholder="MM/AA" keyboardType="numeric" maxLength={5} value={card.expiry}
                          onChangeText={(v) => setCard({ ...card, expiry: Mascara.validade(v) })} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input label={t.checkout.cvv} placeholder="000" keyboardType="numeric" secureTextEntry maxLength={4}
                          value={card.cvv} onChangeText={(v) => setCard({ ...card, cvv: Mascara.cvv(v) })} />
                      </View>
                    </View>
                    <View style={styles.salvarCartao}>
                      <Text style={[typography.bodyMuted, { flex: 1 }]}>
                        {t.checkout.salvarCartaoParaProximasCompras}
                      </Text>
                      <Switch value={salvarNovoCartao} onValueChange={setSalvarNovoCartao} />
                    </View>
                  </View>
                )}

                {/* Parcelas: só no crédito. Débito é sempre à vista. */}
                {!ehDebito && (
                  <View>
                <Text style={[styles.subtitulo, { marginTop: spacing.lg }]}>{t.checkout.parcelas}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pilulas}>
                  {opcoesDeParcelamento.map((opcao) => {
                    const ativa = parcelasEscolhidas === opcao.installments;
                    return (
                      <TouchableOpacity key={opcao.installments}
                        style={[styles.pilula, ativa && styles.pilulaAtiva]}
                        onPress={() => setParcelasEscolhidas(opcao.installments)}>
                        <Text style={[styles.pilulaTitulo, ativa && { color: colors.textInverse }]}>
                          {opcao.installments === 1 ? t.checkout.parcelaUnica : `${opcao.installments}x`}
                        </Text>
                        <Text style={[styles.pilulaValor, ativa && { color: colors.textInverse }]}>
                          {formatarMoeda(opcao.installmentAmount)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <Text style={typography.caption}>
                  {opcaoEscolhida.interestFree ? t.checkout.semJuros : t.checkout.comJuros}
                  {" • "}{formatarMoeda(opcaoEscolhida.totalAmount)}
                </Text>
                  </View>
                )}
              </View>
            )}
          </SecaoRecolhivel>

          {/* ---------- Cupom: discreto, só abre se a pessoa tocar ---------- */}
          {descontoAplicado ? (
            <View style={styles.cupomAplicado}>
              <Ionicons name="pricetag" size={18} color={colors.success} />
              <Text style={styles.cupomAplicadoTexto}>
                Cupom de {descontoAplicado.percentual}% aplicado
              </Text>
              <TouchableOpacity onPress={handleRemoverCupom}>
                <Text style={styles.cupomRemover}>Remover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity style={styles.linkAcao} onPress={() => setCupomAberto((v) => !v)}>
                <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                <Text style={styles.linkAcaoTexto}>Tem um cupom de desconto?</Text>
              </TouchableOpacity>

              {cupomAberto && (
                <View style={styles.cupomCaixa}>
                  <TextInput
                    style={styles.cupomCampo}
                    placeholder="Desconto em % (ex: 10)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={percentualCupom}
                    onChangeText={setPercentualCupom}
                  />
                  <TouchableOpacity style={styles.cupomBotao} onPress={handleAplicarCupom} disabled={aplicandoCupom}>
                    {aplicandoCupom ? (
                      <ActivityIndicator size="small" color={colors.textInverse} />
                    ) : (
                      <Text style={styles.cupomBotaoTexto}>Aplicar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              {!!erroCupom && <Text style={styles.erro}>{erroCupom}</Text>}
            </View>
          )}

          {!!error && (
            <View style={styles.caixaErro}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.erroTexto}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* ---------- Barra fixa com o total ---------- */}
        <BarraDeTotal
          total={totalFinal}
          totalAntigo={descontoAplicado ? total : undefined}
          textoBotao={isAuthenticated ? t.checkout.finalizarReserva : "Entrar para finalizar"}
          aoPressionar={handleFinish}
          carregando={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================
// OPÇÃO DE PAGAMENTO (cartão grande com ícone, tipo "rádio")
// ============================================================
function OpcaoDePagamento({
  icone, rotulo, detalhe, selo, ativa, aoPressionar,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  detalhe?: string;
  selo?: string;
  ativa: boolean;
  aoPressionar: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.metodo, ativa && styles.metodoAtivo]} onPress={aoPressionar}
      accessibilityRole="radio" accessibilityState={{ selected: ativa }}>
      <View style={[styles.metodoIcone, ativa && { backgroundColor: colors.secondary }]}>
        <Ionicons name={icone} size={20} color={ativa ? colors.textInverse : colors.secondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.metodoRotulo}>{rotulo}</Text>
        {!!detalhe && <Text style={typography.caption}>{detalhe}</Text>}
      </View>
      {!!selo && (
        <View style={styles.metodoSelo}><Text style={styles.metodoSeloTexto}>{selo}</Text></View>
      )}
      <View style={[styles.radio, ativa && styles.radioAtivo]}>
        {ativa && <View style={styles.radioMiolo} />}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================
// CARTÃO SALVO (bandeira + últimos dígitos; toque para escolher)
// ============================================================
function CartaoSalvoItem({
  cartao, selecionado, onSelecionar, onExcluir,
}: {
  cartao: SavedCard;
  selecionado: boolean;
  onSelecionar: () => void;
  onExcluir: () => void;
}) {
  const bandeira = (cartao.brand in NOME_BANDEIRA ? cartao.brand : "unknown") as keyof typeof NOME_BANDEIRA;
  return (
    <TouchableOpacity style={[styles.cartaoSalvo, selecionado && styles.cartaoSalvoAtivo]} onPress={onSelecionar}>
      <View style={[styles.cartaoSalvoTag, { backgroundColor: COR_BANDEIRA[bandeira] }]}>
        <Text style={styles.cartaoSalvoTagTexto}>{NOME_BANDEIRA[bandeira]}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={typography.body}>•••• {cartao.lastDigits}</Text>
        <Text style={typography.caption}>{cartao.printedName}</Text>
      </View>
      {selecionado && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
      <TouchableOpacity onPress={onExcluir} style={{ marginLeft: spacing.sm }} hitSlop={8}>
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundMuted },
  conteudo: { padding: spacing.lg, gap: spacing.md },

  avisoTeste: {
    flexDirection: "row", gap: spacing.sm, alignItems: "center", padding: spacing.md,
    borderRadius: radius.md, backgroundColor: "#FFF7E0", borderWidth: 1, borderColor: "#F1D98A",
  },
  avisoTesteTexto: { flex: 1, color: "#6B5200", fontSize: 13 },

  resumo: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  resumoTitulo: { fontSize: 16, fontWeight: "700", color: colors.primary },
  resumoLinha: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  resumoImagem: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.border },
  resumoNome: { fontSize: 15, fontWeight: "700", color: colors.text },
  resumoPessoas: { color: colors.secondary, fontWeight: "700", fontSize: 12, marginTop: 2 },
  resumoSubtotal: { fontSize: 14, fontWeight: "700", color: colors.primary },

  metodos: { gap: spacing.sm },
  metodo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  metodoAtivo: { borderColor: colors.secondary, backgroundColor: "rgba(26,86,219,0.06)" },
  metodoIcone: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(26,86,219,0.12)", alignItems: "center", justifyContent: "center" },
  metodoRotulo: { fontSize: 15, fontWeight: "700", color: colors.text },
  metodoSelo: { backgroundColor: colors.success, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  metodoSeloTexto: { color: colors.textInverse, fontSize: 10, fontWeight: "700" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioAtivo: { borderColor: colors.secondary },
  radioMiolo: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary },

  painelPix: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.backgroundMuted },
  painelTitulo: { fontSize: 16, fontWeight: "700", color: colors.primary },
  passo: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  codigoCaixa: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  codigoTexto: { fontSize: 12, color: colors.text },
  botaoCopiar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    marginTop: spacing.sm, paddingVertical: 12, borderRadius: radius.full, backgroundColor: colors.secondary,
  },
  botaoCopiarTexto: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },
  notaTeste: { marginTop: spacing.md, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  bandeiras: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  bandeira: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  bandeiraAtiva: { borderColor: colors.secondary, backgroundColor: "rgba(26,86,219,0.08)" },
  bandeiraTexto: { fontSize: 13, fontWeight: "700", color: colors.primary },
  cartaoVisualTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cartaoVisualTipo: { color: colors.textInverse, fontSize: 11, fontWeight: "700", letterSpacing: 1, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: "hidden" },
  dica: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
  },
  subtitulo: { ...typography.caption, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: spacing.sm },

  linkAcao: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm },
  linkAcaoTexto: { color: colors.primary, fontWeight: "700" },

  cartaoVisual: { borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, minHeight: 140, justifyContent: "space-between" },
  cartaoVisualBandeira: { color: colors.textInverse, fontWeight: "700", fontSize: 16 },
  cartaoVisualNumero: { color: colors.textInverse, fontSize: 19, letterSpacing: 2, marginVertical: spacing.sm },
  cartaoVisualRodape: { flexDirection: "row", justifyContent: "space-between" },
  cartaoVisualTextoMenor: { color: colors.textInverse, fontSize: 12, opacity: 0.9 },
  salvarCartao: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },

  cartaoSalvo: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  cartaoSalvoAtivo: { borderColor: colors.primary, backgroundColor: colors.backgroundMuted },
  cartaoSalvoTag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  cartaoSalvoTagTexto: { color: colors.textInverse, fontSize: 11, fontWeight: "700" },

  pilulas: { gap: spacing.sm, paddingVertical: spacing.xs },
  pilula: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pilulaAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  pilulaTitulo: { fontWeight: "700", color: colors.primary, fontSize: 15 },
  pilulaValor: { fontSize: 12, color: colors.textSecondary },

  cupomCaixa: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  cupomCampo: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
  },
  cupomBotao: { height: 46, paddingHorizontal: spacing.xl, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  cupomBotaoTexto: { color: colors.textInverse, fontWeight: "700" },
  cupomAplicado: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.success,
  },
  cupomAplicadoTexto: { flex: 1, color: colors.success, fontWeight: "700" },
  cupomRemover: { color: colors.danger, fontWeight: "600" },

  erro: { color: colors.danger, marginTop: spacing.xs },
  caixaErro: { flexDirection: "row", gap: spacing.sm, alignItems: "center", padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.dangerSuave },
  erroTexto: { color: colors.danger, flex: 1 },
});
