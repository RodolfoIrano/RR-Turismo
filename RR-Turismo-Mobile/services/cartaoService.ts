// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cuida dos cartões de crédito salvos: transforma o cartão
// digitado em um "token" seguro, e salva/lista/exclui os cartões
// do usuário no backend. Usado na tela de Checkout (pagamento).
// ============================================================
import { CheckoutCard, SavedCard } from "../types";
import { apiFetch } from "./api";
import { detectarBandeira, ultimosDigitos } from "./cardBrandService";

// ============================================================
// CARTÃO SERVICE
// ------------------------------------------------------------
// Responsável por: 1) transformar os dados do cartão digitado em
// um "token" (sem nunca enviar o número completo/CVV para o
// nosso backend) e 2) salvar/listar/excluir os cartões do
// usuário logado, usando o backend Spring (/api/cartoes).
//
// TOKENIZAÇÃO - IMPORTANTE:
// -------------------------
// Hoje a função `tokenizarCartao` abaixo é SIMULADA: ela gera um
// token local só para fins de demonstração (projeto de
// faculdade), pois nenhum gateway de pagamento real está
// configurado ainda.
//
// Quando você criar sua conta no Mercado Pago e quiser processar
// pagamentos de verdade, o único lugar que precisa mudar é esta
// função. O fluxo correto com o Mercado Pago é:
//   1. Instalar o SDK: `npx expo install react-native-mercadopago-px`
//      (ou usar a Payment Brick via WebView, seguindo a doc do MP)
//   2. Inicializar o SDK com sua "public key" (a chave PÚBLICA,
//      nunca a chave secreta, essa fica só no backend).
//   3. Chamar o SDK passando os dados do cartão (número, validade,
//      CVV, nome) - o SDK se comunica diretamente com o Mercado
//      Pago e devolve um "card_token".
//   4. Trocar o `gerarTokenSimulado(...)` abaixo por esse token
///     real devolvido pelo SDK.
// O número do cartão e o CVV JAMAIS devem ser enviados para o
// nosso próprio backend - só para o SDK do gateway.
// ============================================================

export interface CartaoTokenizado {
  gatewayToken: string;
  brand: string;
  lastDigits: string;
}

// Simula a chamada ao SDK do gateway de pagamento (ver comentário
// acima). Retorna uma Promise para já deixar a assinatura igual
// à que uma chamada real teria.
export async function tokenizarCartao(card: CheckoutCard): Promise<CartaoTokenizado> {
  await new Promise((resolve) => setTimeout(resolve, 600)); // simula latência de rede

  return {
    gatewayToken: gerarTokenSimulado(),
    brand: detectarBandeira(card.number),
    lastDigits: ultimosDigitos(card.number),
  };
}

function gerarTokenSimulado(): string {
  return `simulado_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ============================================================
// PERSISTÊNCIA DOS CARTÕES (backend real - /api/cartoes)
// ============================================================

interface CartaoApi {
  id: number;
  bandeira: string;
  ultimosDigitos: string;
  nomeImpresso: string;
  validade: string;
}

function paraSavedCard(cartao: CartaoApi): SavedCard {
  return {
    id: String(cartao.id),
    gatewayToken: "", // o token do gateway não volta do backend por segurança
    brand: cartao.bandeira,
    lastDigits: cartao.ultimosDigitos,
    printedName: cartao.nomeImpresso,
    expiry: cartao.validade,
  };
}

export async function listarCartoesSalvos(): Promise<SavedCard[]> {
  const cartoes = await apiFetch<CartaoApi[]>("/cartoes");
  return cartoes.map(paraSavedCard);
}

export async function salvarCartao(card: CheckoutCard): Promise<SavedCard> {
  const tokenizado = await tokenizarCartao(card);

  const cartao = await apiFetch<CartaoApi>("/cartoes", {
    method: "POST",
    body: JSON.stringify({
      gatewayToken: tokenizado.gatewayToken,
      bandeira: tokenizado.brand,
      ultimosDigitos: tokenizado.lastDigits,
      nomeImpresso: card.name,
      validade: card.expiry,
    }),
  });

  return paraSavedCard(cartao);
}

export async function excluirCartaoSalvo(id: string): Promise<void> {
  await apiFetch(`/cartoes/${id}`, { method: "DELETE" });
}
