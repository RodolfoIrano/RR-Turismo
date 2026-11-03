// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Carrega a lista de viagens e guias (do backend) UMA vez e
// deixa disponível pra qualquer tela do app usar, sem precisar
// buscar de novo toda hora.
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

import { Trip, Guide } from "../types";
import * as tripService from "../services/tripService";
import * as guideService from "../services/guideService";

// ============================================================
// CATÁLOGO (viagens e guias vindos do backend)
// ------------------------------------------------------------
// Antes, várias telas liam a lista de viagens direto do arquivo
// de dados fictícios (mocks/trips.ts). Agora as viagens são as
// REAIS, cadastradas no site - mas buscá-las na API dentro de
// cada tela separadamente faria o app repetir a mesma requisição
// várias vezes.
//
// Então este contexto carrega o catálogo UMA vez, quando o app
// abre, e deixa disponível para qualquer tela através de
// useCatalogo(). Também expõe "recarregar()", para atualizar a
// lista quando o usuário puxar a tela para baixo (pull to
// refresh) ou quando uma viagem nova for criada no site.
// ============================================================

interface CatalogoContextData {
  viagens: Trip[];
  guias: Guide[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  buscarViagem: (id: string) => Trip | undefined;
  buscarGuia: (id: string) => Guide | undefined;
}

const CatalogoContext = createContext<CatalogoContextData | undefined>(undefined);

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [viagens, setViagens] = useState<Trip[]>([]);
  const [guias, setGuias] = useState<Guide[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      // Busca as viagens primeiro.
      const listaViagens = await tripService.getTrips();

      // Busca os guias dessas viagens, passando a lista que já
      // temos (em vez da função buscar de novo por conta própria -
      // ver o comentário em getGuides(), no guideService.ts, sobre
      // o bug que isso causava).
      const listaGuias = await guideService.getGuides(listaViagens);

      // Só atualiza os dois estados depois que TUDO deu certo, pra
      // nunca deixar "viagens" e "guias" storage fora de sincronia.
      setViagens(listaViagens);
      setGuias(listaGuias);
    } catch (e) {
      // Ex: backend desligado ou endereço da API errado.
      //
      // IMPORTANTE: aqui NÃO apagamos "viagens"/"guias" que já
      // estavam carregadas de uma vez anterior com sucesso - se
      // essa tentativa de recarregar falhar (ex: uma instabilidade
      // momentânea de rede), o app continua mostrando os últimos
      // dados bons que tinha, em vez de fazer tudo desaparecer.
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar as viagens."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carrega o catálogo assim que o app abre.
  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // Atalhos para encontrar uma viagem/guia já carregado, sem
  // precisar fazer outra chamada de rede.
  const buscarViagem = useCallback(
    (id: string) => viagens.find((v) => v.id === id),
    [viagens]
  );

  const buscarGuia = useCallback(
    (id: string) => guias.find((g) => g.id === id),
    [guias]
  );

  return (
    <CatalogoContext.Provider
      value={{ viagens, guias, carregando, erro, recarregar, buscarViagem, buscarGuia }}
    >
      {children}
    </CatalogoContext.Provider>
  );
}

export function useCatalogo(): CatalogoContextData {
  const context = useContext(CatalogoContext);
  if (!context) throw new Error("useCatalogo deve ser usado dentro de um CatalogoProvider.");
  return context;
}
