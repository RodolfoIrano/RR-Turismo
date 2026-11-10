// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela "Favoritos". Mostra as viagens que o usuário marcou com o
// coração (❤️). Abre pelo coração do cabeçalho da Home, pelo Perfil
// e pelas Configurações.
//
// ⚠️ Esta tela fica em app/favoritos/ (e NÃO dentro de app/(tabs)/)
// porque telas "escondidas" da barra de abas (href: null) não abrem
// quando chamadas por router.push - elas voltam para a Início.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Título da tela ............ <TabHeader title="..."> mais abaixo
//   - Mensagem quando não há favoritos ... bloco <EmptyState> mais abaixo
//   - Cartões das viagens ....... componente TripCard
// ============================================================
import React, { useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import TripCard from "../../components/TripCard";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import TabHeader from "../../components/TabHeader";

import { useFavorites } from "../../contexts/FavoritesContext";
import { useCatalogo } from "../../contexts/CatalogoContext";

// ============================================================
// FAVORITOS
// ------------------------------------------------------------
// Tela responsável por exibir as viagens marcadas como
// favoritas pelo usuário.
//
// Os favoritos são controlados pelo FavoritesContext.
// Cada favorito possui o ID de uma viagem, então usamos esse
// ID para encontrar os dados completos da viagem na lista de
// viagens reais carregadas do backend (CatalogoContext).
// ============================================================
export default function Favorites() {

  // Pega a lista de favoritos e o estado de carregamento
  const { favorites, loading } = useFavorites();

  // Viagens reais cadastradas no site
  const { viagens } = useCatalogo();


  // ==========================================================
  // BUSCA DAS VIAGENS FAVORITAS
  // ----------------------------------------------------------
  // Para cada favorito, procura a viagem correspondente
  // dentro da lista de viagens carregadas do backend.
  //
  // useMemo evita refazer essa busca toda vez que a tela
  // for renderizada. Ela só será recalculada quando
  // "favorites" ou "viagens" mudarem.
  // ==========================================================
  const favoriteTrips = useMemo(
    () =>
      favorites

        // Procura a viagem correspondente ao ID do favorito
        .map((f) =>
          viagens.find((t) => t.id === f.tripId)
        )

        // Remove possíveis viagens que não foram encontradas
        .filter(
          (t): t is NonNullable<typeof t> => !!t
        ),

    [favorites, viagens]
  );


  // ==========================================================
  // INTERFACE DA TELA
  // ==========================================================
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >

      {/* ====================================================
          CABEÇALHO (com botão de voltar)
          ==================================================== */}
      <TabHeader title="Minhas viagens favoritas" />


      {/* ====================================================
          CONTEÚDO PRINCIPAL
          ----------------------------------------------------
          Existem três situações possíveis:
          1. Os favoritos ainda estão carregando
          2. Não existem favoritos
          3. Existem viagens favoritas para exibir
          ==================================================== */}

      {loading ? (

        // ----------------------------------------------------
        // CARREGANDO
        // ----------------------------------------------------
        // Enquanto os favoritos são carregados, mostramos
        // o componente de carregamento.
        <Loading />

      ) : favoriteTrips.length === 0 ? (

        // ----------------------------------------------------
        // NENHUM FAVORITO
        // ----------------------------------------------------
        // Caso o usuário ainda não tenha salvo nenhuma viagem,
        // mostramos uma mensagem incentivando a explorar.
        <EmptyState
          icon="heart-outline"
          title="Você ainda não possui viagens favoritas."
          message="Explore nossos destinos e salve suas viagens preferidas."
        />

      ) : (

        // ----------------------------------------------------
        // LISTA DE FAVORITOS
        // ----------------------------------------------------
        // Quando existem favoritos, cada viagem é exibida
        // utilizando o componente TripCard.
        <FlatList
          data={favoriteTrips}

          // Cada viagem possui um ID único
          keyExtractor={(item) => item.id}

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

  // Cabeçalho da tela
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
