// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda o carrinho de compras (quais viagens, quantas pessoas)
// pra todo o app poder consultar - é o que faz a aba "Carrinho"
// e o ícone do cabeçalho funcionarem.
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from "react";
import { CartItem, Trip } from "../types";
import { loadCart, saveCart, clearCartStorage } from "../services/cartService";
import { useCatalogo } from "./CatalogoContext";
import { useAuth } from "./AuthContext";
import { VISITANTE, apagarChavesAntigas } from "../services/ArmazenamentoPorConta";

// ============================================================
// CART CONTEXT
// ------------------------------------------------------------
// Regra de negócio do carrinho:
// - cada item guarda o id da viagem e a quantidade de pessoas;
// - o subtotal é a soma de (preço da viagem x quantidade);
// - aplicamos uma taxa fixa de serviço (poderia vir da API);
// - o total é subtotal + taxa.
//
// Os dados das viagens vêm do CatalogoContext, ou seja, são as
// viagens REAIS cadastradas no site (não mais dados fictícios).
// ============================================================

// A taxa de serviço foi removida a pedido do usuário - o total da
// compra agora é só a soma das viagens do carrinho (subtotal),
// sem nenhum valor extra somado.

interface CartContextData {
  items: CartItem[];
  addToCart: (tripId: string, quantity?: number) => void;
  updateQuantity: (tripId: string, quantity: number) => void;
  removeFromCart: (tripId: string) => void;
  clearCart: () => void;
  getTripForItem: (tripId: string) => Trip | undefined;
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Viagens reais carregadas do backend (ver CatalogoContext).
  const { viagens } = useCatalogo();

  // ----------------------------------------------------------
  // CARRINHO POR CONTA
  // "dono" = id do usuário logado, ou "visitante" se ninguém logou.
  // Ao trocar de conta (login/logout), carregamos o carrinho DAQUELA
  // conta. O que o visitante juntou antes de logar é somado ao
  // carrinho da conta (e some da gaveta de visitante).
  // ----------------------------------------------------------
  const { user, restaurandoSessao } = useAuth();
  const dono = user?.id ?? VISITANTE;
  const donoRef = useRef(dono); // sempre o dono atual (usado ao salvar)

  useEffect(() => {
    if (restaurandoSessao) return; // espera saber se há alguém logado
    donoRef.current = dono;
    let cancelado = false;
    (async () => {
      await apagarChavesAntigas();
      let lista = await loadCart(dono);
      if (user) {
        const doVisitante = await loadCart(VISITANTE);
        if (doVisitante.length > 0) {
          for (const item of doVisitante) {
            const existente = lista.find((i) => i.tripId === item.tripId);
            if (existente) existente.quantity += item.quantity;
            else lista.push(item);
          }
          await saveCart(dono, lista);
          await clearCartStorage(VISITANTE);
        }
      }
      if (!cancelado) setItems(lista);
    })();
    return () => { cancelado = true; };
  }, [dono, restaurandoSessao]); // eslint-disable-line react-hooks/exhaustive-deps

  // Adiciona uma viagem ao carrinho. Se ela já estiver lá, só soma
  // a quantidade em vez de criar um item duplicado.
  const addToCart = useCallback(
    (tripId: string, quantity: number = 1) => {
      setItems((current) => {
        const existing = current.find((i) => i.tripId === tripId);
        const updated = existing
          ? current.map((i) =>
              i.tripId === tripId ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [...current, { id: `cart-${Date.now()}`, tripId, quantity }];
        saveCart(donoRef.current, updated);
        return updated;
      });
    },
    []
  );

  // Altera a quantidade de pessoas de um item já no carrinho.
  const updateQuantity = useCallback(
    (tripId: string, quantity: number) => {
      if (quantity < 1) return; // não permite quantidade zero ou negativa
      setItems((current) => {
        const updated = current.map((i) => (i.tripId === tripId ? { ...i, quantity } : i));
        saveCart(donoRef.current, updated);
        return updated;
      });
    },
    []
  );

  // Remove um item do carrinho.
  const removeFromCart = useCallback((tripId: string) => {
    setItems((current) => {
      const updated = current.filter((i) => i.tripId !== tripId);
      saveCart(donoRef.current, updated);
      return updated;
    });
  }, []);

  // Esvazia o carrinho por completo (usado depois de finalizar uma compra).
  const clearCart = useCallback(() => {
    setItems([]);
    clearCartStorage(donoRef.current);
  }, []);

  // Busca os dados completos (título, preço, fotos...) de uma viagem
  // a partir do id guardado no item do carrinho.
  const getTripForItem = useCallback(
    (tripId: string) => viagens.find((t) => t.id === tripId),
    [viagens]
  );

  // Soma (preço da viagem x quantidade de pessoas) de todos os itens.
  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const trip = viagens.find((t) => t.id === item.tripId);
        return sum + (trip ? trip.price * item.quantity : 0);
      }, 0),
    [items, viagens]
  );

  // Taxa de serviço fixa, cobrada só quando há pelo menos 1 item no carrinho.
  // Taxa de serviço removida a pedido do usuário - fica sempre 0.
  // O campo continua existindo (em vez de apagar de tudo) pra não
  // quebrar as telas que já esperam esse valor (ex: checkout,
  // que mostra uma linha "Taxas") - só nunca soma nada ao total.
  const serviceFee = 0;
  const total = subtotal + serviceFee;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTripForItem,
        subtotal,
        serviceFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de um CartProvider.");
  return context;
}
