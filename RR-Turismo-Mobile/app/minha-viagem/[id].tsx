// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Tela "MINHA VIAGEM" (modo Cliente). Quando a viagem comprada
// está acontecendo, o cliente:
//   1. Entra na viagem (com consentimento) e passa a compartilhar
//      a localização COM O GUIA, só durante a viagem;
//   2. Vê o próprio estado (compartilhando, distante, alerta...);
//   3. Recebe os avisos do guia (a tela pisca no "reunir todos");
//   4. Pode pedir ajuda ao guia pelo botão de emergência.
// Quando o guia encerra a viagem, tudo para automaticamente.
// ============================================================
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../../components/TextoTraduzido";
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
import { entrarNaViagem, sairDaViagem, pedirAjuda } from "../../services/aoVivoService";
import { EstadoVisual } from "../../modelos/EstadoVisual";
import PrimaryButton from "../../components/PrimaryButton";
import { useEnderecos } from "../../hooks/useEnderecos";
import ErroDeConexao from "../../components/ErroDeConexao";
import AlertaPiscante from "../../components/AlertaPiscante";
import MapaAoVivo, { PontoDoMapa } from "../../components/MapaAoVivo";

export default function MinhaViagem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, traduzir } = useTraducao();
  // Alert que traduz título, mensagem e botões.
  const Alert = criarAlertaTraduzido(traduzir);
  const { buscarViagem } = useCatalogo();
  const viagem = buscarViagem(id);

  // Consulta o servidor a cada 5 s enquanto a tela está aberta.
  const { estado, erro, atualizar } = useViagemAoVivo(id, 5000);
  const [ocupado, setOcupado] = useState(false);

  // Só envia localização se a viagem está ativa E o cliente entrou.
  const compartilhando = !!estado?.ativa && !!estado.entrei;
  const { permitido } = useRastreamento(id, compartilhando);

  const alerta = useAlertasAoVivo(estado, t.aoVivo.avisoReunir, t.aoVivo.alertaDe);

  // Executa uma ação do servidor mostrando erro amigável se falhar.
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

  // Botão de emergência: sempre pede confirmação e mostra o aviso legal.
  function confirmarEmergencia() {
    Alert.alert(t.aoVivo.emergenciaTitulo, t.aoVivo.emergenciaTexto, [
      { text: t.comum.cancelar, style: "cancel" },
      {
        text: t.aoVivo.botaoEmergencia,
        style: "destructive",
        onPress: () =>
          executar(async () => {
            await pedirAjuda(id, t.aoVivo.emergenciaMensagem);
            Alert.alert(t.aoVivo.emergenciaEnviada);
          }),
      },
    ]);
  }

  const meuEstado = EstadoVisual.de(estado?.meuStatus);

  // O servidor só devolve o guia e o próprio participante (privacidade).
  const lista = estado?.participantes ?? [];
  const guiaPonto = lista.find((p) => p.guia);
  const pontos: PontoDoMapa[] = lista
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.usuarioId,
      nome: p.guia ? (estado?.guiaNome ?? "") : t.aoVivo.voceNoMapa,
      lat: p.lat as number, lng: p.lng as number,
      cor: p.guia ? colors.radarAmarelo : EstadoVisual.de(p.status).cor,
      guia: p.guia, eu: !p.guia, // você = bolinha azul pulsante; o guia = estrela dourada
    }));
  const enderecoPorId = useEnderecos(pontos.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })));
  const meuPonto = lista.find((p) => !p.guia);
  const distanciaGuia = lista.find((p) => !p.guia)?.distanciaM ?? null;

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: true, title: t.aoVivo.minhaViagem }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={typography.h2}>{viagem?.title ?? ""}</Text>
        {estado?.guiaNome && (
          <Text style={typography.bodyMuted}>{t.aoVivo.seuGuia}: {estado.guiaNome}</Text>
        )}

        {/* ---- Servidor não respondeu: mostra o motivo real ---- */}
        {!estado && erro && <ErroDeConexao mensagem={erro} aoTentarDeNovo={atualizar} />}

        {/* ---- Viagem ainda não iniciada / já encerrada ---- */}
        {estado && !estado.ativa && (
          <View style={styles.cartao}>
            <Ionicons name="time-outline" size={32} color={colors.textMuted} />
            <Text style={[typography.body, styles.centro]}>{t.aoVivo.viagemNaoIniciada}</Text>
            <Text style={[typography.bodyMuted, styles.centro]}>{t.aoVivo.aguardandoGuia}</Text>
          </View>
        )}

        {/* ---- Ativa, mas o cliente ainda não entrou ---- */}
        {estado?.ativa && !estado.entrei && (
          <View style={styles.cartao}>
            <Ionicons name="location-outline" size={32} color={colors.secondary} />
            <Text style={[typography.bodyMuted, styles.centro]}>{t.aoVivo.localizacaoAtiva}</Text>
            <PrimaryButton
              label={t.aoVivo.entrarNaViagem}
              loading={ocupado}
              onPress={() => executar(() => entrarNaViagem(id))}
              style={styles.botaoLargo}
            />
          </View>
        )}

        {/* ---- Dentro da viagem ---- */}
        {estado?.ativa && estado.entrei && (
          <>
            <View style={[styles.cartao, { borderColor: meuEstado.cor, borderWidth: 2 }]}>
              <View style={[styles.bolinha, { backgroundColor: meuEstado.cor }]} />
              <Text style={typography.h3}>{t.aoVivo[meuEstado.chaveTexto]}</Text>
              <Text style={[typography.caption, styles.centro]}>
                {permitido === false ? t.aoVivo.permissaoLocalizacao : t.aoVivo.localizacaoAtiva}
              </Text>
            </View>

            {/* Mapa real: só o guia autorizado e você */}
            <MapaAoVivo
              pontos={pontos}
              altura={420}
              textoVazio={t.aoVivo.mapaVazioParticipante}
              textoCentralizar={t.aoVivo.centralizar}
            />
            {/* Rua onde você está agora */}
            {meuPonto?.lat != null && (
              <Text style={typography.bodyMuted}>
                📍 Você está em: {enderecoPorId[meuPonto.usuarioId] ?? "buscando endereço..."}
              </Text>
            )}
            {guiaPonto && guiaPonto.lat == null ? (
              <Text style={typography.caption}>{t.aoVivo.guiaSemSinal}</Text>
            ) : distanciaGuia != null ? (
              <Text style={typography.body}>
                {t.aoVivo.distanciaDoGuia}:{" "}
                {distanciaGuia >= 1000 ? `${(distanciaGuia / 1000).toFixed(1)} ${t.aoVivo.km}` : `${Math.round(distanciaGuia)} ${t.aoVivo.metros}`}
              </Text>
            ) : null}

            <Text style={typography.h3}>{t.aoVivo.avisos}</Text>
            {estado.avisos.length === 0 ? (
              <Text style={typography.bodyMuted}>{t.aoVivo.nenhumAviso}</Text>
            ) : (
              [...estado.avisos].reverse().map((a) => (
                <View key={a.id} style={styles.aviso}>
                  <Ionicons
                    name={a.tipo === "REUNIR" ? "megaphone" : "information-circle"}
                    size={20}
                    color={a.tipo === "REUNIR" ? colors.danger : colors.secondary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={typography.body}>{a.texto}</Text>
                    <Text style={typography.caption}>
                      {new Date(a.hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <TouchableOpacity style={styles.sos} onPress={confirmarEmergencia} accessibilityRole="button">
              <Ionicons name="alert-circle" size={26} color={colors.textInverse} />
              <Text style={styles.sosTexto}>{t.aoVivo.botaoEmergencia}</Text>
            </TouchableOpacity>

            <PrimaryButton
              label={t.aoVivo.sairDaViagem}
              variant="outline"
              onPress={() => executar(() => sairDaViagem(id))}
            />
          </>
        )}
      </ScrollView>

      <AlertaPiscante mensagem={alerta.mensagem} textoFechar={t.comum.confirmar} aoFechar={alerta.fechar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.backgroundMuted },
  conteudo: { padding: spacing.lg, gap: spacing.lg },
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  centro: { textAlign: "center" },
  botaoLargo: { alignSelf: "stretch" },
  bolinha: { width: 22, height: 22, borderRadius: radius.full },
  aviso: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadows.card,
  },
  sos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.danger,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.elevated,
  },
  sosTexto: { color: colors.textInverse, fontSize: 17, fontWeight: "800" },
});
