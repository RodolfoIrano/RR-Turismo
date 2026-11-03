// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Liga o RastreadorDeLocalizacao (classe) enquanto "ativo" for
// verdadeiro e a tela estiver aberta, enviando a posição do
// celular ao servidor. Desliga sozinho ao sair da tela ou quando
// a viagem termina. Devolve se o usuário deu permissão.
// ============================================================
import { useEffect, useState } from "react";
import { RastreadorDeLocalizacao } from "../services/RastreadorDeLocalizacao";
import { enviarLocalizacao } from "../services/aoVivoService";

export function useRastreamento(viagemId: string, ativo: boolean) {
  // null = ainda não sabemos; true/false = resposta da permissão.
  const [permitido, setPermitido] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ativo) return;
    const rastreador = new RastreadorDeLocalizacao(async (lat, lng) => { await enviarLocalizacao(viagemId, lat, lng); });
    let cancelado = false;
    rastreador.iniciar().then((ok) => {
      if (cancelado) { rastreador.parar(); return; }
      setPermitido(ok);
    });
    return () => { cancelado = true; rastreador.parar(); };
  }, [viagemId, ativo]);

  return { permitido };
}
