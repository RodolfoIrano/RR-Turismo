// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda a lista de viagens favoritadas pra todo o app poder
// consultar - é o que faz o ícone de coração (❤️) funcionar em
// qualquer tela.
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { Favorite } from "../types";
import { loadFavorites, saveFavorites, clearFavorites } from "../services/favoriteService";
import { useAuth } from "./AuthContext";
import { VISITANTE } from "../services/ArmazenamentoPorConta";

// ============================================================
// FAVORITES CONTEXT
// ------------------------------------------------------------
// Centraliza a lógica de favoritar/desfavoritar para que o
// coração (♡ / ♥) fique sincronizado em qualquer tela do app
// (Home, Detalhes da Viagem, Favoritos, Perfil do Guia).
// ============================================================

interface FavoritesContextData {
  favorites: Favorite[];
  isFavorite: (tripId: string) => boolean;
  toggleFavorite: (tripId: string) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextData | undefined>(undefined);


export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true); // true enquanto carrega os favoritos salvos

  // FAVORITOS POR CONTA: cada usuário tem a sua lista. Ao trocar de
  // conta (login/logout) carregamos a lista DAQUELA conta; o que o
  // visitante favoritou antes de logar é somado à lista da conta.
  const { user, restaurandoSessao } = useAuth();
  const dono = user?.id ?? VISITANTE;
  const donoRef = useRef(dono);

  useEffect(() => {
    if (restaurandoSessao) return;
    donoRef.current = dono;
    let cancelado = false;
    setLoading(true);
    (async () => {
      const lista = await loadFavorites(dono);
      if (user) {
        const doVisitante = await loadFavorites(VISITANTE);
        if (doVisitante.length > 0) {
          for (const fav of doVisitante) {
            if (!lista.some((f) => f.tripId === fav.tripId)) lista.push({ ...fav, userId: dono });
          }
          await saveFavorites(dono, lista);
          await clearFavorites(VISITANTE);
        }
      }
      if (!cancelado) { setFavorites(lista); setLoading(false); }
    })();
    return () => { cancelado = true; };
  }, [dono, restaurandoSessao]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verifica se uma viagem específica já está nos favoritos.
  const isFavorite = useCallback(
    (tripId: string) => favorites.some((f) => f.tripId === tripId),
    [favorites]
  );

  // Adiciona ou remove uma viagem dos favoritos (o nome "toggle"
  // vem de "alternar": se já está favoritado, remove; senão, adiciona).
  const toggleFavorite = useCallback(
    (tripId: string) => {
      setFavorites((current) => {
        const exists = current.find((f) => f.tripId === tripId);
        const updated = exists
          ? current.filter((f) => f.tripId !== tripId)
          : [
              ...current,
              {
                id: `fav-${Date.now()}`,
                userId: donoRef.current,
                tripId,
                createdAt: new Date().toISOString(),
              },
            ];
        saveFavorites(donoRef.current, updated); // persiste em background, sem travar a UI
        return updated;
      });
    },
    []
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextData {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites deve ser usado dentro de um FavoritesProvider.");
  return context;
}
