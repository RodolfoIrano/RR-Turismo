// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// "Cérebro" do ASSISTENTE DE AJUDA do app. NÃO é uma inteligência
// artificial na internet: é uma lista de perguntas frequentes (FAQ)
// e de frases de conversa (CONVERSA: oi, obrigado, elogio, reclamação,
// despedida...) com palavras-chave. O assistente compara o que a pessoa
// escreveu com as palavras-chave e responde a melhor resposta.
//
// ✏️ COMO MUDAR / ACRESCENTAR RESPOSTAS:
//   - Nova PERGUNTA do app (ex.: "como pagar?"): copie um bloco da lista
//     FAQ, troque "titulo", "palavras" (escreva SEM acento e em minúsculas),
//     "resposta" e, se quiser, "atalho" (botão que abre uma tela).
//   - Nova frase de CONVERSA (oi, obrigado, elogio...): copie um bloco da
//     lista CONVERSA e coloque 2 ou 3 "respostas" (uma é sorteada).
//   - Botões rápidos do chat flutuante: lista SUGESTOES_RAPIDAS (cada texto
//     tem que ser igual ao "titulo" de alguma pergunta da FAQ).
//   - Primeira mensagem do chat: BOAS_VINDAS.
//   - Quem decide entre FAQ e conversa: função responder(), no fim do arquivo.
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
    atalho: { texto: "Fale conosco", rota: "/fale-conosco" },
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
    atalho: { texto: "Fale conosco", rota: "/fale-conosco" },
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
    atalho: { texto: "Fale conosco", rota: "/fale-conosco" },
  },
  {
    titulo: "Quem criou o RR Turismo?",
    palavras: ["quem criou", "quem fez", "criadores", "desenvolvedores", "fatec", "sobre nos", "sobre o app", "equipe do app"],
    resposta:
      "O RR Turismo foi criado por Rafael e Rodolfo, estudantes de Sistemas para Internet na Fatec Taquaritinga. Na tela Sobre nós você conhece a história do projeto.",
    atalho: { texto: "Sobre nós", rota: "/sobre-nos" },
  },
  {
    titulo: "Quero falar com uma pessoa",
    palavras: ["atendente", "humano", "pessoa", "whatsapp", "zap", "falar com alguem", "conversar com alguem"],
    resposta:
      "Sem problema! Na tela Fale conosco você escreve a sua mensagem e ela abre direto no WhatsApp da nossa equipe.",
    atalho: { texto: "Fale conosco", rota: "/fale-conosco" },
  },
];

// ============================================================
// CONVERSA (bate-papo)
// ------------------------------------------------------------
// Frases do dia a dia: cumprimentos, agradecimentos, elogios,
// reclamações, sugestões, despedidas. Cada item tem várias
// respostas e o assistente escolhe uma ao acaso, para não
// parecer um robô repetindo a mesma frase.
// "{nome}" vira ", Fulano" se a pessoa estiver logada (ou some).
// ============================================================
export interface ItemDeConversa {
  palavras: string[];      // palavras inteiras ou frases (sem acento, minúsculas)
  respostas: string[];
  atalho?: { texto: string; rota: string };
}

export const CONVERSA: ItemDeConversa[] = [
  {
    palavras: ["oi", "ola", "oie", "opa", "eai", "e ai", "salve", "bom dia", "boa tarde", "boa noite", "hello", "hi", "hey"],
    respostas: [
      "Oi{nome}! 😊 Que bom ter você por aqui. Posso tirar dúvidas sobre o app ou só bater um papo. Como posso ajudar?",
      "Olá{nome}! Tudo bem? Me conta o que você precisa: reservar, pagar, mudar o perfil… é só perguntar.",
    ],
  },
  {
    palavras: ["tudo bem", "como vai", "como voce esta", "como esta", "td bem", "tudo certo"],
    respostas: [
      "Tudo ótimo por aqui, obrigado por perguntar! E com você? Se precisar de algo no app, é só falar.",
      "Tudo bem sim! Estou pronto para ajudar você a planejar a próxima viagem. ✈️",
    ],
  },
  {
    palavras: ["obrigado", "obrigada", "obg", "brigado", "brigada", "valeu", "vlw", "agradeco", "thanks", "thank you", "muito obrigado"],
    respostas: [
      "De nada{nome}! Fico feliz em ajudar. Se surgir outra dúvida, estou por aqui. 💙",
      "Imagina! Sempre que precisar, é só chamar.",
    ],
  },
  {
    palavras: ["gostei", "adorei", "amei", "curti", "legal", "bonito", "lindo", "linda", "otimo", "excelente", "perfeito", "parabens", "top", "show", "maravilhoso", "incrivel", "massa", "da hora", "muito bom", "gostei muito"],
    respostas: [
      "Que bom ouvir isso{nome}! 🥰 Muito obrigado, esse carinho motiva a gente a continuar melhorando o RR Turismo.",
      "Obrigado pelo elogio! Foi feito com muito cuidado pela nossa equipe. Se quiser deixar um comentário para a equipe, use o Fale conosco.",
    ],
    atalho: { texto: "Deixar um comentário", rota: "/fale-conosco" },
  },
  {
    palavras: ["nao gostei", "ruim", "pessimo", "horrivel", "odiei", "lento", "lenta", "bugado", "bugou", "confuso", "reclamar", "reclamacao", "decepcionado", "insatisfeito", "nao funciona", "nao gosto", "complicado", "dificil"],
    respostas: [
      "Poxa{nome}, sinto muito que a sua experiência não tenha sido boa. 😔 Conta pra gente o que aconteceu pelo Fale conosco para a equipe resolver o quanto antes.",
      "Obrigado por avisar, isso ajuda a gente a melhorar. Se puder, descreva o problema no Fale conosco que a equipe cuida disso.",
    ],
    atalho: { texto: "Fale conosco", rota: "/fale-conosco" },
  },
  {
    palavras: ["sugestao", "sugerir", "sugiro", "ideia", "melhorar", "melhoria", "deveria", "poderia", "seria legal", "falta", "queria que"],
    respostas: [
      "Adoramos ideias! 💡 Escreva a sua sugestão no Fale conosco para chegar direto na equipe, ok?",
      "Boa! Sugestões de quem usa o app valem ouro. Manda pelo Fale conosco que a gente lê com carinho.",
    ],
    atalho: { texto: "Enviar sugestão", rota: "/fale-conosco" },
  },
  {
    palavras: ["tchau", "ate logo", "ate mais", "flw", "falou", "adeus", "ate a proxima", "fui", "bye"],
    respostas: [
      "Até mais{nome}! Boa viagem e volte sempre. 👋",
      "Tchau! Qualquer dúvida, é só abrir a bolinha de ajuda de novo. ✈️",
    ],
  },
  {
    palavras: ["quem e voce", "quem e vc", "seu nome", "como se chama", "voce e um robo", "voce e robo", "voce e humano", "voce e uma pessoa", "voce e real", "inteligencia artificial", "voce e ia", "e um bot"],
    respostas: [
      "Eu sou o assistente virtual do RR Turismo. Não sou uma pessoa: respondo as dúvidas mais comuns sobre o app. Para falar com a equipe de verdade, use o Fale conosco.",
    ],
    atalho: { texto: "Falar com a equipe", rota: "/fale-conosco" },
  },
  {
    palavras: ["o que voce faz", "o que voce sabe", "o que voce pode", "para que serve", "no que voce ajuda", "como voce pode ajudar", "voce sabe fazer"],
    respostas: [
      "Eu ajudo com reservas, pagamento, favoritos, perfil, idioma, Modo Guia e contato com a equipe. Também aceito elogios, sugestões e reclamações! Escolha uma pergunta abaixo ou escreva a sua.",
    ],
  },
  {
    palavras: ["piada", "conta uma piada", "me faz rir", "engracado"],
    respostas: [
      "Por que o turista levou um relógio para a praia? Porque queria passar o tempo! 😄",
      "Qual é o cúmulo da viagem? Ir de ônibus e voltar de bom humor. 😄",
    ],
  },
];

// Palavras que mostram que a pessoa está FAZENDO UMA PERGUNTA sobre
// o app (aí a resposta da FAQ ganha da conversa).
const PALAVRAS_DE_PERGUNTA = ["como", "onde", "qual", "quais", "quando", "posso", "preciso", "quero", "consigo", "por que", "porque", "tem como", "cade"];

// Mensagem de abertura e resposta quando nada combina.
export const BOAS_VINDAS =
  "Oi! Eu sou o assistente do RR Turismo 💙 Posso tirar dúvidas sobre o app, ouvir sugestões e elogios ou só bater um papo. Escolha uma pergunta abaixo ou escreva o que quiser.";

// Perguntas que aparecem como botões rápidos na bolinha de ajuda.
export const SUGESTOES_RAPIDAS: string[] = [
  "Como reservar uma viagem?",
  "Como pagar?",
  "Como salvar uma viagem nos favoritos?",
  "Como mudar o idioma do app?",
  "Quero falar com uma pessoa",
];

export const NAO_ENTENDI: ItemDeAjuda = {
  titulo: "",
  palavras: [],
  resposta:
    "Não encontrei uma resposta para isso. Tente com outras palavras ou escolha uma das perguntas sugeridas. Se preferir, a nossa equipe pode ajudar.",
  atalho: { texto: "Fale conosco", rota: "/fale-conosco" },
};

// Tira acentos e deixa tudo minúsculo para comparar.
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

// Procura uma palavra inteira (ou frase) dentro do texto normalizado.
function contemPalavra(texto: string, palavra: string): boolean {
  return texto.includes(" " + palavra + " ");
}

// Troca "{nome}" por ", Fulano" (ou apaga se não souber o nome).
function colocarNome(resposta: string, nome?: string): string {
  return resposta.replace("{nome}", nome ? `, ${nome}` : "");
}

function melhorDaFaq(texto: string): ItemDeAjuda | null {
  let melhor: ItemDeAjuda | null = null;
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

function melhorDaConversa(texto: string): ItemDeConversa | null {
  let melhor: ItemDeConversa | null = null;
  let melhorPontos = 0;

  for (const item of CONVERSA) {
    let pontos = 0;
    for (const palavra of item.palavras) {
      if (contemPalavra(texto, palavra)) pontos += palavra.includes(" ") ? 3 : 1;
    }
    if (pontos > melhorPontos) {
      melhorPontos = pontos;
      melhor = item;
    }
  }
  return melhor;
}

// Devolve a resposta que mais combina com o que a pessoa escreveu.
// "nome" é o primeiro nome de quem está logada (opcional).
export function responder(pergunta: string, nome?: string): ItemDeAjuda {
  const texto = " " + normalizar(pergunta).replace(/\s+/g, " ").trim() + " ";
  if (texto.trim().length < 2) return NAO_ENTENDI;

  const faq = melhorDaFaq(texto);
  const conversa = melhorDaConversa(texto);

  // Se a pessoa fez uma PERGUNTA, a FAQ ganha. Se foi só um comentário
  // (oi, obrigado, gostei...), a conversa ganha.
  const ehPergunta =
    pergunta.includes("?") || PALAVRAS_DE_PERGUNTA.some((p) => contemPalavra(texto, p));

  if (conversa && (!ehPergunta || !faq)) {
    const resposta = conversa.respostas[Math.floor(Math.random() * conversa.respostas.length)];
    return { titulo: "", palavras: [], resposta: colocarNome(resposta, nome), atalho: conversa.atalho };
  }
  return faq ?? NAO_ENTENDI;
}
