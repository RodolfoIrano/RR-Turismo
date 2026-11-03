// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de CHECKOUT (finalizar a reserva), redesenhada: limpa e
// moderna, com as informações ESCONDIDAS até a pessoa precisar.
//
//   - Resumo da viagem sempre no topo;
//   - "Seus dados": seção que abre/fecha;
//   - "Forma de pagamento": escolhe Cartão ou PIX - só então aparece
//     o formulário do cartão, os cartões salvos e as parcelas;
//   - "Tem um cupom?": um link discreto que abre o campo do cupom;
//   - Barra fixa embaixo com o total e o botão de finalizar.
//
// LOGIN: quem não está logado é levado ao login ao entrar aqui e
// volta direto para o checkout depois de entrar.
//
// O pagamento continua SIMULADO (não há gateway real); todo o resto
// (cartões salvos, parcelas, cupom SOAP, criação das reservas) é real.
// ============================================================
import { Mascara } from "../../utils/mascaras";
import React, { useState, useEffect, useCallback } from "react";
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Switch, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";
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
import { CheckoutCard, CheckoutCustomer, SavedCard, InstallmentOption } from "../../types";
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
} from "../../services/cardBrandService";

type PaymentMethod = "credit_card" | "pix";
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

  const opcoesDeParcelamento: InstallmentOption[] = calcularOpcoesDeParcelamento(totalFinal);
  const [parcelasEscolhidas, setParcelasEscolhidas] = useState(1);
  const opcaoEscolhida =
    opcoesDeParcelamento.find((o) => o.installments === parcelasEscolhidas) ?? opcoesDeParcelamento[0];

  // Cartão novo é usado se não há salvos OU se a pessoa abriu o formulário.
  const usandoCartaoNovo = method === "credit_card" && (mostrarFormularioNovoCartao || cartoesSalvos.length === 0);

  // Resumo mostrado na seção fechada.
  const cartaoEscolhido = cartoesSalvos.find((c) => c.id === cartaoSelecionadoId);
  const resumoPagamento =
    method === "pix"
      ? t.checkout.pix
      : method === "credit_card"
      ? usandoCartaoNovo
        ? `${t.checkout.cartaoCredito} • ${opcaoEscolhida.installments}x`
        : `${t.checkout.cartaoCredito} •••• ${cartaoEscolhido?.lastDigits ?? ""}`
      : "Escolha como pagar";

  // ----------------------------------------------------------
  // FINALIZAÇÃO DA RESERVA
  // ----------------------------------------------------------
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalPessoas = items.reduce((soma, i) => soma + i.quantity, 0);
  const primeiraViagem = items[0] ? getTripForItem(items[0].tripId) : undefined;

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
      const erroCartao = paymentService.validateCard(card);
      if (erroCartao) {
        setSecaoAberta("pagamento");
        setError(erroCartao);
        return;
      }
    } else if (method === "credit_card" && !cartaoSelecionadoId) {
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
        });
      }

      clearCart();
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

          {/* ---------- Resumo da viagem (sempre visível, compacto) ---------- */}
          {primeiraViagem && (
            <View style={styles.resumo}>
              <Image source={{ uri: primeiraViagem.images[0] }} style={styles.resumoImagem} />
              <View style={{ flex: 1 }}>
                <Text style={typography.h3} numberOfLines={2}>{primeiraViagem.title}</Text>
                <Text style={typography.caption} numberOfLines={1}>{primeiraViagem.location}</Text>
                <Text style={styles.resumoPessoas}>
                  {items.length > 1 ? `${items.length} viagens • ` : ""}{totalPessoas} pessoa(s)
                </Text>
              </View>
            </View>
          )}

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
            {/* Duas opções grandes: o conteúdo só aparece depois de escolher. */}
            <View style={styles.metodos}>
              <OpcaoDePagamento icone="card" rotulo={t.checkout.cartaoCredito}
                ativa={method === "credit_card"} aoPressionar={() => setMethod("credit_card")} />
              <OpcaoDePagamento icone="qr-code" rotulo={t.checkout.pix}
                ativa={method === "pix"} aoPressionar={() => setMethod("pix")} />
            </View>

            {method === "pix" && (
              <View style={styles.dica}>
                <Ionicons name="information-circle-outline" size={18} color={colors.secondary} />
                <Text style={[typography.bodyMuted, { flex: 1 }]}>{t.checkout.pixInfo}</Text>
              </View>
            )}

            {method === "credit_card" && (
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
                    <View style={[styles.cartaoVisual, { backgroundColor: COR_BANDEIRA[bandeiraDetectada] }]}>
                      <Text style={styles.cartaoVisualBandeira}>{NOME_BANDEIRA[bandeiraDetectada]}</Text>
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

                {/* Parcelas: fileira de "pílulas" em vez de uma lista enorme. */}
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
  icone, rotulo, ativa, aoPressionar,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  ativa: boolean;
  aoPressionar: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.metodo, ativa && styles.metodoAtivo]} onPress={aoPressionar} accessibilityRole="radio"
      accessibilityState={{ selected: ativa }}>
      <Ionicons name={icone} size={26} color={ativa ? colors.textInverse : colors.primary} />
      <Text style={[typography.body, { fontWeight: "700" }, ativa && { color: colors.textInverse }]}>{rotulo}</Text>
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

  resumo: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  resumoImagem: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.border },
  resumoPessoas: { color: colors.secondary, fontWeight: "700", fontSize: 13, marginTop: 2 },

  metodos: { flexDirection: "row", gap: spacing.md },
  metodo: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
  },
  metodoAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
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
  pilulaTitulo: { fontWeight: "800", color: colors.primary, fontSize: 15 },
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
