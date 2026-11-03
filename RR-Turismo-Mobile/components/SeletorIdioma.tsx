// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o SELETOR DE IDIOMA em formato de modal (janela flutuante) -
// mostra a bandeira + sigla + nome de cada idioma disponível,
// com busca pra achar rápido. Aberto pelo ícone de globo 🌐 no
// cabeçalho, ou pela tela de Configurações.
// ============================================================
import React, { useState, useMemo } from "react";
import { View, Modal, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Text, TextInput } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { shadows } from "../constants/shadows";
import { IDIOMAS, InfoIdioma } from "../traducoes/idiomasDisponiveis";
import { useTraducao } from "../traducoes/TraducaoContext";

interface Props {
  visivel: boolean;
  aoFechar: () => void;
}

export default function SeletorIdioma({ visivel, aoFechar }: Props) {
  const { idioma, mudarIdioma, traduzindo } = useTraducao();
  const [busca, setBusca] = useState("");

  // Filtra a lista de idiomas pelo texto digitado na busca
  // (procura tanto no nome quanto na sigla, pra facilitar).
  const idiomasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return IDIOMAS;
    return IDIOMAS.filter(
      (i) => i.nome.toLowerCase().includes(termo) || i.sigla.toLowerCase().includes(termo)
    );
  }, [busca]);

  async function handleEscolher(info: InfoIdioma) {
    await mudarIdioma(info.codigo);
    setBusca("");
    aoFechar();
  }

  return (
    <Modal visible={visivel} animationType="slide" transparent onRequestClose={aoFechar}>
      <View style={styles.fundo}>
        <SafeAreaView style={styles.folha} edges={["bottom"]}>
          {/* Cabeçalho do modal */}
          <View style={styles.cabecalho}>
            <View style={styles.tituloRow}>
              <Ionicons name="globe-outline" size={22} color={colors.primary} />
              <Text style={typography.h2}>Escolher idioma</Text>
            </View>
            <TouchableOpacity onPress={aoFechar} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Campo de busca */}
          <View style={styles.buscaBox}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.buscaInput}
              placeholder="Pesquisar idioma..."
              placeholderTextColor={colors.textMuted}
              value={busca}
              onChangeText={setBusca}
              autoCapitalize="none"
            />
          </View>

          {/* Lista de idiomas */}
          <FlatList
            data={idiomasFiltrados}
            keyExtractor={(item) => item.codigo}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            renderItem={({ item }) => {
              const selecionado = item.codigo === idioma;
              return (
                <TouchableOpacity
                  style={[styles.item, selecionado && styles.itemSelecionado]}
                  onPress={() => handleEscolher(item)}
                  accessibilityRole="button"
                >
                  <Text style={styles.bandeira}>{item.bandeira}</Text>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.sigla}>{item.sigla}</Text>
                    <Text style={typography.bodyMuted}>{item.nome}</Text>
                  </View>

                  {selecionado && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />

          {/* Aviso discreto enquanto uma tradução nova está sendo
              buscada em segundo plano (ver TraducaoContext.tsx). */}
          {traduzindo && (
            <View style={styles.avisoTraduzindo}>
              <Text style={styles.avisoTraduzindoTexto}>Traduzindo os textos do app...</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  folha: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "80%",
    paddingTop: spacing.lg,
    ...shadows.elevated,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  buscaBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
  },
  buscaInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  itemSelecionado: {
    backgroundColor: colors.backgroundMuted,
  },
  bandeira: {
    fontSize: 28,
  },
  sigla: {
    fontWeight: "700",
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  avisoTraduzindo: {
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avisoTraduzindoTexto: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
