// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Este é o CABEÇALHO azul que aparece no topo da tela Início.
// Tem a logo, o nome "RR TURISMO", e os botões de favoritos e
// carrinho (com o número de itens). Tocar na logo leva pro perfil.
// ============================================================
import React, { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useCart } from "../contexts/CartContext";
import { useTraducao } from "../traducoes/TraducaoContext";
import { buscarInfoIdioma } from "../traducoes/idiomasDisponiveis";
import SeletorIdioma from "./SeletorIdioma";

// Cabeçalho profissional exibido na Home: logo + nome do app,
// botão de idioma (bandeira), favoritos e carrinho (com badge
// de quantidade). Mantém-se compacto para não ocupar espaço
// excessivo no mobile.
export default function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { idioma } = useTraducao();
  const infoIdiomaAtual = buscarInfoIdioma(idioma);

  // Controla se o modal de troca de idioma está aberto.
  const [seletorAberto, setSeletorAberto] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.brand}
        activeOpacity={0.7}
        accessibilityLabel="Ir para o meu perfil"
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Image
          source={require("../assets/images/RRTurismoClaroRecortada.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.actions}>
        {/* Botão de idioma - mostra a bandeira do idioma atual.
            Toca pra abrir o seletor (globo + bandeiras + busca). */}
        <TouchableOpacity
          accessibilityLabel="Trocar idioma"
          style={styles.iconButton}
          onPress={() => setSeletorAberto(true)}
        >
          <Text style={styles.bandeiraAtual}>{infoIdiomaAtual.bandeira}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Carrinho"
          style={styles.iconButton}
          onPress={() => router.push("/(tabs)/cart")}
        >
          <Ionicons name="cart-outline" size={22} color={colors.textInverse} />
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal do seletor de idioma, só fica visível quando aberto. */}
      <SeletorIdioma visivel={seletorAberto} aoFechar={() => setSeletorAberto(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    // Fundo azul institucional (mesma cor do site) em vez de branco.
    backgroundColor: colors.primary,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  // Texto "RR TURISMO" em branco, para contrastar com o fundo azul.
  brandText: { ...typography.h3, color: colors.textInverse },

  // ⭐ TAMANHO DA LOGO — mude os números "width" e "height" abaixo
  // para deixar a logo maior ou menor (os dois precisam ficar
  // sempre com o MESMO valor, pra não distorcer a imagem).
  // A imagem já está recortada e inclui o nome "RR Turismo".
  logo: {
    width: 96,         // 👈 largura da logo (em pixels)
    aspectRatio: 1.8,  // proporção da imagem; a altura segue sozinha
  },
  actions: { flexDirection: "row", gap: spacing.sm },
  iconButton: {
    padding: spacing.sm,
    borderRadius: radius.full,
    // Um azul um pouco mais escuro que o fundo, só para o botão se
    // destacar sutilmente (em vez do cinza usado sobre fundo branco).
    backgroundColor: colors.primaryDark,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.textInverse, fontSize: 10, fontWeight: "700" },
  // Bandeira exibida dentro do botão de idioma, no cabeçalho.
  bandeiraAtual: { fontSize: 18 },
});
