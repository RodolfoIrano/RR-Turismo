// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Bloco "Precisa de ajuda?" com dois cartões grandes: FALE CONOSCO e
// SOBRE NÓS. Aparece no final da tela Início para a pessoa achar esses
// dois canais sem precisar abrir as Configurações.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Textos e ícones dos cartões ......... lista CARTOES, logo abaixo
//   - Para onde cada cartão leva .......... campo "rota" de cada item
//   - Título do bloco ..................... <Text style={styles.titulo}>
//   - Onde o bloco aparece ................ app/(tabs)/index.tsx (fim da Home)
//   - Cores/tamanhos ...................... styles, no fim do arquivo
// ============================================================
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";

const CARTOES: {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  texto: string;
  rota: string;
}[] = [
  {
    icone: "chatbubbles-outline",
    titulo: "Fale conosco",
    texto: "Dúvidas, elogios ou sugestões pelo WhatsApp",
    rota: "/fale-conosco",
  },
  {
    icone: "information-circle-outline",
    titulo: "Sobre nós",
    texto: "Conheça a equipe e a história do RR Turismo",
    rota: "/sobre-nos",
  },
];

export default function AtalhosInstitucionais() {
  const router = useRouter();

  return (
    <View style={styles.bloco}>
      <Text style={styles.titulo}>Precisa de ajuda?</Text>

      <View style={styles.linha}>
        {CARTOES.map((c) => (
          <TouchableOpacity
            key={c.rota}
            style={styles.cartao}
            onPress={() => router.push(c.rota as Href)}
            accessibilityRole="button"
            accessibilityLabel={c.titulo}
          >
            <View style={styles.icone}>
              <Ionicons name={c.icone} size={24} color={colors.secondary} />
            </View>
            <Text style={styles.cartaoTitulo}>{c.titulo}</Text>
            <Text style={styles.cartaoTexto}>{c.texto}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  titulo: { fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: spacing.md },
  linha: { flexDirection: "row", gap: spacing.md },
  cartao: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(26,86,219,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cartaoTitulo: { fontSize: 16, fontWeight: "800", color: colors.primary },
  cartaoTexto: { fontSize: 13, lineHeight: 18, color: colors.textSecondary },
});
