// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cartão do GUIA dentro da tela da viagem: foto, nome, cidade e o
// que ele escreveu no perfil do site ("sobre", idiomas, especialidades,
// redes de contato). Tocar leva ao perfil completo.
// ============================================================
import React from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { shadows } from "../constants/shadows";
import { Guide } from "../types";
import { useTraducao } from "../traducoes/TraducaoContext";
import { REDES_SOCIAIS } from "../utils/redesSociais";

interface Props {
  guideId: string;
  guide: Guide | null;
  carregando?: boolean;
}

export default function CartaoDoGuia({ guideId, guide, carregando }: Props) {
  const router = useRouter();
  const { t } = useTraducao();

  const abrirPerfil = () => guideId && router.push(`/guide/${guideId}`);

  // Redes que o guia realmente preencheu.
  const contatos = REDES_SOCIAIS.flatMap((rede) => {
    const valor = guide?.contatos?.[rede.chave] ?? "";
    const link = valor.trim() ? rede.montarLink(valor) : null;
    return link ? [{ rede, link }] : [];
  });

  return (
    <View style={styles.cartao}>
      <TouchableOpacity style={styles.topo} onPress={abrirPerfil} disabled={!guideId} accessibilityRole="button">
        {guide ? (
          <Image source={{ uri: guide.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarVazio]}>
            <Ionicons name="person" size={28} color={colors.textMuted} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={typography.h3} numberOfLines={1}>
            {guide?.name ?? (carregando ? t.viagem.guiaCarregando : t.guia.guiaNaoInformado)}
          </Text>
          <Text style={typography.bodyMuted} numberOfLines={1}>
            {t.guia.guiaTuristico}{guide?.location ? ` • ${guide.location}` : ""}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* O que o guia escreveu no perfil do site */}
      {!!guide?.bio && (
        <Text style={[typography.body, styles.bio]} numberOfLines={4}>{guide.bio}</Text>
      )}

      {guide && (guide.languages.length > 0 || guide.specialties.length > 0) && (
        <View style={styles.tags}>
          {[...guide.languages, ...guide.specialties].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagTexto}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {contatos.length > 0 && (
        <View style={styles.contatos}>
          {contatos.map(({ rede, link }) => (
            <TouchableOpacity
              key={rede.chave}
              style={styles.contato}
              onPress={() => Linking.openURL(link).catch(() => {})}
              accessibilityRole="link"
            >
              <Ionicons name={rede.icone as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
              <Text style={styles.contatoTexto}>{t.guia[rede.chave]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!!guideId && (
        <TouchableOpacity onPress={abrirPerfil} accessibilityRole="button">
          <Text style={styles.verPerfil}>{t.viagem.verPerfilCompleto} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topo: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: radius.full, backgroundColor: colors.backgroundMuted },
  avatarVazio: { alignItems: "center", justifyContent: "center" },
  bio: { color: colors.textSecondary },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  tag: { backgroundColor: colors.backgroundMuted, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  tagTexto: { ...typography.caption, color: colors.primary, fontWeight: "600" },
  contatos: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  contato: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  contatoTexto: { ...typography.caption, color: colors.primary, fontWeight: "700" },
  verPerfil: { color: colors.secondary, fontWeight: "700" },
});
