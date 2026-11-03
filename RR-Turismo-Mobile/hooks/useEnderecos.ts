// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Dado uma lista de pessoas com posição no mapa, devolve o ENDEREÇO
// (rua e número) de cada uma, por id. Vai preenchendo aos poucos,
// conforme o serviço responde, e atualiza quando a pessoa anda.
// ============================================================
import { useEffect, useState } from "react";
import { enderecos } from "../services/EnderecoPorCoordenada";

interface PosicaoComId {
  id: number;
  lat: number;
  lng: number;
}

export function useEnderecos(posicoes: PosicaoComId[]): Record<number, string> {
  const [porId, setPorId] = useState<Record<number, string>>({});

  // Chave estável (muda só quando alguém muda ~11 m), para não repetir a busca à toa.
  const chave = posicoes.map((p) => `${p.id}:${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");

  useEffect(() => {
    let cancelado = false;
    for (const p of posicoes) {
      const ja = enderecos.conhecido(p.lat, p.lng);
      if (ja) {
        setPorId((atual) => (atual[p.id] === ja ? atual : { ...atual, [p.id]: ja }));
        continue;
      }
      enderecos.buscar(p.lat, p.lng).then((texto) => {
        if (cancelado || !texto) return;
        setPorId((atual) => (atual[p.id] === texto ? atual : { ...atual, [p.id]: texto }));
      });
    }
    return () => { cancelado = true; };
  }, [chave]); // eslint-disable-line react-hooks/exhaustive-deps

  return porId;
}
