// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela ASSISTENTE DE AJUDA (aberta em Configurações). É o mesmo chat
// da bolinha flutuante, só que em tela cheia. As respostas vêm de
// services/assistenteDeAjuda.ts (não usa internet nem IA externa).
// ============================================================
import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";

import { colors } from "../../constants/colors";
import { FAQ } from "../../services/assistenteDeAjuda";
import { useConversaAssistente } from "../../hooks/useConversaAssistente";
import { useAuth } from "../../contexts/AuthContext";
import ConversaDoAssistente from "../../components/chat/ConversaDoAssistente";

export default function Ajuda() {
  const router = useRouter();
  const { user } = useAuth();
  const conversa = useConversaAssistente(user?.name?.split(" ")[0]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ConversaDoAssistente
          mensagens={conversa.mensagens}
          digitando={conversa.digitando}
          sugestoes={FAQ.map((f) => f.titulo)}
          aoPerguntar={conversa.perguntar}
          aoAbrirAtalho={(rota) => router.push(rota as Href)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundMuted },
});
