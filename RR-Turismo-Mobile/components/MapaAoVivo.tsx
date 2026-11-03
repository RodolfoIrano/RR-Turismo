// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// MAPA AO VIVO (OpenStreetMap + Leaflet). Mostra no mapa REAL as
// posições recebidas do servidor: o guia (estrela) e os
// participantes (bolinhas coloridas pelo estado). Só desenha
// pessoas que REALMENTE enviaram localização - nada de dados
// inventados.
//
// Por que OpenStreetMap + Leaflet?
//  - Não precisa de chave de API nem cadastro;
//  - Funciona no Expo Go (roda dentro de uma WebView);
//  - Precisa de internet no celular (baixa as imagens do mapa).
//
// Como atualiza: a página do mapa é carregada UMA vez; a cada novo
// estado, o app manda os pontos por injectJavaScript e o mapa move
// os marcadores (sem recarregar).
// ============================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./TextoTraduzido";
import { colors } from "../constants/colors";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { HTML_DO_MAPA } from "./htmlDoMapa";

// Um ponto a desenhar no mapa.
export interface PontoDoMapa {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  cor: string;       // cor do marcador (vem do EstadoVisual)
  guia: boolean;     // true = desenha uma estrela (para quem NÃO é o guia)
  eu: boolean;       // true = é o próprio usuário: bolinha azul pulsante, igual ao GPS
}

interface Props {
  pontos: PontoDoMapa[];
  altura?: number;
  textoVazio: string;       // mostrado quando ainda ninguém enviou localização
  textoCentralizar: string; // acessibilidade do botão "centralizar"
  focoId?: number | null;   // se mudar, o mapa vai até essa pessoa (zoom de rua)
  focoVersao?: number;      // muda a cada toque, para focar de novo na mesma pessoa
}

export default function MapaAoVivo({ pontos, altura = 300, textoVazio, textoCentralizar, focoId, focoVersao }: Props) {
  const webview = useRef<React.ComponentRef<typeof WebView>>(null);
  const [pronto, setPronto] = useState(false);
  const [falha, setFalha] = useState<string | null>(null); // motivo, se o mapa não abrir

  // Só considera pontos com coordenadas de verdade.
  const validos = useMemo(() => pontos.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)), [pontos]);
  const json = useMemo(() => JSON.stringify(validos), [validos]);

  // Sempre que os pontos mudam (e a página já carregou), manda para o mapa.
  useEffect(() => {
    if (!pronto) return;
    webview.current?.injectJavaScript(`atualizar(${json}); true;`);
  }, [json, pronto]);

  // Quando a pessoa toca num nome da lista, o mapa vai até ela.
  useEffect(() => {
    if (!pronto || focoId == null) return;
    webview.current?.injectJavaScript(`focar(${focoId}); true;`);
  }, [focoId, focoVersao, pronto]);

  return (
    <View style={[styles.caixa, { height: altura }]}>
      <WebView
        ref={webview}
        source={{ html: HTML_DO_MAPA, baseUrl: "https://localhost" }}
        originWhitelist={["*"]}
        javaScriptEnabled
        nestedScrollEnabled
        onLoadEnd={() => setPronto(true)}
        // O HTML avisa quando algo falha (sem internet, imagens bloqueadas...).
        onMessage={(e) => {
          const msg = e.nativeEvent.data;
          if (msg === "erro:leaflet") setFalha("Não foi possível carregar o mapa. Confira a conexão do celular com a internet.");
          else if (msg === "erro:tiles") setFalha("O mapa abriu, mas as imagens não carregaram. Confira a internet.");
          else if (msg === "pronto") setFalha(null);
        }}
        onError={() => setFalha("Não foi possível abrir o mapa. Confira a internet.")}
        style={{ flex: 1 }}
      />

      {falha && (
        <View style={styles.falha}>
          <Text style={styles.falhaTexto}>{falha}</Text>
        </View>
      )}

      {validos.length === 0 && !falha && (
        <View style={styles.vazio} pointerEvents="none">
          <Text style={styles.vazioTexto}>{textoVazio}</Text>
        </View>
      )}

      {/* Botão para voltar a enquadrar todo mundo */}
      <TouchableOpacity
        style={styles.centralizar}
        onPress={() => webview.current?.injectJavaScript("ajustar(); true;")}
        accessibilityRole="button"
        accessibilityLabel={textoCentralizar}
      >
        <Ionicons name="locate" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.radarFundo,
  },
  vazio: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: "rgba(11,31,42,0.9)",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  falha: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  falhaTexto: { ...typography.bodyMuted, textAlign: "center" },
  vazioTexto: { ...typography.caption, color: colors.textInverse, textAlign: "center" },
  centralizar: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
