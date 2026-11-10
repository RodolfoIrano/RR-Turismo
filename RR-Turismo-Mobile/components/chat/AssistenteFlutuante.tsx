// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É a BOLINHA FLUTUANTE de ajuda (com a logo do RR Turismo) que
// aparece em todas as telas do app. Tocando nela abre o chat do
// assistente numa "gavetinha" por cima da tela; dá para arrastar a
// bolinha para outro canto se ela estiver atrapalhando.
//
// Fica montada uma única vez em app/_layout.tsx. Se algo der errado
// aqui, o resto do app continua funcionando normalmente.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Tamanho da bolinha .............. TAMANHO (logo abaixo)
//   - Distância da borda da tela ...... MARGEM
//   - Telas SEM a bolinha ............. TELAS_SEM_BOLINHA
//   - Altura da bolinha em relação à barra de baixo ... "base" (insets.bottom + 84)
//   - Logo dentro da bolinha .......... assets/images/RRBolinha.png
//   - Cor da bolinha e do topo do chat  colors.primary (constants/colors.ts)
//   - Altura da gavetinha do chat ..... styles.gaveta → height: "78%"
//   - Perguntas rápidas (botões) ...... SUGESTOES_RAPIDAS em
//                                       services/assistenteDeAjuda.ts
//   - Respostas do assistente ......... services/assistenteDeAjuda.ts
// ============================================================
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "react-native";
import { useRouter, usePathname, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { SUGESTOES_RAPIDAS } from "../../services/assistenteDeAjuda";
import { useConversaAssistente } from "../../hooks/useConversaAssistente";
import { useAuth } from "../../contexts/AuthContext";
import ConversaDoAssistente, { Avatar } from "./ConversaDoAssistente";

// Tamanho da bolinha e distância das bordas da tela.
const TAMANHO = 60;
const MARGEM = 16;
// Telas onde a bolinha NÃO aparece (login/cadastro e o próprio chat em tela cheia).
const TELAS_SEM_BOLINHA = ["/login", "/register", "/ajuda"];

export default function AssistenteFlutuante() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const conversa = useConversaAssistente(user?.name?.split(" ")[0]);
  const [aberto, setAberto] = useState(false);

  // Posição da bolinha em relação ao canto padrão (embaixo à direita).
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const ultima = useRef({ x: 0, y: 0 });

  // Distância da bolinha até a base da tela: fica acima da barra de abas.
  const base = insets.bottom + 84;
  const limites = useMemo(
    () => ({
      minX: -(width - TAMANHO - MARGEM * 2), // encostada na esquerda
      minY: -(height - insets.top - base - TAMANHO - 70), // perto do topo
      maxY: base - MARGEM - insets.bottom, // quase no pé da tela
    }),
    [width, height, insets.top, insets.bottom, base],
  );

  // Arrastar a bolinha. Um toque curto (sem mover) abre o chat.
  const arrastar = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          x.stopAnimation();
          y.stopAnimation();
        },
        onPanResponderMove: (_, g) => {
          x.setValue(ultima.current.x + g.dx);
          y.setValue(ultima.current.y + g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) {
            setAberto(true);
            return;
          }
          // Gruda no lado mais próximo (esquerda ou direita).
          const novoY = Math.min(limites.maxY, Math.max(limites.minY, ultima.current.y + g.dy));
          const novoX = ultima.current.x + g.dx < limites.minX / 2 ? limites.minX : 0;
          ultima.current = { x: novoX, y: novoY };
          Animated.spring(x, { toValue: novoX, useNativeDriver: false, bounciness: 6 }).start();
          Animated.spring(y, { toValue: novoY, useNativeDriver: false, bounciness: 6 }).start();
        },
      }),
    [limites, x, y],
  );

  const escondida = TELAS_SEM_BOLINHA.some((t) => pathname === t || pathname.startsWith(t + "/"));

  function abrirAtalho(rota: string) {
    setAberto(false);
    // Espera a gavetinha fechar antes de trocar de tela.
    setTimeout(() => router.push(rota as Href), 250);
  }

  return (
    <>
      {!escondida && (
        <Animated.View
          {...arrastar.panHandlers}
          accessibilityRole="button"
          accessibilityLabel="Abrir o assistente de ajuda"
          style={[styles.bolinha, { right: MARGEM, bottom: base, transform: [{ translateX: x }, { translateY: y }] }]}
        >
          <Image source={require("../../assets/images/RRBolinha.png")} style={styles.logo} resizeMode="contain" />
          <View style={styles.pontoOnline} />
        </Animated.View>
      )}

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <KeyboardAvoidingView style={styles.fundo} behavior="padding">
          {/* Tocar fora da gavetinha fecha o chat. */}
          <Pressable style={{ flex: 1 }} onPress={() => setAberto(false)} accessibilityLabel="Fechar o chat" />

          <View style={[styles.gaveta, { paddingBottom: insets.bottom }]}>
            <View style={styles.topo}>
              <Avatar tamanho={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.titulo}>Assistente RR Turismo</Text>
                <View style={styles.linhaOnline}>
                  <View style={styles.pontoPequeno} />
                  <Text style={styles.subtitulo}>Online agora</Text>
                </View>
              </View>
              <TouchableOpacity onPress={conversa.recomecar} style={styles.botaoTopo} accessibilityLabel="Nova conversa">
                <Ionicons name="refresh" size={20} color={colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAberto(false)} style={styles.botaoTopo} accessibilityLabel="Fechar">
                <Ionicons name="close" size={22} color={colors.textInverse} />
              </TouchableOpacity>
            </View>

            <ConversaDoAssistente
              mensagens={conversa.mensagens}
              digitando={conversa.digitando}
              sugestoes={SUGESTOES_RAPIDAS}
              aoPerguntar={conversa.perguntar}
              aoAbrirAtalho={abrirAtalho}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bolinha: {
    position: "absolute",
    width: TAMANHO,
    height: TAMANHO,
    borderRadius: TAMANHO / 2,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    ...Platform.select({
      ios: { shadowColor: "#001146", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 8 },
      default: { boxShadow: "0 4px 12px rgba(0,17,70,0.35)" } as object,
    }),
  },
  logo: { width: 38, height: 38 },
  pontoOnline: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  fundo: { flex: 1, backgroundColor: "rgba(0,17,70,0.45)", justifyContent: "flex-end" },
  gaveta: {
    height: "78%",
    backgroundColor: colors.backgroundMuted,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  titulo: { color: colors.textInverse, fontSize: 16, fontWeight: "800" },
  linhaOnline: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  pontoPequeno: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  subtitulo: { color: colors.primaryMuted, fontSize: 12 },
  botaoTopo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
});
