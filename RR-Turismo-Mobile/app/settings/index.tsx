// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela de CONFIGURAÇÕES. Hoje só tem a troca de idioma, com
// bandeira + sigla + nome de cada opção (mesma lista usada no
// seletor rápido do cabeçalho - ver components/SeletorIdioma.tsx).
// ============================================================
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useTraducao } from "../../traducoes/TraducaoContext";
import { IDIOMAS } from "../../traducoes/idiomasDisponiveis";

export default function Settings() {
  const { t, idioma, mudarIdioma, traduzindo } = useTraducao();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.h1}>{t.configuracoesIdioma.titulo}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.bodyMuted, styles.sectionLabel]}>
          {t.configuracoesIdioma.escolher}
        </Text>

        {IDIOMAS.map((info) => {
          const selecionado = info.codigo === idioma;
          return (
            <TouchableOpacity
              key={info.codigo}
              style={styles.opcao}
              onPress={() => mudarIdioma(info.codigo)}
              accessibilityRole="button"
            >
              <Text style={styles.bandeira}>{info.bandeira}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.sigla}>{info.sigla}</Text>
                <Text style={typography.bodyMuted}>{info.nome}</Text>
              </View>
              {selecionado && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}

        {traduzindo && (
          <Text style={[typography.caption, { marginTop: spacing.sm }]}>
            Traduzindo os textos do app...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  bandeira: {
    fontSize: 26,
  },
  sigla: {
    fontWeight: "700",
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
});
