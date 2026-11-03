// ============================================================
// CARD BRAND SERVICE (deteccao de bandeira do cartao)
// ------------------------------------------------------------
// Detecta a bandeira do cartao apenas olhando os primeiros
// digitos do numero digitado (BIN/IIN), igual ao que apps como
// Shopee/Mercado Livre fazem em tempo real enquanto o usuario
// digita.
//
// Isso e so identificacao VISUAL (mostrar o icone certo) - a
// validacao "de verdade" do cartao e feita pelo gateway de
// pagamento no momento da tokenizacao.
// ============================================================

export type CardBrand =
  | "visa"
  | "mastercard"
  | "elo"
  | "amex"
  | "hipercard"
  | "diners"
  | "discover"
  | "unknown";

interface BrandRule {
  brand: CardBrand;
  // Cada regex testa o numero (somente digitos) do cartao.
  regex: RegExp;
}

// Faixas de BIN conhecidas. A ordem importa: regras mais
// especificas (ex: Elo) devem vir antes das mais genericas.
const REGRAS_BANDEIRA: BrandRule[] = [
  { brand: "elo", regex: /^(4011|4312|4389|4514|4573|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/ },
  { brand: "amex", regex: /^3[47]/ },
  { brand: "diners", regex: /^3(0[0-5]|[68])/ },
  { brand: "hipercard", regex: /^(606282|3841)/ },
  { brand: "discover", regex: /^6(011|5)/ },
  { brand: "mastercard", regex: /^(5[1-5]|2[2-7])/ },
  { brand: "visa", regex: /^4/ },
];

// Nomes amigaveis para exibir na tela (podem ser traduzidos
// futuramente pelo sistema de idiomas, se fizer sentido).
export const NOME_BANDEIRA: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  elo: "Elo",
  amex: "American Express",
  hipercard: "Hipercard",
  diners: "Diners Club",
  discover: "Discover",
  unknown: "Cartão",
};

// Cor de destaque de cada bandeira, usada no cartão visual da tela.
export const COR_BANDEIRA: Record<CardBrand, string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  elo: "#000000",
  amex: "#2E77BC",
  hipercard: "#AF272F",
  diners: "#0079BE",
  discover: "#FF6000",
  unknown: "#5D6B77",
};

export function detectarBandeira(numeroCartao: string): CardBrand {
  const apenasDigitos = numeroCartao.replace(/\D/g, "");
  if (!apenasDigitos) return "unknown";

  const regra = REGRAS_BANDEIRA.find((r) => r.regex.test(apenasDigitos));
  return regra ? regra.brand : "unknown";
}

// Formata o numero do cartao em blocos de 4 digitos enquanto o
// usuario digita: "4111 1111 1111 1111".
export function formatarNumeroCartao(valor: string): string {
  const apenasDigitos = valor.replace(/\D/g, "").slice(0, 16);
  return apenasDigitos.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// Retorna somente os ultimos 4 digitos, usados para exibicao
// (nunca guardamos/exibimos o numero completo depois de salvo).
export function ultimosDigitos(numeroCartao: string): string {
  const apenasDigitos = numeroCartao.replace(/\D/g, "");
  return apenasDigitos.slice(-4);
}
