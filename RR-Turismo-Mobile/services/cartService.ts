// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Salva o carrinho de compras no celular, UM CARRINHO POR CONTA
// (ver ArmazenamentoPorConta). Usado pelo CartContext.
// ============================================================
import { CartItem } from "../types";
import { ArmazenamentoPorConta } from "./ArmazenamentoPorConta";

const gaveta = new ArmazenamentoPorConta<CartItem>("carrinho");

export const loadCart = (dono: string) => gaveta.ler(dono);
export const saveCart = (dono: string, itens: CartItem[]) => gaveta.gravar(dono, itens);
export const clearCartStorage = (dono: string) => gaveta.apagar(dono);
