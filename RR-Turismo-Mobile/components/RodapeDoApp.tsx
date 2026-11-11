// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// RODAPÉ do app (fim da tela Início), com o mesmo conteúdo do rodapé
// do site: marca + descrição + WhatsApp, colunas que abrem e fecham
// ao tocar no título (Explore, Institucional, Para guias e empresas,
// Contato), convite para receber novidades, idioma e direitos.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Textos e links de cada coluna ...... lista COLUNAS, logo abaixo
//   - Redes sociais ....................... constantes REDES (vazias = não aparecem)
//   - WhatsApp ............................ constants/contato.ts
//   - Cores e tamanhos .................... styles, no fim do arquivo
//   - Onde aparece ........................ app/(tabs)/index.tsx (fim da Home)
// ============================================================
import React, { useState } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { linkDoWhatsapp, WHATSAPP_NUMERO } from "../constants/contato";

// 👈 COLOQUE AQUI os endereços das redes sociais (https://...). Vazio = o ícone some.
const REDES: { icone: keyof typeof Ionicons.glyphMap; nome: string; url: string }[] = [
  { icone: "logo-instagram", nome: "Instagram", url: "" },
  { icone: "logo-facebook", nome: "Facebook", url: "" },
  { icone: "logo-youtube", nome: "YouTube", url: "" },
];

type Link = { texto: string; rota?: string; externo?: string };

const COLUNAS: { titulo: string; links: Link[] }[] = [
  {
    titulo: "Explore",
    links: [
      { texto: "Todas as viagens", rota: "/(tabs)/explore" },
      { texto: "Meus favoritos", rota: "/favoritos" },
      { texto: "Minhas reservas", rota: "/bookings" },
      { texto: "Carrinho", rota: "/(tabs)/cart" },
    ],
  },
  {
    titulo: "Institucional",
    links: [
      { texto: "Sobre nós", rota: "/sobre-nos" },
      { texto: "Fale conosco", rota: "/fale-conosco" },
      { texto: "Central de ajuda", rota: "/ajuda" },
    ],
  },
  {
    titulo: "Para guias e empresas",
    links: [
      { texto: "Anunciar minhas viagens", externo: "site" },
      { texto: "Modo guia", rota: "/modo-guia" },
      { texto: "Configurações", rota: "/settings" },
    ],
  },
  {
    titulo: "Contato",
    links: [
      { texto: "WhatsApp: (16) 99241-6492", externo: "zap" },
      { texto: "Fatec Taquaritinga" },
      { texto: "Sistemas para Internet" },
    ],
  },
];

export default function RodapeDoApp() {
  const router = useRouter();
  const [aberta, setAberta] = useState<string | null>(null);

  function abrirZap(mensagem: string) {
    Linking.openURL(linkDoWhatsapp(mensagem)).catch(() => {});
  }

  function tocar(link: Link) {
    if (link.rota) {
      router.push(link.rota as Href);
    } else if (link.externo === "zap") {
      abrirZap("Olá, equipe RR Turismo!");
    } else if (link.externo === "site") {
      abrirZap("Olá! Quero anunciar minhas viagens no RR Turismo.");
    }
  }

  const redes = REDES.filter((r) => r.url);

  return (
    <View style={styles.rodape}>
      {/* ---------- Marca ---------- */}
      <Image
        source={require("../assets/images/RRTurismoClaroRecortada.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={styles.descricao}>
        Descubra novos destinos, viva experiências incríveis e encontre a sua próxima aventura com guias e agências de confiança.
      </Text>

      <View style={styles.redes}>
        {WHATSAPP_NUMERO ? (
          <TouchableOpacity
            style={styles.rede}
            onPress={() => abrirZap("Olá, equipe RR Turismo!")}
            accessibilityRole="button"
            accessibilityLabel="WhatsApp"
          >
            <Ionicons name="logo-whatsapp" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        ) : null}
        {redes.map((r) => (
          <TouchableOpacity
            key={r.nome}
            style={styles.rede}
            onPress={() => Linking.openURL(r.url).catch(() => {})}
            accessibilityRole="button"
            accessibilityLabel={r.nome}
          >
            <Ionicons name={r.icone} size={20} color={colors.textInverse} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------- Colunas que abrem e fecham ---------- */}
      <View style={styles.colunas}>
        {COLUNAS.map((col) => {
          const estaAberta = aberta === col.titulo;
          return (
            <View key={col.titulo} style={styles.coluna}>
              <TouchableOpacity
                style={styles.colunaTitulo}
                onPress={() => setAberta(estaAberta ? null : col.titulo)}
                accessibilityRole="button"
                accessibilityState={{ expanded: estaAberta }}
              >
                <Text style={styles.colunaTituloTexto}>{col.titulo}</Text>
                <Ionicons
                  name={estaAberta ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.primaryMuted}
                />
              </TouchableOpacity>
              {estaAberta && (
                <View style={styles.lista}>
                  {col.links.map((l) => {
                    const clicavel = !!(l.rota || l.externo);
                    return clicavel ? (
                      <TouchableOpacity key={l.texto} onPress={() => tocar(l)} style={styles.linkLinha}>
                        <Text style={styles.link}>{l.texto}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View key={l.texto} style={styles.linkLinha}>
                        <Text style={styles.linkSemToque}>{l.texto}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* ---------- Novidades (abre o WhatsApp; nada é guardado) ---------- */}
      <View style={styles.novidades}>
        <Text style={styles.novidadesTitulo}>Receba novidades sobre viagens</Text>
        <Text style={styles.novidadesTexto}>
          Fique por dentro de novos destinos e dicas de viagem. É só mandar um oi para a nossa equipe.
        </Text>
        <TouchableOpacity
          style={styles.botaoZap}
          onPress={() => abrirZap("Olá! Quero receber novidades sobre viagens do RR Turismo.")}
          accessibilityRole="button"
        >
          <Ionicons name="logo-whatsapp" size={18} color={colors.textInverse} />
          <Text style={styles.botaoZapTexto}>Quero receber novidades</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- Idioma ---------- */}
      <TouchableOpacity style={styles.idioma} onPress={() => router.push("/settings/idioma" as Href)}>
        <Ionicons name="globe-outline" size={16} color={colors.textInverse} />
        <Text style={styles.idiomaTexto}>Idioma e moeda (BRL)</Text>
      </TouchableOpacity>

      <View style={styles.base}>
        <Text style={styles.baseTexto}>© 2026 RR Turismo. Todos os direitos reservados.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rodape: {
    marginTop: spacing.xxl,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  logo: { width: 150, height: 46 },
  descricao: { color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 21, marginTop: spacing.md },

  redes: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  rede: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  colunas: { marginTop: spacing.lg },
  coluna: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" },
  colunaTitulo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  colunaTituloTexto: { color: colors.textInverse, fontSize: 15, fontWeight: "700" },
  lista: { paddingBottom: spacing.md, gap: 2 },
  linkLinha: { paddingVertical: 7 },
  link: { color: "rgba(255,255,255,0.82)", fontSize: 14 },
  linkSemToque: { color: "rgba(255,255,255,0.6)", fontSize: 14 },

  novidades: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    gap: spacing.sm,
  },
  novidadesTitulo: { color: colors.textInverse, fontSize: 16, fontWeight: "700" },
  novidadesTexto: { color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 19 },
  botaoZap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingVertical: 12,
    borderRadius: radius.full,
    backgroundColor: "#1FBF63",
  },
  botaoZapTexto: { color: colors.textInverse, fontWeight: "700", fontSize: 14 },

  idioma: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    marginTop: spacing.lg,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  idiomaTexto: { color: colors.textInverse, fontSize: 13 },

  base: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" },
  baseTexto: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
});
