// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda "quem é o usuário logado" pra todo o app poder
// consultar (ex: saber o nome dele em qualquer tela). Chama o
// authService.ts por baixo dos panos.
// ============================================================
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User } from "../types";
import * as authService from "../services/authService";

// ============================================================
// AUTH CONTEXT
// ------------------------------------------------------------
// Mantém o usuário logado disponível para todo o app.
//
// O login/cadastro agora são chamadas reais para o backend
// Spring (ver services/authService.ts), que devolve um token
// salvo com expo-secure-store. Esse token é reenviado
// automaticamente em toda chamada autenticada (services/api.ts).
//
// "restaurandoSessao" indica que o app está checando, na
// abertura, se já existe um token salvo de uma sessão anterior
// (para o usuário não precisar logar toda vez que abrir o app).
// ============================================================

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  restaurandoSessao: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Troca os dados do usuário já logado (ex: depois de editar o nome no perfil).
  atualizarUsuario: (novo: User) => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [restaurandoSessao, setRestaurandoSessao] = useState(true);

  // Ao abrir o app, tenta restaurar a sessão usando o token salvo
  // no dispositivo (se o usuário já tiver logado antes).
  useEffect(() => {
    (async () => {
      const usuarioRestaurado = await authService.restaurarSessao();
      setUser(usuarioRestaurado);
      setRestaurandoSessao(false);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login({ email, password });
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const newUser = await authService.register({ name, email, password });
        setUser(newUser);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sair da conta: o usuário é "esquecido" no app NA HORA, mesmo que a
  // chamada ao servidor falhe (ex: sem internet). Assim ninguém continua
  // "logado" na tela depois de tocar em Sair.
  const signOut = useCallback(async () => {
    setUser(null);
    try {
      await authService.logout();
    } catch {
      // Sem conexão: o token local é removido pelo próprio logout quando possível.
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, restaurandoSessao, signIn, signUp, signOut, atualizarUsuario: setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  return context;
}

