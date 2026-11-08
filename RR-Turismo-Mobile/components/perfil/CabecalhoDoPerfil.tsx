// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Topo do PERFIL: capa (banner) grande, foto redonda por cima
// dela, nome e e-mail. Tocar na capa ou na foto troca a imagem
// (quem decide o que acontece é a tela que usa este componente).
// Usado na tela Perfil e na tela Editar perfil.
// ============================================================
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import type { FonteDeImagem } from "../../hooks/usePerfilImagens";

interface Props {
  nome: string;
  email?: string;
  ehGuia?: boolean;
  foto: FonteDeImagem | null;
  banner: FonteDeImagem | null;
  enviandoFoto: boolean;
  enviandoBanner: boolean;
  aoTrocarFoto: () => void;
  aoTrocarBanner: () => void;
}

const ALTURA_CAPA = 150;
const TAMANHO_FOTO = 100;

export default function CabecalhoDoPerfil({
  nome, email, ehGuia, foto, banner, enviandoFoto, enviandoBanner, aoTrocarFoto, aoTrocarBanner,
}: Props) {
  return (
    <View>
      {/* CAPA */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={aoTrocarBanner}
        disabled={enviandoBanner}
        accessibilityLabel="Alterar capa"
      >
        {banner ? (
          <Image source={banner} style={styles.capa} contentFit="cover" />
        ) : (
          <View style={[styles.capa, styles.capaVazia]}>
            <Ionicons name="airplane" size={64} color="rgba(255,255,255,0.12)" />
          </View>
        )}
        <View style={styles.botaoCapa}>
          {enviandoBanner ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="image-outline" size={14} color={colors.textInverse} />
              <Text style={styles.botaoCapaTexto}>Alterar capa</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* FOTO + NOME (a foto "sobe" um pouco sobre a capa) */}
      <View style={styles.identidade}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={aoTrocarFoto}
          disabled={enviandoFoto}
          accessibilityLabel="Alterar foto de perfil"
          style={styles.fotoSombra}
        >
          {foto ? (
            <Image source={foto} style={styles.foto} contentFit="cover" />
          ) : (
            <View style={[styles.foto, styles.fotoVazia]}>
              <Ionicons name="person" size={44} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.selo}>
            {enviandoFoto ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Ionicons name="camera" size={15} color={colors.textInverse} />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
        {!!email && <Text style={typography.bodyMuted} numberOfLines={1}>{email}</Text>}

        {ehGuia && (
          <View style={styles.chipGuia}>
            <Ionicons name="compass" size={13} color={colors.secondary} />
            <Text style={styles.chipGuiaTexto}>Guia turístico</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { width: "100%", height: ALTURA_CAPA },
  capaVazia: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  botaoCapa: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(0,17,70,0.65)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  botaoCapaTexto: { color: colors.textInverse, fontSize: 12, fontWeight: "700" },

  identidade: {
    alignItems: "center",
    marginTop: -(TAMANHO_FOTO / 2),
    paddingHorizontal: spacing.lg,
  },
  fotoSombra: {
    borderRadius: radius.full,
    backgroundColor: colors.background,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  foto: { width: TAMANHO_FOTO, height: TAMANHO_FOTO, borderRadius: radius.full },
  fotoVazia: { backgroundColor: colors.backgroundMuted, alignItems: "center", justifyContent: "center" },
  selo: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  nome: { fontSize: 22, fontWeight: "800", color: colors.primary, marginTop: spacing.sm },
  chipGuia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: spacing.sm,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: "rgba(26,86,219,0.12)",
  },
  chipGuiaTexto: { color: colors.secondary, fontSize: 12, fontWeight: "800" },
});
