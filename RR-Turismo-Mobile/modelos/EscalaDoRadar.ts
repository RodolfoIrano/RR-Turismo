// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Classe que decide o ALCANCE do radar (ex.: 250 m, 1 km...)
// conforme a distância do participante mais longe, para todos
// os pontos caberem na tela.
//
// ORIENTAÇÃO A OBJETOS: os dados (alcance) e o comportamento
// (formatar, converter metros em pixels) ficam juntos na classe.
// ============================================================
export class EscalaDoRadar {
  // Alcances "redondos" possíveis, em metros.
  private static readonly DEGRAUS = [100, 250, 500, 1000, 2500, 5000, 10000, 50000];

  private constructor(public readonly alcanceMetros: number) {}

  // Escolhe o menor degrau que comporta a maior distância (com folga de 15%).
  static paraDistancias(distanciasM: number[]): EscalaDoRadar {
    const maior = distanciasM.length ? Math.max(...distanciasM) * 1.15 : 0;
    const degrau = EscalaDoRadar.DEGRAUS.find((d) => d >= maior) ?? EscalaDoRadar.DEGRAUS[EscalaDoRadar.DEGRAUS.length - 1];
    return new EscalaDoRadar(degrau);
  }

  // Converte metros em pixels (raioPx = raio do círculo externo na tela).
  metrosParaPixels(metros: number, raioPx: number): number {
    return Math.min(metros / this.alcanceMetros, 1) * raioPx;
  }

  // Texto do alcance: "250 m" ou "2,5 km".
  get rotulo(): string {
    return EscalaDoRadar.formatarDistancia(this.alcanceMetros);
  }

  static formatarDistancia(metros: number): string {
    if (metros < 1000) return `${Math.round(metros)} m`;
    return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
  }
}
