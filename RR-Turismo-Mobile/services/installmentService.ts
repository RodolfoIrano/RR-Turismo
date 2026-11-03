// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Calcula as opções de PARCELAMENTO no checkout (ex: "3x de
// R$ 50,00 sem juros"). Usado na tela de pagamento.
// ============================================================
import { InstallmentOption } from "../types";

// ============================================================
// PARCELAMENTO (installments)
// ------------------------------------------------------------
// Calcula as opções de parcelas para exibir no checkout, no
// mesmo estilo de grandes apps de e-commerce: "3x de R$ 33,33
// sem juros", etc.
//
// Regra usada neste projeto (ajustável conforme a política de
// juros que você definir com o gateway de pagamento escolhido):
// - Até MAX_PARCELAS_SEM_JUROS parcelas: sem juros (valor total
//   dividido igualmente).
// - Acima disso: aplica uma taxa de juros simples por parcela,
//   só para exemplificar - o valor real de juros deve vir do
//   gateway de pagamento quando a integração for feita de fato.
// ============================================================

const MAX_PARCELAS = 12;
const MAX_PARCELAS_SEM_JUROS = 6;
const JUROS_AO_MES = 0.0199; // 1,99% ao mês, só para as parcelas com juros
const VALOR_MINIMO_PARCELA = 20; // não faz sentido parcelar em valores muito baixos

export function calcularOpcoesDeParcelamento(valorTotal: number): InstallmentOption[] {
  const opcoes: InstallmentOption[] = [];

  for (let parcelas = 1; parcelas <= MAX_PARCELAS; parcelas++) {
    const semJuros = parcelas <= MAX_PARCELAS_SEM_JUROS;

    const valorComJuros = semJuros
      ? valorTotal
      : valorTotal * Math.pow(1 + JUROS_AO_MES, parcelas);

    const valorParcela = valorComJuros / parcelas;

    // Para de gerar opções quando a parcela ficar pequena demais.
    if (parcelas > 1 && valorParcela < VALOR_MINIMO_PARCELA) {
      break;
    }

    opcoes.push({
      installments: parcelas,
      installmentAmount: arredondar(valorParcela),
      totalAmount: arredondar(valorComJuros),
      interestFree: semJuros,
    });
  }

  return opcoes;
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
