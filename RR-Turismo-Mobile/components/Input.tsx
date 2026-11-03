// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o CAMPO DE TEXTO padrão do app (usado em login, cadastro,
// checkout, etc) - já vem com rótulo e mensagem de erro prontos.
// Quando é um campo de senha (secureTextEntry), mostra
// automaticamente um ícone de "olho" pra revelar/esconder o
// texto digitado.
// ============================================================
import React, { useState } from "react";
import { View, StyleSheet, TextInputProps, TouchableOpacity } from "react-native";
import { Text, TextInput } from "./TextoTraduzido";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

interface Props extends TextInputProps {
  label: string; // Texto acima do campo (ex: "E-mail")
  dicaNoRotulo?: string; // Texto pequeno azul ao lado do rótulo (ex: "(mínimo 8 caracteres)")
  dica?: string; // Texto pequeno e cinza embaixo do campo (ex: "Mínimo de 8 caracteres")
  error?: string | null; // Se preenchido, mostra a mensagem em vermelho abaixo do campo
  // "...TextInputProps" significa que este componente aceita
  // também todas as props normais de um TextInput do React Native
  // (value, onChangeText, keyboardType, secureTextEntry, etc).
}

// Campo de formulário padrão, com label e mensagem de erro amigável.
export default function Input({ label, error, dica, dicaNoRotulo, secureTextEntry, ...rest }: Props) {
  // Controla se o texto do campo de senha está visível ou
  // escondido (só é usado quando o campo É de senha).
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Se o campo não é de senha, comporta-se normalmente. Se é,
  // some ou mostra o texto de acordo com o botão de "olho".
  const escondendoTexto = secureTextEntry && !senhaVisivel;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {dicaNoRotulo ? <Text style={styles.dicaRotulo}>{"  "}{dicaNoRotulo}</Text> : null}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            secureTextEntry ? styles.inputComIcone : undefined,
            error ? styles.inputError : undefined,
          ]}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          secureTextEntry={escondendoTexto}
          {...rest}
        />

        {/* Ícone de "olho" pra mostrar/esconder a senha - só
            aparece em campos que são de senha. */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconeOlho}
            onPress={() => setSenhaVisivel((v) => !v)}
            accessibilityLabel={senhaVisivel ? "Esconder senha" : "Mostrar senha"}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : dica ? <Text style={styles.dica}>{dica}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  dicaRotulo: { fontSize: 12, fontWeight: "500", color: colors.secondary },
  dica: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  label: { ...typography.bodyMuted, marginBottom: spacing.xs, fontWeight: "600" },
  inputRow: { position: "relative", justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  // Dá espaço à direita pro ícone de olho não ficar em cima do texto.
  inputComIcone: { paddingRight: spacing.xxl },
  iconeOlho: {
    position: "absolute",
    right: spacing.md,
  },
  inputError: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
