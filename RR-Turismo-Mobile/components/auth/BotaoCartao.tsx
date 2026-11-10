// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Botão principal do login/cadastro: grande, arredondado, com
// sombra e uma animação de "apertar" (encolhe um pouquinho quando
// você toca e volta). Mostra um spinner enquanto carrega.
// ============================================================
import React, { useRef } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { shadows } from "../../constants/shadows";

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function BotaoCartao({ label, onPress, loading, disabled }: Props) {
  const escala = useRef(new Animated.Value(1)).current;

  function apertar(para: number) {
    Animated.spring(escala, { toValue: para, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }

  const bloqueado = disabled || loading;

  return (
    <Animated.View style={{ transform: [{ scale: escala }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={bloqueado}
        onPress={onPress}
        onPressIn={() => apertar(0.97)}
        onPressOut={() => apertar(1)}
        style={[styles.botao, bloqueado && styles.desabilitado]}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <View style={styles.conteudo}>
            <Text style={styles.texto}>{label}</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.elevated,
  },
  desabilitado: { opacity: 0.65 },
  conteudo: { flexDirection: "row", alignItems: "center", gap: 8 },
  texto: { color: colors.textInverse, fontSize: 15, fontWeight: "700", letterSpacing: 0.6 },
});
