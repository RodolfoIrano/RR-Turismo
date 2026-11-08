// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela ASSISTENTE DE AJUDA: um chat simples onde a pessoa tira
// dúvidas sobre o app. As respostas vêm de services/assistenteDeAjuda.ts
// (perguntas frequentes - não usa internet nem IA externa).
// Tela totalmente separada: se algo der errado aqui, o resto do app
// não é afetado.
// ============================================================
import React, { useRef, useState } from "react";
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View,
} from "react-native";
import { Text } from "../../components/TextoTraduzido";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { BOAS_VINDAS, FAQ, responder, type ItemDeAjuda } from "../../services/assistenteDeAjuda";

interface Mensagem {
  id: string;
  autor: "eu" | "assistente";
  texto: string;
  atalho?: ItemDeAjuda["atalho"];
}

export default function Ajuda() {
  const router = useRouter();
  const lista = useRef<FlatList<Mensagem>>(null);
  const contador = useRef(1);
  const [texto, setTexto] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { id: "0", autor: "assistente", texto: BOAS_VINDAS },
  ]);

  function proximoId() {
    contador.current += 1;
    return String(contador.current);
  }

  function perguntar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa) return;
    const item = responder(limpa);
    setMensagens((atual) => [
      ...atual,
      { id: proximoId(), autor: "eu", texto: limpa },
      { id: proximoId(), autor: "assistente", texto: item.resposta, atalho: item.atalho },
    ]);
    setTexto("");
    setTimeout(() => lista.current?.scrollToEnd({ animated: true }), 120);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={lista}
          data={mensagens}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.conversa}
          onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.linha, item.autor === "eu" && styles.linhaEu]}>
              {item.autor === "assistente" && (
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={16} color={colors.textInverse} />
                </View>
              )}
              <View style={{ maxWidth: "80%" }}>
                <View style={[styles.balao, item.autor === "eu" ? styles.balaoEu : styles.balaoAssistente]}>
                  <Text style={[styles.balaoTexto, item.autor === "eu" && { color: colors.textInverse }]}>
                    {item.texto}
                  </Text>
                </View>
                {!!item.atalho && (
                  <TouchableOpacity
                    style={styles.atalho}
                    onPress={() => router.push(item.atalho!.rota as Href)}
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
            <View style={styles.sugestoes}>
              {FAQ.map((f) => (
                <TouchableOpacity key={f.titulo} style={styles.sugestao} onPress={() => perguntar(f.titulo)}>
                  <Text style={styles.sugestaoTexto}>{f.titulo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          }
        />

        <View style={styles.barra}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva sua dúvida..."
            placeholderTextColor={colors.textMuted}
            style={styles.campo}
            returnKeyType="send"
            onSubmitEditing={() => perguntar(texto)}
          />
          <TouchableOpacity
            style={[styles.enviar, !texto.trim() && { opacity: 0.4 }]}
            onPress={() => perguntar(texto)}
            disabled={!texto.trim()}
            accessibilityLabel="Enviar"
          >
            <Ionicons name="send" size={18} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundMuted },
  conversa: { padding: spacing.lg, paddingBottom: spacing.md },
  linha: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, marginBottom: spacing.md },
  linhaEu: { justifyContent: "flex-end" },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
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
