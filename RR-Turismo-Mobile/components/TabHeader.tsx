// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o CABEÇALHO com a setinha de voltar (←), usado no topo das
// abas Explorar, Favoritos, Carrinho e Perfil.
// ============================================================
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

// ============================================================
// CABEÇALHO COM BOTÃO DE VOLTAR (usado nas abas Explorar,
// Favoritos, Carrinho e Perfil - a aba Início não tem, por ser
// a tela raiz do app).
// ------------------------------------------------------------
// "router.back()" volta para a última tela visitada (ex: se o
// usuário chegou aqui tocando no ícone de coração do cabeçalho
// da Home, volta para a Home). Se não houver um histórico para
// voltar (ex: o app abriu direto nesta aba), leva para o Início
// em vez de não fazer nada.
// ============================================================
interface Props {
  title: string;
}

export default function TabHeader({ title }: Props) {
  const router = useRouter();

  function handleVoltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleVoltar}
        style={styles.backButton}
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[typography.h1, styles.title]}>{title}</Text>

      {/* Espaço vazio do mesmo tamanho do botão, só para o título
          ficar centralizado de verdade (balanceando o botão à esquerda). */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  spacer: {
    width: 24 + spacing.sm * 2,
  },
});
