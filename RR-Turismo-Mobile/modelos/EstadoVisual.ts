// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Define COMO CADA ESTADO de um participante aparece na tela
// (cor, texto, se pisca). É um exemplo de ORIENTAÇÃO A OBJETOS:
//
//  - CLASSE ABSTRATA  (EstadoVisual): o "molde" - diz o que todo
//    estado precisa ter (cor, chave do texto, se pisca).
//  - HERANÇA          (Compartilhando, Distante...): cada estado
//    estende o molde e preenche seus valores.
//  - POLIMORFISMO     : quem usa (radar, lista) chama
//    estado.cor sem saber qual estado é - cada classe responde
//    do seu jeito. Nada de "if status === ..." espalhado.
//  - FÁBRICA          (EstadoVisual.de): converte o texto vindo
//    do servidor ("ALERTA") no objeto certo.
// ============================================================
import { colors } from "../constants/colors";
import { StatusParticipante } from "../types/aoVivo";

// Chaves dos textos em traducoes/idiomas/pt.ts (aoVivo.status*).
export type ChaveTextoStatus =
  | "statusCompartilhando"
  | "statusDistante"
  | "statusSemLocalizacao"
  | "statusAlerta";

export abstract class EstadoVisual {
  // Cor do ponto no radar e do nome na lista.
  abstract readonly cor: string;
  // Qual texto (traduzido) usar para descrever o estado.
  abstract readonly chaveTexto: ChaveTextoStatus;
  // Se o ponto deve pulsar rápido (chamar atenção).
  readonly urgente: boolean = false;
  // Se o participante está "ok" para o guia (nome verde).
  abstract readonly estaBem: boolean;

  // Fábrica: do texto do servidor para o objeto certo.
  static de(status: StatusParticipante | null | undefined): EstadoVisual {
    switch (status) {
      case "COMPARTILHANDO": return new Compartilhando();
      case "DISTANTE": return new Distante();
      case "ALERTA": return new EmAlerta();
      default: return new SemLocalizacao();
    }
  }
}

class Compartilhando extends EstadoVisual {
  readonly cor = colors.radarVerde;
  readonly chaveTexto = "statusCompartilhando" as const;
  readonly estaBem = true;
}

class Distante extends EstadoVisual {
  readonly cor = colors.radarAmarelo;
  readonly chaveTexto = "statusDistante" as const;
  readonly estaBem = false;
}

class SemLocalizacao extends EstadoVisual {
  readonly cor = colors.statusSemLocalizacao;
  readonly chaveTexto = "statusSemLocalizacao" as const;
  readonly estaBem = false;
}

class EmAlerta extends EstadoVisual {
  readonly cor = colors.radarVermelho;
  readonly chaveTexto = "statusAlerta" as const;
  readonly urgente = true;
  readonly estaBem = false;
}
