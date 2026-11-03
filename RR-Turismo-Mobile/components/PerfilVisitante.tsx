// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela mostrada na aba Perfil para quem NÃO está logado (visitante).
// Convida a entrar ou criar conta, sem mostrar dados de ninguém.
// É o login "só quando necessário": o visitante navega livre pelo
// app e só é chamado a entrar aqui ou ao finalizar uma compra.
// ============================================================
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./TextoTraduzido";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useTraducao } from "../traducoes/TraducaoContext";
import PrimaryButton from "./PrimaryButton";

export default function PerfilVisitante() {
  const router = useRouter();
  const { t } = useTraducao();

  return (
    <View style={styles.tela}>
      <View style={styles.icone}>
        <Ionicons name="person-outline" size={44} color={colors.primary} />
      </View>
      <Text style={[typography.h2, styles.centro]}>{t.visitante.titulo}</Text>
      <Text style={[typography.bodyMuted, styles.centro]}>{t.visitante.texto}</Text>

      <PrimaryButton
        label={t.visitante.entrar}
        onPress={() => router.push("/(auth)/login")}
        style={styles.botao}
      />
      <PrimaryButton
        label={t.visitante.criarConta}
        variant="outline"
        onPress={() => router.push("/(auth)/register")}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  icone: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  centro: { textAlign: "center" },
  botao: { alignSelf: "stretch" },
});
