// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela "Minhas Reservas". Mostra a lista de viagens que o
// usuário já reservou, com status (confirmada/pendente/
// cancelada), quantos dias faltam pra viagem, e um botão pra
// comprar a mesma viagem de novo.
// ============================================================
import { DataDaViagem, useContagemDias } from "../../utils/datas";
import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTraducao } from "../../traducoes/TraducaoContext";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

import { Booking, BookingStatus } from "../../types";
import * as bookingService from "../../services/bookingService";

import { useCatalogo } from "../../contexts/CatalogoContext";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { VISITANTE } from "../../services/ArmazenamentoPorConta";


// ============================================================
// MINHAS RESERVAS
// ------------------------------------------------------------
// Tela responsável por listar as reservas realizadas pelo
// usuário.
//
// As reservas em si ficam guardadas localmente no aparelho
// (bookingService, via AsyncStorage) - futuramente essa mesma
// função poderá buscar de uma API (GET /api/bookings), quando
// o backend tiver essa rota.
//
// Os dados da viagem/guia de cada reserva vêm do CatalogoContext
// (viagens reais cadastradas no site).
// ============================================================
export default function Bookings() {

  // Guarda a lista de reservas carregadas
  const { user } = useAuth();
  const dono = user?.id ?? VISITANTE; // as reservas são separadas por conta
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Controla o estado atual da tela:
  // carregando, sucesso, vazia ou erro.
  const [status, setStatus] = useState<
    "loading" | "success" | "empty" | "error"
  >("loading");


  // ==========================================================
  // CARREGAMENTO DAS RESERVAS
  // ----------------------------------------------------------
  // Busca as reservas através do bookingService e atualiza
  // o estado da tela de acordo com o resultado.
  // ==========================================================
  const load = useCallback(async () => {

    setStatus("loading");

    try {
      // Busca as reservas armazenadas
      const data = await bookingService.getBookings(dono);

      setBookings(data);

      // Se não houver reservas, mostra o estado vazio.
      // Caso contrário, informa que os dados foram carregados.
      setStatus(
        data.length === 0
          ? "empty"
          : "success"
      );

    } catch {
      // Caso aconteça algum problema no carregamento,
      // mostramos uma mensagem de erro ao usuário.
      setStatus("error");
    }
  }, [dono]);


  // ==========================================================
  // CARREGAMENTO INICIAL
  // ----------------------------------------------------------
  // Executa a função load assim que a tela é montada.
  // ==========================================================
  useEffect(() => {
    load();
  }, [load]);


  // ==========================================================
  // ESTADOS DA TELA
  // ----------------------------------------------------------
  // Antes de mostrar a lista, verificamos se os dados ainda
  // estão carregando, se ocorreu um erro ou se não existem
  // reservas cadastradas.
  // ==========================================================

  if (status === "loading") {
    return (
      <Loading label="Carregando reservas..." />
    );
  }


  if (status === "error") {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Não foi possível carregar suas reservas."
      />
    );
  }


  if (status === "empty") {
    return (
      <EmptyState
        icon="briefcase-outline"
        title="Você ainda não possui reservas."
        message="Suas próximas aventuras aparecerão aqui."
      />
    );
  }


  // ==========================================================
  // LISTA DE RESERVAS
  // ----------------------------------------------------------
  // Quando existem reservas, cada item da lista é renderizado
  // através do componente BookingCard.
  // ==========================================================
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["bottom"]}
    >
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.lg,
        }}
        renderItem={({ item }) => (
          <BookingCard booking={item} />
        )}
      />
    </SafeAreaView>
  );
}


// ============================================================
// CARD DA RESERVA
// ------------------------------------------------------------
// Componente responsável por exibir as informações de uma
// reserva individual.
//
// A partir do tripId e guideId da reserva, buscamos os dados
// completos da viagem e do guia no CatalogoContext (que já
// carregou as viagens reais cadastradas no site).
// ============================================================
function BookingCard({
  booking,
}: {
  booking: Booking;
}) {

  const router = useRouter();
  const { t } = useTraducao();

  // Procura a viagem e o guia relacionados à reserva, na lista
  // de viagens reais carregadas do backend (CatalogoContext).
  const { buscarViagem, buscarGuia } = useCatalogo();
  const trip = buscarViagem(booking.tripId);
  const guide = buscarGuia(booking.guideId);

  // Função responsável por adicionar o carrinho novamente com
  // esta mesma viagem, para o usuário comprar de novo facilmente.
  const { addToCart } = useCart();

  // Só mostra a contagem de dias em reservas confirmadas (não
  // faz sentido contar dias para uma reserva cancelada).
  // A data usada é a da VIAGEM (cadastrada no site), não a da compra.
  // Reservas antigas sem data usam a data atual da viagem no catálogo.
  const dataIda = trip?.dataIda ?? booking.dataIda;
  const textoContagem = useContagemDias(dataIda);
  const contagem = booking.status === "Confirmada" ? textoContagem : null;

  // Abre a tela "Minha viagem" (radar/avisos/ajuda) desta reserva.
  function handleMinhaViagem() {
    router.push(`/minha-viagem/${booking.tripId}`);
  }

  function handleComprarNovamente() {
    if (!trip) return;
    addToCart(trip.id, booking.people || 1);
    // Leva o usuário direto pro carrinho, já com a viagem adicionada.
    router.push("/(tabs)/cart");
  }

  return (
    <View style={styles.card}>

      {/* ====================================================
          CABEÇALHO DO CARD
          ----------------------------------------------------
          Mostra o nome da viagem e o status atual da reserva.
          ==================================================== */}
      <View style={styles.cardHeader}>

        <Text style={typography.h3}>
          {trip?.title ?? "Viagem"}
        </Text>

        <StatusBadge status={booking.status} />

      </View>


      {/* Localização da viagem */}
      <Text style={typography.bodyMuted}>
        {trip?.location}
      </Text>


      {/* Data da reserva e quantidade de pessoas */}
      {dataIda && (
        <Text style={typography.body}>
          Viagem: {new DataDaViagem(dataIda).porExtenso()}
          {(trip?.dataVolta ?? booking.dataVolta)
            ? ` → ${new DataDaViagem(trip?.dataVolta ?? booking.dataVolta).curta()}`
            : ""}
        </Text>
      )}
      <Text style={typography.bodyMuted}>
        Reservado em {new Date(booking.date).toLocaleDateString("pt-BR")}
        {" • "}
        {booking.people} pessoa(s)
      </Text>


      {/* Como foi pago (reservas antigas não têm essa informação) */}
      {!!booking.paymentLabel && (
        <Text style={typography.bodyMuted}>
          Pagamento: {booking.paymentLabel}
        </Text>
      )}


      {/* Mostra o guia somente quando ele foi encontrado */}
      {guide && (
        <Text style={typography.bodyMuted}>
          Guia: {guide.name}
        </Text>
      )}


      {/* ====================================================
          CONTAGEM REGRESSIVA
          ----------------------------------------------------
          Aviso de quantos dias faltam para a viagem acontecer.
          Só aparece se a viagem ainda não passou.
          ==================================================== */}
      {contagem && (
        <View style={styles.contagemBox}>
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={styles.contagemTexto}>{contagem}</Text>
        </View>
      )}


      {/* Valor total da reserva */}
      <Text style={styles.total}>
        {booking.total.toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          }
        )}
      </Text>


      {/* Identificador da reserva */}
      <Text style={typography.caption}>
        Reserva #{booking.id}
      </Text>


      {/* ====================================================
          COMPRAR NOVAMENTE
          ----------------------------------------------------
          Atalho para reservar a mesma viagem de novo - só
          aparece se ainda conseguirmos encontrar a viagem no
          catálogo (ela pode ter sido removida do site).
          ==================================================== */}
      {/* MINHA VIAGEM: só em reservas confirmadas. */}
      {booking.status === "Confirmada" && (
        <TouchableOpacity
          style={styles.comprarNovamenteBtn}
          onPress={handleMinhaViagem}
          accessibilityRole="button"
        >
          <Ionicons name="radio-outline" size={16} color={colors.primary} />
          <Text style={styles.comprarNovamenteTexto}>{t.aoVivo.minhaViagemBotao}</Text>
        </TouchableOpacity>
      )}

      {trip && (
        <TouchableOpacity
          style={styles.comprarNovamenteBtn}
          onPress={handleComprarNovamente}
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={styles.comprarNovamenteTexto}>Comprar novamente</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}


// ============================================================
// STATUS DA RESERVA
// ------------------------------------------------------------
// Exibe uma pequena etiqueta colorida de acordo com o status.
//
// Confirmada -> verde
// Pendente   -> amarelo
// Outros     -> vermelho
// ============================================================
function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {

  // Define a cor do badge de acordo com o status recebido
  const color =
    status === "Confirmada"
      ? colors.success
      : status === "Pendente"
        ? colors.warning
        : colors.danger;


  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
        },
      ]}
    >
      <Text style={styles.badgeText}>
        {status}
      </Text>
    </View>
  );
}


// ============================================================
// ESTILOS
// ------------------------------------------------------------
// Define a aparência dos cards, status, espaçamentos e demais
// elementos utilizados nesta tela.
// ============================================================
const styles = StyleSheet.create({

  // Container principal
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },


  // Card individual de cada reserva
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },


  // Organiza o título da viagem e o status lado a lado
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },


  // Pequena etiqueta que mostra o status
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },


  // Texto dentro da etiqueta de status
  badgeText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: "700",
  },


  // Destaque para o valor total da reserva
  total: {
    ...typography.price,
    marginTop: spacing.sm,
  },

  // Caixinha com o ícone de calendário + "Faltam X dias"
  contagemBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.backgroundMuted,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  contagemTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },

  // Botão "Comprar novamente"
  comprarNovamenteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  comprarNovamenteTexto: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});