// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Mostra uma imagem (foto de perfil ou capa) em TELA CHEIA, com fundo
// escuro. Toque em qualquer lugar ou no X para fechar.
// Usado no perfil (ver foto/capa) e no perfil público do guia.
// ============================================================
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import type { FonteDeImagem } from "../../hooks/usePerfilImagens";

interface Props {
  visivel: boolean;
  fonte: FonteDeImagem | { uri: string } | null;
  aoFechar: () => void;
}

export default function VisualizadorDeImagem({ visivel, fonte, aoFechar }: Props) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar} statusBarTranslucent>
      <Pressable style={styles.fundo} onPress={aoFechar} accessibilityLabel="Fechar imagem">
        {fonte ? <Image source={fonte} style={styles.imagem} contentFit="contain" /> : <View />}
        <SafeAreaView style={styles.topo} edges={["top"]} pointerEvents="box-none">
          <Pressable style={styles.fechar} onPress={aoFechar} accessibilityLabel="Fechar">
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.94)", justifyContent: "center" },
  imagem: { width: "100%", height: "80%" },
  topo: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "flex-end", paddingHorizontal: 16 },
  fechar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});
