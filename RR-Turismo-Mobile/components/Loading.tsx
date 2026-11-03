// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É a "RODINHA GIRANDO" (spinner) de carregamento, usada em
// toda tela que está buscando dados do servidor.
// ============================================================
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";

// Estado de carregamento padrão (ícone girando + texto), usado em
// todas as telas que buscam dados do backend enquanto a resposta
// ainda não chegou.
export default function Loading({ label = "Carregando..." }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[typography.bodyMuted, styles.label]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  label: { marginTop: spacing.md },
});
