// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Campo de texto BONITO usado no login e no cadastro: cantos bem
// arredondados, ícone à esquerda e uma animação que destaca a borda
// (e o ícone) quando o campo está selecionado. Em campos de senha
// mostra o "olho" para revelar/esconder o texto.
// Aceita as mesmas props de um TextInput normal.
// ============================================================
import React, { useRef, useState } from "react";
import { Animated, StyleSheet, TextInputProps, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

type NomeDoIcone = React.ComponentProps<typeof Ionicons>["name"];

interface Props extends TextInputProps {
  label: string; // texto acima do campo
  icone: NomeDoIcone; // ícone à esquerda
  dicaNoRotulo?: string; // texto pequeno ao lado do rótulo, ex.: "(mínimo de 8 caracteres)"
  temErro?: boolean; // deixa a borda vermelha
}

export default function CampoCartao({ label, icone, dicaNoRotulo, temErro, secureTextEntry, onFocus, onBlur, ...rest }: Props) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [focado, setFocado] = useState(false);

  // 0 = normal, 1 = focado (anima a cor da borda e o fundo)
  const foco = useRef(new Animated.Value(0)).current;

  function animar(para: number) {
    Animated.timing(foco, { toValue: para, duration: 180, useNativeDriver: false }).start();
  }

  const corDaBorda = temErro
    ? colors.danger
    : foco.interpolate({ inputRange: [0, 1], outputRange: ["#E6ECF1", colors.secondary] });
  const corDeFundo = foco.interpolate({ inputRange: [0, 1], outputRange: ["#F5F8FA", "#FFFFFF"] });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {dicaNoRotulo ? <Text style={styles.dicaRotulo}>{"  "}{dicaNoRotulo}</Text> : null}
      </Text>

      <Animated.View style={[styles.caixa, { borderColor: corDaBorda, backgroundColor: corDeFundo }]}>
        <Ionicons
          name={icone}
          size={19}
          color={temErro ? colors.danger : focado ? colors.secondary : colors.textMuted}
          style={styles.icone}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          secureTextEntry={secureTextEntry && !senhaVisivel}
          onFocus={(e) => {
            setFocado(true);
            animar(1);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            animar(0);
            onBlur?.(e);
          }}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setSenhaVisivel((v) => !v)}
            accessibilityLabel={senhaVisivel ? "Esconder senha" : "Mostrar senha"}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.olho}
          >
            <Ionicons name={senhaVisivel ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 6, marginLeft: 2 },
  dicaRotulo: { fontSize: 12, fontWeight: "500", color: colors.secondary },
  caixa: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: spacing.md + 2,
    minHeight: 52,
  },
  icone: { marginRight: spacing.sm + 2 },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 12 },
  olho: { marginLeft: spacing.sm },
});
