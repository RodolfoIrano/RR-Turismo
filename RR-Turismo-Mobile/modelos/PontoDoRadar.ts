// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Classe que representa UM ponto (pessoa) no radar. Sabe sua
// cor conforme o status, e calcula a posição (x, y) na tela a
// partir da distância e da direção (rumo) em relação ao guia.
//
// ORIENTAÇÃO A OBJETOS: "encapsula" a conta de trigonometria.
// A tela só pergunta ponto.posicao(...) e ponto.cor.
// ============================================================
import { colors } from "../constants/colors";
import { ParticipanteAoVivo, StatusParticipante } from "../types/aoVivo";
import { EscalaDoRadar } from "./EscalaDoRadar";

// Cor de cada status (um único lugar para mudar).
const COR_DO_STATUS: Record<StatusParticipante, string> = {
  COMPARTILHANDO: colors.radarVerde,
  DISTANTE: colors.radarAmarelo,
  ALERTA: colors.radarVermelho,
  SEM_LOCALIZACAO: colors.statusSemLocalizacao,
};

export class PontoDoRadar {
  constructor(public readonly participante: ParticipanteAoVivo) {}

  get cor(): string {
    return COR_DO_STATUS[this.participante.status];
  }

  // Só dá para desenhar quem já mandou posição.
  get temPosicao(): boolean {
    return this.participante.distanciaM !== null && this.participante.rumoGraus !== null;
  }

  // Primeiro nome, para o rótulo curto embaixo do ponto.
  get rotuloCurto(): string {
    return this.participante.nome.split(" ")[0];
  }

  // Posição relativa ao CENTRO do radar (onde está o guia).
  // Norte fica em cima: rumo 0° = para cima, 90° = para a direita.
  posicao(escala: EscalaDoRadar, raioPx: number): { x: number; y: number } {
    if (!this.temPosicao) return { x: 0, y: 0 };
    const r = escala.metrosParaPixels(this.participante.distanciaM!, raioPx);
    const rad = (this.participante.rumoGraus! * Math.PI) / 180;
    return { x: r * Math.sin(rad), y: -r * Math.cos(rad) };
  }

  static corDoStatus(status: StatusParticipante): string {
    return COR_DO_STATUS[status];
  }
}
