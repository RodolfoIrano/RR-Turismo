// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Desenha o CHAT do assistente: as bolhas de mensagem, o "digitando...",
// os botões de perguntas rápidas e a barra para escrever. É usado dentro
// da bolinha flutuante e também na tela Assistente de ajuda.
// A lógica (as respostas) fica em hooks/useConversaAssistente.ts.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Cores das bolhas ........ styles.balaoEu (da pessoa) e styles.balaoAssistente
//   - Texto do campo de digitar  placeholder do <TextInput>
//   - Botões de perguntas rápidas  vêm de fora (propriedade "sugestoes")
//   - Carinha do assistente ... função Avatar (usa assets/images/RRBolinha.png)
// ============================================================
import React, { useRef, useState } from "react";
import { FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import type { Mensagem } from "../../hooks/useConversaAssistente";

interface Props {
  mensagens: Mensagem[];
  digitando: boolean;
  sugestoes: string[];
  aoPerguntar: (texto: string) => void;
  aoAbrirAtalho: (rota: string) => void;
}

export default function ConversaDoAssistente({ mensagens, digitando, sugestoes, aoPerguntar, aoAbrirAtalho }: Props) {
  const lista = useRef<FlatList<Mensagem>>(null);
  const [texto, setTexto] = useState("");

  function enviar(valor: string) {
    if (!valor.trim()) return;
    aoPerguntar(valor);
    setTexto("");
  }

  const descer = () => setTimeout(() => lista.current?.scrollToEnd({ animated: true }), 60);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={lista}
        data={mensagens}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.conversa}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={descer}
        renderItem={({ item }) => (
          <View style={[styles.linha, item.autor === "eu" && styles.linhaEu]}>
            {item.autor === "assistente" && <Avatar />}
            <View style={{ maxWidth: "80%" }}>
              <View style={[styles.balao, item.autor === "eu" ? styles.balaoEu : styles.balaoAssistente]}>
                <Text style={[styles.balaoTexto, item.autor === "eu" && { color: colors.textInverse }]}>
                  {item.texto}
                </Text>
              </View>
              {!!item.atalho && (
                <TouchableOpacity
                  style={styles.atalho}
                  onPress={() => aoAbrirAtalho(item.atalho!.rota)}
                  accessibilityRole="button"
                >
                  <Text style={styles.atalhoTexto}>{item.atalho.texto}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListFooterComponent={
          <View>
            {digitando && (
              <View style={styles.linha}>
                <Avatar />
                <View style={[styles.balao, styles.balaoAssistente]}>
                  <Text style={[styles.balaoTexto, { color: colors.textMuted }]}>digitando…</Text>
                </View>
              </View>
            )}
            <View style={styles.sugestoes}>
              {sugestoes.map((s) => (
                <TouchableOpacity key={s} style={styles.sugestao} onPress={() => enviar(s)}>
                  <Text style={styles.sugestaoTexto}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />

      <View style={styles.barra}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escreva sua dúvida ou comentário..."
          placeholderTextColor={colors.textMuted}
          style={styles.campo}
          returnKeyType="send"
          onSubmitEditing={() => enviar(texto)}
        />
        <TouchableOpacity
          style={[styles.enviar, !texto.trim() && { opacity: 0.4 }]}
          onPress={() => enviar(texto)}
          disabled={!texto.trim()}
          accessibilityLabel="Enviar"
        >
          <Ionicons name="send" size={18} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Carinha do assistente: a logo do RR Turismo num círculo azul.
export function Avatar({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <View style={[styles.avatar, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}>
      <Image
        source={require("../../assets/images/RRBolinha.png")}
        style={{ width: tamanho * 0.7, height: tamanho * 0.7 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conversa: { padding: spacing.lg, paddingBottom: spacing.md },
  linha: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, marginBottom: spacing.md },
  linhaEu: { justifyContent: "flex-end" },
  avatar: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  balao: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.xl },
  balaoAssistente: { backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  balaoEu: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  balaoTexto: { fontSize: 15, lineHeight: 21, color: colors.text },
  atalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: "rgba(26,86,219,0.12)",
  },
  atalhoTexto: { color: colors.secondary, fontSize: 13, fontWeight: "800" },
  sugestoes: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  sugestao: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sugestaoTexto: { fontSize: 13, fontWeight: "600", color: colors.primary },
  barra: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  campo: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  enviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
