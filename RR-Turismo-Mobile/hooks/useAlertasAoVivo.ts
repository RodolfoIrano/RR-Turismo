// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Observa o estado da viagem ao vivo e avisa quando aparece algo
// NOVO e importante, para a tela piscar:
//   - CLIENTE: um aviso do tipo "REUNIR" (hora de voltar).
//   - GUIA: um novo pedido de ajuda (emergência).
// O que já existia quando a tela abriu NÃO dispara alerta (senão
// avisos antigos piscariam toda vez que o usuário entrasse).
// ============================================================
import { useEffect, useRef, useState } from "react";
import { EstadoAoVivo } from "../types/aoVivo";

export function useAlertasAoVivo(
  estado: EstadoAoVivo | null,
  textoReunir: string,
  textoAjuda: string, // ex: "pede ajuda!"
) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const jaVistos = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!estado) return;

    // IDs de tudo que existe agora (prefixo separa avisos de emergências).
    const atuais = [
      ...estado.avisos.map((a) => `a${a.id}`),
      ...estado.emergencias.map((e) => `e${e.id}`),
    ];

    // Primeira leitura: só memoriza, não alerta.
    if (jaVistos.current === null) {
      jaVistos.current = new Set(atuais);
      return;
    }

    for (const aviso of estado.avisos) {
      if (!jaVistos.current.has(`a${aviso.id}`) && aviso.tipo === "REUNIR" && !estado.souGuia) {
        setMensagem(aviso.texto || textoReunir);
      }
    }
    for (const emerg of estado.emergencias) {
      if (!jaVistos.current.has(`e${emerg.id}`) && estado.souGuia) {
        setMensagem(`${emerg.nome} ${textoAjuda}`);
      }
    }
    atuais.forEach((id) => jaVistos.current!.add(id));
  }, [estado, textoReunir, textoAjuda]);

  return { mensagem, fechar: () => setMensagem(null) };
}
