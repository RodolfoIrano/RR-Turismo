// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Busca as VIAGENS de verdade no backend (as que foram
// cadastradas no site). É o arquivo mais importante pra Home e
// pra tela Explorar. Usado pelo CatalogoContext.
// ============================================================
import { Trip } from "../types";
import { apiFetch, BASE_URL } from "./api";

// ============================================================
// TRIP SERVICE
// ------------------------------------------------------------
// Busca as viagens REAIS cadastradas no site (projeto Spring),
// através das rotas públicas /api/viagens.
//
// "Público" aqui significa que não exige login: o catálogo de
// viagens precisa aparecer no app antes mesmo do usuário entrar
// na conta, igual à vitrine de uma loja.
//
// Assim que alguém cria uma viagem no site, ela passa a
// aparecer aqui automaticamente - não existe mais nenhuma
// viagem fictícia (mock) sendo usada nestas funções.
// ============================================================

// Formato cru devolvido pelo backend (ver ViagemDTO.java).
interface ViagemApi {
  id: string;
  title: string;
  description: string;
  destination: string;
  location: string;
  category: string;
  price: number;
  duration: number;
  rating: number;
  reviewCount: number;
  guideId: string | null;
  available: boolean;
  imageUrl: string | null;
  imageUrls?: string[]; // capa + fotos extras (o site aceita até 5 fotos por viagem)
  transporte: string | null;
  hotel: string | null;
  assentos: number;
  participantes: number;
  dataIda: string | null;
  dataVolta: string | null;
}

// Endereço do servidor SEM o "/api" no final (as imagens ficam em /api/...
// mas a URL completa é montada a partir do endereço base).
// "?w=900" pede ao servidor uma versão leve da foto (largura máx. 900 px):
// fotos originais da câmera têm vários MB e travam o carregamento no celular.
const URL_BASE_SERVIDOR = BASE_URL.replace(/\/api$/, "");

// Imagem usada quando a viagem foi cadastrada sem foto no site.
const IMAGEM_PADRAO =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800";

// Converte a viagem vinda do backend para o formato "Trip" que
// todas as telas do app já usam.
function paraTrip(viagem: ViagemApi): Trip {
  return {
    id: viagem.id,
    title: viagem.title ?? "Viagem",
    description: viagem.description ?? "",
    destination: viagem.destination ?? "",
    location: viagem.location ?? "",
    category: viagem.category ?? "Outros",
    price: viagem.price ?? 0,
    duration: viagem.duration ?? 1,
    rating: viagem.rating ?? 0,
    reviewCount: viagem.reviewCount ?? 0,
    guideId: viagem.guideId ?? "",

    // O backend manda só o caminho da imagem (ex: "/api/viagens/3/imagem"),
    // então montamos a URL completa aqui. O "?" no final evita que o
    // app mostre uma versão antiga em cache depois de trocar a foto.
    // "imageUrls" traz TODAS as fotos (capa + extras); se o servidor for antigo
    // e só mandar "imageUrl", usamos a capa. Sem nenhuma foto: imagem padrão.
    images: viagem.imageUrls && viagem.imageUrls.length > 0
      ? viagem.imageUrls.map((url) => `${URL_BASE_SERVIDOR}${url}?w=900`)
      : viagem.imageUrl
        ? [`${URL_BASE_SERVIDOR}${viagem.imageUrl}?w=900`]
        : [IMAGEM_PADRAO],

    // Campos que ainda não existem na tabela Viagem do site.
    // Preenchidos com o que dá para deduzir dos dados existentes,
    // para as telas não ficarem vazias.
    includedItems: [
      viagem.transporte ? `Transporte: ${viagem.transporte}` : null,
      viagem.hotel ? `Hospedagem: ${viagem.hotel}` : null,
    ].filter(Boolean) as string[],
    rules: [],
    cancellationPolicy:
      "Consulte as condições de cancelamento diretamente com o guia responsável.",

    available: viagem.available,
    dataIda: viagem.dataIda ?? undefined,
    dataVolta: viagem.dataVolta ?? undefined,
    transporte: viagem.transporte ?? undefined,
    hotel: viagem.hotel ?? undefined,
    assentos: viagem.assentos,
    participantes: viagem.participantes,
  };
}

// Filtros que a tela "Explorar" pode aplicar na busca de viagens.
export interface TripFilters {
  query?: string; // texto digitado na busca (compara com título, destino, local, categoria)
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

// Busca todas as viagens do backend (usada como base pelas
// funções abaixo, que apenas filtram/ordenam o resultado).
async function buscarTodas(): Promise<Trip[]> {
  const viagens = await apiFetch<ViagemApi[]>("/viagens");
  return viagens.map(paraTrip);
}

// Busca viagens aplicando os filtros informados (todos opcionais).
// O filtro é feito aqui no app porque a quantidade de viagens é
// pequena; se um dia crescer muito, vale mover para o backend.
export async function getTrips(filters?: TripFilters): Promise<Trip[]> {
  let result = await buscarTodas();

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }

  if (filters?.category) {
    result = result.filter((t) => t.category === filters.category);
  }

  if (filters?.minPrice !== undefined) {
    result = result.filter((t) => t.price >= filters.minPrice!);
  }

  if (filters?.maxPrice !== undefined) {
    result = result.filter((t) => t.price <= filters.maxPrice!);
  }

  if (filters?.minRating !== undefined) {
    result = result.filter((t) => t.rating >= filters.minRating!);
  }

  return result;
}

// Busca uma viagem específica pelo id (tela de detalhes).
export async function getTripById(id: string): Promise<Trip | undefined> {
  try {
    const viagem = await apiFetch<ViagemApi>(`/viagens/${id}`);
    return paraTrip(viagem);
  } catch {
    return undefined;
  }
}

// ============================================================
// SEÇÕES DA TELA INICIAL
// ------------------------------------------------------------
// A tabela Viagem do site ainda não tem os campos "destaque" e
// "em promoção". Então, em vez de inventar essa informação,
// montamos as seções a partir do que existe de verdade:
// - Destaques: as viagens mais recentes (últimas cadastradas).
// - Populares: as com mais participantes já inscritos.
// - Ofertas: as de menor preço.
//
// Se quiser marcar destaque/promoção manualmente no site, dá
// para adicionar essas colunas na tabela depois - aí é só
// trocar estas funções.
// ============================================================

export async function getFeaturedTrips(): Promise<Trip[]> {
  const todas = await buscarTodas();
  // Ids maiores = cadastradas mais recentemente.
  return [...todas]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);
}

export async function getPopularTrips(): Promise<Trip[]> {
  const todas = await buscarTodas();
  return [...todas].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);
}

export async function getOfferTrips(): Promise<Trip[]> {
  const todas = await buscarTodas();
  return [...todas].sort((a, b) => a.price - b.price).slice(0, 5);
}

// Lista de categorias únicas existentes entre as viagens (usado nos filtros).
export async function getCategories(): Promise<string[]> {
  const todas = await buscarTodas();
  return Array.from(new Set(todas.map((t) => t.category).filter(Boolean)));
}
