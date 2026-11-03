// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// MINI MAPA da viagem ("Onde fica"). Descobre as coordenadas do
// local pelo nome (geocodificação) e mostra um mapa interativo com
// um marcador no destino. Dá para arrastar e dar zoom.
//
// Para não falhar:
//  - tenta 2 serviços gratuitos de busca de lugar, um depois do
//    outro: Nominatim (OpenStreetMap) e Open-Meteo Geocoding;
//  - tenta várias frases (do mais específico ao mais geral), por
//    exemplo "Cristo Redentor, Rio de Janeiro" e depois "Rio de Janeiro";
//  - guarda o resultado no aparelho (cache) para abrir rápido;
//  - o mapa em si (MapaAoVivo) tem provedores reserva de imagens;
//  - se nada der certo, mostra o MOTIVO e um botão para abrir o app
//    de mapas do celular.
// Nenhum serviço usado precisa de chave de API.
// ============================================================
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./TextoTraduzido";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useTraducao } from "../traducoes/TraducaoContext";
import MapaAoVivo from "./MapaAoVivo";

interface Props {
  // Textos de busca, do mais específico para o mais geral
  // (ex: ["Cristo Redentor, Rio de Janeiro", "Rio de Janeiro"]).
  consultas: string[];
  altura?: number;
}

interface Coordenada {
  lat: number;
  lon: number;
}

const PREFIXO_CACHE = "mapa_coord_v2:";

// Faz uma chamada com limite de tempo (8 s), para não ficar "carregando" para sempre.
async function buscarComTempo(url: string, opcoes: RequestInit = {}): Promise<Response> {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 8000);
  try {
    return await fetch(url, { ...opcoes, signal: controle.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 1º serviço: Nominatim (OpenStreetMap). Entende endereços e pontos turísticos.
async function viaNominatim(consulta: string): Promise<Coordenada | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=pt-BR&q=${encodeURIComponent(consulta)}`;
  const resposta = await buscarComTempo(url, {
    headers: { "User-Agent": "RRTurismo/1.0 (projeto academico)", Accept: "application/json" },
  });
  if (!resposta.ok) throw new Error(`Nominatim HTTP ${resposta.status}`);
  const lista = (await resposta.json()) as { lat: string; lon: string }[];
  return lista.length ? { lat: parseFloat(lista[0].lat), lon: parseFloat(lista[0].lon) } : null;
}

// 2º serviço (reserva): Open-Meteo Geocoding. Entende cidades, bem estável.
async function viaOpenMeteo(consulta: string): Promise<Coordenada | null> {
  // Usa só a primeira parte (a cidade): "Taquaritinga, São Paulo, Brasil" -> "Taquaritinga"
  const nome = consulta.split(",")[0].trim();
  if (!nome) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=1&language=pt&name=${encodeURIComponent(nome)}`;
  const resposta = await buscarComTempo(url);
  if (!resposta.ok) throw new Error(`Open-Meteo HTTP ${resposta.status}`);
  const corpo = (await resposta.json()) as { results?: { latitude: number; longitude: number }[] };
  const achado = corpo.results?.[0];
  return achado ? { lat: achado.latitude, lon: achado.longitude } : null;
}

// Procura as coordenadas de UMA frase, com cache e os dois serviços.
async function buscarCoordenada(consulta: string): Promise<Coordenada | null> {
  const chave = PREFIXO_CACHE + consulta.toLowerCase();
  try {
    const guardado = await AsyncStorage.getItem(chave);
    if (guardado) return JSON.parse(guardado) as Coordenada;
  } catch {
    // sem cache: segue para a busca normal
  }

  let coordenada: Coordenada | null = null;
  for (const servico of [viaNominatim, viaOpenMeteo]) {
    try {
      coordenada = await servico(consulta);
    } catch {
      coordenada = null; // este serviço falhou: tenta o próximo
    }
    if (coordenada) break;
  }

  if (coordenada) AsyncStorage.setItem(chave, JSON.stringify(coordenada)).catch(() => {});
  return coordenada;
}

export default function MiniMapa({ consultas, altura = 220 }: Props) {
  const { t } = useTraducao();
  const [estado, setEstado] = useState<"carregando" | "ok" | "naoEncontrado">("carregando");
  const [coord, setCoord] = useState<Coordenada | null>(null);
  const [tentativa, setTentativa] = useState(0);

  // Junta as consultas numa chave estável para o useEffect.
  const chaveConsultas = consultas.filter(Boolean).join("|");

  useEffect(() => {
    let cancelado = false;
    setEstado("carregando");
    (async () => {
      for (const consulta of chaveConsultas.split("|").filter(Boolean)) {
        const achada = await buscarCoordenada(consulta);
        if (achada) {
          if (!cancelado) { setCoord(achada); setEstado("ok"); }
          return;
        }
      }
      if (!cancelado) setEstado("naoEncontrado");
    })();
    return () => { cancelado = true; };
  }, [chaveConsultas, tentativa]);

  const textoBusca = chaveConsultas.split("|")[0] ?? "";

  const abrirNoApp = useCallback(() => {
    const url = coord
      ? `https://www.google.com/maps/search/?api=1&query=${coord.lat},${coord.lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(textoBusca)}`;
    Linking.openURL(url).catch(() => {});
  }, [coord, textoBusca]);

  return (
    <View>
      {estado === "carregando" && (
        <View style={[styles.caixa, { height: altura }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={typography.caption}>{t.mapa.carregando}</Text>
        </View>
      )}

      {estado === "naoEncontrado" && (
        <View style={[styles.caixa, { height: altura }]}>
          <Ionicons name="map-outline" size={32} color={colors.textMuted} />
          <Text style={[typography.bodyMuted, styles.texto]}>{t.mapa.naoEncontrado}</Text>
          <TouchableOpacity onPress={() => setTentativa((n) => n + 1)} accessibilityRole="button">
            <Text style={styles.textoBotao}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      )}

      {estado === "ok" && coord && (
        <MapaAoVivo
          altura={altura}
          pontos={[{
            id: 1,
            nome: textoBusca.split(",")[0] ?? "",
            lat: coord.lat,
            lng: coord.lon,
            cor: colors.danger,
            guia: false,
            eu: false,
          }]}
          textoVazio=""
          textoCentralizar="Centralizar no destino"
        />
      )}

      <TouchableOpacity style={styles.botao} onPress={abrirNoApp} accessibilityRole="button">
        <Ionicons name="navigate-outline" size={16} color={colors.primary} />
        <Text style={styles.textoBotao}>{t.mapa.abrirNoMapa}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  texto: { textAlign: "center" },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  textoBotao: { color: colors.primary, fontWeight: "700", fontSize: 14 },
});
