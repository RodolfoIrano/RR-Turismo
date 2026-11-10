// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de DETALHES DE UMA VIAGEM (fotos, descrição, o que está
// incluso, guia responsável, botão de adicionar ao carrinho).
// Abre quando o usuário toca num card de viagem.
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, type HostInstance } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { shadows } from "../../constants/shadows";
import Rating from "../../components/Rating";
import PriceDisplay from "../../components/PriceDisplay";
import MiniMapa from "../../components/MiniMapa";
import InfoDaViagem from "../../components/InfoDaViagem";
import CartaoDoGuia from "../../components/CartaoDoGuia";
import CarrosselDeViagens from "../../components/CarrosselDeViagens";
import GaleriaDeFotos from "../../components/GaleriaDeFotos";
import Aparece from "../../components/auth/Aparece";
import { carregarGuiaOuErro } from "../../services/guideService";
import { useTraducao } from "../../traducoes/TraducaoContext";
import FavoriteButton from "../../components/FavoriteButton";
import PrimaryButton from "../../components/PrimaryButton";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import FlyToCart, { FlyToCartHandle } from "../../components/FlyToCart";
import CartHeaderButton, { CartHeaderButtonHandle } from "../../components/CartHeaderButton";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useCart } from "../../contexts/CartContext";
import { useCatalogo } from "../../contexts/CatalogoContext";
import { Trip, Guide } from "../../types";

// ============================================================
// DETALHES DA VIAGEM (/trip/[id])
// ------------------------------------------------------------
// Tela responsável por apresentar todas as informações de uma
// viagem selecionada pelo usuário.
//
// O ID da viagem é recebido através da rota dinâmica do Expo
// Router. A tela busca os dados da viagem e também os dados do
// guia responsável.
//
// São exibidos:
// - Galeria de imagens da viagem;
// - Título e localização;
// - Avaliação e quantidade de avaliações;
// - Preço por pessoa;
// - Descrição da viagem;
// - Itens inclusos;
// - Regras;
// - Política de cancelamento;
// - Informações do guia;
// - Botão para adicionar a viagem ao carrinho.
//
// Também permite:
// - Favoritar ou desfavoritar a viagem;
// - Acessar o perfil do guia;
// - Acessar o carrinho;
// - Voltar para a tela anterior.
//
// Os dados são obtidos pelos services, atualmente mockados.
// Futuramente poderão ser utilizados endpoints como:
// GET /api/trips/{id}
// GET /api/guides/{id}
// ============================================================
export default function TripDetails() {
  // Recupera o ID da viagem recebido pela rota
  const { id } = useLocalSearchParams<{ id: string }>();

  // Permite realizar navegação entre as telas
  const router = useRouter();

  // Contexto responsável pelos favoritos
  const { isFavorite, toggleFavorite } = useFavorites();

  // Contexto responsável pelo carrinho
  const { addToCart, itemCount } = useCart();

  // Textos traduzidos conforme o idioma escolhido
  const { t } = useTraducao();

  // Catálogo de viagens e guias já carregado do backend (evita
  // uma segunda chamada de rede: reaproveita os mesmos dados que
  // a Home/Explorar já buscaram).
  const { buscarViagem, buscarGuia, viagens, carregando: catalogoCarregando, erro: catalogoErro } = useCatalogo();

  // Descrição longa: começa resumida, com botão "Ler mais".
  const [descricaoAberta, setDescricaoAberta] = useState(false);

  // Se o guia não veio no catálogo, tenta buscar direto pelo id.
  const [guiaDireto, setGuiaDireto] = useState<Guide | null>(null);
  const [buscandoGuia, setBuscandoGuia] = useState(false);

  // Guarda os dados da viagem carregada
  const [trip, setTrip] = useState<Trip | null>(null);

  // Guarda os dados do guia responsável pela viagem
  const [guide, setGuide] = useState<Guide | null>(null);

  // Controla o estado de carregamento da tela
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // Controla o feedback visual depois de adicionar a viagem ao carrinho
  const [added, setAdded] = useState(false);

  // (A galeria de fotos cuida sozinha da foto atual e das fotos com erro.)

  // ==========================================================
  // REFS DA ANIMAÇÃO DO CARRINHO
  // ----------------------------------------------------------
  // buttonWrapRef representa o botão "Adicionar ao carrinho".
  //
  // flyRef controla o componente responsável pela animação da
  // imagem da viagem voando até o carrinho.
  //
  // cartButtonRef representa o botão do carrinho no cabeçalho.
  //
  // Dessa forma, conseguimos medir a posição dos dois elementos
  // e criar a animação entre eles.
  // ==========================================================
  const buttonWrapRef = useRef<HostInstance>(null);
  const flyRef = useRef<FlyToCartHandle>(null);
  const cartButtonRef = useRef<CartHeaderButtonHandle>(null);

  // ==========================================================
  // CARREGAMENTO DOS DADOS
  // ----------------------------------------------------------
  // Em vez de fazer uma nova chamada de rede, busca a viagem e o
  // guia dentro do catálogo que o CatalogoContext já carregou
  // (evita depender de uma segunda requisição, que poderia
  // falhar por conta própria mesmo com a lista funcionando).
  // ==========================================================
  useEffect(() => {
    // Enquanto o catálogo geral ainda está carregando, aguarda.
    if (catalogoCarregando) {
      setStatus("loading");
      return;
    }

    if (catalogoErro) {
      setStatus("error");
      return;
    }

    const foundTrip = buscarViagem(id);
    if (!foundTrip) {
      setStatus("error");
      return;
    }

    setTrip(foundTrip);
    setGuide(buscarGuia(foundTrip.guideId) ?? null);
    setStatus("success");
  }, [id, catalogoCarregando, catalogoErro, buscarViagem, buscarGuia]);

  // Busca direta do guia quando ele não está no catálogo.
  useEffect(() => {
    if (!trip?.guideId || guide) return;
    let cancelado = false;
    setBuscandoGuia(true);
    carregarGuiaOuErro(trip.guideId)
      .then((g) => { if (!cancelado) setGuiaDireto(g); })
      .catch(() => {})
      .finally(() => { if (!cancelado) setBuscandoGuia(false); });
    return () => { cancelado = true; };
  }, [trip?.guideId, guide]);

  // ==========================================================
  // ESTADO DE CARREGAMENTO
  // ----------------------------------------------------------
  // Enquanto os dados estão sendo buscados, exibe o componente
  // de carregamento.
  // ==========================================================
  if (status === "loading") {
    return <Loading label="Carregando viagem..." />;
  }

  // ==========================================================
  // ESTADO DE ERRO
  // ----------------------------------------------------------
  // Exibido quando a viagem não é encontrada ou ocorre algum
  // problema durante o carregamento.
  // ==========================================================
  if (status === "error" || !trip) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Não foi possível carregar esta viagem."
        message="Volte e tente novamente."
      />
    );
  }

  // Verifica se a viagem atual está nos favoritos
  const favorited = isFavorite(trip.id);

  // Guia a exibir (do catálogo ou da busca direta) e as OUTRAS
  // viagens que o mesmo guia criou (a atual não entra na lista).
  const guideExibido = guide ?? guiaDireto;
  const outrasViagens = viagens.filter((v) => v.guideId === trip.guideId && v.id !== trip.id);

  // Sem vagas = não dá para reservar.
  const esgotada = (trip.assentos ?? 0) > 0 && (trip.participantes ?? 0) >= (trip.assentos ?? 0);

  // ==========================================================
  // ADICIONAR AO CARRINHO
  // ----------------------------------------------------------
  // Adiciona uma unidade da viagem ao carrinho.
  //
  // Depois disso, mede a posição do botão e do carrinho no
  // cabeçalho para executar a animação "voando até o carrinho".
  // ==========================================================
  function handleAddToCart() {
    // Essa função só deveria ser chamada quando a viagem já estiver
    // carregada (o botão que a chama só aparece nesse caso), mas
    // esse "if" garante isso também em tempo de execução, e resolve
    // o aviso do TypeScript de que "trip" poderia ser nulo aqui.
    if (!trip) return;

    // Adiciona uma unidade da viagem ao carrinho
    addToCart(trip.id, 1);

    // Mede a posição do botão de adicionar ao carrinho
    buttonWrapRef.current?.measureInWindow((x, y, width, height) => {

      // Mede o centro do botão do carrinho no cabeçalho
      cartButtonRef.current?.measureCenter((targetX, targetY) => {

        // Inicia a animação da imagem da viagem até o carrinho
        flyRef.current?.fly({
          imageUri: trip.images[0],

          // Ponto inicial da animação
          from: {
            x,
            y,
            width,
            height,
          },

          // Ponto final da animação
          to: {
            x: targetX,
            y: targetY,
          },

          // Executado quando a animação chega ao carrinho
          onLand: () => {
            // Cria um pequeno efeito no botão do carrinho
            cartButtonRef.current?.bump();

            // Exibe o feedback de que o item foi adicionado
            setAdded(true);

            // Remove o feedback depois de 1,5 segundos
            setTimeout(() => setAdded(false), 1500);
          },
        });
      });
    });
  }

  // ==========================================================
  // CONTEÚDO PRINCIPAL
  // ==========================================================
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>

      {/* ====================================================
          BOTÃO DO CARRINHO NO CABEÇALHO
          ----------------------------------------------------
          O Stack.Screen permite adicionar o botão do carrinho
          diretamente no cabeçalho da rota.
          ==================================================== */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <CartHeaderButton
              ref={cartButtonRef}
              itemCount={itemCount}
              onPress={() => router.push("/(tabs)/cart")}
            />
          ),
        }}
      />

      <ScrollView>

        {/* ==================================================
            GALERIA DE IMAGENS
            --------------------------------------------------
            Todas as fotos da viagem (até 5), com setinhas,
            bolinhas e um aviso "deslize" - ver GaleriaDeFotos.
            ================================================== */}
        <View>
          <GaleriaDeFotos fotos={trip.images} altura={340} />

          {/* O botão de voltar já vem pronto no cabeçalho nativo. */}

          {/* Botão flutuante para favoritar a viagem */}
          <View style={styles.favoriteFloating}>
            <FavoriteButton
              active={favorited}
              onPress={() => toggleFavorite(trip.id)}
              size={22}
            />
          </View>
        </View>

        {/* ==================================================
            INFORMAÇÕES DA VIAGEM
            ================================================== */}
        <View style={styles.content}>

          {/* Categoria (etiqueta) */}
          {!!trip.category && (
            <Aparece atraso={60}>
              <View style={styles.etiqueta}>
                <Ionicons name="pricetag" size={12} color={colors.secondary} />
                <Text style={styles.etiquetaTexto}>{trip.category}</Text>
              </View>
            </Aparece>
          )}

          {/* Título da viagem */}
          <Aparece atraso={120}>
            <Text style={styles.titulo}>{trip.title}</Text>
          </Aparece>

          {/* Localização da viagem */}
          <Aparece atraso={180}>
            <View style={styles.row}>
              <View style={styles.iconeLocal}>
                <Ionicons name="location" size={14} color={colors.secondary} />
              </View>
              <Text style={[typography.bodyMuted, { flex: 1 }]}>{trip.location}</Text>
            </View>
          </Aparece>

          {/* GUIA (obrigatório): nome sempre visível e clicável. */}
          <TouchableOpacity
            style={styles.guiaChip}
            onPress={() => trip.guideId && router.push(`/guide/${trip.guideId}`)}
            accessibilityRole="link"
            disabled={!trip.guideId}
          >
            <Ionicons name="person-circle-outline" size={18} color={colors.secondary} />
            <Text style={styles.guiaChipTexto}>
              {t.guia.seuGuia}: {guideExibido?.name ?? t.guia.guiaNaoInformado}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.secondary} />
          </TouchableOpacity>

          {/* Avaliação (só se já existir alguma) */}
          {trip.reviewCount > 0 && (
            <View style={{ marginTop: spacing.sm }}>
              <Rating rating={trip.rating} reviewCount={trip.reviewCount} size={16} />
            </View>
          )}

          {/* =================================================
              DETALHES (datas, duração, vagas, transporte, hotel)
              ================================================= */}
          <Section icone="information-circle-outline" atraso={240} title={t.viagem.detalhes}>
            <InfoDaViagem trip={trip} />
          </Section>

          {/* =================================================
              DESCRIÇÃO COMPLETA (resumida, com "Ler mais")
              ================================================= */}
          <Section icone="document-text-outline" atraso={280} title={t.viagem.sobre}>
            <Text style={typography.body} numberOfLines={descricaoAberta ? undefined : 6}>
              {trip.description || t.viagem.naoInformado}
            </Text>
            {trip.description.length > 280 && (
              <TouchableOpacity onPress={() => setDescricaoAberta((v) => !v)} accessibilityRole="button">
                <Text style={styles.lerMais}>{descricaoAberta ? t.viagem.lerMenos : t.viagem.lerMais}</Text>
              </TouchableOpacity>
            )}
          </Section>

          {/* =================================================
              MINI MAPA: onde fica o local da viagem
              ================================================= */}
          <Section icone="map-outline" atraso={320} title={t.mapa.titulo}>
            <MiniMapa consultas={[`${trip.destination}, ${trip.location}`, trip.location, trip.destination]} />
          </Section>

          {/* =================================================
              REGRAS DA VIAGEM (só se existirem)
              ================================================= */}
          {trip.rules.length > 0 && (
            <Section icone="list-outline" atraso={340} title="Regras">
              {trip.rules.map((rule) => (
                <Text key={rule} style={[typography.bodyMuted, { marginBottom: 4 }]}>• {rule}</Text>
              ))}
            </Section>
          )}

          {/* =================================================
              O GUIA: perfil que ele preencheu no site
              ================================================= */}
          <Section icone="person-outline" atraso={360} title={t.guia.seuGuia}>
            <CartaoDoGuia guideId={trip.guideId} guide={guideExibido} carregando={buscandoGuia} />
          </Section>

          {/* =================================================
              OUTRAS VIAGENS DO MESMO GUIA (carrossel)
              ================================================= */}
          {outrasViagens.length > 0 && (
            <Section icone="compass-outline" atraso={380} title={`${t.viagem.outrasDoGuia} ${guideExibido?.name ?? t.guia.guiaTuristico}`}>
              <CarrosselDeViagens trips={outrasViagens} />
            </Section>
          )}

          {/* =================================================
              POLÍTICA DE CANCELAMENTO
              ================================================= */}
          <Section icone="shield-checkmark-outline" atraso={400} title={t.viagem.cancelamento}>
            <Text style={typography.bodyMuted}>{trip.cancellationPolicy}</Text>
          </Section>
        </View>
      </ScrollView>

      {/* ====================================================
          RODAPÉ / BOTÃO DO CARRINHO
          ----------------------------------------------------
          Botão fixo na parte inferior da tela para adicionar
          a viagem ao carrinho.
          ==================================================== */}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={typography.caption}>{t.viagem.porPessoa}</Text>
          <PriceDisplay price={trip.price} />
        </View>
        <View ref={buttonWrapRef} collapsable={false} style={{ flex: 1.4 }}>
          <PrimaryButton
            label={esgotada ? t.viagem.esgotadaBotao : added ? t.viagem.adicionado : t.viagem.adicionar}
            onPress={handleAddToCart}
            disabled={esgotada}
            style={{ borderRadius: radius.lg }}
          />
        </View>
      </View>

      {/* ====================================================
          ANIMAÇÃO DE ADIÇÃO AO CARRINHO
          ----------------------------------------------------
          Fica por cima de todos os elementos da tela.
          O componente FlyToCart utiliza esse espaço para
          animar a imagem da viagem até o botão do carrinho.
          ==================================================== */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <FlyToCart ref={flyRef} />
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// COMPONENTE DE SEÇÃO
// ------------------------------------------------------------
// Componente reutilizável para padronizar os títulos e o
// espaçamento das diferentes seções da página.
// ============================================================
function Section({
  title,
  icone,
  atraso = 0,
  children,
}: {
  title: string;
  icone: React.ComponentProps<typeof Ionicons>["name"];
  atraso?: number;
  children: React.ReactNode;
}) {
  return (
    <Aparece atraso={atraso} style={styles.section}>
      {/* Cabeçalho da seção: ícone num quadradinho colorido + título */}
      <View style={styles.sectionCabecalho}>
        <View style={styles.sectionIcone}>
          <Ionicons name={icone} size={18} color={colors.secondary} />
        </View>
        <Text style={styles.sectionTitulo}>{title}</Text>
      </View>

      <View style={{ marginTop: spacing.md }}>
        {children}
      </View>
    </Aparece>
  );
}

// ============================================================
// ESTILOS DA TELA
// ============================================================
const styles = StyleSheet.create({

  // Container principal da tela
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Botão de voltar sobre a imagem principal
  backButton: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: spacing.sm,
  },

  // Botão de favorito sobre a imagem
  favoriteFloating: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
  },

  // Espaço reservado exibido quando uma foto da galeria falha ao carregar.
  imagemFallback: {
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  imagemFallbackTexto: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Fileira de bolinhas do indicador de fotos, na parte de baixo da galeria.
  pontosContainer: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  ponto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.overlayLightSutil,
  },
  // Bolinha da foto atualmente visível, maior e mais opaca que as outras.
  pontoAtivo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textInverse,
  },

  // Contador "1/3" no canto superior direito da galeria.
  contadorFotos: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.overlayEscuro,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  contadorFotosTexto: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "600",
  },

  // Área principal das informações: folha branca com cantos
  // bem arredondados "subindo" sobre a foto.
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.background,
  },

  // Título grande da viagem
  titulo: { fontSize: 27, fontWeight: "700", color: colors.primary, lineHeight: 33 },
  // Bolinha com o ícone de localização
  iconeLocal: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(26,86,219,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  // Cabeçalho de cada seção (ícone + título)
  sectionCabecalho: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  sectionIcone: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(26,86,219,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitulo: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.primary },

  // Linha utilizada para informações como localização
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },

  // Área que contém o preço da viagem
  priceRow: {
    marginTop: spacing.md,
  },

  // Espaçamento padrão das seções
  section: {
    marginTop: spacing.xxl,
  },

  // Linha dos itens inclusos
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },

  // Cartão com as informações resumidas do guia
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  // Foto do guia dentro do cartão
  guideAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    marginRight: spacing.md,
  },

  // Etiqueta clicável com o nome do guia, logo abaixo da localização
  guiaChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.full,
    backgroundColor: "rgba(26,86,219,0.12)",
  },
  guiaChipTexto: { color: colors.secondary, fontWeight: "700", fontSize: 14 },
  guideAvatarVazio: { backgroundColor: colors.border, alignItems: "center", justifyContent: "center" },

  // Link para visualizar o perfil do guia
  guideLink: {
    color: colors.secondary,
    fontWeight: "600",
    marginTop: 2,
  },

  // Etiqueta da categoria acima do título
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(26,86,219,0.14)",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginBottom: spacing.md,
  },
  etiquetaTexto: { color: colors.secondary, fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  lerMais: { color: colors.secondary, fontWeight: "700", marginTop: spacing.xs },

  // Rodapé flutuante: preço à esquerda, botão à direita
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    ...shadows.elevated,
  },
});
