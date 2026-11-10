/* ============================================================
   📄 O QUE ESTE ARQUIVO FAZ:
   "Cérebro" e funcionamento do CHAT FLUTUANTE do site (a bolinha com a
   logo no canto da tela). NÃO é inteligência artificial na internet:
   é uma lista de perguntas frequentes (FAQ) e de frases de conversa
   (oi, obrigado, elogio, reclamação...) com palavras-chave. O chat
   compara o que a pessoa escreveu com as palavras-chave e responde.
   É a versão para o SITE do mesmo assistente que existe no app
   (RR-Turismo-Mobile/services/assistenteDeAjuda.ts).

   ✏️ COMO MUDAR / ACRESCENTAR RESPOSTAS:
     - Nova PERGUNTA do site: copie um bloco de FAQ, troque "titulo",
       "palavras" (SEM acento e em minúsculas), "resposta" e, se quiser,
       "atalho" (botão que leva a uma página: texto + endereço).
     - Nova frase de CONVERSA: copie um bloco de CONVERSA.
     - Botões rápidos: lista SUGESTOES (cada texto = "titulo" de uma FAQ).
     - Primeira mensagem: BOAS_VINDAS.
   A conversa fica guardada só na aba do navegador (sessionStorage) para
   não zerar ao trocar de página. Nada é enviado para servidor nenhum.
   ============================================================ */
(function () {
    "use strict";

    var FAQ = [
        {
            titulo: "Como reservar uma viagem?",
            palavras: ["reservar", "reserva", "comprar", "compra", "contratar", "carrinho", "checkout", "finalizar"],
            resposta: "Escolha a viagem na página inicial, abra os detalhes (fotos, mapa, guia e datas) e siga para a reserva. Hoje a reserva é finalizada pelo aplicativo RR Turismo, em “Adicionar ao carrinho”.",
            atalho: { texto: "Ver viagens", href: "/inicio" }
        },
        {
            titulo: "Como salvar uma viagem nos favoritos?",
            palavras: ["favorito", "favoritos", "salvar", "salva", "coracao", "guardar"],
            resposta: "Clique no coração que aparece sobre a foto da viagem (ou o botão “Salvar nos favoritos” dentro dela). As salvas ficam na página Favoritos, no menu de cima.",
            atalho: { texto: "Ver favoritos", href: "/favoritos" }
        },
        {
            titulo: "Preciso criar uma conta?",
            palavras: ["conta", "cadastro", "cadastrar", "criar conta", "registrar", "entrar", "login", "logar"],
            resposta: "Para ver as viagens não precisa de conta. Para salvar favoritos entre aparelhos e reservar, crie a sua: escolha “Viajante” se só quer comprar viagens, ou “Guia/Empresa” se quer anunciar as suas.",
            atalho: { texto: "Criar conta", href: "/cadastro" }
        },
        {
            titulo: "Sou guia/empresa: como criar uma viagem?",
            palavras: ["criar viagem", "cadastrar viagem", "publicar", "anunciar", "novo passeio", "sou guia", "sou empresa", "guia", "empresa", "agencia"],
            resposta: "Cadastre-se escolhendo “Guia/Empresa”. Depois de entrar você ganha o painel com “Criar nova viagem”, “Editar viagem” e “Reservas”. As viagens publicadas aparecem aqui no site e no app.",
            atalho: { texto: "Criar conta de guia/empresa", href: "/cadastro" }
        },
        {
            titulo: "Como mudar o idioma do site?",
            palavras: ["idioma", "lingua", "traduzir", "traducao", "ingles", "espanhol", "italiano", "language"],
            resposta: "Clique no botão com o globo 🌐 no topo da página e escolha o idioma. O site inteiro é traduzido na hora."
        },
        {
            titulo: "Como trocar minha foto ou meus dados?",
            palavras: ["foto", "capa", "avatar", "perfil", "trocar foto", "editar", "configuracoes", "dados", "nome"],
            resposta: "Abra o menu com o seu nome, no canto de cima, e clique em “Configurações” (ou “Editar Perfil”). Lá você troca foto, capa, nome e a descrição.",
            atalho: { texto: "Abrir configurações", href: "/editarperfil" }
        },
        {
            titulo: "Como cancelar uma reserva?",
            palavras: ["cancelar", "cancelamento", "reembolso", "estorno", "devolver", "desistir"],
            resposta: "As condições de cancelamento ficam na página de cada viagem, na seção “Cancelamento”. Para pedir cancelamento ou reembolso, fale com a nossa equipe.",
            atalho: { texto: "Fale conosco", href: "/fale-conosco" }
        },
        {
            titulo: "Esqueci minha senha",
            palavras: ["senha", "esqueci", "recuperar", "redefinir", "acessar"],
            resposta: "Ainda não existe recuperação de senha automática. Fale com a equipe que ajudamos você a voltar a acessar a conta.",
            atalho: { texto: "Fale conosco", href: "/fale-conosco" }
        },
        {
            titulo: "Existe aplicativo?",
            palavras: ["app", "aplicativo", "celular", "android", "iphone", "baixar", "modo guia", "ao vivo"],
            resposta: "Sim! O app RR Turismo usa a mesma conta do site. Nele você reserva, acompanha a viagem ao vivo no mapa e recebe avisos do guia."
        },
        {
            titulo: "Como falar com a equipe?",
            palavras: ["contato", "falar", "equipe", "suporte", "ajuda", "email", "telefone", "atendimento", "atendente", "humano", "whatsapp", "zap", "pessoa"],
            resposta: "Use o Fale conosco: você escreve a mensagem e ela abre direto no WhatsApp da nossa equipe.",
            atalho: { texto: "Fale conosco", href: "/fale-conosco" }
        },
        {
            titulo: "Quem criou o RR Turismo?",
            palavras: ["quem criou", "quem fez", "criadores", "desenvolvedores", "fatec", "sobre nos", "equipe do site"],
            resposta: "O RR Turismo foi criado por Rafael e Rodolfo, estudantes de Sistemas para Internet na Fatec Taquaritinga. Na página Sobre nós você conhece a história do projeto.",
            atalho: { texto: "Sobre nós", href: "/sobre-nos" }
        }
    ];

    var CONVERSA = [
        { palavras: ["oi", "ola", "oie", "opa", "eai", "e ai", "salve", "bom dia", "boa tarde", "boa noite", "hello", "hi", "hey"],
          respostas: ["Oi{nome}! 😊 Que bom ter você por aqui. Posso tirar dúvidas sobre o site ou só bater um papo. Como posso ajudar?",
                      "Olá{nome}! Tudo bem? Me conta o que você precisa: viagens, conta, favoritos… é só perguntar."] },
        { palavras: ["tudo bem", "como vai", "como voce esta", "como esta", "td bem", "tudo certo"],
          respostas: ["Tudo ótimo por aqui, obrigado por perguntar! E com você? Se precisar de algo no site, é só falar.",
                      "Tudo bem sim! Estou pronto para ajudar você a planejar a próxima viagem. ✈️"] },
        { palavras: ["obrigado", "obrigada", "obg", "brigado", "brigada", "valeu", "vlw", "agradeco", "thanks", "thank you", "muito obrigado"],
          respostas: ["De nada{nome}! Fico feliz em ajudar. Se surgir outra dúvida, estou por aqui. 💙",
                      "Imagina! Sempre que precisar, é só chamar."] },
        { palavras: ["gostei", "adorei", "amei", "curti", "legal", "bonito", "lindo", "linda", "otimo", "excelente", "perfeito", "parabens", "top", "show", "maravilhoso", "incrivel", "massa", "da hora", "muito bom"],
          respostas: ["Que bom ouvir isso{nome}! 🥰 Muito obrigado, esse carinho motiva a gente a continuar melhorando o RR Turismo.",
                      "Obrigado pelo elogio! Foi feito com muito cuidado pela nossa equipe. Se quiser deixar um comentário, use o Fale conosco."],
          atalho: { texto: "Deixar um comentário", href: "/fale-conosco" } },
        { palavras: ["nao gostei", "ruim", "pessimo", "horrivel", "odiei", "lento", "lenta", "bugado", "bugou", "confuso", "reclamar", "reclamacao", "decepcionado", "insatisfeito", "nao funciona", "nao gosto", "complicado", "dificil"],
          respostas: ["Poxa{nome}, sinto muito que a sua experiência não tenha sido boa. 😔 Conta pra gente o que aconteceu pelo Fale conosco para a equipe resolver o quanto antes.",
                      "Obrigado por avisar, isso ajuda a gente a melhorar. Se puder, descreva o problema no Fale conosco que a equipe cuida disso."],
          atalho: { texto: "Fale conosco", href: "/fale-conosco" } },
        { palavras: ["sugestao", "sugerir", "sugiro", "ideia", "melhorar", "melhoria", "deveria", "poderia", "seria legal", "falta", "queria que"],
          respostas: ["Adoramos ideias! 💡 Escreva a sua sugestão no Fale conosco para chegar direto na equipe, ok?",
                      "Boa! Sugestões de quem usa o site valem ouro. Manda pelo Fale conosco que a gente lê com carinho."],
          atalho: { texto: "Enviar sugestão", href: "/fale-conosco" } },
        { palavras: ["tchau", "ate logo", "ate mais", "flw", "falou", "adeus", "ate a proxima", "fui", "bye"],
          respostas: ["Até mais{nome}! Boa viagem e volte sempre. 👋", "Tchau! Qualquer dúvida, é só abrir a bolinha de ajuda de novo. ✈️"] },
        { palavras: ["quem e voce", "quem e vc", "seu nome", "como se chama", "voce e um robo", "voce e robo", "voce e humano", "voce e uma pessoa", "voce e real", "inteligencia artificial", "voce e ia", "e um bot"],
          respostas: ["Eu sou o assistente virtual do RR Turismo. Não sou uma pessoa: respondo as dúvidas mais comuns sobre o site e o app. Para falar com a equipe de verdade, use o Fale conosco."],
          atalho: { texto: "Falar com a equipe", href: "/fale-conosco" } },
        { palavras: ["o que voce faz", "o que voce sabe", "o que voce pode", "para que serve", "no que voce ajuda", "como voce pode ajudar", "voce sabe fazer"],
          respostas: ["Eu ajudo com viagens, favoritos, conta, idioma e contato com a equipe. Também aceito elogios, sugestões e reclamações! Escolha uma pergunta abaixo ou escreva a sua."] },
        { palavras: ["piada", "conta uma piada", "me faz rir", "engracado"],
          respostas: ["Por que o turista levou um relógio para a praia? Porque queria passar o tempo! 😄",
                      "Qual é o cúmulo da viagem? Ir de ônibus e voltar de bom humor. 😄"] }
    ];

    var PALAVRAS_DE_PERGUNTA = ["como", "onde", "qual", "quais", "quando", "posso", "preciso", "quero", "consigo", "por que", "porque", "tem como", "cade"];
    var BOAS_VINDAS = "Oi! Eu sou o assistente do RR Turismo 💙 Posso tirar dúvidas sobre o site, ouvir sugestões e elogios ou só bater um papo. Escolha uma pergunta abaixo ou escreva o que quiser.";
    var SUGESTOES = ["Como reservar uma viagem?", "Como salvar uma viagem nos favoritos?", "Preciso criar uma conta?", "Sou guia/empresa: como criar uma viagem?", "Como falar com a equipe?"];
    var NAO_ENTENDI = {
        resposta: "Não encontrei uma resposta para isso. Tente com outras palavras ou escolha uma das perguntas sugeridas. Se preferir, a nossa equipe pode ajudar.",
        atalho: { texto: "Fale conosco", href: "/fale-conosco" }
    };

    /* ---------------- cérebro ---------------- */
    function normalizar(t) {
        return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");
    }
    function contemPalavra(texto, palavra) { return texto.indexOf(" " + palavra + " ") !== -1; }
    function colocarNome(r, nome) { return r.replace("{nome}", nome ? ", " + nome : ""); }

    function melhorDaFaq(texto) {
        var melhor = null, melhorPontos = 0;
        FAQ.forEach(function (item) {
            var pontos = 0, maior = 0;
            item.palavras.forEach(function (p) {
                if (texto.indexOf(" " + p) !== -1 || texto.indexOf(p + " ") !== -1) {
                    pontos += p.indexOf(" ") !== -1 ? 3 : 1;
                    maior = Math.max(maior, p.length);
                }
            });
            if (pontos > 0) pontos += maior / 100;
            if (pontos > melhorPontos) { melhorPontos = pontos; melhor = item; }
        });
        return melhor;
    }
    function melhorDaConversa(texto) {
        var melhor = null, melhorPontos = 0;
        CONVERSA.forEach(function (item) {
            var pontos = 0;
            item.palavras.forEach(function (p) { if (contemPalavra(texto, p)) pontos += p.indexOf(" ") !== -1 ? 3 : 1; });
            if (pontos > melhorPontos) { melhorPontos = pontos; melhor = item; }
        });
        return melhor;
    }
    function responder(pergunta, nome) {
        var texto = " " + normalizar(pergunta).replace(/\s+/g, " ").trim() + " ";
        if (texto.trim().length < 2) return NAO_ENTENDI;
        var faq = melhorDaFaq(texto), conversa = melhorDaConversa(texto);
        var ehPergunta = pergunta.indexOf("?") !== -1 || PALAVRAS_DE_PERGUNTA.some(function (p) { return contemPalavra(texto, p); });
        if (conversa && (!ehPergunta || !faq)) {
            var r = conversa.respostas[Math.floor(Math.random() * conversa.respostas.length)];
            return { resposta: colocarNome(r, nome), atalho: conversa.atalho };
        }
        return faq || NAO_ENTENDI;
    }

    /* ---------------- tela ---------------- */
    var bolinha = document.getElementById("chatBolinha");
    var janela = document.getElementById("chatJanela");
    if (!bolinha || !janela) return;

    var lista = document.getElementById("chatMensagens");
    var sugestoes = document.getElementById("chatSugestoes");
    var form = document.getElementById("chatForm");
    var entrada = document.getElementById("chatEntrada");
    var primeiroNome = (bolinha.getAttribute("data-nome") || "").trim().split(/\s+/)[0] || "";
    var CHAVE = "rr_chat_site";
    var historico = [];
    var digitando = false;

    function salvar() { try { sessionStorage.setItem(CHAVE, JSON.stringify(historico.slice(-40))); } catch (e) { } }
    function carregar() {
        try { var h = JSON.parse(sessionStorage.getItem(CHAVE) || "[]"); return Array.isArray(h) ? h : []; } catch (e) { return []; }
    }

    function desenhar(m) {
        var linha = document.createElement("div");
        linha.className = "chat-linha " + (m.de === "eu" ? "eu" : "bot");
        if (m.de !== "eu") {
            var av = document.createElement("img");
            av.className = "chat-mini-avatar"; av.src = "/imagens/RRBolinha.png"; av.alt = "";
            linha.appendChild(av);
        }
        var col = document.createElement("div");
        col.className = "chat-col";
        var balao = document.createElement("div");
        balao.className = "chat-balao";
        balao.textContent = m.texto;          // textContent: nada digitado vira HTML
        col.appendChild(balao);
        if (m.atalho) {
            var a = document.createElement("a");
            a.className = "chat-atalho"; a.href = m.atalho.href; a.textContent = m.atalho.texto + " →";
            col.appendChild(a);
        }
        linha.appendChild(col);
        lista.appendChild(linha);
        return linha;
    }
    function rolar() { lista.scrollTop = lista.scrollHeight; }

    function mostrarSugestoes() {
        sugestoes.innerHTML = "";
        SUGESTOES.forEach(function (t) {
            var b = document.createElement("button");
            b.type = "button"; b.className = "chat-chip"; b.textContent = t;
            b.addEventListener("click", function () { perguntar(t); });
            sugestoes.appendChild(b);
        });
    }

    function adicionar(m) { historico.push(m); desenhar(m); salvar(); rolar(); }

    function perguntar(texto) {
        texto = String(texto || "").trim();
        if (!texto || digitando) return;
        adicionar({ de: "eu", texto: texto });
        digitando = true;
        var ind = document.createElement("div");
        ind.className = "chat-linha bot";
        ind.innerHTML = '<img class="chat-mini-avatar" src="/imagens/RRBolinha.png" alt=""><div class="chat-col"><div class="chat-balao chat-digitando"><i></i><i></i><i></i></div></div>';
        lista.appendChild(ind); rolar();
        var r = responder(texto, primeiroNome);
        setTimeout(function () {
            ind.remove();
            digitando = false;
            adicionar({ de: "bot", texto: r.resposta, atalho: r.atalho });
        }, 550);
    }

    function recomecar() {
        historico = []; lista.innerHTML = "";
        adicionar({ de: "bot", texto: BOAS_VINDAS });
        mostrarSugestoes();
    }

    function abrir(abrirAgora) {
        janela.hidden = !abrirAgora;
        bolinha.setAttribute("aria-expanded", abrirAgora ? "true" : "false");
        bolinha.classList.toggle("escondida", abrirAgora && window.innerWidth < 640);
        if (abrirAgora) { rolar(); setTimeout(function () { entrada.focus(); }, 50); }
    }

    // Conversa guardada (troca de página) ou conversa nova.
    historico = carregar();
    if (historico.length) { historico.forEach(desenhar); mostrarSugestoes(); }
    else { recomecar(); }

    /* Arrastar a bolinha (toque curto abre o chat) */
    var arrastando = false, moveu = false, p0 = null, pos0 = null;
    bolinha.addEventListener("pointerdown", function (e) {
        arrastando = true; moveu = false;
        p0 = { x: e.clientX, y: e.clientY };
        var r = bolinha.getBoundingClientRect();
        pos0 = { x: r.left, y: r.top };
        try { bolinha.setPointerCapture(e.pointerId); } catch (x) { }
    });
    bolinha.addEventListener("pointermove", function (e) {
        if (!arrastando) return;
        var dx = e.clientX - p0.x, dy = e.clientY - p0.y;
        if (!moveu && Math.abs(dx) + Math.abs(dy) < 8) return;
        moveu = true;
        var x = Math.min(window.innerWidth - 76, Math.max(8, pos0.x + dx));
        var y = Math.min(window.innerHeight - 76, Math.max(8, pos0.y + dy));
        bolinha.style.left = x + "px"; bolinha.style.top = y + "px";
        bolinha.style.right = "auto"; bolinha.style.bottom = "auto";
    });
    bolinha.addEventListener("pointerup", function () {
        if (!arrastando) return;
        arrastando = false;
        if (moveu) {
            // Gruda na lateral mais próxima.
            var r = bolinha.getBoundingClientRect();
            bolinha.style.left = (r.left + r.width / 2 < window.innerWidth / 2 ? 16 : window.innerWidth - r.width - 16) + "px";
        } else {
            abrir(janela.hidden);
        }
    });
    bolinha.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(janela.hidden); }
    });

    document.getElementById("chatFechar").addEventListener("click", function () { abrir(false); });
    document.getElementById("chatReiniciar").addEventListener("click", recomecar);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !janela.hidden) abrir(false); });
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var t = entrada.value; entrada.value = "";
        perguntar(t);
    });
})();
