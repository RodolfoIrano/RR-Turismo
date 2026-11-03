// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela "vazia" reutilizável - aparece quando não tem nada pra
// mostrar (sem favoritos, sem reservas, erro de conexão, etc).
// ============================================================
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";

// ============================================================
// ESTADO VAZIO (EmptyState)
// ------------------------------------------------------------
// Componente genérico reutilizável em várias telas, para quando
// não há nada para mostrar: lista de favoritos vazia, nenhuma
// reserva ainda, erro ao carregar dados, busca sem resultados,
// etc. Recebe um ícone, um título e (opcionalmente) uma
// mensagem menor explicando melhor a situação.
// ============================================================
interface Props {
  icon?: keyof typeof Ionicons.glyphMap; // ícone exibido acima do texto
  title: string;
  message?: string; // texto menor, opcional, abaixo do título
}

export default function EmptyState({ icon = "airplane-outline", title, message }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={[typography.h3, styles.title]}>{title}</Text>
      {message ? <Text style={[typography.bodyMuted, styles.message]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  title: { marginTop: spacing.md, textAlign: "center" },
  message: { marginTop: spacing.xs, textAlign: "center" },
});
