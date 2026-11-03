// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Controla o IDIOMA do app. Detecta o idioma do aparelho na
// primeira abertura, deixa o usuário trocar (e lembra da escolha)
// e entrega:
//   - idioma / mudarIdioma  : qual idioma e como trocar;
//   - t                     : os textos-base em português (pt.ts);
//   - traduzir(texto)       : traduz QUALQUER texto automaticamente.
//
// Todo <Text> do app já passa por traduzir() sozinho (ver
// components/TextoTraduzido.tsx), então o app INTEIRO muda de
// idioma, inclusive textos que vêm do servidor (títulos de viagem).
// ============================================================
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import pt, { Traducoes } from "./idiomas/pt";
import { IDIOMAS } from "./idiomasDisponiveis";
import { TradutorDeTextos } from "./TradutorDeTextos";

export type CodigoIdioma = string;

const CODIGOS_DISPONIVEIS = IDIOMAS.map((i) => i.codigo);
const CHAVE_STORAGE = "@rr_turismo:idioma";

interface TraducaoContextData {
  idioma: CodigoIdioma;
  t: Traducoes;
  mudarIdioma: (idioma: CodigoIdioma) => Promise<void>;
  traduzir: (texto: string) => string;
  carregando: boolean;
  traduzindo: boolean; // true enquanto há textos sendo traduzidos
}

const TraducaoContext = createContext<TraducaoContextData | undefined>(undefined);

// O app SEMPRE começa em português. O idioma só muda se a pessoa
// escolher outro no seletor (globo no topo) - e aí fica salvo.
const IDIOMA_PADRAO: CodigoIdioma = "pt";

export function TraducaoProvider({ children }: { children: ReactNode }) {
  // Uma única instância do tradutor vive enquanto o app estiver aberto.
  const tradutor = useRef(new TradutorDeTextos()).current;

  const [idioma, setIdioma] = useState<CodigoIdioma>("pt");
  const [carregando, setCarregando] = useState(true);
  // "versao" muda sempre que chega tradução nova: força as telas a se redesenharem.
  const [versao, setVersao] = useState(0);

  useEffect(() => tradutor.assinar(() => setVersao((v) => v + 1)), [tradutor]);

  useEffect(() => {
    (async () => {
      const salvo = await AsyncStorage.getItem(CHAVE_STORAGE).catch(() => null);
      const inicial = salvo && CODIGOS_DISPONIVEIS.includes(salvo) ? salvo : IDIOMA_PADRAO;
      tradutor.definirIdioma(inicial);
      setIdioma(inicial);
      setCarregando(false);
    })();
  }, [tradutor]);

  const mudarIdioma = useCallback(
    async (novo: CodigoIdioma) => {
      tradutor.definirIdioma(novo);
      setIdioma(novo);
      await AsyncStorage.setItem(CHAVE_STORAGE, novo).catch(() => {});
    },
    [tradutor],
  );

  const traduzir = useCallback((texto: string) => tradutor.traduzir(texto), [tradutor]);

  // "versao" entra nas dependências de propósito (ver comentário acima).
  const valor = useMemo<TraducaoContextData>(
    () => ({ idioma, t: pt, mudarIdioma, traduzir, carregando, traduzindo: tradutor.ocupado }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idioma, mudarIdioma, traduzir, carregando, versao],
  );

  return <TraducaoContext.Provider value={valor}>{children}</TraducaoContext.Provider>;
}

export function useTraducao(): TraducaoContextData {
  const context = useContext(TraducaoContext);
  if (!context) throw new Error("useTraducao deve ser usado dentro de um TraducaoProvider.");
  return context;
}

// Versão que não dá erro fora do provider (usada pelo <Text> traduzido).
export function useTraducaoOpcional(): TraducaoContextData | undefined {
  return useContext(TraducaoContext);
}
