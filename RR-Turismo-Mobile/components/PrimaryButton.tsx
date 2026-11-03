// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o BOTÃO AZUL principal usado em quase todo o app (Entrar,
// Cadastrar, Finalizar Reserva, etc).
// ============================================================
import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { shadows } from "../constants/shadows";

interface Props {
  label: string; // Texto exibido dentro do botão
  onPress: () => void; // Ação executada ao tocar
  loading?: boolean; // Mostra um spinner no lugar do texto (ex: aguardando resposta do servidor)
  disabled?: boolean; // Desabilita o toque e deixa o botão "apagado"
  variant?: "primary" | "outline"; // "primary" = preenchido; "outline" = só a borda
  style?: ViewStyle; // Estilos extras, para ajustar espaçamento em cada tela
}

// Botão padrão do app, usado em todas as telas com ações principais
// (entrar, criar conta, adicionar ao carrinho, finalizar reserva...).
export default function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  const isOutline = variant === "outline";
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        isOutline ? styles.outline : styles.filled,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.textInverse} />
      ) : (
        <Text style={[typography.button, isOutline && { color: colors.primary }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: {
    backgroundColor: colors.primary,
    // Sombra leve, pra dar a sensação de "botão elevado" (mais
    // convidativo a tocar do que um retângulo totalmente chapado).
    ...shadows.card,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});
