// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o CARTÃO com a foto/nome de um guia, usado dentro de listas
// (ex: na tela de detalhes da viagem).
// ============================================================
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./TextoTraduzido";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Guide } from "../types";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { shadows } from "../constants/shadows";
import { typography } from "../constants/typography";
import Rating from "./Rating";

// Card compacto de guia, usado em listagens (ex: futura tela "Guias").
export default function GuideCard({ guide }: { guide: Guide }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/guide/${guide.id}`)}
      style={styles.card}
    >
      <Image source={{ uri: guide.photo }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={typography.h3}>{guide.name}</Text>
        <Text style={typography.bodyMuted}>{guide.location}</Text>
        <Rating rating={guide.rating} reviewCount={guide.reviewCount} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatar: { width: 56, height: 56, borderRadius: radius.full, marginRight: spacing.md },
});
