// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Chama a nova rota do backend que calcula desconto usando o
// serviço SOAP da aula (ver DescontoApiController no Spring).
// Usado na tela de Checkout, no campo de cupom de desconto.
// ============================================================
import { apiFetch } from "./api";

// Formato devolvido pelo backend (ver DescontoService.ResultadoDesconto).
export interface ResultadoDesconto {
  precoOriginalCentavos: number;
  descontoCentavos: number;
  precoComDescontoCentavos: number;
  percentual: number;
}

// Calcula o preço com desconto aplicado. "precoReais" é o valor
// em reais normal (ex: 199.90); a conversão pra centavos (que o
// backend exige) é feita aqui dentro, pra quem usa este arquivo
// não precisar pensar nisso.
export async function calcularDesconto(
  precoReais: number,
  percentual: number
): Promise<ResultadoDesconto> {
  const precoCentavos = Math.round(precoReais * 100);

  return apiFetch<ResultadoDesconto>(
    `/desconto/calcular?precoCentavos=${precoCentavos}&percentual=${percentual}`
  );
}
