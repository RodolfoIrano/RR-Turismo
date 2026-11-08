// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Login, cadastro e logout de verdade (fala com o backend
// Spring). Também troca a foto/capa do perfil. É usado pela
// tela de Login, Cadastro e pelo AuthContext.
// ============================================================
import { ValidadorDeSenha } from "../validacoes/ValidadorDeSenha";
import { User } from "../types";
import * as FileSystem from "expo-file-system/legacy";
import { apiFetch, salvarToken, obterToken, removerToken, BASE_URL } from "./api";

// ============================================================
// AUTH SERVICE
// ------------------------------------------------------------
// Login/cadastro reais, integrados ao MESMO backend/banco do
// site (projeto_spring). Não existe usuário "só do app": o
// e-mail e a senha cadastrados aqui são os mesmos usados para
// entrar no site em /entrar.
//
//   POST /api/auth/login    -> { token, usuario }
//   POST /api/auth/register -> { token, usuario }
//   GET  /api/auth/me       -> usuario (usa o token salvo)
//   POST /api/perfil/foto   -> troca a foto de perfil
//
// O token devolvido pelo backend é salvo com expo-secure-store
// (ver services/api.ts) e reenviado automaticamente em toda
// chamada autenticada.
// ============================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Formato cru devolvido pelo backend Spring (nomes em português,
// iguais ao AuthApiController/UsuarioDTO).
interface UsuarioApi {
  id: number;
  nome: string;
  email: string;
  username: string;
  temFoto: boolean;
  temBanner: boolean;
  guia?: boolean;
}

interface AuthResponseApi {
  token: string;
  usuario: UsuarioApi;
}

// Converte o usuário vindo do backend (campos em português) para
// o formato "User" já usado em todas as telas do app.
function paraUser(usuarioApi: UsuarioApi): User {
  return {
    id: String(usuarioApi.id),
    name: usuarioApi.nome ?? usuarioApi.email,
    username: usuarioApi.username,
    email: usuarioApi.email,
    // A foto em si não fica aqui: ela é carregada separadamente
    // pela tela de perfil via fontePerfilFoto(), pois precisa de
    // um header Authorization (ver comentário na função abaixo).
    temFoto: usuarioApi.temFoto,
    temBanner: usuarioApi.temBanner,
    guia: usuarioApi.guia ?? false,
  };
}

export async function login(payload: LoginPayload): Promise<User> {
  if (!payload.email || !payload.password) {
    throw new Error("Preencha e-mail e senha.");
  }
  if (!payload.email.includes("@")) {
    throw new Error("Informe um e-mail válido.");
  }

  const resposta = await apiFetch<AuthResponseApi>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: payload.email, senha: payload.password }),
  });

  await salvarToken(resposta.token);
  return paraUser(resposta.usuario);
}

export async function register(payload: RegisterPayload): Promise<User> {
  if (!payload.name) throw new Error("Nome é obrigatório.");
  if (!payload.email.includes("@")) throw new Error("Informe um e-mail válido.");
  const erroSenha = ValidadorDeSenha.validar(payload.password, payload.name, payload.email);
  if (erroSenha) throw new Error(erroSenha);

  const resposta = await apiFetch<AuthResponseApi>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      nome: payload.name,
      email: payload.email,
      senha: payload.password,
    }),
  });

  await salvarToken(resposta.token);
  return paraUser(resposta.usuario);
}

// Tenta restaurar a sessão ao abrir o app, usando o token salvo
// no dispositivo (se o usuário já tiver feito login antes).
export async function restaurarSessao(): Promise<User | null> {
  const token = await obterToken();
  if (!token) return null;

  try {
    const usuarioApi = await apiFetch<UsuarioApi>("/auth/me");
    return paraUser(usuarioApi);
  } catch {
    // Token inválido/expirado (ex: servidor reiniciou) - remove e
    // deixa o usuário logar novamente.
    await removerToken();
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // mesmo que a chamada falhe (ex: sem internet), removemos o
    // token localmente para efetivar o logout no app.
  }
  await removerToken();
}

// ============================================================
// FOTO DE PERFIL
// ------------------------------------------------------------
// Envia a nova foto para o backend (multipart/form-data),
// reaproveitando a mesma coluna/tabela já usada pelo site.
// ============================================================
export async function atualizarFotoPerfil(uriDaImagem: string): Promise<void> {
  await enviarImagemPerfil("/perfil/foto", "foto", uriDaImagem);
}

// Troca o NOME do usuário (POST /api/perfil/nome) e devolve o usuário atualizado.
export async function atualizarNomePerfil(nome: string): Promise<User> {
  const limpo = nome.trim();
  if (limpo.length < 2) throw new Error("O nome precisa ter pelo menos 2 letras.");
  const usuarioApi = await apiFetch<UsuarioApi>("/perfil/nome", {
    method: "POST",
    body: JSON.stringify({ nome: limpo }),
  });
  return paraUser(usuarioApi);
}

// Envia o BANNER (imagem de capa/fundo do perfil) para o backend,
// reaproveitando a mesma coluna "banner" que o site já usa.
export async function atualizarBannerPerfil(uriDaImagem: string): Promise<void> {
  await enviarImagemPerfil("/perfil/banner", "banner", uriDaImagem);
}

// Lógica comum de upload de imagem do perfil (foto e banner).
//
// IMPORTANTE (SDK 58): o "fetch" do Expo NÃO aceita mais o truque antigo
// formData.append(campo, { uri, name, type }) - dava erro de API ao trocar
// foto/capa. O jeito certo de enviar um arquivo local é o uploadAsync do
// expo-file-system, que lê o arquivo direto do celular e monta o multipart.
async function enviarImagemPerfil(rota: string, campo: string, uriDaImagem: string): Promise<void> {
  const token = await obterToken();
  const nomeArquivo = uriDaImagem.split("/").pop() ?? `${campo}.jpg`;
  const extensao = nomeArquivo.split(".").pop()?.toLowerCase();
  const tipoMime = extensao === "png" ? "image/png" : extensao === "webp" ? "image/webp" : "image/jpeg";

  let resposta: FileSystem.FileSystemUploadResult;
  try {
    resposta = await FileSystem.uploadAsync(`${BASE_URL}${rota}`, uriDaImagem, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: campo,
      mimeType: tipoMime,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new Error("Não foi possível enviar a imagem. Verifique a conexão com o servidor e tente de novo.");
  }

  if (resposta.status < 200 || resposta.status >= 300) {
    let mensagem = `Erro no envio da imagem (${resposta.status}).`;
    try {
      const corpo = JSON.parse(resposta.body);
      if (corpo?.erro) mensagem = corpo.erro;
    } catch {
      // resposta sem JSON - mantém a mensagem padrão
    }
    throw new Error(mensagem);
  }
}

// Monta a "source" (uri + headers) da foto de perfil do usuário
// logado, pronta para ser usada no componente <Image> do pacote
// "expo-image" (que, ao contrário do <Image> nativo do React
// Native, permite enviar headers customizados como Authorization
// numa requisição de imagem - por isso ele já é usado nesta tela).
export async function fontePerfilFoto(): Promise<{ uri: string; headers: Record<string, string> } | null> {
  return fontePerfilImagem("/perfil/foto");
}

// Mesma ideia da função acima, mas para o banner do perfil.
export async function fontePerfilBanner(): Promise<{ uri: string; headers: Record<string, string> } | null> {
  return fontePerfilImagem("/perfil/banner");
}

async function fontePerfilImagem(rota: string) {
  const token = await obterToken();
  if (!token) return null;
  return {
    // O "?v=" com a hora atual força o app a baixar a imagem de
    // novo em vez de mostrar a versão antiga que ficou em cache,
    // logo depois do usuário trocar a imagem.
    uri: `${BASE_URL}${rota}?v=${Date.now()}`,
    headers: { Authorization: `Bearer ${token}` },
  };
}
