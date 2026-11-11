// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Valida os dados do cliente/cartão e simula a aprovação do
// pagamento no checkout. Usado na tela de pagamento.
// ============================================================
import { Documento } from "../utils/mascaras";
import { CheckoutCard, CheckoutCustomer, MetodoDePagamento, Payment } from "../types";
import { CardBrand, detectarBandeira, NOME_BANDEIRA } from "./cardBrandService";
import { delay } from "./api";

// ============================================================
// PAYMENT SERVICE (SIMULADO)
// ------------------------------------------------------------
// Nenhum pagamento real é processado. Este serviço apenas
// valida os campos e simula uma resposta de aprovação, como
// futuramente faria o endpoint POST /api/payments integrado
// a um gateway de pagamento real.
// ============================================================

export function validateCustomer(customer: CheckoutCustomer): string | null {
  if (!customer.name.trim()) return "Informe seu nome completo.";
  if (!customer.email.includes("@")) return "Informe um e-mail válido.";
  if (!Documento.cpfValido(customer.cpf)) return "CPF inválido. Confira os números.";
  if (!Documento.telefoneValido(customer.phone)) return "Telefone inválido. Use DDD + número.";
  return null;
}

// Algoritmo de Luhn: o "dígito verificador" que todo cartão real respeita.
function luhnValido(numero: string): boolean {
  let soma = 0;
  let dobrar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let d = Number(numero[i]);
    if (dobrar) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    soma += d;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

// bandeiraEscolhida: a que a pessoa tocou nos botões (Visa, Mastercard...).
export function validateCard(card: CheckoutCard, bandeiraEscolhida?: CardBrand | null): string | null {
  const numero = card.number.replace(/\D/g, "");
  if (numero.length < 13 || numero.length > 19 || !luhnValido(numero)) {
    return "Número do cartão inválido. Para testar use 4111 1111 1111 1111.";
  }
  if (bandeiraEscolhida !== undefined) {
    if (!bandeiraEscolhida) return "Escolha a bandeira do cartão.";
    const detectada = detectarBandeira(numero);
    if (detectada !== "unknown" && detectada !== bandeiraEscolhida) {
      return `A bandeira escolhida (${NOME_BANDEIRA[bandeiraEscolhida]}) não combina com o número do cartão (${NOME_BANDEIRA[detectada]}).`;
    }
  }
  if (card.name.trim().length < 3) return "Informe o nome impresso no cartão.";
  const m = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
  if (!m) return "Validade inválida (use MM/AA).";
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  const agora = new Date();
  if (mes < 1 || mes > 12 || ano < agora.getFullYear() || (ano === agora.getFullYear() && mes < agora.getMonth() + 1)) {
    return "Cartão vencido ou validade inválida.";
  }
  if (card.cvv.length < 3) return "CVV inválido (3 ou 4 números).";
  return null;
}

export async function processPayment(
  bookingId: string,
  method: MetodoDePagamento,
  amount: number
): Promise<Payment> {
  // TODO: futuramente -> apiFetch<Payment>("/payments", { method: "POST", body: JSON.stringify({...}) });
  return delay(
    {
      id: `pay-${Date.now()}`,
      bookingId,
      method,
      amount,
      status: "approved",
    },
    1200
  );
}
