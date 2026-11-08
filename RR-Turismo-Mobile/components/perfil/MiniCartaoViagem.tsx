// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cartãozinho de uma viagem (foto + título + detalhe) usado nas
// fileiras do PERFIL: "Próximas viagens", "Viagens realizadas" e
// "Salvas". Tocar abre a tela da viagem.
// ============================================================
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import type { Trip } from "../../types";

interface Props {
  viagem: Trip;
  detalhe?: string;       // ex: "10/12/2026" ou "Faltam 3 dias"
  icone?: keyof typeof Ionicons.glyphMap;
}

export default function MiniCartaoViagem({ viagem, detalhe, icone = "calendar-outline" }: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cartao}
      onPress={() => router.push(`/trip/${viagem.id}`)}
      accessibilityRole="button"
    >
      <Image source={{ uri: viagem.images[0] }} style={styles.foto} contentFit="cover" transition={200} />
      <View style={styles.texto}>
        <Text style={styles.titulo} numberOfLines={1}>{viagem.title}</Text>
        {!!detalhe && (
          <View style={styles.linha}>
            <Ionicons name={icone} size={12} color={colors.secondary} />
            <Text style={styles.detalhe} numberOfLines={1}>{detalhe}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartao: {
    width: 170,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    shadowColor: "#001146",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  foto: { width: "100%", height: 100, backgroundColor: colors.backgroundMuted },
  texto: { padding: spacing.md },
  titulo: { fontSize: 14, fontWeight: "800", color: colors.primary },
  linha: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  detalhe: { flex: 1, fontSize: 12, color: colors.textSecondary },
});
