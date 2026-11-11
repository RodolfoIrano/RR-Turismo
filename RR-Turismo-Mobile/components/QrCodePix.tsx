// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Desenha o QR Code (do Pix de teste) com react-native-svg, a partir
// do texto recebido. Fundo branco e uma margem em volta, como pede
// a leitura de QR Code.
//
// ✏️ ONDE MUDAR O QUÊ: tamanho = propriedade "tamanho".
// ============================================================
import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { gerarMatrizQr } from "../utils/qrcode";

export default function QrCodePix({ texto, tamanho = 200 }: { texto: string; tamanho?: number }) {
  const matriz = useMemo(() => {
    try {
      return gerarMatrizQr(texto);
    } catch {
      return null;
    }
  }, [texto]);

  if (!matriz) return null;

  const margem = 2; // quadradinhos de borda branca
  const total = matriz.length + margem * 2;

  return (
    <View style={{ width: tamanho, height: tamanho, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" }}>
      <Svg width={tamanho} height={tamanho} viewBox={`0 0 ${total} ${total}`}>
        <Rect x={0} y={0} width={total} height={total} fill="#fff" />
        {matriz.map((linha, l) =>
          linha.map((escuro, c) =>
            escuro ? <Rect key={`${l}-${c}`} x={c + margem} y={l + margem} width={1.02} height={1.02} fill="#000" /> : null
          )
        )}
      </Svg>
    </View>
  );
}
