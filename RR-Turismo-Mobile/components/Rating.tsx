// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Mostra a ESTRELINHA (⭐) com a nota da viagem/guia, tipo "4.8".
// ============================================================
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";

interface Props {
  rating: number; // nota de 0 a 5, ex: 4.8
  reviewCount?: number; // quantidade de avaliações (opcional - se omitido, mostra só a nota)
  size?: number; // tamanho do ícone de estrela
}

// Exibe a nota (estrela) e, opcionalmente, a quantidade de avaliações.
// Usado nos cards de viagem, na tela de detalhes e no perfil do guia.
export default function Rating({ rating, reviewCount, size = 14 }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name="star" size={size} color={colors.star} />
      {/* toFixed(1) garante sempre uma casa decimal, ex: "4.8" em vez de "4.8333..." */}
      <Text style={[typography.caption, styles.value]}>{rating.toFixed(1)}</Text>
      {reviewCount !== undefined && (
        <Text style={typography.caption}> ({reviewCount} avaliações)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  value: { marginLeft: spacing.xs / 2, fontWeight: "700", color: colors.text },
});
