// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Este é o CABEÇALHO azul que aparece no topo da tela Início.
// Tem a logo e, à direita, os botões de favoritos (coração), idioma
// (bandeira) e carrinho (com o número de itens). Tocar na logo leva
// pro perfil.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Tamanho da logo ............ styles.logo (mude width e height juntos)
//   - Imagem da logo ............. assets/images/RRTurismoClaroRecortada.png
//   - Cor de fundo do cabeçalho .. styles.container → colors.primary
//   - Botões da direita .......... bloco <View style={styles.actions}>
//   - Tamanho dos botões redondos  styles.iconButton (width/height)
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
import { useFavorites } from "../contexts/FavoritesContext";
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
  const { favorites } = useFavorites();
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
        {/* Favoritos: atalho para as viagens salvas (antes ficava na
            barra de baixo). O número mostra quantas já foram salvas. */}
        <TouchableOpacity
          accessibilityLabel="Favoritos"
          style={styles.iconButton}
          onPress={() => router.push("/favoritos")}
        >
          <Ionicons name="heart-outline" size={22} color={colors.textInverse} />
          {favorites.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{favorites.length}</Text>
            </View>
          )}
        </TouchableOpacity>

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
    paddingVertical: spacing.md,
    // Fundo azul institucional (mesma cor do site) em vez de branco.
    backgroundColor: colors.primary,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  // Texto "RR TURISMO" em branco, para contrastar com o fundo azul.
  brandText: { ...typography.h3, color: colors.textInverse },

  // ⭐ TAMANHO DA LOGO — para deixar maior ou menor, mude "width" e
  // "height" juntos, mantendo a proporção de 1.8 (largura ÷ 1.8 = altura).
  // A imagem já está recortada e inclui o nome "RR Turismo".
  logo: {
    width: 104,        // 👈 largura da logo (em pixels)
    height: 58,        // 👈 altura (largura ÷ 1.8)
  },
  actions: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
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
