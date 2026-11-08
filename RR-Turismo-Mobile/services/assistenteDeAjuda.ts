// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// "Cérebro" do ASSISTENTE DE AJUDA do app. NÃO é uma inteligência
// artificial na internet: é uma lista de perguntas frequentes com
// palavras-chave. O assistente compara o que a pessoa escreveu
// com as palavras-chave e responde a melhor resposta.
//
// Vantagens: funciona sem internet, não custa nada, não precisa de
// chave de API e NÃO mexe em nenhuma outra parte do app. Para
// ensinar uma resposta nova, basta acrescentar um item em FAQ.
// ============================================================

export interface ItemDeAjuda {
  titulo: string;          // texto do botão de sugestão
  palavras: string[];      // palavras-chave (sem acento, minúsculas)
  resposta: string;
  atalho?: { texto: string; rota: string }; // botão opcional que abre uma tela
}

export const FAQ: ItemDeAjuda[] = [
  {
    titulo: "Como reservar uma viagem?",
    palavras: ["reservar", "reserva", "comprar", "compra", "contratar", "carrinho", "checkout", "finalizar"],
    resposta:
      "Abra a viagem que você quer, confira os detalhes e toque em “Adicionar ao carrinho”. Depois abra o carrinho, escolha a forma de pagamento e finalize. A reserva aparece em Perfil > Minhas reservas.",
    atalho: { texto: "Explorar viagens", rota: "/(tabs)/explore" },
  },
  {
    titulo: "Onde vejo minhas reservas?",
    palavras: ["minhas reservas", "ver reserva", "reservas", "historico", "realizadas", "proximas"],
    resposta:
      "No Perfil você vê as suas próximas viagens e as já realizadas. A lista completa fica em Minhas reservas.",
    atalho: { texto: "Abrir Minhas reservas", rota: "/bookings" },
  },
  {
    titulo: "Como pagar?",
    palavras: ["pagar", "pagamento", "pix", "cartao", "credito", "parcela", "parcelar", "desconto", "cupom"],
    resposta:
      "No carrinho você escolhe pagar com cartão de crédito (com opção de parcelas) ou Pix. Se houver cupom de desconto, digite o código na tela de pagamento.",
  },
  {
    titulo: "Como cancelar uma reserva?",
    palavras: ["cancelar", "cancelamento", "reembolso", "estorno", "devolver", "desistir"],
    resposta:
      "As regras de cancelamento ficam na tela de cada viagem, na seção “Cancelamento”. Para pedir um cancelamento ou reembolso, fale com a equipe pelo Fale conosco.",
    atalho: { texto: "Fale conosco", rota: "/(tabs)/contato" },
  },
  {
    titulo: "Como salvar uma viagem nos favoritos?",
    palavras: ["favorito", "favoritos", "salvar", "salva", "coracao", "guardar"],
    resposta:
      "Toque no coração que aparece sobre a foto da viagem. Todas as viagens salvas ficam na aba Favoritos e também no seu Perfil.",
    atalho: { texto: "Ver favoritos", rota: "/(tabs)/favorites" },
  },
  {
    titulo: "Como trocar minha foto ou capa?",
    palavras: ["foto", "capa", "banner", "avatar", "imagem", "perfil", "trocar foto", "editar"],
    resposta:
      "Vá em Configurações > Editar perfil e toque na foto ou na capa para escolher uma imagem da sua galeria. Lá você também muda o seu nome. No Perfil, tocar na foto ou na capa também funciona.",
    atalho: { texto: "Editar perfil", rota: "/settings/editar-perfil" },
  },
  {
    titulo: "Como mudar o idioma do app?",
    palavras: ["idioma", "lingua", "traduzir", "traducao", "ingles", "espanhol", "italiano", "bandeira", "language"],
    resposta:
      "Toque na bandeira no topo das telas principais, ou vá em Configurações > Idioma, e escolha o idioma que preferir. O app inteiro é traduzido.",
    atalho: { texto: "Escolher idioma", rota: "/settings/idioma" },
  },
  {
    titulo: "O que é o Modo Guia?",
    palavras: ["guia", "modo guia", "radar", "grupo", "aviso", "avisos", "reunir", "localizacao", "mapa"],
    resposta:
      "O Modo Guia é para quem criou viagens no site. Ele mostra o seu grupo no mapa em tempo real, permite enviar avisos e chamar todos para se reunir. Os turistas entram pela opção “Minha viagem ao vivo” quando o guia inicia a viagem.",
  },
  {
    titulo: "Como criar uma viagem?",
    palavras: ["criar viagem", "cadastrar viagem", "publicar", "anunciar", "novo passeio", "site"],
    resposta:
      "As viagens são criadas no site do RR Turismo, na opção “Criar nova viagem”, com a conta de guia. Assim que forem salvas, aparecem aqui no app.",
  },
  {
    titulo: "Esqueci minha senha",
    palavras: ["senha", "esqueci", "recuperar", "redefinir", "login", "entrar", "acessar"],
    resposta:
      "Ainda não existe recuperação de senha automática no app. Fale com a equipe pelo Fale conosco que ajudamos você a voltar a acessar a conta.",
    atalho: { texto: "Fale conosco", rota: "/(tabs)/contato" },
  },
  {
    titulo: "A foto não envia / deu erro",
    palavras: ["erro", "nao envia", "nao carrega", "falha", "problema", "travou", "bug", "servidor", "conexao"],
    resposta:
      "Confira se o celular está na mesma rede Wi-Fi do computador onde o servidor (Spring) está rodando e se ele está ligado. Depois feche e abra o app. Se continuar, conte o problema pelo Fale conosco.",
  },
  {
    titulo: "Como falar com a equipe?",
    palavras: ["contato", "falar", "equipe", "suporte", "ajuda", "email", "telefone", "atendimento"],
    resposta: "Use o Fale conosco: preencha o formulário e a equipe responde para você.",
    atalho: { texto: "Fale conosco", rota: "/(tabs)/contato" },
  },
];

// Mensagem de abertura e resposta quando nada combina.
export const BOAS_VINDAS =
  "Oi! Eu sou o assistente de ajuda do RR Turismo. Posso explicar como usar o app. Escolha uma pergunta abaixo ou escreva a sua dúvida.";

export const NAO_ENTENDI: ItemDeAjuda = {
  titulo: "",
  palavras: [],
  resposta:
    "Não encontrei uma resposta para isso. Tente com outras palavras ou escolha uma das perguntas sugeridas. Se preferir, a nossa equipe pode ajudar.",
  atalho: { texto: "Fale conosco", rota: "/(tabs)/contato" },
};

// Tira acentos e deixa tudo minúsculo para comparar.
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

// Devolve o item de ajuda que mais combina com a pergunta.
export function responder(pergunta: string): ItemDeAjuda {
  const texto = " " + normalizar(pergunta).replace(/\s+/g, " ").trim() + " ";
  if (texto.trim().length < 2) return NAO_ENTENDI;

  let melhor: ItemDeAjuda = NAO_ENTENDI;
  let melhorPontos = 0;

  for (const item of FAQ) {
    let pontos = 0;
    let maiorPalavra = 0;
    for (const palavra of item.palavras) {
      if (texto.includes(" " + palavra) || texto.includes(palavra + " ")) {
        // frases com mais de uma palavra valem mais
        pontos += palavra.includes(" ") ? 3 : 1;
        maiorPalavra = Math.max(maiorPalavra, palavra.length);
      }
    }
    // Desempate: a palavra-chave mais específica (maior) ganha um bônus
    // pequeno - ex: "cancelar" vence "compra" em "quero cancelar minha compra".
    if (pontos > 0) pontos += maiorPalavra / 100;
    if (pontos > melhorPontos) {
      melhorPontos = pontos;
      melhor = item;
    }
  }
  return melhor;
}
