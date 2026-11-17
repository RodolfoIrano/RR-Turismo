// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Topo do PERFIL (estilo Facebook): capa (banner) grande, foto redonda
// à esquerda com metade dentro da capa, nome e e-mail. Tocar na capa ou na foto
// abre um menu igual ao do Facebook: "Ver foto/capa" (tela cheia) ou
// "Trocar foto/capa" (abre a galeria; quem envia é a tela que usa este componente).
// Usado na tela Perfil e na tela Editar perfil.
// ============================================================
import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "../TextoTraduzido";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import type { FonteDeImagem } from "../../hooks/usePerfilImagens";
import VisualizadorDeImagem from "./VisualizadorDeImagem";

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

// Estilo Facebook: capa grande e foto redonda, à esquerda, com metade dentro da capa.
const ALTURA_CAPA = 190;
const TAMANHO_FOTO = 116;

export default function CabecalhoDoPerfil({
  nome, email, ehGuia, foto, banner, enviandoFoto, enviandoBanner, aoTrocarFoto, aoTrocarBanner,
}: Props) {
  // Qual menu está aberto ("foto" ou "capa") e qual imagem está em tela cheia.
  const [menu, setMenu] = useState<"foto" | "capa" | null>(null);
  const [vendo, setVendo] = useState<FonteDeImagem | null>(null);

  const imagemDoMenu = menu === "foto" ? foto : banner;
  const rotuloVer = menu === "foto" ? "Ver foto de perfil" : "Ver capa";
  const rotuloTrocar = menu === "foto" ? "Trocar foto de perfil" : "Trocar foto de capa";

  function escolher(acao: "ver" | "trocar") {
    const atual = menu;
    setMenu(null);
    if (acao === "ver") {
      setVendo(atual === "foto" ? foto : banner);
    } else {
      // Espera o menu fechar antes de abrir a galeria (evita conflito de modais no iOS).
      setTimeout(() => (atual === "foto" ? aoTrocarFoto() : aoTrocarBanner()), 250);
    }
  }

  return (
    <View>
      {/* CAPA */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setMenu("capa")}
        disabled={enviandoBanner}
        accessibilityLabel="Opções da capa"
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
          onPress={() => setMenu("foto")}
          disabled={enviandoFoto}
          accessibilityLabel="Opções da foto de perfil"
          style={styles.fotoSombra}
        >
          {foto ? (
            <Image source={foto} style={styles.foto} contentFit="cover" />
          ) : (
            <View style={[styles.foto, styles.fotoVazia]}>
              <Ionicons name="person" size={50} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.selo}>
            {enviandoFoto ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Ionicons name="camera" size={17} color={colors.textInverse} />
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

      {/* MENU (estilo Facebook): ver ou trocar */}
      <Modal visible={menu !== null} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <Pressable style={styles.menuFundo} onPress={() => setMenu(null)}>
          <Pressable style={styles.menuCaixa} onPress={() => {}}>
            <View style={styles.menuAlca} />
            {!!imagemDoMenu && (
              <TouchableOpacity style={styles.menuItem} onPress={() => escolher("ver")}>
                <Ionicons name="eye-outline" size={22} color={colors.primary} />
                <Text style={styles.menuTexto}>{rotuloVer}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.menuItem} onPress={() => escolher("trocar")}>
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
              <Text style={styles.menuTexto}>{rotuloTrocar}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenu(null)}>
              <Ionicons name="close-outline" size={22} color={colors.textMuted} />
              <Text style={[styles.menuTexto, { color: colors.textMuted }]}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <VisualizadorDeImagem visivel={vendo !== null} fonte={vendo} aoFechar={() => setVendo(null)} />
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
    alignItems: "flex-start",
    marginTop: -(TAMANHO_FOTO / 2),
    paddingHorizontal: spacing.lg,
  },
  fotoSombra: {
    borderRadius: radius.full,
    backgroundColor: colors.background,
    padding: 5,
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
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  menuFundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  menuCaixa: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  menuAlca: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border ?? "#d0d5dd", marginBottom: spacing.sm },
  menuItem: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  menuTexto: { fontSize: 16, fontWeight: "600", color: colors.primary },
  nome: { fontSize: 22, fontWeight: "700", color: colors.primary, marginTop: spacing.sm },
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
  chipGuiaTexto: { color: colors.secondary, fontSize: 12, fontWeight: "700" },
});
