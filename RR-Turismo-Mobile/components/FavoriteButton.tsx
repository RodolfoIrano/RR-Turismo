// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o BOTÃO DE CORAÇÃO (❤️) usado pra favoritar uma viagem.
// ============================================================
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius } from "../constants/spacing";

interface Props {
  active: boolean; // Se o item já está favoritado (mostra o coração preenchido)
  onPress: () => void;
  size?: number; // Tamanho do ícone
}

// Botão de coração usado nos cards e na tela de detalhes da viagem.
export default function FavoriteButton({ active, onPress, size = 20 }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      style={styles.button}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name={active ? "heart" : "heart-outline"}
        size={size}
        color={active ? colors.favorite : colors.text}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    // Fundo branco semitransparente (colors.overlayLight), para o
    // ícone ficar legível independente da cor da foto por trás.
    backgroundColor: colors.overlayLight,
    padding: 6,
    borderRadius: radius.full,
  },
});
