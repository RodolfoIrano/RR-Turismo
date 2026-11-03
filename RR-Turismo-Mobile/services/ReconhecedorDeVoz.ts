// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Classe que converte FALA EM TEXTO usando o reconhecimento de voz
// do próprio celular (o mesmo do ditado do teclado), pelo módulo
// "expo-speech-recognition".
//
// IMPORTANTE: esse módulo é nativo e NÃO existe dentro do Expo Go.
// Ele só funciona em um "development build" (app instalado com
// EAS Build). Por isso a classe é feita para NÃO quebrar o app:
//   - ReconhecedorDeVoz.disponivel  diz se dá para usar voz agora;
//   - se não der, as telas mostram a alternativa (microfone do
//     teclado do celular).
//
// ORIENTAÇÃO A OBJETOS: a classe esconde os detalhes do módulo;
// quem usa só chama iniciar() e parar().
// ============================================================

// "require" dentro de try/catch: se o módulo não estiver instalado
// ou não existir no Expo Go, o app segue funcionando normalmente.
let moduloVoz: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  moduloVoz = require("expo-speech-recognition")?.ExpoSpeechRecognitionModule ?? null;
} catch {
  moduloVoz = null;
}

// Código de região que o reconhecimento de voz espera (ex: "pt" -> "pt-BR").
const LOCALE_DE_VOZ: Record<string, string> = {
  pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE",
  it: "it-IT", nl: "nl-NL", pl: "pl-PL", ru: "ru-RU", zh: "zh-CN",
  ja: "ja-JP", ko: "ko-KR", ar: "ar-SA", hi: "hi-IN", tr: "tr-TR",
};

export class ReconhecedorDeVoz {
  private ouvintes: { remove: () => void }[] = [];
  private ativo = false;

  // true se este app tem o módulo de voz (development build).
  static get disponivel(): boolean {
    return moduloVoz !== null;
  }

  get ouvindo(): boolean {
    return this.ativo;
  }

  // Começa a ouvir. "aoTexto" é chamado várias vezes enquanto a pessoa
  // fala (texto parcial) e uma última vez com "final = true".
  async iniciar(
    idioma: string,
    aoTexto: (texto: string, final: boolean) => void,
    aoErro: (mensagem: string) => void,
  ): Promise<boolean> {
    if (!moduloVoz || this.ativo) return false;

    const permissao = await moduloVoz.requestPermissionsAsync();
    if (!permissao?.granted) {
      aoErro("permissao");
      return false;
    }

    this.ouvintes = [
      moduloVoz.addListener("result", (e: any) => {
        aoTexto(e?.results?.[0]?.transcript ?? "", !!e?.isFinal);
      }),
      moduloVoz.addListener("error", (e: any) => aoErro(e?.message ?? "erro")),
      moduloVoz.addListener("end", () => this.limpar()),
    ];

    this.ativo = true;
    moduloVoz.start({ lang: LOCALE_DE_VOZ[idioma] ?? "pt-BR", interimResults: true });
    return true;
  }

  // Para de ouvir (o último texto ainda chega pelo "aoTexto").
  parar(): void {
    if (moduloVoz && this.ativo) moduloVoz.stop();
  }

  private limpar(): void {
    this.ouvintes.forEach((o) => o.remove());
    this.ouvintes = [];
    this.ativo = false;
  }
}
