// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela do CARRINHO, redesenhada: cartões limpos com foto grande,
// controle de quantidade em "pílula" e uma barra fixa embaixo com
// o total e o botão "Continuar". Qualquer pessoa pode montar o
// carrinho SEM login; o login só é pedido ao finalizar a compra.
// ============================================================
import React from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { shadows } from "../../constants/shadows";

import PriceDisplay from "../../components/PriceDisplay";
import EmptyState from "../../components/EmptyState";
import TabHeader from "../../components/TabHeader";
import BarraDeTotal from "../../components/BarraDeTotal";

import { useCart } from "../../contexts/CartContext";
import { useTraducao } from "../../traducoes/TraducaoContext";
import { CartItem } from "../../types";

export default function Cart() {
  const router = useRouter();
  const { t } = useTraducao();
  const { items, getTripForItem, updateQuantity, removeFromCart, total, itemCount } = useCart();

  // ---------- Carrinho vazio ----------
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <TabHeader title={t.abas.carrinho} />
        <EmptyState
          icon="cart-outline"
          title="Seu carrinho está vazio."
          message="Adicione uma viagem para começar a planejar sua próxima aventura."
        />
        <View style={styles.vazioAcao}>
          <TouchableOpacity style={styles.explorar} onPress={() => router.push("/(tabs)/explore")}>
            <Ionicons name="search" size={18} color={colors.textInverse} />
            <Text style={styles.explorarTexto}>Explorar viagens</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Um cartão por viagem ----------
  function renderItem({ item }: { item: CartItem }) {
    const trip = getTripForItem(item.tripId);
    if (!trip) return null;

    return (
      <View style={styles.cartao}>
        <Image source={{ uri: trip.images[0] }} style={styles.imagem} />

        <View style={styles.info}>
          <View style={styles.topo}>
            <Text style={[typography.h3, { flex: 1 }]} numberOfLines={2}>{trip.title}</Text>
            <TouchableOpacity
              onPress={() => removeFromCart(item.tripId)}
              accessibilityLabel="Remover viagem do carrinho"
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.local}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={typography.caption} numberOfLines={1}>{trip.location}</Text>
          </View>

          <View style={styles.rodape}>
            {/* Quantidade de pessoas, em "pílula" */}
            <View style={styles.pilula}>
              <TouchableOpacity
                style={styles.botaoQtd}
                accessibilityLabel="Diminuir quantidade"
                onPress={() => updateQuantity(item.tripId, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtd}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.botaoQtd}
                accessibilityLabel="Aumentar quantidade"
                onPress={() => updateQuantity(item.tripId, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <PriceDisplay price={trip.price * item.quantity} suffix="" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <TabHeader title={t.abas.carrinho} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <Text style={typography.bodyMuted}>{itemCount} pessoa(s) • {items.length} viagem(ns)</Text>
        }
      />

      <BarraDeTotal
        total={total}
        textoBotao="Continuar"
        aoPressionar={() => router.push("/checkout")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundMuted },
  lista: { padding: spacing.lg, gap: spacing.md },

  cartao: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.card,
  },
  imagem: { width: 108, backgroundColor: colors.border },
  info: { flex: 1, padding: spacing.md, gap: spacing.xs },
  topo: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  local: { flexDirection: "row", alignItems: "center", gap: 4 },
  rodape: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },

  pilula: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.full,
    padding: 2,
  },
  botaoQtd: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  qtd: { minWidth: 30, textAlign: "center", fontWeight: "800", color: colors.text },

  vazioAcao: { padding: spacing.xl },
  explorar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  explorarTexto: { color: colors.textInverse, fontWeight: "700" },
});
