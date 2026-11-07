// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Busca os dados dos GUIAS (as pessoas/empresas que criaram as
// viagens no site) no backend. Usado na tela de perfil do guia
// e no CatalogoContext.
// ============================================================
import { Guide, Trip } from "../types";
import { apiFetch, BASE_URL } from "./api";
import { getTrips } from "./tripService";

// ============================================================
// GUIDE SERVICE
// ------------------------------------------------------------
// Busca os dados do "guia" - que, na prática, é o usuário do
// site que CRIOU a viagem. É a mesma pessoa que aparece como
// dono do pacote no seu site.
//
// Rotas usadas (públicas, não exigem login):
//   GET /api/guias/{id}          -> dados do guia
//   GET /api/guias/{id}/foto     -> foto de perfil dele
//   GET /api/guias/{id}/viagens  -> viagens criadas por ele
// ============================================================

// Formato cru devolvido pelo backend (ver GuiaDTO.java).
interface GuiaApi {
  id: string;
  name: string;
  location: string | null;
  bio: string | null;
  languages: string | null;      // vem como texto único, ex: "Português, Inglês"
  specialties: string | null;
  tripsCompleted: number;
  clientesAtendidos: number;
  rating: number;
  reviewCount: number;
  cadastur: boolean;
  photoUrl: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  site: string | null;
  videoUrl: string | null;
}

// Foto usada quando o guia ainda não colocou uma no site.
const FOTO_PADRAO = "https://ui-avatars.com/api/?background=1E2A5E&color=fff&name=";

// Transforma um texto separado por vírgulas numa lista.
// Ex: "Português, Inglês" -> ["Português", "Inglês"]
function paraLista(texto: string | null): string[] {
  if (!texto || !texto.trim()) return [];
  return texto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// Converte o guia vindo do backend para o formato "Guide" que as
// telas do app já usam.
function paraGuide(guia: GuiaApi): Guide {
  return {
    id: guia.id,
    name: guia.name,
    photo: guia.photoUrl
      ? `${BASE_URL.replace(/\/api$/, "")}${guia.photoUrl}?w=400`
      : `${FOTO_PADRAO}${encodeURIComponent(guia.name)}`,
    location: guia.location ?? "",
    bio: guia.bio ?? "",

    // A tabela do site não guarda "anos de experiência"; usamos a
    // quantidade de viagens realizadas como referência mais próxima.
    experienceYears: 0,

    languages: paraLista(guia.languages),
    specialties: paraLista(guia.specialties),
    clientsServed: guia.clientesAtendidos,
    contatos: {
      whatsapp: guia.whatsapp ?? "",
      instagram: guia.instagram ?? "",
      facebook: guia.facebook ?? "",
      twitter: guia.twitter ?? "",
      site: guia.site ?? "",
    },
    tripsCompleted: guia.tripsCompleted,
    rating: guia.rating,
    reviewCount: guia.reviewCount,
  };
}

// Busca um guia específico pelo id, mas SEM esconder o erro:
// quem chama recebe a mensagem real (ex: "HTTP 500", "Failed to fetch").
export async function carregarGuiaOuErro(id: string): Promise<Guide> {
  const guia = await apiFetch<GuiaApi>(`/guias/${id}`);
  return paraGuide(guia);
}

// Versão para listas: se um guia falhar, registra o motivo no log
// (antes ele sumia sem explicação) e segue com os outros.
export async function getGuideById(id: string): Promise<Guide | undefined> {
  try {
    return await carregarGuiaOuErro(id);
  } catch (e) {
    console.warn(`[guias] não foi possível carregar o guia ${id}:`, e);
    return undefined;
  }
}

// Lista as viagens oferecidas por um guia específico.
export async function getTripsByGuide(guideId: string): Promise<Trip[]> {
  const todas = await getTrips();
  return todas.filter((t) => t.guideId === guideId);
}

// Lista todos os guias que possuem pelo menos uma viagem
// cadastrada. Como o backend não tem uma rota "listar todos os
// guias" (e nem faria sentido expor todos os usuários do site),
// montamos a lista a partir dos criadores das viagens existentes.
//
// IMPORTANTE (correção de bug): esta função recebe a lista de
// viagens já carregada como parâmetro, em vez de buscar de novo
// aqui dentro. Antes ela chamava getTrips() outra vez por conta
// própria - uma segunda chamada de rede totalmente redundante,
// que se falhasse por qualquer instabilidade, derrubava a tela
// de detalhes da viagem mesmo com a viagem já carregada
// corretamente em outro lugar do app.
export async function getGuides(viagens: Trip[]): Promise<Guide[]> {
  // Pega os ids de guia únicos que aparecem nas viagens.
  const ids = Array.from(new Set(viagens.map((t) => t.guideId).filter(Boolean)));

  const guias = await Promise.all(ids.map((id) => getGuideById(id)));
  return guias.filter((g): g is Guide => g !== undefined);
}
