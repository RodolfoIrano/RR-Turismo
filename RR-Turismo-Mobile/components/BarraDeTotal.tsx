// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Barra FIXA no rodapé (carrinho e checkout) com o valor total e o
// botão principal. Se houver desconto, mostra o preço antigo
// riscado. Fica sempre visível, sem precisar rolar a tela.
// ============================================================
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { shadows } from "../constants/shadows";
import { formatarMoeda } from "../services/installmentService";
import PrimaryButton from "./PrimaryButton";

interface Props {
  total: number;
  totalAntigo?: number;        // preço antes do desconto (aparece riscado)
  rotulo?: string;             // padrão: "Total"
  textoBotao: string;
  aoPressionar: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
}

export default function BarraDeTotal({
  total, totalAntigo, rotulo = "Total", textoBotao, aoPressionar, carregando, desabilitado,
}: Props) {
  return (
    <View style={styles.barra}>
      <View style={{ flex: 1 }}>
        <Text style={typography.caption}>{rotulo}</Text>
        <Text style={styles.total}>{formatarMoeda(total)}</Text>
        {!!totalAntigo && totalAntigo > total && (
          <Text style={styles.antigo}>{formatarMoeda(totalAntigo)}</Text>
        )}
      </View>
      <PrimaryButton
        label={textoBotao}
        onPress={aoPressionar}
        loading={carregando}
        disabled={desabilitado}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.elevated,
  },
  total: { fontSize: 22, fontWeight: "700", color: colors.primary },
  antigo: { fontSize: 12, color: colors.textMuted, textDecorationLine: "line-through" },
  botao: { paddingHorizontal: spacing.xl },
});
