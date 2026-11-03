// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de DETALHES DE UMA VIAGEM (fotos, descrição, o que está
// incluso, guia responsável, botão de adicionar ao carrinho).
// Abre quando o usuário toca num card de viagem.
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, StyleSheet, FlatList, TouchableOpacity, Dimensions, type HostInstance } from "react-native";
import { Text } from "../../components/TextoTraduzido";
// Ver comentário em components/TripCard.tsx sobre o uso do
// <Image> do expo-image (cache melhor + onError para diagnóstico).
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import Rating from "../../components/Rating";
import PriceDisplay from "../../components/PriceDisplay";
import MiniMapa from "../../components/MiniMapa";
import InfoDaViagem from "../../components/InfoDaViagem";
import CartaoDoGuia from "../../components/CartaoDoGuia";
import CarrosselDeViagens from "../../components/CarrosselDeViagens";
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

const { width } = Dimensions.get("window");

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

  // Guarda quais fotos da galeria falharam ao carregar, pra
  // mostrar um "espaço reservado" (ícone + fundo cinza) no lugar
  // delas, em vez de deixar um vazio branco feio na tela.
  // Guarda qual foto da galeria está sendo exibida no momento
  // (usado pra destacar a bolinha certa no indicador de fotos).
  const [fotoAtualIndice, setFotoAtualIndice] = useState(0);

  // Guarda quais fotos da galeria falharam ao carregar, pra
  // mostrar um "espaço reservado" (ícone + fundo cinza) no lugar
  // delas, em vez de deixar um vazio branco feio na tela.
  const [fotosComErro, setFotosComErro] = useState<Set<string>>(new Set());

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
            Exibe todas as imagens da viagem horizontalmente.
            O pagingEnabled faz cada imagem ocupar uma página
            completa da galeria.
            ================================================== */}
        <View>
          <FlatList
            data={trip.images}
            keyExtractor={(_, idx) => String(idx)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            // Detecta em qual foto o usuário está, pra atualizar
            // a bolinha ativa do indicador embaixo da galeria.
            onMomentumScrollEnd={(evento) => {
              const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
              setFotoAtualIndice(indice);
            }}
            renderItem={({ item }) =>
              fotosComErro.has(item) ? (
                // Espaço reservado exibido quando a foto falha ao
                // carregar (em vez de deixar um vazio branco feio).
                <View style={[styles.imagemFallback, { width, height: 300 }]}>
                  <Ionicons name="image-outline" size={40} color={colors.textMuted} />
                  <Text style={styles.imagemFallbackTexto}>Foto indisponível</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: item }}
                  style={{ width, height: 300 }}
                  contentFit="cover"
                  onError={(erro) => {
                    console.warn(`[TripDetails] Falha ao carregar imagem:`, item, erro);
                    // Marca esta foto como "com erro", pra próxima
                    // vez renderizar o espaço reservado em vez de
                    // tentar (e falhar) carregar de novo.
                    setFotosComErro((atual) => new Set(atual).add(item));
                  }}
                />
              )
            }
          />

          {/* ================================================
              INDICADOR DE FOTOS (bolinhas + contador)
              ------------------------------------------------
              Só aparece quando a viagem tem MAIS DE UMA foto -
              com uma foto só, o indicador não acrescenta nada e
              só ocuparia espaço à toa.
              ================================================ */}
          {trip.images.length > 1 && (
            <>
              <View style={styles.pontosContainer}>
                {trip.images.map((_, indice) => (
                  <View
                    key={indice}
                    style={[
                      styles.ponto,
                      indice === fotoAtualIndice && styles.pontoAtivo,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.contadorFotos}>
                <Text style={styles.contadorFotosTexto}>
                  {fotoAtualIndice + 1}/{trip.images.length}
                </Text>
              </View>
            </>
          )}

          {/* O botão de voltar já vem pronto no cabeçalho nativo
              (configurado lá em cima, no Stack.Screen com o botão
              do carrinho) - por isso NÃO colocamos um segundo botão
              de voltar aqui em cima da imagem. Ter os dois juntos
              ficava redundante e feio, especialmente quando a foto
              não carrega (o botão ficava "boiando" sozinho). */}

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
            <View style={styles.etiqueta}>
              <Text style={styles.etiquetaTexto}>{trip.category}</Text>
            </View>
          )}

          {/* Título da viagem */}
          <Text style={typography.h1}>{trip.title}</Text>

          {/* Localização da viagem */}
          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[typography.bodyMuted, { marginLeft: 4 }]}>{trip.location}</Text>
          </View>

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
          <Section title={t.viagem.detalhes}>
            <InfoDaViagem trip={trip} />
          </Section>

          {/* =================================================
              DESCRIÇÃO COMPLETA (resumida, com "Ler mais")
              ================================================= */}
          <Section title={t.viagem.sobre}>
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
          <Section title={t.mapa.titulo}>
            <MiniMapa consultas={[`${trip.destination}, ${trip.location}`, trip.location, trip.destination]} />
          </Section>

          {/* =================================================
              REGRAS DA VIAGEM (só se existirem)
              ================================================= */}
          {trip.rules.length > 0 && (
            <Section title="Regras">
              {trip.rules.map((rule) => (
                <Text key={rule} style={[typography.bodyMuted, { marginBottom: 4 }]}>• {rule}</Text>
              ))}
            </Section>
          )}

          {/* =================================================
              O GUIA: perfil que ele preencheu no site
              ================================================= */}
          <Section title={t.guia.seuGuia}>
            <CartaoDoGuia guideId={trip.guideId} guide={guideExibido} carregando={buscandoGuia} />
          </Section>

          {/* =================================================
              OUTRAS VIAGENS DO MESMO GUIA (carrossel)
              ================================================= */}
          {outrasViagens.length > 0 && (
            <Section title={`${t.viagem.outrasDoGuia} ${guideExibido?.name ?? t.guia.guiaTuristico}`}>
              <CarrosselDeViagens trips={outrasViagens} />
            </Section>
          )}

          {/* =================================================
              POLÍTICA DE CANCELAMENTO
              ================================================= */}
          <Section title={t.viagem.cancelamento}>
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={typography.h2}>
        {title}
      </Text>

      <View style={{ marginTop: spacing.sm }}>
        {children}
      </View>
    </View>
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
  // arredondados "subindo" um pouco sobre a foto.
  content: {
    padding: spacing.lg,
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
  },

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
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted,
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
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  etiquetaTexto: { color: colors.textInverse, fontSize: 12, fontWeight: "700" },
  lerMais: { color: colors.secondary, fontWeight: "700", marginTop: spacing.xs },

  // Rodapé fixo: preço à esquerda, botão à direita
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
