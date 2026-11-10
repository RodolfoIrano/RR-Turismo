// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// PAINEL DO GUIA de uma viagem ao vivo:
//   - Iniciar / encerrar a viagem (ao encerrar, ninguém mais é
//     rastreado e o guia perde o acesso aos dados);
//   - RADAR com os participantes em tempo real;
//   - Lista de nomes: verde = ok, vermelho/cinza = atenção;
//   - Pedidos de ajuda (a tela pisca quando chega um novo);
//   - Enviar aviso ao grupo ou "reunir todos agora".
// ============================================================
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Text, TextInput } from "../../components/TextoTraduzido";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { shadows } from "../../constants/shadows";
import { useCatalogo } from "../../contexts/CatalogoContext";
import { criarAlertaTraduzido } from "../../utils/alertaTraduzido";
import { useTraducao } from "../../traducoes/TraducaoContext";
import { useViagemAoVivo } from "../../hooks/useViagemAoVivo";
import { useRastreamento } from "../../hooks/useRastreamento";
import { useAlertasAoVivo } from "../../hooks/useAlertasAoVivo";
import {
  iniciarViagem, encerrarViagem, enviarAviso, resolverEmergencia,
} from "../../services/aoVivoService";
import { EstadoVisual } from "../../modelos/EstadoVisual";
import PrimaryButton from "../../components/PrimaryButton";
import MapaAoVivo, { PontoDoMapa } from "../../components/MapaAoVivo";
import BotaoMicrofone from "../../components/BotaoMicrofone";
import { useEnderecos } from "../../hooks/useEnderecos";
import ErroDeConexao from "../../components/ErroDeConexao";
import AlertaPiscante from "../../components/AlertaPiscante";

// Formata a distância: "350 m" ou "1.2 km".
function formatarDistancia(m: number | null, un: { m: string; km: string }) {
  if (m == null) return "—";
  return m >= 1000 ? `${(m / 1000).toFixed(1)} ${un.km}` : `${Math.round(m)} ${un.m}`;
}

export default function PainelDoGuia() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, traduzir } = useTraducao();
  // Alert que traduz título, mensagem e botões.
  const Alert = criarAlertaTraduzido(traduzir);
  const { buscarViagem } = useCatalogo();
  const { width } = useWindowDimensions();
  const viagem = buscarViagem(id);

  // Guia atualiza mais rápido (3 s) para o radar parecer "ao vivo".
  const { estado, erro, atualizar } = useViagemAoVivo(id, 3000);
  const [ocupado, setOcupado] = useState(false);
  const [texto, setTexto] = useState("");
  // Pessoa em foco no mapa (ao tocar no nome dela na lista).
  const [foco, setFoco] = useState<{ id: number | null; versao: number }>({ id: null, versao: 0 });

  // O guia também compartilha a própria posição (centro do radar).
  useRastreamento(id, !!estado?.ativa && estado.souGuia);
  const alerta = useAlertasAoVivo(estado, t.aoVivo.avisoReunir, t.aoVivo.alertaDe);

  async function executar(acao: () => Promise<unknown>) {
    setOcupado(true);
    try {
      await acao();
      await atualizar();
    } catch (e) {
      Alert.alert(t.aoVivo.erroGenerico, e instanceof Error ? e.message : "");
    } finally {
      setOcupado(false);
    }
  }

  function confirmarEncerrar() {
    Alert.alert(t.aoVivo.encerrarViagem, t.aoVivo.confirmarEncerrar, [
      { text: t.aoVivo.nao, style: "cancel" },
      { text: t.aoVivo.sim, style: "destructive", onPress: () => executar(() => encerrarViagem(id)) },
    ]);
  }

  async function mandarAviso(tipo: "INFO" | "REUNIR") {
    const conteudo = tipo === "REUNIR" ? t.aoVivo.avisoReunir : texto.trim();
    if (!conteudo) return;
    await executar(() => enviarAviso(id, conteudo, tipo));
    if (tipo === "INFO") setTexto("");
    Alert.alert(t.aoVivo.avisoEnviado);
  }

  const un = { m: t.aoVivo.metros, km: t.aoVivo.km };
  const lado = Math.min(width - spacing.lg * 2, 380);

  // Se o usuário não é o criador/guia desta viagem, não mostra o painel.
  if (estado && !estado.souGuia) {
    return (
      <SafeAreaView style={styles.tela}>
        <Stack.Screen options={{ headerShown: true, title: t.aoVivo.modoGuia }} />
        <Text style={[typography.body, styles.centro]}>{t.aoVivo.nenhumaViagemGuia}</Text>
      </SafeAreaView>
    );
  }

  const participantes = (estado?.participantes ?? []).filter((p) => !p.guia);

  // Pontos do mapa: só quem tem coordenada real.
  const pontos: PontoDoMapa[] = (estado?.participantes ?? [])
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.usuarioId, nome: p.nome, lat: p.lat as number, lng: p.lng as number,
      cor: EstadoVisual.de(p.status).cor,
      guia: p.guia, eu: p.guia, // o guia (você) é a bolinha azul pulsante, como no GPS
    }));

  // Rua e número de cada pessoa que já enviou posição.
  const enderecoPorId = useEnderecos(pontos.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })));

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: true, title: t.aoVivo.modoGuia }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={typography.h2}>{viagem?.title ?? ""}</Text>

          {/* ---- Servidor não respondeu: mostra o motivo real ---- */}
          {!estado && erro && <ErroDeConexao mensagem={erro} aoTentarDeNovo={atualizar} />}

          {/* ---- Ainda não iniciada ---- */}
          {estado && !estado.ativa && (
            <View style={styles.cartao}>
              <Ionicons name="radio-outline" size={36} color={colors.secondary} />
              <Text style={[typography.bodyMuted, styles.centro]}>{t.aoVivo.localizacaoAtiva}</Text>
              <PrimaryButton
                label={t.aoVivo.iniciarViagem}
                loading={ocupado}
                onPress={() => executar(() => iniciarViagem(id))}
                style={styles.largo}
              />
            </View>
          )}

          {/* ---- Ativa: radar + controles ---- */}
          {estado?.ativa && (
            <>
              {/* MAPA ÚNICO, estilo GPS: você (bolinha azul) e cada participante,
                  com zoom até a rua. Toque no nome na lista para ir até a pessoa. */}
              <MapaAoVivo
                pontos={pontos}
                altura={Math.max(Math.min(lado + 120, 520), 340)}
                textoVazio={t.aoVivo.mapaVazioGuia}
                textoCentralizar={t.aoVivo.centralizar}
                focoId={foco.id}
                focoVersao={foco.versao}
              />

              {/* Pedidos de ajuda */}
              {estado.emergencias.length > 0 && (
                <View style={styles.blocoAjuda}>
                  <Text style={styles.tituloAjuda}>{t.aoVivo.emergenciasAbertas}</Text>
                  {estado.emergencias.map((e) => (
                    <View key={e.id} style={styles.linhaAjuda}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nomeAjuda}>{e.nome}</Text>
                        <Text style={styles.msgAjuda}>{e.mensagem}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.botaoResolver}
                        onPress={() => executar(() => resolverEmergencia(id, e.id))}
                      >
                        <Text style={styles.textoResolver}>{t.aoVivo.resolver}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Lista de participantes */}
              <Text style={typography.h3}>
                {t.aoVivo.participantes} ({estado.totalParticipantes})
              </Text>
              {participantes.length === 0 ? (
                <Text style={typography.bodyMuted}>{t.aoVivo.ninguemEntrou}</Text>
              ) : (
                participantes.map((p) => {
                  const ev = EstadoVisual.de(p.status);
                  const temPosicao = p.lat != null && p.lng != null;
                  return (
                    <TouchableOpacity
                      key={p.usuarioId}
                      style={styles.linha}
                      disabled={!temPosicao}
                      onPress={() => setFoco((f) => ({ id: p.usuarioId, versao: f.versao + 1 }))}
                      accessibilityRole="button"
                    >
                      <View style={[styles.bolinha, { backgroundColor: ev.cor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.body, { color: ev.estaBem ? colors.success : colors.danger, fontWeight: "700" }]}>
                          {p.nome}
                        </Text>
                        <Text style={typography.caption}>{t.aoVivo[ev.chaveTexto]}</Text>
                        {/* Rua e número onde a pessoa está agora */}
                        {temPosicao && (
                          <Text style={typography.caption}>
                            📍 {enderecoPorId[p.usuarioId] ?? "Buscando endereço..."}
                          </Text>
                        )}
                      </View>
                      <Text style={typography.bodyMuted}>{formatarDistancia(p.distanciaM, un)}</Text>
                    </TouchableOpacity>
                  );
                })
              )}

              {/* Avisos */}
              <Text style={typography.h3}>{t.aoVivo.enviarAviso}</Text>
              <TextInput
                style={styles.campo}
                placeholder={t.aoVivo.avisoPlaceholder}
                placeholderTextColor={colors.textMuted}
                value={texto}
                onChangeText={setTexto}
                multiline
              />
              {/* Voz: segure para ditar o aviso (ou use o microfone do teclado) */}
              <BotaoMicrofone aoTexto={(falado) => setTexto(falado)} />
              <PrimaryButton label={t.aoVivo.enviarAviso} onPress={() => mandarAviso("INFO")} disabled={!texto.trim() || ocupado} />
              <TouchableOpacity style={styles.reunir} onPress={() => mandarAviso("REUNIR")} accessibilityRole="button">
                <Ionicons name="megaphone" size={20} color={colors.textInverse} />
                <Text style={styles.reunirTexto}>{t.aoVivo.reunirAgora}</Text>
              </TouchableOpacity>

              <PrimaryButton label={t.aoVivo.encerrarViagem} variant="outline" onPress={confirmarEncerrar} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertaPiscante mensagem={alerta.mensagem} textoFechar={t.comum.confirmar} aoFechar={alerta.fechar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.backgroundMuted },
  conteudo: { padding: spacing.lg, gap: spacing.lg },
  centro: { textAlign: "center", padding: spacing.xl },
  largo: { alignSelf: "stretch" },
  abas: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.full, padding: 4 },
  aba: { flex: 1, alignItems: "center", paddingVertical: spacing.sm, borderRadius: radius.full },
  abaAtiva: { backgroundColor: colors.primary },
  abaTexto: { color: colors.textMuted, fontWeight: "700" },
  abaTextoAtivo: { color: colors.textInverse },
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadows.card,
  },
  bolinha: { width: 14, height: 14, borderRadius: radius.full },
  blocoAjuda: { backgroundColor: colors.danger, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  tituloAjuda: { color: colors.textInverse, fontWeight: "700", fontSize: 16 },
  linhaAjuda: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  nomeAjuda: { color: colors.textInverse, fontWeight: "700" },
  msgAjuda: { color: colors.overlayLight },
  botaoResolver: { backgroundColor: colors.textInverse, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.full },
  textoResolver: { color: colors.danger, fontWeight: "700" },
  campo: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 56,
    color: colors.text,
  },
  reunir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  reunirTexto: { color: colors.textInverse, fontWeight: "700", fontSize: 15 },
});
