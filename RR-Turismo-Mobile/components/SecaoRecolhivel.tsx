// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// "Sanfona" (accordion): um cartão com título que ESCONDE o
// conteúdo e só mostra quando a pessoa toca. Usada no checkout
// para deixar a tela limpa - dados pessoais, pagamento e cupom
// ficam recolhidos e abrem só quando necessário.
//
// Mostra um resumo curto ao lado do título quando está fechada
// (ex: "Visa •••• 4242") para a pessoa saber o que escolheu.
// ============================================================
import React from "react";
import { LayoutAnimation, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { shadows } from "../constants/shadows";

interface Props {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  resumo?: string;          // texto menor mostrado quando fechada
  aberta: boolean;
  aoAlternar: () => void;
  concluida?: boolean;      // mostra um "check" verde ao lado do título
  children: React.ReactNode;
}

export default function SecaoRecolhivel({ icone, titulo, resumo, aberta, aoAlternar, concluida, children }: Props) {
  function alternar() {
    // Animação suave de abrir/fechar (se o aparelho não suportar, só troca).
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // sem animação
    }
    aoAlternar();
  }

  return (
    <View style={styles.cartao}>
      <TouchableOpacity style={styles.cabecalho} onPress={alternar} accessibilityRole="button" accessibilityState={{ expanded: aberta }}>
        <View style={styles.icone}>
          <Ionicons name={icone} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.h3}>{titulo}</Text>
          {!aberta && !!resumo && (
            <Text style={typography.caption} numberOfLines={1}>{resumo}</Text>
          )}
        </View>
        {concluida && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
        <Ionicons name={aberta ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {aberta && <View style={styles.conteudo}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.card,
  },
  cabecalho: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  icone: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  conteudo: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
