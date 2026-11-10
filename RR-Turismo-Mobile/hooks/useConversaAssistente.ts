// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda a CONVERSA do assistente de ajuda (as mensagens trocadas)
// e sabe responder: quando a pessoa pergunta, mostra "digitando..."
// por um instante e depois a resposta do assistente. É usado tanto
// pela bolinha flutuante quanto pela tela Assistente de ajuda.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Tempo do "digitando..." ... variável "espera" dentro de perguntar()
//   - Primeira mensagem ......... BOAS_VINDAS em services/assistenteDeAjuda.ts
//   - O que o assistente responde  services/assistenteDeAjuda.ts
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { BOAS_VINDAS, responder, type ItemDeAjuda } from "../services/assistenteDeAjuda";

export interface Mensagem {
  id: string;
  autor: "eu" | "assistente";
  texto: string;
  atalho?: ItemDeAjuda["atalho"];
}

export function useConversaAssistente(nome?: string) {
  const contador = useRef(1);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [digitando, setDigitando] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { id: "0", autor: "assistente", texto: BOAS_VINDAS },
  ]);

  // Ao sair da tela, cancela uma resposta que ainda estava "digitando".
  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  const proximoId = () => {
    contador.current += 1;
    return String(contador.current);
  };

  const perguntar = useCallback(
    (pergunta: string) => {
      const limpa = pergunta.trim();
      if (!limpa) return;

      setMensagens((atual) => [...atual, { id: proximoId(), autor: "eu", texto: limpa }]);
      setDigitando(true);

      const item = responder(limpa, nome);
      // Pausa curtinha (proporcional ao tamanho da resposta) para parecer conversa.
      const espera = Math.min(1100, 450 + item.resposta.length * 4);

      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => {
        setMensagens((atual) => [
          ...atual,
          { id: proximoId(), autor: "assistente", texto: item.resposta, atalho: item.atalho },
        ]);
        setDigitando(false);
      }, espera);
    },
    [nome],
  );

  const recomecar = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setDigitando(false);
    setMensagens([{ id: "0", autor: "assistente", texto: BOAS_VINDAS }]);
  }, []);

  return { mensagens, digitando, perguntar, recomecar };
}
