// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela "Explorar" (2ª aba). Tem a busca por texto e os filtros
// (categoria, preço, avaliação) pra encontrar viagens.
// ============================================================
import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import SearchBar from "../../components/SearchBar";
import CategoryCard from "../../components/CategoryCard";
import TripCard from "../../components/TripCard";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import TabHeader from "../../components/TabHeader";

import { Trip } from "../../types";
import * as tripService from "../../services/tripService";

// ============================================================
// EXPLORAR / PESQUISA E FILTROS
// ------------------------------------------------------------
// Tela responsável por pesquisar e filtrar as viagens.
//
// A tela pode receber uma pesquisa ou categoria através dos
// parâmetros da rota, por exemplo, quando o usuário vem da Home.
//
// A busca é feita pelo tripService, que já consulta as viagens
// REAIS cadastradas no site (backend Spring) - não usa mais
// dados fictícios.
// ============================================================
export default function Explore() {

  // ==========================================================
  // PARÂMETROS RECEBIDOS PELA ROTA
  // ----------------------------------------------------------
  // query  -> texto que será pesquisado
  // category -> categoria selecionada
  // ==========================================================
  const params = useLocalSearchParams<{
    query?: string;
    category?: string;
  }>();


  // ==========================================================
  // ESTADOS DA TELA
  // ==========================================================

  // Texto digitado na barra de pesquisa
  const [query, setQuery] = useState(params.query ?? "");

  // Categoria atualmente selecionada
  const [category, setCategory] = useState<string | null>(
    params.category || null
  );

  // Lista de categorias disponíveis
  const [categories, setCategories] = useState<string[]>([]);

  // Lista de viagens encontradas
  const [trips, setTrips] = useState<Trip[]>([]);

  // Controla o estado da busca
  const [status, setStatus] = useState<
    "loading" | "success" | "empty" | "error"
  >("loading");


  // ==========================================================
  // FUNÇÃO DE PESQUISA
  // ----------------------------------------------------------
  // Busca as categorias e as viagens ao mesmo tempo.
  //
  // Promise.all permite executar as duas operações
  // simultaneamente, deixando o carregamento mais eficiente.
  // ==========================================================
  const runSearch = useCallback(async () => {

    // Enquanto a busca está acontecendo, mostramos loading
    setStatus("loading");

    try {

      // Busca categorias e viagens simultaneamente
      const [cats, results] = await Promise.all([
        tripService.getCategories(),

        tripService.getTrips({
          query,
          category: category ?? undefined,
        }),
      ]);

      // Atualiza a lista de categorias
      setCategories(cats);

      // Atualiza a lista de viagens encontradas
      setTrips(results);

      // Define o resultado da pesquisa
      // Se não encontrou viagens, muda para "empty"
      setStatus(
        results.length === 0
          ? "empty"
          : "success"
      );

    } catch {

      // Caso aconteça algum erro durante a busca
      setStatus("error");
    }

  }, [query, category]);


  // ==========================================================
  // EXECUTA A BUSCA QUANDO A CATEGORIA MUDA
  // ----------------------------------------------------------
  // useEffect observa a categoria selecionada.
  // Quando ela muda, uma nova pesquisa é realizada.
  // ==========================================================
  useEffect(() => {
    runSearch();

    // A busca é controlada manualmente pelas dependências
    // definidas acima.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);


  // ==========================================================
  // INTERFACE DA TELA
  // ==========================================================
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>

      {/* ======================================================
          CABEÇALHO
          ------------------------------------------------------
          Contém o título, barra de pesquisa e categorias.
          ====================================================== */}
      <View style={styles.header}>

        {/* Título da tela, com botão de voltar */}
        <TabHeader title="Explorar" />


        {/* ====================================================
            BARRA DE PESQUISA
            ----------------------------------------------------
            O usuário pode digitar um destino ou outro termo.
            A pesquisa é executada ao confirmar o teclado.
            ==================================================== */}
        <View style={{ marginTop: spacing.md }}>

          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={runSearch}
          />

        </View>


        {/* ====================================================
            LISTA DE CATEGORIAS
            ----------------------------------------------------
            Mostra as categorias horizontalmente para que o
            usuário possa filtrar as viagens.
            ==================================================== */}
        <FlatList
          horizontal
          data={categories}

          // Cada categoria usa seu próprio nome como chave
          keyExtractor={(item) => item}

          // Remove a barra de rolagem horizontal
          showsHorizontalScrollIndicator={false}

          contentContainerStyle={{
            marginTop: spacing.md,
          }}

          renderItem={({ item }) => (

            <CategoryCard

              // Nome da categoria
              label={item}

              // Verifica se essa categoria está selecionada
              active={category === item}

              // Ao clicar novamente na categoria selecionada,
              // o filtro é removido.
              onPress={() =>
                setCategory(
                  category === item
                    ? null
                    : item
                )
              }
            />

          )}
        />

      </View>


      {/* ======================================================
          ESTADO DE CARREGAMENTO
          ====================================================== */}
      {status === "loading" && (
        <Loading label="Buscando viagens..." />
      )}


      {/* ======================================================
          ESTADO DE ERRO
          ------------------------------------------------------
          Aparece quando não foi possível buscar os dados.
          ====================================================== */}
      {status === "error" && (
        <EmptyState
          icon="cloud-offline-outline"
          title="Não foi possível carregar as viagens."
          message="Tente novamente em instantes."
        />
      )}


      {/* ======================================================
          NENHUM RESULTADO
          ------------------------------------------------------
          Aparece quando a pesquisa foi realizada, mas nenhuma
          viagem corresponde aos filtros utilizados.
          ====================================================== */}
      {status === "empty" && (
        <EmptyState
          icon="search-outline"
          title="Nenhuma viagem encontrada."
          message="Tente buscar por outro destino ou categoria."
        />
      )}


      {/* ======================================================
          RESULTADOS
          ------------------------------------------------------
          Quando existem viagens, elas são exibidas em uma
          lista utilizando o componente TripCard.
          ====================================================== */}
      {status === "success" && (
        <FlatList
          data={trips}

          // Cada viagem possui um ID único
          keyExtractor={(item) => item.id}

          // Lista com uma coluna
          numColumns={1}

          // Espaçamento ao redor da lista
          contentContainerStyle={{
            padding: spacing.lg,
          }}

          // Renderiza cada viagem como um card horizontal
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              variant="horizontal"
            />
          )}
        />
      )}

    </SafeAreaView>
  );
}


// ============================================================
// ESTILOS DA TELA
// ------------------------------------------------------------
// Define o fundo da tela e o espaçamento do cabeçalho.
// ============================================================
const styles = StyleSheet.create({

  // Container principal
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Área superior com título, pesquisa e categorias
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
