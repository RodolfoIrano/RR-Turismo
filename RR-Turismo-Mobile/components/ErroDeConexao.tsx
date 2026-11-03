// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cartão de ERRO com o motivo real e botão "Tentar de novo".
// Usado nas telas ao vivo (Modo Guia / Minha viagem): antes, quando
// o servidor dava erro, a tela ficava em branco sem explicar nada.
// ============================================================
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

interface Props {
  mensagem: string;
  aoTentarDeNovo: () => void;
}

export default function ErroDeConexao({ mensagem, aoTentarDeNovo }: Props) {
  return (
    <View style={styles.cartao}>
      <Ionicons name="cloud-offline-outline" size={36} color={colors.danger} />
      <Text style={typography.h3}>Não foi possível carregar</Text>
      <Text style={[typography.bodyMuted, styles.centro]}>{mensagem}</Text>
      <TouchableOpacity style={styles.botao} onPress={aoTentarDeNovo} accessibilityRole="button">
        <Ionicons name="refresh" size={18} color={colors.textInverse} />
        <Text style={styles.botaoTexto}>Tentar de novo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  centro: { textAlign: "center" },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  botaoTexto: { color: colors.textInverse, fontWeight: "700" },
});
