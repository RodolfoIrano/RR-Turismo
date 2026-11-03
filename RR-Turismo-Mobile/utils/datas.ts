// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cuida das DATAS da viagem: converte o texto que vem do servidor
// ("2026-11-20") em data, escreve a data por extenso e calcula
// "faltam X dias". Centraliza tudo numa classe (OO) para que as
// telas não repitam essa conta.
//
// Por que não usar new Date("2026-11-20") direto?
// O JavaScript trata esse texto como meia-noite em UTC, e no Brasil
// (UTC-3) isso vira o DIA ANTERIOR às 21h. Aqui montamos a data no
// horário do próprio aparelho, então o dia nunca "escorrega".
// ============================================================
import { useEffect, useState } from "react";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export class DataDaViagem {
  // Data (sem horário) no fuso do aparelho.
  readonly data: Date | null;

  // Aceita "AAAA-MM-DD" (formato do servidor) ou um ISO completo.
  constructor(texto: string | null | undefined) {
    this.data = DataDaViagem.converter(texto);
  }

  private static converter(texto: string | null | undefined): Date | null {
    if (!texto) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = new Date(texto);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  get valida(): boolean {
    return this.data !== null;
  }

  // Quantos dias faltam a partir de HOJE (negativo = já passou).
  diasRestantes(agora: Date = new Date()): number | null {
    if (!this.data) return null;
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    return Math.round((this.data.getTime() - hoje.getTime()) / MS_POR_DIA);
  }

  // "20/11/2026"
  curta(): string {
    return this.data ? this.data.toLocaleDateString("pt-BR") : "";
  }

  // "sex., 20 de novembro de 2026"
  porExtenso(): string {
    return this.data
      ? this.data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })
      : "";
  }

  // Texto da contagem regressiva, ou null se a data não existe.
  //   "Faltam 12 dias" | "Falta 1 dia" | "É amanhã!" | "É hoje!" | "Viagem concluída"
  contagem(agora: Date = new Date()): string | null {
    const dias = this.diasRestantes(agora);
    if (dias === null) return null;
    if (dias < 0) return "Viagem concluída";
    if (dias === 0) return "É hoje! 🎉";
    if (dias === 1) return "É amanhã!";
    if (dias < 30) return `Faltam ${dias} dias`;
    // Acima de 30 dias: "Faltam 2 meses e 5 dias" fica mais fácil de ler.
    const meses = Math.floor(dias / 30);
    const resto = dias % 30;
    const textoMeses = `${meses} ${meses === 1 ? "mês" : "meses"}`;
    return resto === 0
      ? `Faltam ${textoMeses}`
      : `Faltam ${textoMeses} e ${resto} ${resto === 1 ? "dia" : "dias"}`;
  }
}

// Hook que ATUALIZA a contagem sozinho: confere de minuto em minuto
// (então vira "Faltam 11 dias" assim que passa da meia-noite) e quando
// o app volta do segundo plano.
export function useContagemDias(dataIda: string | null | undefined): string | null {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return new DataDaViagem(dataIda).contagem(agora);
}
