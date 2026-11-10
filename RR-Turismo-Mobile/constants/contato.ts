// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda os CANAIS DE CONTATO oficiais do RR Turismo (WhatsApp e
// e-mail), usados na tela "Fale conosco".
//
// ✏️ COMO MUDAR: é só trocar os dois valores abaixo (o resto do app
// já usa estes dois). Salvou, o app atualiza sozinho.
//   - WHATSAPP_NUMERO: só números, no formato 55 + DDD + número.
//   - EMAIL_CONTATO: o e-mail que recebe as mensagens.
// Se o número ficar zerado/inválido, o app avisa que o WhatsApp
// ainda não foi configurado, em vez de abrir um link quebrado.
// ============================================================

// WhatsApp da equipe, só números, com 55 (Brasil) + DDD + número.
// 👈 TROQUE AQUI o número do WhatsApp. Ex.: (16) 99241-6492 → "5516992416492"
export const WHATSAPP_NUMERO = "5516992416492";

// 👈 COLOQUE AQUI o e-mail da equipe. Enquanto estiver vazio ("") o app
// esconde os botões de e-mail do Fale conosco.
export const EMAIL_CONTATO = "";

export function emailConfigurado(): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(EMAIL_CONTATO);
}

// O número só vale se tiver 55 + DDD + 8 ou 9 dígitos e não for zerado.
export function whatsappConfigurado(): boolean {
  return /^55\d{10,11}$/.test(WHATSAPP_NUMERO) && !/^55(0+)$/.test(WHATSAPP_NUMERO);
}

// Link que abre o WhatsApp já com a mensagem escrita.
export function linkDoWhatsapp(mensagem: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

// Link que abre o app de e-mail com assunto e texto prontos.
export function linkDoEmail(assunto: string, corpo: string): string {
  return `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}
