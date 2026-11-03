// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Salva as viagens favoritas no celular, UMA LISTA POR CONTA
// (ver ArmazenamentoPorConta). Usado pelo FavoritesContext.
// ============================================================
import { Favorite } from "../types";
import { ArmazenamentoPorConta } from "./ArmazenamentoPorConta";

const gaveta = new ArmazenamentoPorConta<Favorite>("favoritos");

export const loadFavorites = (dono: string) => gaveta.ler(dono);
export const saveFavorites = (dono: string, lista: Favorite[]) => gaveta.gravar(dono, lista);
export const clearFavorites = (dono: string) => gaveta.apagar(dono);
