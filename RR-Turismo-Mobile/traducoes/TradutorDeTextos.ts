// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Classe que TRADUZ QUALQUER TEXTO que aparece no app, na hora,
// como o botão "traduzir página" do navegador. Funciona assim:
//
//   1. A tela pede  tradutor.traduzir("Minhas reservas");
//   2. Se já está na memória, devolve na hora;
//   3. Se não, devolve o português AGORA (a tela nunca trava) e
//      põe o texto numa fila;
//   4. A fila é traduzida em segundo plano (vários de uma vez);
//   5. Quando chega tradução nova, avisa a tela para se redesenhar.
//
// ORIENTAÇÃO A OBJETOS: a classe guarda o estado (idioma, memória,
// fila) e esconde a complexidade. Quem usa só chama traduzir().
// ============================================================
import { traduzirTexto } from "./motorDeTraducao";

type Ouvinte = () => void;

const TRADUCOES_SIMULTANEAS = 6;   // pedidos em paralelo (não sobrecarrega o serviço)
const ESPERA_PARA_AGRUPAR_MS = 120; // junta pedidos que chegam quase juntos
const AVISO_MAXIMO_A_CADA_MS = 350; // evita redesenhar a tela o tempo todo

export class TradutorDeTextos {
  private idioma = "pt";
  private memoria = new Map<string, string>();
  private fila = new Set<string>();
  private ouvintes = new Set<Ouvinte>();
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private processando = false;
  private ultimoAviso = 0;

  // Texto que NÃO deve ser traduzido: sem letras (números, preços,
  // símbolos), e-mails e links.
  private naoPrecisaTraduzir(texto: string): boolean {
    const limpo = texto.trim();
    if (limpo.length < 2) return true;
    if (!/\p{L}/u.test(limpo)) return true;
    if (/^R\$/.test(limpo)) return true;
    if (/^(https?:\/\/|www\.)|@\S+\.\S+/.test(limpo)) return true;
    return false;
  }

  get idiomaAtual(): string {
    return this.idioma;
  }

  // true enquanto ainda há textos esperando tradução.
  get ocupado(): boolean {
    return this.fila.size > 0 || this.processando;
  }

  definirIdioma(idioma: string): void {
    if (idioma === this.idioma) return;
    this.idioma = idioma;
    this.fila.clear();
    this.avisar(true);
  }

  // Devolve o texto traduzido (ou o original, se ainda não chegou).
  traduzir(texto: string): string {
    if (this.idioma === "pt" || this.naoPrecisaTraduzir(texto)) return texto;

    // Preserva espaços do começo/fim (ex: " de ") para não "colar" palavras.
    const inicio = texto.match(/^\s*/)?.[0] ?? "";
    const fim = texto.match(/\s*$/)?.[0] ?? "";
    const miolo = texto.trim();

    const pronto = this.memoria.get(this.chave(miolo));
    if (pronto !== undefined) return `${inicio}${pronto}${fim}`;

    this.enfileirar(miolo);
    return texto;
  }

  // Quem quiser ser avisado quando chegar tradução nova (a tela).
  assinar(ouvinte: Ouvinte): () => void {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  }

  // ---------------- internos ----------------

  private chave(miolo: string): string {
    return `${this.idioma}|${miolo}`;
  }

  private enfileirar(miolo: string): void {
    this.fila.add(miolo);
    if (this.temporizador) return;
    this.temporizador = setTimeout(() => {
      this.temporizador = null;
      void this.processarFila();
    }, ESPERA_PARA_AGRUPAR_MS);
  }

  private async processarFila(): Promise<void> {
    if (this.processando) return;
    this.processando = true;
    const idiomaDoLote = this.idioma;

    try {
      while (this.fila.size > 0 && this.idioma === idiomaDoLote) {
        const lote = Array.from(this.fila).slice(0, TRADUCOES_SIMULTANEAS);
        lote.forEach((t) => this.fila.delete(t));

        const resultados = await Promise.all(lote.map((t) => traduzirTexto(t, idiomaDoLote)));

        // Se o usuário trocou de idioma no meio, descarta o lote.
        if (this.idioma !== idiomaDoLote) break;
        lote.forEach((t, i) => this.memoria.set(`${idiomaDoLote}|${t}`, resultados[i]));
        this.avisar(false);
      }
    } finally {
      this.processando = false;
      this.avisar(true);
      // Se entrou texto novo enquanto processava, continua.
      if (this.fila.size > 0 && !this.temporizador) this.enfileirar(Array.from(this.fila)[0]);
    }
  }

  // Avisa as telas. "forcar" ignora o intervalo mínimo entre avisos.
  private avisar(forcar: boolean): void {
    const agora = Date.now();
    if (!forcar && agora - this.ultimoAviso < AVISO_MAXIMO_A_CADA_MS) return;
    this.ultimoAviso = agora;
    this.ouvintes.forEach((o) => o());
  }
}
