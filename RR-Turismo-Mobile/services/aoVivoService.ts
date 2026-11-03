// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Fala com o backend sobre a VIAGEM AO VIVO: iniciar/encerrar,
// entrar, enviar localização, mandar avisos, pedir ajuda e ler
// o estado (radar). Cada função = uma rota /api/ao-vivo/...
// Todas exigem login (o token é enviado pelo apiFetch).
// ============================================================
import { apiFetch } from "./api";
import { EstadoAoVivo, AvisoAoVivo } from "../types/aoVivo";

const rota = (viagemId: string, parte: string) => `/ao-vivo/${viagemId}/${parte}`;
const post = (caminho: string, corpo?: object) =>
  apiFetch<unknown>(caminho, { method: "POST", body: JSON.stringify(corpo ?? {}) });

// Lê o estado atual (o app chama isto a cada poucos segundos).
export const buscarEstado = (viagemId: string) =>
  apiFetch<EstadoAoVivo>(rota(viagemId, "estado"));

// ---- Guia ----
export const iniciarViagem = (viagemId: string) => post(rota(viagemId, "iniciar"));
export const encerrarViagem = (viagemId: string) => post(rota(viagemId, "encerrar"));
export const enviarAviso = (viagemId: string, texto: string, tipo: "INFO" | "REUNIR") =>
  post(rota(viagemId, "avisos"), { texto, tipo }) as Promise<AvisoAoVivo>;
export const resolverEmergencia = (viagemId: string, emergenciaId: number) =>
  post(rota(viagemId, `emergencias/${emergenciaId}/resolver`));

// ---- Cliente ----
export const entrarNaViagem = (viagemId: string) => post(rota(viagemId, "entrar"));
export const sairDaViagem = (viagemId: string) => post(rota(viagemId, "sair"));
export const pedirAjuda = (viagemId: string, mensagem: string) =>
  post(rota(viagemId, "emergencia"), { mensagem });

// ---- Os dois ----
export const enviarLocalizacao = (viagemId: string, lat: number, lng: number) =>
  post(rota(viagemId, "localizacao"), { lat, lng });
