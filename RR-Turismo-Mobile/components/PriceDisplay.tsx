// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Formata e mostra um PREÇO em Real (R$ 599,90) do jeito certo,
// usado nos cards de viagem e no checkout.
// ============================================================
import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { typography } from "../constants/typography";
import { colors } from "../constants/colors";

interface Props {
  price: number; // valor em reais, ex: 599.9
  suffix?: string; // texto pequeno depois do preço, ex: "/pessoa"
}

// Formata valores em Real (R$ 599,90) de forma consistente no app.
// Usado nos cards de viagem, na tela de detalhes e no checkout.
export default function PriceDisplay({ price, suffix }: Props) {
  const formatted = price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <Text style={typography.price}>
      {formatted}
      {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  suffix: { fontSize: 12, fontWeight: "400", color: colors.textSecondary },
});
