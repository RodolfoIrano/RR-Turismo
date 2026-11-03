// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Hook que mantém o ESTADO DA VIAGEM AO VIVO sempre atualizado:
// consulta o servidor a cada poucos segundos enquanto a tela
// está aberta (radar, avisos e emergências em "tempo real").
// Para de consultar quando a tela sai de foco (economiza bateria).
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { buscarEstado } from "../services/aoVivoService";
import { EstadoAoVivo } from "../types/aoVivo";

export function useViagemAoVivo(viagemId: string, intervaloMs: number = 5000) {
  const [estado, setEstado] = useState<EstadoAoVivo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  const atualizar = useCallback(async () => {
    try {
      const novo = await buscarEstado(viagemId);
      if (!montado.current) return;
      setEstado(novo);
      setErro(null);
    } catch (e) {
      if (montado.current) setErro(e instanceof Error ? e.message : "Erro ao atualizar.");
    }
  }, [viagemId]);

  // Liga o "relógio" só enquanto a tela está em foco.
  useFocusEffect(
    useCallback(() => {
      atualizar();
      const timer = setInterval(atualizar, intervaloMs);
      return () => clearInterval(timer);
    }, [atualizar, intervaloMs]),
  );

  return { estado, erro, atualizar };
}
