// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// TRADUTOR DE VOZ: o turista fala (ou digita) em um idioma e vê a
// tradução em outro, na hora. Fluxo: voz -> texto -> tradução.
//
//  - "Falar em": idioma em que a pessoa fala (ex: Français);
//  - "Traduzir para": idioma do resultado (ex: Português);
//  - Segure o microfone para falar (development build) OU use o
//    microfone do teclado do celular (funciona também no Expo Go);
//  - A tradução aparece sozinha enquanto a pessoa escreve/fala.
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, TouchableOpacity, View,
  type TextInputInstance,
} from "react-native";
import { Text, TextInput } from "../../components/TextoTraduzido";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { shadows } from "../../constants/shadows";
import { useTraducao } from "../../traducoes/TraducaoContext";
import { IDIOMAS } from "../../traducoes/idiomasDisponiveis";
import { traduzirFrase } from "../../traducoes/motorDeTraducao";
import { ReconhecedorDeVoz } from "../../services/ReconhecedorDeVoz";
import BotaoMicrofone from "../../components/BotaoMicrofone";

export default function TradutorDeVoz() {
  const { t, idioma: idiomaDoApp } = useTraducao();
  const campo = useRef<TextInputInstance>(null);

  const [origem, setOrigem] = useState(idiomaDoApp);
  const [destino, setDestino] = useState(idiomaDoApp === "pt" ? "en" : "pt");
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState("");
  const [traduzindo, setTraduzindo] = useState(false);

  // Traduz sozinho 500 ms depois de a pessoa parar de escrever/falar.
  useEffect(() => {
    if (!texto.trim()) {
      setResultado("");
      return;
    }
    setTraduzindo(true);
    let cancelado = false;
    const espera = setTimeout(async () => {
      const traduzido = await traduzirFrase(texto, destino, origem);
      if (!cancelado) {
        setResultado(traduzido);
        setTraduzindo(false);
      }
    }, 500);
    return () => { cancelado = true; clearTimeout(espera); };
  }, [texto, origem, destino]);

  function trocarIdiomas() {
    setOrigem(destino);
    setDestino(origem);
    setTexto(resultado || texto);
  }

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: true, title: "" }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={typography.h1}>{t.voz.titulo}</Text>
          <Text style={typography.bodyMuted}>{t.voz.subtitulo}</Text>

          <Text style={styles.rotulo}>{t.voz.falarEm}</Text>
          <SeletorDeIdioma valor={origem} aoEscolher={setOrigem} />

          <TouchableOpacity style={styles.trocar} onPress={trocarIdiomas} accessibilityLabel="Trocar idiomas">
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.rotulo}>{t.voz.traduzirPara}</Text>
          <SeletorDeIdioma valor={destino} aoEscolher={setDestino} />

          {/* Entrada: texto digitado/falado */}
          <View style={styles.caixa}>
            <TextInput
              ref={campo}
              style={styles.entrada}
              multiline
              value={texto}
              onChangeText={setTexto}
              placeholder={t.voz.placeholder}
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.barra}>
              {!!texto && (
                <TouchableOpacity onPress={() => setTexto("")}>
                  <Text style={styles.limpar}>{t.voz.limpar}</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <BotaoMicrofone
                idiomaFala={origem}
                tamanho={30}
                aoTexto={(falado) => falado && setTexto(falado)}
                aoSemSuporte={() => campo.current?.focus()}
              />
            </View>
          </View>

          {!ReconhecedorDeVoz.disponivel && (
            <Text style={typography.caption}>{t.voz.dicaTeclado}</Text>
          )}

          {/* Saída: tradução */}
          {(!!resultado || traduzindo) && (
            <View style={[styles.caixa, styles.caixaResultado]}>
              <Text style={styles.rotuloResultado}>{t.voz.traducao}</Text>
              <Text style={styles.resultado}>{traduzindo && !resultado ? t.voz.traduzindo : resultado}</Text>
              {!!resultado && (
                <TouchableOpacity
                  style={styles.compartilhar}
                  onPress={() => Share.share({ message: resultado })}
                >
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                  <Text style={styles.textoCompartilhar}>{t.voz.compartilhar}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Fila de "chips" com bandeira + sigla para escolher o idioma.
function SeletorDeIdioma({ valor, aoEscolher }: { valor: string; aoEscolher: (codigo: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {IDIOMAS.map((i) => {
        const ativo = i.codigo === valor;
        return (
          <TouchableOpacity
            key={i.codigo}
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => aoEscolher(i.codigo)}
            accessibilityLabel={i.nome}
          >
            <Text style={styles.chipBandeira}>{i.bandeira}</Text>
            <Text style={[styles.chipSigla, ativo && { color: colors.textInverse }]}>{i.sigla}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.backgroundMuted },
  conteudo: { padding: spacing.lg, gap: spacing.md },
  rotulo: { ...typography.caption, textTransform: "uppercase", letterSpacing: 0.6, marginTop: spacing.sm },
  trocar: {
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipBandeira: { fontSize: 16 },
  chipSigla: { fontSize: 13, fontWeight: "700", color: colors.primary },
  caixa: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  entrada: { minHeight: 90, fontSize: 18, color: colors.text, textAlignVertical: "top" },
  barra: { flexDirection: "row", alignItems: "center" },
  limpar: { color: colors.textSecondary, fontWeight: "600" },
  caixaResultado: { backgroundColor: colors.primary },
  rotuloResultado: { color: colors.primaryMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 },
  resultado: { color: colors.textInverse, fontSize: 20, fontWeight: "600" },
  compartilhar: { flexDirection: "row", alignItems: "center", gap: spacing.xs, alignSelf: "flex-start", backgroundColor: colors.textInverse, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.full },
  textoCompartilhar: { color: colors.primary, fontWeight: "700", fontSize: 13 },
});
