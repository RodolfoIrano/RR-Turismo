// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Faz a TELA PISCAR com uma mensagem grande (e o celular vibrar)
// quando chega um aviso importante: "reunir todos" do guia ou
// um pedido de ajuda de um cliente. O usuário toca para fechar.
//
// Quem usa só precisa passar a mensagem (ou null para esconder).
// ============================================================
import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import { Text } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { spacing, radius } from "../constants/spacing";

interface Props {
  mensagem: string | null;   // null = escondido
  cor?: string;              // cor do fundo piscando
  textoFechar: string;
  aoFechar: () => void;
}

export default function AlertaPiscante({ mensagem, cor = colors.danger, textoFechar, aoFechar }: Props) {
  const brilho = useRef(new Animated.Value(0)).current;
  const visivel = mensagem !== null;

  useEffect(() => {
    if (!visivel) return;
    // Padrão: vibra 400ms, pausa 300ms, repete.
    Vibration.vibrate([0, 400, 300, 400, 300, 400]);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(brilho, { toValue: 1, duration: 350, useNativeDriver: false }),
        Animated.timing(brilho, { toValue: 0, duration: 350, useNativeDriver: false }),
      ]),
    );
    anim.start();
    return () => { anim.stop(); Vibration.cancel(); };
  }, [visivel, brilho]);

  const fundo = brilho.interpolate({ inputRange: [0, 1], outputRange: [cor, colors.primaryDark] });

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <Animated.View style={[styles.tela, { backgroundColor: fundo }]}>
        <Ionicons name="warning" size={72} color={colors.textInverse} />
        <Text style={styles.mensagem}>{mensagem}</Text>
        <TouchableOpacity style={styles.botao} onPress={aoFechar} accessibilityRole="button">
          <Text style={styles.textoBotao}>{textoFechar}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.xl },
  mensagem: { color: colors.textInverse, fontSize: 26, fontWeight: "800", textAlign: "center" },
  botao: {
    backgroundColor: colors.textInverse,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.full,
  },
  textoBotao: { color: colors.primary, fontSize: 16, fontWeight: "700" },
});
