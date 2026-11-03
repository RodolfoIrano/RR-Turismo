// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Valida os dados do cliente/cartão e simula a aprovação do
// pagamento no checkout. Usado na tela de pagamento.
// ============================================================
import { Documento } from "../utils/mascaras";
import { CheckoutCard, CheckoutCustomer, Payment } from "../types";
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

export function validateCard(card: CheckoutCard): string | null {
  if (card.number.replace(/\s/g, "").length < 16) return "Número do cartão inválido.";
  if (!card.name.trim()) return "Informe o nome impresso no cartão.";
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "Validade inválida (use MM/AA).";
  if (card.cvv.length < 3) return "CVV inválido.";
  return null;
}

export async function processPayment(
  bookingId: string,
  method: "credit_card" | "pix",
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
