// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Lista dos idiomas disponíveis no app, com bandeira (emoji),
// sigla (ex: "PT-BR") e nome completo (ex: "Português (Brasil)")
// - usado no seletor de idioma (ícone de globo no cabeçalho).
//
// COMO ADICIONAR UM IDIOMA NOVO:
// Como a tradução agora é automática (ver motorDeTraducao.ts),
// basta adicionar uma linha aqui nesta lista - não precisa criar
// nenhum arquivo de tradução novo. O código do idioma precisa
// ser um código reconhecido pela API de tradução (padrão ISO,
// ex: "en", "es", "fr"...).
// ============================================================

export interface InfoIdioma {
  codigo: string; // usado internamente e na chamada da API de tradução
  bandeira: string; // emoji da bandeira
  sigla: string; // ex: "PT-BR"
  nome: string; // nome completo, no próprio idioma
}

export const IDIOMAS: InfoIdioma[] = [
  { codigo: "pt", bandeira: "🇧🇷", sigla: "PT-BR", nome: "Português (Brasil)" },
  { codigo: "en", bandeira: "🇺🇸", sigla: "EN-US", nome: "English (US)" },
  { codigo: "es", bandeira: "🇪🇸", sigla: "ES", nome: "Español" },
  { codigo: "fr", bandeira: "🇫🇷", sigla: "FR", nome: "Français" },
  { codigo: "de", bandeira: "🇩🇪", sigla: "DE", nome: "Deutsch" },
  { codigo: "it", bandeira: "🇮🇹", sigla: "IT", nome: "Italiano" },
  { codigo: "nl", bandeira: "🇳🇱", sigla: "NL", nome: "Nederlands" },
  { codigo: "pl", bandeira: "🇵🇱", sigla: "PL", nome: "Polski" },
  { codigo: "ru", bandeira: "🇷🇺", sigla: "RU", nome: "Русский" },
  { codigo: "zh", bandeira: "🇨🇳", sigla: "ZH", nome: "中文" },
  { codigo: "ja", bandeira: "🇯🇵", sigla: "JA", nome: "日本語" },
  { codigo: "ko", bandeira: "🇰🇷", sigla: "KO", nome: "한국어" },
  { codigo: "ar", bandeira: "🇸🇦", sigla: "AR", nome: "العربية" },
  { codigo: "hi", bandeira: "🇮🇳", sigla: "HI", nome: "हिन्दी" },
  { codigo: "tr", bandeira: "🇹🇷", sigla: "TR", nome: "Türkçe" },
];

export function buscarInfoIdioma(codigo: string): InfoIdioma {
  return IDIOMAS.find((i) => i.codigo === codigo) ?? IDIOMAS[0];
}
