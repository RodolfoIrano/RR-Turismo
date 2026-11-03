// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É a BARRA DE BUSCA (campo com a lupa 🔍) usada na tela Explorar.
// ============================================================
import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import BotaoMicrofone from "./BotaoMicrofone";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";

interface Props {
  value: string; // texto atual digitado
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void; // chamado quando o usuário aperta "buscar" no teclado
  placeholder?: string;
}

// Campo de pesquisa da Home. Busca por nome da viagem, destino,
// cidade, estado ou categoria (ver tripService.getTrips).
export default function SearchBar({ value, onChangeText, onSubmitEditing, placeholder }: Props) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder ?? "Para onde você quer ir?"}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Pesquisar viagens"
        returnKeyType="search"
      />
      {/* Segure para falar: o texto falado vira a busca. */}
      <BotaoMicrofone aoTexto={(texto) => texto && onChangeText(texto)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, marginLeft: spacing.sm, fontSize: 15, color: colors.text },
});
