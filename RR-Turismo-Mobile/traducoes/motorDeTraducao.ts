// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// É o "motor" de tradução automática: recebe UM texto em
// português e devolve o texto no idioma pedido. Ninguém escreve
// tradução à mão - tudo é automático.
//
// Usa dois serviços GRATUITOS, sem conta e sem cartão:
//   1) Google Tradutor (endpoint público "gtx") - principal;
//   2) MyMemory - reserva, se o primeiro falhar.
// Cada tradução feita é guardada no aparelho (AsyncStorage), então
// o mesmo texto nunca é traduzido duas vezes - fica instantâneo.
//
// Se tudo falhar (sem internet, serviço fora do ar), devolve o
// texto ORIGINAL em português: o app nunca fica com espaço vazio.
// ============================================================
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIXO_CACHE = "@rr_turismo:traducao:v2:";

// Alguns idiomas usam um código diferente no Google Tradutor.
const CODIGO_GOOGLE: Record<string, string> = {
  zh: "zh-CN",
  he: "iw",
};

async function buscarDoCache(idioma: string, texto: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`${PREFIXO_CACHE}${idioma}:${texto}`);
  } catch {
    return null;
  }
}

async function salvarNoCache(idioma: string, texto: string, traduzido: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${PREFIXO_CACHE}${idioma}:${texto}`, traduzido);
  } catch {
    // Cache é só um bônus: se falhar, a próxima vez traduz de novo.
  }
}

// ---- Serviço 1: Google Tradutor (gtx) ----
async function viaGoogle(texto: string, idioma: string): Promise<string | null> {
  const alvo = CODIGO_GOOGLE[idioma] ?? idioma;
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&dt=t" +
    `&tl=${encodeURIComponent(alvo)}&q=${encodeURIComponent(texto)}`;
  const resposta = await fetch(url);
  if (!resposta.ok) return null;
  const dados = await resposta.json();
  // Formato: [[["traduzido","original",...], ["pedaço 2", ...]], ...]
  const pedacos: unknown = dados?.[0];
  if (!Array.isArray(pedacos)) return null;
  const juntado = pedacos.map((p) => (Array.isArray(p) ? String(p[0] ?? "") : "")).join("");
  return juntado.trim() ? juntado : null;
}

// ---- Serviço 2: MyMemory (reserva) ----
async function viaMyMemory(texto: string, idioma: string): Promise<string | null> {
  const parametros = new URLSearchParams({ q: texto, langpair: `pt|${idioma}` });
  const resposta = await fetch(`https://api.mymemory.translated.net/get?${parametros.toString()}`);
  const dados = await resposta.json();
  const traduzido: string | undefined = dados?.responseData?.translatedText;
  return traduzido && dados?.responseStatus === 200 ? traduzido : null;
}

// Traduz um texto. Nunca lança erro: no pior caso devolve o original.
export async function traduzirTexto(texto: string, idioma: string): Promise<string> {
  if (idioma === "pt" || !texto.trim()) return texto;

  const doCache = await buscarDoCache(idioma, texto);
  if (doCache) return doCache;

  for (const servico of [viaGoogle, viaMyMemory]) {
    try {
      const resultado = await servico(texto, idioma);
      if (resultado) {
        await salvarNoCache(idioma, texto, resultado);
        return resultado;
      }
    } catch {
      // tenta o próximo serviço
    }
  }
  return texto;
}

// ==============================================================
// TRADUÇÃO LIVRE (usada pelo Tradutor de Voz)
// ----------------------------------------------------------------
// Diferente de traduzirTexto (sempre de português para outro
// idioma), aqui o idioma de origem pode ser qualquer um (ou
// "auto" = descobrir sozinho) - necessário para quando o turista
// fala em francês e quer ver em português, por exemplo.
// Não usa cache: cada frase falada costuma ser única.
// ==============================================================
export async function traduzirFrase(texto: string, destino: string, origem: string = "auto"): Promise<string> {
  if (!texto.trim()) return "";
  const alvo = CODIGO_GOOGLE[destino] ?? destino;
  const de = CODIGO_GOOGLE[origem] ?? origem;
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${encodeURIComponent(de)}` +
    `&tl=${encodeURIComponent(alvo)}&q=${encodeURIComponent(texto)}`;
  try {
    const resposta = await fetch(url);
    if (resposta.ok) {
      const dados = await resposta.json();
      const pedacos: unknown = dados?.[0];
      if (Array.isArray(pedacos)) {
        const juntado = pedacos.map((p) => (Array.isArray(p) ? String(p[0] ?? "") : "")).join("");
        if (juntado.trim()) return juntado;
      }
    }
  } catch {
    // cai para o serviço reserva
  }
  try {
    const origemMM = de === "auto" ? "pt" : de;
    const parametros = new URLSearchParams({ q: texto, langpair: `${origemMM}|${destino}` });
    const r = await fetch(`https://api.mymemory.translated.net/get?${parametros.toString()}`);
    const d = await r.json();
    if (d?.responseStatus === 200 && d?.responseData?.translatedText) return d.responseData.translatedText;
  } catch {
    // sem rede
  }
  return "";
}
