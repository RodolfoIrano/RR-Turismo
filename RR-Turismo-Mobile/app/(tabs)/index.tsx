// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É a TELA INICIAL do app (a primeira aba, "Início"). Mostra o
// banner, as categorias, e as listas de viagens em destaque,
// populares e em oferta.
// ============================================================
import React, { useState, useCallback, useRef } from "react";
import { View, ScrollView, FlatList, Image, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import CategoryCard from "../../components/CategoryCard";
import TripCard from "../../components/TripCard";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import PrimaryButton from "../../components/PrimaryButton";

import { useAuth } from "../../contexts/AuthContext";
import { Trip } from "../../types";
import * as tripService from "../../services/tripService";

// ============================================================
// HOME
// ------------------------------------------------------------
// É a tela principal do aplicativo.
//
// Aqui são exibidos:
// - Saudação do usuário
// - Campo de pesquisa
// - Categorias
// - Banner principal
// - Destinos em destaque
// - Viagens populares
// - Ofertas especiais
//
// Os dados são carregados através do tripService.
// Atualmente o serviço utiliza dados mockados, mas futuramente
// poderá buscar essas informações de uma API.
// ============================================================
export default function Home() {
  const router = useRouter();

  // Recupera os dados do usuário logado
  const { user } = useAuth();

  // ==========================================================
  // ESTADOS DA TELA
  // ==========================================================
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Listas de viagens que serão mostradas em cada seção
  const [featured, setFeatured] = useState<Trip[]>([]);
  const [popular, setPopular] = useState<Trip[]>([]);
  const [offers, setOffers] = useState<Trip[]>([]);

  // Controla o estado do carregamento da tela
  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");


  // ==========================================================
  // CARREGAMENTO DOS DADOS
  // ----------------------------------------------------------
  // Busca todas as informações necessárias para a Home.
  //
  // Promise.all permite buscar categorias e viagens ao mesmo
  // tempo, evitando fazer cada requisição uma após a outra.
  // ==========================================================
  // Controla se já foi feito o primeiro carregamento (para saber
  // se devemos mostrar a tela de "carregando" ou atualizar
  // silenciosamente em segundo plano).
  const jaCarregouUmaVez = useRef(false);

  const loadData = useCallback(async (mostrarCarregando: boolean = true) => {
    if (mostrarCarregando) {
      setStatus("loading");
    }

    try {
      const [cats, feat, pop, off] = await Promise.all([
        tripService.getCategories(),
        tripService.getFeaturedTrips(),
        tripService.getPopularTrips(),
        tripService.getOfferTrips(),
      ]);

      // Salva os dados recebidos nos respectivos estados
      setCategories(cats);
      setFeatured(feat);
      setPopular(pop);
      setOffers(off);

      setStatus("success");
    } catch {
      // Caso aconteça algum erro no carregamento
      if (mostrarCarregando) {
        setStatus("error");
      }
      // Se já estava tudo certo antes (era só uma atualização
      // silenciosa em segundo plano), não interrompe a tela com
      // um erro - o usuário continua vendo os dados anteriores.
    }
  }, []);


  // ==========================================================
  // CARREGAMENTO INICIAL + ATUALIZAÇÃO AO VOLTAR PARA A TELA
  // ----------------------------------------------------------
  // Sempre que o usuário chega/volta para a aba Início (ex: ao
  // abrir o app, ou depois de ver o carrinho/perfil e voltar),
  // busca os dados de novo - assim, se uma viagem nova foi
  // cadastrada no site enquanto o app estava aberto, ela aparece
  // sem precisar fechar e abrir o app de novo.
  //
  // Só a primeira vez mostra a tela de carregamento; as próximas
  // atualizam em segundo plano (mostrarCarregando: false), para
  // não piscar um loading a cada troca de aba.
  // ==========================================================
  useFocusEffect(
    useCallback(() => {
      loadData(!jaCarregouUmaVez.current);
      jaCarregouUmaVez.current = true;
    }, [loadData])
  );


  // ==========================================================
  // NAVEGAÇÃO PARA A TELA EXPLORAR
  // ----------------------------------------------------------
  // Pode enviar uma pesquisa ou uma categoria para a tela
  // Explore.
  // ==========================================================
  function goToExplore(
    params?: { query?: string; category?: string }
  ) {
    router.push({
      pathname: "/(tabs)/explore",

      params: {
        query: params?.query ?? "",
        category: params?.category ?? "",
      },
    });
  }


  // ==========================================================
  // ESTADO DE CARREGAMENTO
  // ----------------------------------------------------------
  // Enquanto os dados estão sendo buscados, mostramos um
  // indicador de carregamento.
  // ==========================================================
  if (status === "loading") {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={["top"]}
      >
        <Header />

        <Loading label="Carregando viagens..." />
      </SafeAreaView>
    );
  }


  // ==========================================================
  // ESTADO DE ERRO
  // ----------------------------------------------------------
  // Caso não seja possível carregar os dados, mostramos uma
  // mensagem e um botão para tentar novamente.
  // ==========================================================
  if (status === "error") {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={["top"]}
      >
        <Header />

        <EmptyState
          icon="cloud-offline-outline"
          title="Não foi possível carregar as viagens."
          message="Verifique sua conexão e tente novamente."
        />

        <View style={{ padding: spacing.lg }}>
          <PrimaryButton
            label="Tentar novamente"
            onPress={loadData}
          />
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================================
  // CONTEÚDO PRINCIPAL
  // ----------------------------------------------------------
  // Quando o carregamento termina com sucesso, exibimos
  // todos os componentes da Home.
  // ==========================================================
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >
      <Header />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.xxl,
        }}

        // Permite atualizar a tela puxando o conteúdo para baixo
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={loadData}
          />
        }
      >

        {/* ==================================================
            SAUDAÇÃO
            --------------------------------------------------
            Mostra o primeiro nome do usuário logado.
            Caso não exista usuário, mostra "viajante".
            ================================================== */}
        <View style={styles.greeting}>
          <Text style={typography.h2}>
            Olá, {user?.name?.split(" ")[0] ?? "viajante"}! 👋
          </Text>

          <Text
            style={[
              typography.bodyMuted,
              { marginTop: 2 },
            ]}
          >
            Encontre sua próxima aventura
          </Text>
        </View>


        {/* ==================================================
            PESQUISA
            --------------------------------------------------
            O usuário pode pesquisar por um destino ou viagem.
            Ao enviar a pesquisa, é direcionado para Explore.
            ================================================== */}
        <View style={styles.section}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() =>
              goToExplore({ query })
            }
          />
        </View>


        {/* ==================================================
            CATEGORIAS
            --------------------------------------------------
            Lista horizontal com as categorias disponíveis.
            Ao tocar em uma categoria, ela fica ativa e a
            tela Explore é aberta com esse filtro.
            ================================================== */}
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}

          renderItem={({ item }) => (
            <CategoryCard
              label={item}
              active={activeCategory === item}

              onPress={() => {
                setActiveCategory(item);
                goToExplore({ category: item });
              }}
            />
          )}
        />

        {/* Traço (linha fina) separando as categorias do restante
            da tela, pra ficar mais claro visualmente onde a seção
            de categorias termina. */}
        <View style={styles.divisor} />


        {/* ==================================================
            BANNER PRINCIPAL
            --------------------------------------------------
            Área de destaque para incentivar o usuário a
            explorar novos destinos.
            ================================================== */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.banner}
          onPress={() => goToExplore()}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000",
            }}
            style={styles.bannerImage}
          />

          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>
              Explore novos destinos
            </Text>

            <Text style={styles.bannerSubtitle}>
              Viva experiências inesquecíveis com a RR TURISMO.
            </Text>

            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>
                EXPLORAR VIAGENS
              </Text>
            </View>
          </View>
        </TouchableOpacity>


        {/* ==================================================
            SEÇÕES DE VIAGENS
            --------------------------------------------------
            Cada seção utiliza o componente Section para
            mostrar suas respectivas viagens.
            ================================================== */}
        <Section
          title="Destinos em destaque"
          trips={featured}
        />

        <Section
          title="Viagens populares"
          trips={popular}
        />

        <Section
          title="Ofertas especiais"
          trips={offers}
        />

      </ScrollView>
    </SafeAreaView>
  );
}


// ============================================================
// COMPONENTE SECTION
// ------------------------------------------------------------
// Componente reutilizável para mostrar uma seção de viagens.
//
// Recebe:
// - title: título da seção
// - trips: lista de viagens que será exibida
//
// Se não houver viagens, a seção não é exibida.
// ============================================================
function Section({
  title,
  trips,
}: {
  title: string;
  trips: Trip[];
}) {

  // Não mostra a seção quando não existem viagens
  if (trips.length === 0) return null;

  return (
    <View style={styles.section}>

      <Text style={typography.h2}>
        {title}
      </Text>

      {/* Lista horizontal de viagens */}
      <FlatList
        horizontal
        data={trips}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.md,
        }}

        renderItem={({ item }) => (
          <TripCard trip={item} />
        )}
      />

    </View>
  );
}


// ============================================================
// ESTILOS
// ------------------------------------------------------------
// Define aparência, espaçamentos, cores e tamanhos utilizados
// pelos componentes da tela Home.
// ============================================================
const styles = StyleSheet.create({

  // Container principal da tela
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Área da saudação do usuário
  greeting: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },

  // Espaçamento padrão das seções
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },

  // Lista horizontal de categorias
  categoryList: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },

  // Traço fino separando a seção de categorias do restante da tela.
  divisor: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },

  // ==========================================================
  // BANNER
  // ==========================================================
  banner: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    height: 180,
  },

  // Imagem ocupa todo o banner
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  // Camada escura sobre a imagem para facilitar a leitura
  // dos textos.
  bannerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,17,70,0.55)",
    padding: spacing.lg,
    justifyContent: "flex-end",
  },

  // Título principal do banner
  bannerTitle: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: "700",
  },

  // Texto complementar do banner
  bannerSubtitle: {
    color: colors.textInverse,
    marginTop: 4,
    marginBottom: spacing.md,
  },

  // Botão de ação do banner
  bannerButton: {
    backgroundColor: colors.accent,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },

  // Texto do botão
  bannerButtonText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 12,
  },
});
