// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Início do MODO GUIA: lista as viagens criadas pelo usuário (no
// site) para ele escolher qual vai acompanhar ao vivo.
// Só aparece para quem tem o campo "guia" no cadastro.
// ============================================================
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { shadows } from "../../constants/shadows";
import { useAuth } from "../../contexts/AuthContext";
import { useCatalogo } from "../../contexts/CatalogoContext";
import { useTraducao } from "../../traducoes/TraducaoContext";
import EmptyState from "../../components/EmptyState";

export default function ModoGuia() {
  const router = useRouter();
  const { t } = useTraducao();
  const { user } = useAuth();
  const { viagens } = useCatalogo();

  // Viagens cujo criador (guia) é o usuário logado.
  const minhas = viagens.filter((v) => v.guideId === user?.id);

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: true, title: t.aoVivo.modoGuia }} />
      <FlatList
        data={minhas}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <Text style={typography.bodyMuted}>{t.aoVivo.escolhaViagem}</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="radio-outline" title={t.aoVivo.modoGuia} message={t.aoVivo.nenhumaViagemGuia} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/modo-guia/${item.id}`)}
            accessibilityRole="button"
          >
            <View style={styles.icone}>
              <Ionicons name="radio" size={22} color={colors.radarVerde} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>{item.title}</Text>
              <Text style={typography.caption}>{item.location}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.backgroundMuted },
  lista: { padding: spacing.lg, gap: spacing.md },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.card,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.radarFundo,
    alignItems: "center",
    justifyContent: "center",
  },
});
