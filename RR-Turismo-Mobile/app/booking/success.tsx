import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import PrimaryButton from "../../components/PrimaryButton";
import { useCatalogo } from "../../contexts/CatalogoContext";
import { DataDaViagem, useContagemDias } from "../../utils/datas";


// ============================================================
// CONFIRMAÇÃO DA RESERVA
// ------------------------------------------------------------
// Esta é a tela exibida depois que o usuário finaliza uma
// reserva com sucesso.
//
// Ela apresenta:
// - confirmação visual da reserva;
// - número da reserva gerado;
// - acesso às reservas do usuário;
// - opção para voltar à tela inicial.
// ============================================================
export default function BookingSuccess() {

  // Recupera o número da reserva enviado pela tela anterior
  // através dos parâmetros da rota.
  const { bookingId, tripId } = useLocalSearchParams<{
    bookingId: string;
    tripId?: string;
  }>();

  // Data real da viagem (cadastrada no site) e contagem regressiva.
  const { buscarViagem } = useCatalogo();
  const viagem = tripId ? buscarViagem(tripId) : undefined;
  const contagem = useContagemDias(viagem?.dataIda);

  // Permite realizar a navegação entre as telas do aplicativo.
  const router = useRouter();


  return (
    <SafeAreaView style={styles.safe}>

      {/* ======================================================
          CONTEÚDO PRINCIPAL
          ------------------------------------------------------
          Centraliza todas as informações da confirmação
          no meio da tela.
          ====================================================== */}
      <View style={styles.content}>

        {/* ====================================================
            ÍCONE DE SUCESSO
            ----------------------------------------------------
            Círculo verde com um ícone de check para indicar
            visualmente que a reserva foi concluída.
            ==================================================== */}
        <View style={styles.iconCircle}>
          <Ionicons
            name="checkmark"
            size={40}
            color={colors.textInverse}
          />
        </View>


        {/* ====================================================
            MENSAGEM DE CONFIRMAÇÃO
            ==================================================== */}
        <Text style={typography.h1}>
          Reserva realizada!
        </Text>

        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Sua viagem foi reservada com sucesso.
        </Text>


        {/* ====================================================
            NÚMERO DA RESERVA
            ----------------------------------------------------
            Mostra ao usuário o identificador da reserva para
            que ele possa consultá-la posteriormente.
            ==================================================== */}
        <View style={styles.bookingBox}>

          <Text style={typography.caption}>
            Número da reserva
          </Text>

          <Text style={styles.bookingId}>
            #{bookingId}
          </Text>

        </View>


        {/* Data da viagem e quantos dias faltam */}
        {viagem?.dataIda && (
          <View style={styles.bookingBox}>
            <Text style={typography.caption}>Data da viagem</Text>
            <Text style={styles.bookingId}>{new DataDaViagem(viagem.dataIda).curta()}</Text>
            {contagem && <Text style={typography.bodyMuted}>{contagem}</Text>}
          </View>
        )}

        {/* ====================================================
            BOTÕES DE NAVEGAÇÃO
            ----------------------------------------------------
            O primeiro botão leva para a lista de reservas.
            O segundo retorna para a Home.
            ==================================================== */}

        <PrimaryButton
          label="VER MINHAS RESERVAS"
          onPress={() => router.replace("/bookings")}
          style={{
            marginTop: spacing.xl,
            width: "100%",
          }}
        />

        <PrimaryButton
          label="VOLTAR PARA HOME"
          variant="outline"
          onPress={() => router.replace("/(tabs)")}
          style={{
            marginTop: spacing.md,
            width: "100%",
          }}
        />

      </View>
    </SafeAreaView>
  );
}


// ============================================================
// ESTILOS DA TELA
// ------------------------------------------------------------
// Define o posicionamento, espaçamento, cores e aparência dos
// elementos utilizados na confirmação da reserva.
// ============================================================
const styles = StyleSheet.create({

  // Container principal da tela
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },


  // Centraliza o conteúdo vertical e horizontalmente
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },


  // Círculo verde utilizado para indicar sucesso
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },


  // Espaçamento entre a mensagem principal e o subtítulo
  subtitle: {
    marginTop: spacing.xs,
    textAlign: "center",
  },


  // Caixa que destaca o número da reserva
  bookingBox: {
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },


  // Estilo do identificador da reserva
  bookingId: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
});
