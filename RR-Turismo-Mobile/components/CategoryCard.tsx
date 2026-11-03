// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o "chip" (bolinha/pílula) de categoria que aparece na Home,
// tipo "Praia", "Aventura" - usado pra filtrar viagens.
// ============================================================
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";

interface Props {
  label: string; // nome da categoria, ex: "Praia", "Aventura"
  active?: boolean; // true quando esta é a categoria selecionada no momento
  onPress: () => void;
}

// Chip de categoria usado na Home para filtrar viagens rapidamente.
// Quando "active" é true, fica destacado com a cor principal do app.
export default function CategoryCard({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  textActive: { color: colors.textInverse },
});
