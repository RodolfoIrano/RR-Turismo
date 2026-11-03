// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É a "central de conexão" com o backend (o servidor Spring).
// Guarda o endereço do servidor, envia o token de login em toda
// chamada, e trata erros de rede. QUASE TODO OUTRO ARQUIVO DE
// SERVIÇO (services/*.ts) usa este arquivo por baixo dos panos.
// ============================================================
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// ============================================================
// CONFIGURAÇÃO CENTRAL DA API
// ------------------------------------------------------------
// Aponta para o backend Spring (pasta RR-Turismo-Spring), que
// roda na porta 9000.
//
// O ENDEREÇO É DESCOBERTO SOZINHO - você não precisa editar nada:
//  1. Se existir a variável EXPO_PUBLIC_API_URL (arquivo .env),
//     ela manda. Ex.: EXPO_PUBLIC_API_URL=http://192.168.0.10:9000/api
//  2. Senão, usa o IP do computador que está rodando o "expo start"
//     (o Expo já sabe esse IP - funciona no celular com Expo Go e
//     no emulador, desde que estejam na mesma rede Wi-Fi).
//  3. Se nada disso existir: emulador Android usa 10.0.2.2 e o
//     navegador usa localhost.
// ============================================================
function descobrirBaseUrl(): string {
  const manual = process.env.EXPO_PUBLIC_API_URL;
  if (manual) return manual.replace(/\/+$/, "");

  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:9000/api`;
  }
  return Platform.OS === "android" ? "http://10.0.2.2:9000/api" : "http://localhost:9000/api";
}

export const BASE_URL = descobrirBaseUrl();

const CHAVE_TOKEN = "rr_turismo_token";

// Simula latência de rede para os mocks que ainda não foram
// substituídos por chamadas reais (ex: viagens/guias).
export function delay<T>(data: T, ms: number = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// ==============================================================
// ARMAZENAMENTO SEGURO DO TOKEN
// ----------------------------------------------------------------
// O token de login é salvo com expo-secure-store (Keychain no iOS
// e Keystore/EncryptedSharedPreferences no Android) em vez de
// AsyncStorage puro, porque é uma credencial sensível.
// ==============================================================
export async function salvarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function obterToken(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

export async function removerToken(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}

// ==============================================================
// ERRO DA API
// ----------------------------------------------------------------
// Guarda a mensagem vinda do backend (campo "erro" do JSON),
// para que as telas possam mostrar um aviso amigável em vez de
// "Erro na requisição: 401".
// ==============================================================
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Helper genérico para chamadas autenticadas (envia o token salvo
// no header Authorization automaticamente, quando existir).
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await obterToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    // Falha de rede/conexão (backend fora do ar, IP errado, etc.).
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique sua conexão e o endereço da API em services/api.ts.");
  }

  if (!response.ok) {
    let mensagem = `Erro na requisição (${response.status}).`;
    try {
      const corpo = await response.json();
      if (corpo?.erro) mensagem = corpo.erro;
    } catch {
      // resposta sem corpo JSON - mantém a mensagem padrão
    }
    throw new ApiError(response.status, mensagem);
  }

  // Respostas 204 (sem conteúdo) não têm corpo para ler.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Igual ao apiFetch, mas para upload de arquivos (multipart),
// como a troca de foto de perfil. Não define Content-Type
// manualmente para que o fetch monte o boundary automaticamente.
export async function apiFetchMultipart<T>(path: string, formData: FormData): Promise<T> {
  const token = await obterToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique sua conexão e o endereço da API em services/api.ts.");
  }

  if (!response.ok) {
    let mensagem = `Erro no envio (${response.status}).`;
    try {
      const corpo = await response.json();
      if (corpo?.erro) mensagem = corpo.erro;
    } catch {}
    throw new ApiError(response.status, mensagem);
  }

  return response.json();
}
