/* =========================================================
   PAINEL DE ACESSIBILIDADE — RR Turismo
   Modular, localStorage, sem conflitos
========================================================= */
(function () {
    'use strict';

    var STORAGE_KEY = 'rr_acc_prefs';
    var conteudo     = document.querySelector('.conteudo');
    var HTML         = document.documentElement;
    var BODY         = document.body;

    /* ---- Auxiliares de leitura ---- */
    var maskTop  = ce('div', 'acc-mask-top');
    var maskBot  = ce('div', 'acc-mask-bot');
    var guiaLine = ce('div', null, 'acc-guia-line');
    var lupaEl   = ce('div', null, 'acc-lupa');
    var leitorBar = buildLeitorBar();
    BODY.appendChild(maskTop);
    BODY.appendChild(maskBot);
    BODY.appendChild(guiaLine);
    BODY.appendChild(lupaEl);
    BODY.appendChild(leitorBar);

    function ce(tag, cls, id) {
        var el = document.createElement(tag);
        if (cls) el.className = cls;
        if (id)  el.id = id;
        return el;
    }

    /* =========================================================
       ÍCONES SVG
    ========================================================= */
    var icons = {
        fontsize:     '<svg viewBox="0 0 24 24"><text x="1" y="19" font-size="15" font-weight="bold" fill="currentColor" stroke="none" font-family="Arial">A+</text></svg>',
        textstyle:    '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/></svg>',
        bold:         '<svg viewBox="0 0 24 24"><text x="5" y="19" font-size="17" font-weight="900" fill="currentColor" stroke="none" font-family="Arial">B</text></svg>',
        lineheight:   '<svg viewBox="0 0 24 24"><line x1="3" y1="5" x2="21" y2="5"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="19" x2="21" y2="19"/><polyline points="7,2 12,5 17,2"/><polyline points="7,22 12,19 17,22"/></svg>',
        letterspacing:'<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="3" y2="18"/><line x1="21" y1="6" x2="21" y2="18"/></svg>',
        book:         '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        speaker:      '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
        readmode:     '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><line x1="6" y1="8" x2="10" y2="8"/></svg>',
        mask:         '<svg viewBox="0 0 24 24"><rect x="2" y="9" width="20" height="6" rx="1"/><rect x="0" y="0" width="24" height="9" fill="currentColor" opacity=".2" stroke="none"/><rect x="0" y="15" width="24" height="9" fill="currentColor" opacity=".2" stroke="none"/></svg>',
        guide:        '<svg viewBox="0 0 24 24"><line x1="2" y1="12" x2="22" y2="12"/><polyline points="8,7 3,12 8,17"/><polyline points="16,7 21,12 16,17"/></svg>',
        link:         '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        magnify:      '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
        noimage:      '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="3" x2="21" y2="21"/></svg>',
        heading:      '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7"/></svg>',
        contrast:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" stroke="none"/></svg>',
        saturation:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" stroke="none"/><path d="M12 2a10 10 0 0 0 0 20" fill="none"/></svg>',
        dark:         '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        colorblind:   '<svg viewBox="0 0 32 24" fill="none"><circle cx="10" cy="12" r="7" fill="#e74c3c" opacity=".8" stroke="none"/><circle cx="22" cy="12" r="7" fill="#2ecc71" opacity=".8" stroke="none"/><circle cx="16" cy="12" r="7" fill="#3498db" opacity=".8" stroke="none"/></svg>'
    };

    /* =========================================================
       DEFINIÇÃO DAS SEÇÕES E CARDS
    ========================================================= */
    var secoes = [
        {
            titulo: 'Ferramentas',
            cards: [
                {
                    id: 'sinonimos', nome: 'Sinônimos e Significados', max: 1,
                    estagios: ['Desativado', 'Ativado'],
                    icone: icons.book,
                    aplicar: toggleSinonimos
                }
            ]
        },
        {
            titulo: 'Controle de fonte',
            cards: [
                {
                    id: 'fonte', nome: 'Tamanho de fonte', max: 2,
                    estagios: ['Normal', 'Grande', 'Muito grande'],
                    icone: icons.fontsize,
                    aplicar: aplicarFonte
                },
                {
                    id: 'dislexia', nome: 'Estilo de texto', max: 2,
                    estagios: ['Padrão', 'Dislexia leve', 'Dislexia forte'],
                    icone: icons.textstyle,
                    aplicar: function(v) { bc('acc-dislexia-1','acc-dislexia-2', v); }
                },
                {
                    id: 'negrito', nome: 'Letras Destacadas', max: 2,
                    estagios: ['Normal', 'Negrito', 'Extra negrito'],
                    icone: icons.bold,
                    aplicar: function(v) { bc('acc-negrito-1','acc-negrito-2', v); }
                },
                {
                    id: 'linhas', nome: 'Espaço entre linhas', max: 2,
                    estagios: ['Normal', 'Médio', 'Amplo'],
                    icone: icons.lineheight,
                    aplicar: function(v) { bc('acc-linhas-1','acc-linhas-2', v); }
                },
                {
                    id: 'letras', nome: 'Espaço entre letras', max: 2,
                    estagios: ['Normal', 'Médio', 'Amplo'],
                    icone: icons.letterspacing,
                    aplicar: function(v) { bc('acc-letras-1','acc-letras-2', v); }
                }
            ]
        },
        {
            titulo: 'Navegação',
            cards: [
                {
                    id: 'leitor', nome: 'Leitor de sites', max: 1,
                    estagios: ['Parado', 'Lendo'],
                    icone: icons.speaker,
                    aplicar: toggleLeitor
                },
                {
                    id: 'leitura', nome: 'Modo de leitura', max: 1,
                    estagios: ['Normal', 'Foco'],
                    icone: icons.readmode,
                    aplicar: function(v) { btoggle('acc-leitura', v); }
                },
                {
                    id: 'mascara', nome: 'Máscara de leitura', max: 1,
                    estagios: ['Desligada', 'Ligada'],
                    icone: icons.mask,
                    aplicar: function(v) { btoggle('acc-mascara', v); }
                },
                {
                    id: 'guia', nome: 'Guia de leitura', max: 1,
                    estagios: ['Desligado', 'Ligado'],
                    icone: icons.guide,
                    aplicar: function(v) { btoggle('acc-guia', v); }
                },
                {
                    id: 'links', nome: 'Destaque de links', max: 2,
                    estagios: ['Normal', 'Contorno', 'Realçado'],
                    icone: icons.link,
                    aplicar: function(v) { bc('acc-links-1','acc-links-2', v); }
                },
                {
                    id: 'lupa', nome: 'Lupa de Conteúdo', max: 1,
                    estagios: ['Desligada', 'Ligada'],
                    icone: icons.magnify,
                    aplicar: toggleLupa
                },
                {
                    id: 'semimg', nome: 'Esconder imagens', max: 2,
                    estagios: ['Visíveis', 'Transparentes', 'Ocultas'],
                    icone: icons.noimage,
                    aplicar: function(v) { bc('acc-semimg-1','acc-semimg-2', v); }
                },
                {
                    id: 'heads', nome: 'Destacar Cabeçalho', max: 2,
                    estagios: ['Normal', 'Leve', 'Forte'],
                    icone: icons.heading,
                    aplicar: function(v) { bc('acc-heads-1','acc-heads-2', v); }
                }
            ]
        },
        {
            titulo: 'Controle de cor',
            cards: [
                {
                    id: 'contraste', nome: 'Contraste de cores', max: 3,
                    estagios: ['Normal', 'Alto P/B', 'Alto A/P', 'Escala cinza'],
                    icone: icons.contrast,
                    aplicar: function(v) { bc3('acc-contraste-1','acc-contraste-2','acc-contraste-3', v); }
                },
                {
                    id: 'saturacao', nome: 'Intensidade de cores', max: 2,
                    estagios: ['Normal', 'Reduzida', 'Escala cinza'],
                    icone: icons.saturation,
                    aplicar: function(v) { hc('acc-sat-1','acc-sat-2', v); }
                },
                {
                    id: 'escuro', nome: 'Modo escuro', max: 1,
                    estagios: ['Claro', 'Escuro'],
                    icone: icons.dark,
                    aplicar: function(v) { btoggle('acc-escuro', v); }
                },
                {
                    id: 'daltonico', nome: 'Modo daltônico', max: 3,
                    estagios: ['Normal', 'Deuteranopia', 'Protanopia', 'Tritanopia'],
                    /* label exibido no badge + cor da bolinha */
                    badges: [
                        null,
                        { cor: '#27ae60', nome: 'Deuteranopia',  desc: 'Verde' },
                        { cor: '#e74c3c', nome: 'Protanopia',    desc: 'Vermelho' },
                        { cor: '#2980b9', nome: 'Tritanopia',    desc: 'Azul' }
                    ],
                    icone: icons.colorblind,
                    aplicar: aplicarDaltonico
                }
            ]
        }
    ];

    /* ---- Estado ---- */
    var estado = {};
    secoes.forEach(function(s) { s.cards.forEach(function(c) { estado[c.id] = 0; }); });
    carregarPrefs();

    /* =========================================================
       CONSTRUIR PAINEL
    ========================================================= */
    var painel = document.createElement('div');
    painel.id = 'acc-painel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'Recursos Assistivos');

    var html = '<div class="acc-h">'
        + '<div class="acc-h-titulo"><span>♿</span> Recursos Assistivos</div>'
        + '<button class="acc-h-fechar" id="acc-fechar" title="Fechar">✕</button>'
        + '</div><div class="acc-body">';

    secoes.forEach(function(s) {
        html += '<div class="acc-st">' + s.titulo + '</div><div class="acc-grid">';
        s.cards.forEach(function(c) {
            var dots = '';
            if (c.max > 1) {
                for (var i = 1; i <= c.max; i++) {
                    dots += '<div class="acc-dot' + (estado[c.id] >= i ? ' on' : '') + '" data-dot="' + c.id + '-' + i + '"></div>';
                }
                dots = '<div class="acc-dots">' + dots + '</div>';
            }
            var cls = 'acc-card' + (estado[c.id] > 0 ? ' s' + Math.min(estado[c.id], 3) : '');

            /* Badge daltônico */
            var badge = '';
            if (c.id === 'daltonico' && estado[c.id] > 0 && c.badges[estado[c.id]]) {
                var bd = c.badges[estado[c.id]];
                badge = '<div class="acc-dal-badge">'
                    + '<span class="acc-dal-dot" style="background:' + bd.cor + '"></span>'
                    + '<span class="acc-dal-nome">' + bd.nome + '</span>'
                    + '<span class="acc-dal-desc">' + bd.desc + '</span>'
                    + '</div>';
            }

            html += '<button class="' + cls + '" data-id="' + c.id + '" title="' + c.estagios[estado[c.id]] + '">'
                + dots
                + badge
                + '<div class="acc-ci">' + c.icone + '</div>'
                + '<div class="acc-cn">' + c.nome + '</div>'
                + '</button>';
        });
        html += '</div>';
    });

    html += '</div>'
        + '<div class="acc-foot">'
        + '<button class="acc-resetar" id="acc-resetar">↺ Redefinir tudo</button>'
        + '<span class="acc-marca">RR Turismo</span>'
        + '</div>';

    painel.innerHTML = html;
    BODY.appendChild(painel);

    /* ---- Mapa de features ---- */
    var featMap = {};
    secoes.forEach(function(s) { s.cards.forEach(function(c) { featMap[c.id] = c; }); });

    /* =========================================================
       EVENTOS DO PAINEL
    ========================================================= */
    var btnToggle = document.getElementById('acc-toggle-btn');

    btnToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        painel.classList.toggle('acc-aberto');
    });

    document.getElementById('acc-fechar').addEventListener('click', function() {
        painel.classList.remove('acc-aberto');
    });

    document.addEventListener('click', function(e) {
        if (!painel.contains(e.target) && !btnToggle.contains(e.target)) {
            painel.classList.remove('acc-aberto');
        }
    });

    /* ---- Clique nos cards ---- */
    painel.querySelectorAll('.acc-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var id = this.dataset.id;
            var feat = featMap[id];

            estado[id] = (estado[id] + 1) % (feat.max + 1);
            feat.aplicar(estado[id]);

            /* Visual do card */
            this.classList.remove('s1','s2','s3');
            if (estado[id] > 0) this.classList.add('s' + Math.min(estado[id], 3));
            this.title = feat.estagios[estado[id]];

            /* Dots */
            for (var i = 1; i <= feat.max; i++) {
                var dot = painel.querySelector('[data-dot="' + id + '-' + i + '"]');
                if (dot) dot.classList.toggle('on', i <= estado[id]);
            }

            /* Badge daltônico */
            if (id === 'daltonico') {
                var existingBadge = this.querySelector('.acc-dal-badge');
                if (existingBadge) existingBadge.remove();
                if (estado[id] > 0 && feat.badges[estado[id]]) {
                    var bd2 = feat.badges[estado[id]];
                    var newBadge = document.createElement('div');
                    newBadge.className = 'acc-dal-badge';
                    newBadge.innerHTML = '<span class="acc-dal-dot" style="background:' + bd2.cor + '"></span>'
                        + '<span class="acc-dal-nome">' + bd2.nome + '</span>'
                        + '<span class="acc-dal-desc">' + bd2.desc + '</span>';
                    this.insertBefore(newBadge, this.querySelector('.acc-ci'));
                }
            }

            salvarPrefs();
        });
    });

    /* ---- Reset ---- */
    document.getElementById('acc-resetar').addEventListener('click', function() {
        secoes.forEach(function(s) {
            s.cards.forEach(function(c) {
                estado[c.id] = 0;
                c.aplicar(0);
            });
        });
        painel.querySelectorAll('.acc-card').forEach(function(card) {
            card.classList.remove('s1','s2','s3');
            var id = card.dataset.id;
            card.title = featMap[id].estagios[0];
            var badge = card.querySelector('.acc-dal-badge');
            if (badge) badge.remove();
        });
        painel.querySelectorAll('.acc-dot').forEach(function(d) { d.classList.remove('on'); });
        limparFontes();
        localStorage.removeItem(STORAGE_KEY);
    });

    /* =========================================================
       HELPERS DE CLASSE
    ========================================================= */
    function btoggle(cls, v) { BODY.classList.toggle(cls, v > 0); }
    function bc(c1, c2, v) { BODY.classList.remove(c1,c2); if(v===1) BODY.classList.add(c1); if(v===2) BODY.classList.add(c2); }
    function bc3(c1,c2,c3,v) { BODY.classList.remove(c1,c2,c3); if(v===1) BODY.classList.add(c1); if(v===2) BODY.classList.add(c2); if(v===3) BODY.classList.add(c3); }
    function hc(c1,c2,v) { HTML.classList.remove(c1,c2); if(v===1) HTML.classList.add(c1); if(v===2) HTML.classList.add(c2); }
    function hc3(c1,c2,c3,c4,v) { HTML.classList.remove(c1,c2,c3,c4); if(v===1) HTML.classList.add(c1); if(v===2) HTML.classList.add(c2); if(v===3) HTML.classList.add(c3); if(v===4) HTML.classList.add(c4); }

    /* =========================================================
       TAMANHO DE FONTE
    ========================================================= */
    var fonteMults = [1, 1.2, 1.45];
    var fonteOriginals = new Map();

    function aplicarFonte(nivel) {
        if (nivel === 0) { limparFontes(); return; }
        var mult = fonteMults[nivel];
        var sels = 'p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, label, small, strong, em, b, i';
        if (!conteudo) return;
        conteudo.querySelectorAll(sels).forEach(function(el) {
            if (!fonteOriginals.has(el)) {
                fonteOriginals.set(el, parseFloat(window.getComputedStyle(el).fontSize));
            }
            el.style.fontSize = (fonteOriginals.get(el) * mult) + 'px';
        });
    }

    function limparFontes() {
        fonteOriginals.forEach(function(_, el) { el.style.removeProperty('font-size'); });
        fonteOriginals.clear();
    }

    /* =========================================================
       MODO DALTÔNICO
    ========================================================= */
    function aplicarDaltonico(v) {
        HTML.classList.remove('acc-dal-1','acc-dal-2','acc-dal-3');
        if (v === 1) HTML.classList.add('acc-dal-1');
        else if (v === 2) HTML.classList.add('acc-dal-2');
        else if (v === 3) HTML.classList.add('acc-dal-3');
    }

    /* =========================================================
       DICIONÁRIO PT-BR EMBUTIDO
       Formato: palavra -> { sin: [...], def: '...', ex: [...] }
    ========================================================= */
    var DICIONARIO_PT = {
        'viagem':      { sin:['jornada','excursão','passeio','tour','expedição'], def:'Deslocamento de um lugar para outro, geralmente por lazer ou negócios.', ex:['A viagem foi inesquecível.','Planejamos a viagem com meses de antecedência.','A viagem de negócios durou três dias.'] },
        'viagens':     { sin:['jornadas','excursões','passeios','tours','expedições'], def:'Plural de viagem; deslocamentos realizados para diferentes destinos.', ex:['As viagens enriquecem o espírito.','Ela fez muitas viagens pelo mundo.','As viagens de verão são as mais procuradas.'] },
        'turismo':     { sin:['turismo','excursionismo','lazer','aventura','exploração'], def:'Atividade de viajar para conhecer lugares, culturas e atrações fora do cotidiano.', ex:['O turismo movimenta a economia local.','O turismo sustentável preserva o meio ambiente.','A cidade vive do turismo.'] },
        'destino':     { sin:['rumo','objetivo','meta','alvo','finalidade'], def:'Local para onde se viaja ou ponto de chegada de uma jornada.', ex:['O destino da viagem é Paris.','Escolhemos um destino exótico.','O destino foi uma surpresa para todos.'] },
        'destinos':    { sin:['rumos','objetivos','metas','localidades','pontos'], def:'Plural de destino; lugares para onde se planeja viajar.', ex:['Os destinos mais procurados estão no Nordeste.','Temos vários destinos disponíveis.','Conheça os destinos em promoção.'] },
        'reserva':     { sin:['agendamento','marcação','booking','pré-venda','compromisso'], def:'Ato de garantir antecipadamente um serviço como hospedagem ou assento.', ex:['Fiz a reserva do hotel com antecedência.','A reserva pode ser cancelada até 48h antes.','Confirme sua reserva pelo site.'] },
        'reservas':    { sin:['agendamentos','marcações','bookings','pré-vendas','confirmações'], def:'Plural de reserva; agendamentos feitos para serviços turísticos.', ex:['As reservas estão abertas para o próximo mês.','Gerenciamos todas as reservas pelo sistema.','As reservas devem ser feitas com antecedência.'] },
        'hospedagem':  { sin:['acomodação','estadia','alojamento','pousada','moradia'], def:'Serviço de alojamento temporário oferecido a viajantes.', ex:['A hospedagem inclui café da manhã.','Encontramos uma ótima hospedagem barata.','A hospedagem foi confortável e bem localizada.'] },
        'hotel':       { sin:['pousada','resort','hostel','albergue','inn'], def:'Estabelecimento comercial que oferece hospedagem, geralmente com serviços adicionais.', ex:['O hotel fica próximo à praia.','Reservamos um quarto no hotel cinco estrelas.','O hotel oferece spa e restaurante.'] },
        'passagem':    { sin:['bilhete','ticket','ingresso','voo','trajeto'], def:'Documento que autoriza o transporte de uma pessoa de um lugar a outro.', ex:['Comprei a passagem com antecedência.','A passagem aérea saiu barata.','Perdeu a passagem e não pode embarcar.'] },
        'pacote':      { sin:['combo','oferta','plano','programa','conjunto'], def:'Conjunto de serviços turísticos vendidos juntos, como voo, hotel e passeios.', ex:['O pacote inclui voo e hospedagem.','Adquirimos um pacote completo para Cancún.','O pacote de lua de mel é especial.'] },
        'passeio':     { sin:['excursão','tour','caminhada','volta','giro'], def:'Atividade de exploração de um lugar por lazer ou entretenimento.', ex:['O passeio de barco foi incrível.','Fizemos um passeio pela cidade histórica.','O passeio durou o dia todo.'] },
        'aventura':    { sin:['emoção','risco','exploração','expedição','desafio'], def:'Experiência emocionante que envolve novidade, risco ou exploração de novos lugares.', ex:['A aventura na selva foi memorável.','Cada viagem é uma nova aventura.','Ele busca aventura em destinos remotos.'] },
        'guia':        { sin:['condutor','acompanhante','cicerone','orientador','mentor'], def:'Pessoa que acompanha e orienta viajantes em uma visita a um lugar.', ex:['O guia conhecia cada canto da cidade.','Contratamos um guia local para o passeio.','O guia falava três idiomas.'] },
        'mapa':        { sin:['carta','planta','roteiro','diagrama','croqui'], def:'Representação gráfica de uma região ou território para orientação.', ex:['O mapa indicava os pontos turísticos.','Precisamos de um mapa da cidade.','O mapa foi essencial para a trilha.'] },
        'roteiro':     { sin:['itinerário','programa','agenda','plano','trajeto'], def:'Descrição detalhada dos lugares e atividades planejados durante uma viagem.', ex:['O roteiro incluía três países.','Montamos um roteiro de dez dias.','O guia sugeriu um roteiro alternativo.'] },
        'perfil':      { sin:['cadastro','conta','ficha','registro','identidade'], def:'Conjunto de informações pessoais ou profissionais que descrevem um usuário.', ex:['Complete seu perfil para aproveitar todos os recursos.','O perfil público fica visível para outros usuários.','Atualize seu perfil regularmente.'] },
        'usuario':     { sin:['cliente','membro','visitante','participante','conta'], def:'Pessoa que utiliza um sistema, plataforma ou serviço.', ex:['O usuário pode editar seu perfil.','Cada usuário tem uma senha única.','O usuário recebeu uma notificação.'] },
        'cadastro':    { sin:['registro','inscrição','conta','ficha','matricula'], def:'Processo de registrar informações pessoais em um sistema.', ex:['Faça seu cadastro gratuitamente.','O cadastro é rápido e simples.','Após o cadastro, você acessa todos os recursos.'] },
        'conta':       { sin:['perfil','registro','acesso','login','cadastro'], def:'Espaço pessoal em uma plataforma que reúne dados e acessos de um usuário.', ex:['Acesse sua conta para ver as reservas.','Crie uma conta para começar.','Esqueceu a senha da sua conta?'] },
        'pagamento':   { sin:['quitação','liquidação','débito','cobrança','transação'], def:'Ato de transferir dinheiro em troca de um bem ou serviço.', ex:['O pagamento pode ser parcelado.','Confirme o pagamento antes de viajar.','O pagamento foi processado com sucesso.'] },
        'valor':       { sin:['preço','custo','quantia','importância','montante'], def:'Quantia monetária correspondente a um produto ou serviço.', ex:['O valor da diária é acessível.','O valor inclui todas as taxas.','Verifique o valor total antes de confirmar.'] },
        'promo':       { sin:['promoção','desconto','oferta','liquidação','saldo'], def:'Redução temporária no preço de um produto ou serviço.', ex:['Aproveite a promo de fim de ano.','A promo acaba amanhã.','Encontrei uma promo imperdível.'] },
        'promoção':    { sin:['desconto','oferta','liquidação','saldo','redução'], def:'Redução temporária no preço de um produto ou serviço para atrair clientes.', ex:['A promoção vale por tempo limitado.','Compramos na promoção de verão.','A promoção inclui voo e hotel.'] },
        'desconto':    { sin:['abatimento','redução','promoção','rebate','benefício'], def:'Redução no preço original de um produto ou serviço.', ex:['Recebemos um desconto especial.','O desconto foi de 30%.','Aproveite o desconto para membros.'] },
        'futuro':      { sin:['amanhã','adiante','progresso','evolução','porvir'], def:'Período de tempo ainda por vir; o que está por acontecer.', ex:['Investir em tecnologia é preparar a empresa para o futuro.','A nova estratégia visa garantir um futuro promissor.','Estamos construindo um futuro mais sustentável.'] },
        'empresa':     { sin:['companhia','negócio','firma','organização','empreendimento'], def:'Organização com fins econômicos que oferece produtos ou serviços.', ex:['A empresa atua no ramo de turismo.','A empresa cresceu muito este ano.','Nossa empresa preza pela qualidade.'] },
        'cliente':     { sin:['consumidor','comprador','usuário','hóspede','contratante'], def:'Pessoa que adquire produtos ou serviços de uma empresa.', ex:['O cliente sempre tem razão.','Atendemos o cliente com excelência.','O cliente ficou satisfeito com o serviço.'] },
        'clientes':    { sin:['consumidores','compradores','usuários','hóspedes','parceiros'], def:'Plural de cliente; pessoas que utilizam os serviços de uma empresa.', ex:['Os clientes são nossa prioridade.','Temos clientes em todo o Brasil.','Os clientes elogiaram o atendimento.'] },
        'serviço':     { sin:['atendimento','assistência','suporte','trabalho','prestação'], def:'Atividade realizada em benefício de outra pessoa ou empresa mediante pagamento.', ex:['O serviço foi excelente.','Contratamos um serviço de qualidade.','O serviço inclui transporte gratuito.'] },
        'qualidade':   { sin:['excelência','padrão','nível','eficiência','perfeição'], def:'Grau de excelência ou superioridade de algo em relação ao esperado.', ex:['A qualidade do serviço superou as expectativas.','Buscamos qualidade em tudo.','A qualidade do hotel é incomparável.'] },
        'segurança':   { sin:['proteção','garantia','confiança','estabilidade','amparo'], def:'Estado de estar protegido de riscos, perigos ou danos.', ex:['A segurança dos hóspedes é prioridade.','Viaje com segurança e tranquilidade.','O hotel oferece segurança 24 horas.'] },
        'conforto':    { sin:['comodidade','bem-estar','luxo','facilidade','tranquilidade'], def:'Estado de bem-estar físico proporcionado por boas condições de vida ou acomodação.', ex:['O hotel oferece todo o conforto necessário.','Viaje com conforto e estilo.','O conforto dos assentos é excepcional.'] },
        'natureza':    { sin:['ambiente','meio','ecossistema','flora','fauna'], def:'Conjunto de fenômenos e seres do mundo físico não criados pelo homem.', ex:['A natureza da região é exuberante.','Preservar a natureza é nosso dever.','A viagem permitiu contato com a natureza.'] },
        'praia':       { sin:['litoral','beira-mar','costa','orla','areias'], def:'Faixa de areia à beira do mar, lago ou rio, propícia ao lazer.', ex:['A praia estava cheia de turistas.','Passamos as férias na praia.','A praia tem águas cristalinas.'] },
        'férias':      { sin:['recesso','folga','descanso','feriado','lazer'], def:'Período de descanso e lazer, afastado das obrigações de trabalho ou estudo.', ex:['As férias de verão são as mais esperadas.','Planejamos as férias com antecedência.','Nas férias, a família viaja junta.'] },
        'cultura':     { sin:['tradição','civilização','herança','costumes','saber'], def:'Conjunto de conhecimentos, artes, crenças e costumes de um povo ou grupo.', ex:['Conhecer a cultura local enriquece a viagem.','A cultura brasileira é diversa.','Respeitamos a cultura de cada destino.'] },
        'gastronomia': { sin:['culinária','cozinha','alimentação','sabores','iguarias'], def:'Arte e ciência de preparar e apreciar alimentos de qualidade.', ex:['A gastronomia local é imperdível.','A gastronomia francesa é mundialmente famosa.','Incluímos um tour gastronômico no pacote.'] },
        'avaliação':   { sin:['análise','nota','julgamento','crítica','parecer'], def:'Ato de julgar ou atribuir valor a algo com base em critérios estabelecidos.', ex:['A avaliação do hotel foi excelente.','Deixe sua avaliação após a viagem.','As avaliações ajudam outros viajantes.'] },
        'avaliações':  { sin:['análises','notas','julgamentos','críticas','opiniões'], def:'Plural de avaliação; opiniões e notas sobre produtos ou serviços.', ex:['As avaliações dos hóspedes são muito positivas.','Confira as avaliações antes de reservar.','As avaliações ajudam a escolher o melhor hotel.'] },
        'mensagem':    { sin:['comunicado','recado','nota','aviso','notificação'], def:'Informação transmitida de uma pessoa para outra por qualquer meio de comunicação.', ex:['Enviei uma mensagem para confirmar a reserva.','A mensagem foi respondida rapidamente.','Aguarde a mensagem de confirmação.'] },
        'foto':        { sin:['fotografia','imagem','retrato','registro','instantâneo'], def:'Imagem capturada por uma câmera ou dispositivo digital.', ex:['Tire uma foto para recordar a viagem.','A foto ficou perfeita.','Compartilhe suas fotos de viagem.'] },
        'contato':     { sin:['comunicação','ligação','acesso','relação','conexão'], def:'Ato de entrar em comunicação com alguém ou alguma empresa.', ex:['Entre em contato para mais informações.','O contato pelo chat é imediato.','Salve nosso contato no celular.'] },
        'suporte':     { sin:['apoio','auxílio','ajuda','assistência','atendimento'], def:'Serviço de apoio técnico ou atendimento oferecido a usuários.', ex:['O suporte está disponível 24 horas.','Acesse o suporte pelo chat.','O suporte resolveu o problema rapidamente.'] },
        'nome':        { sin:['denominação','título','alcunha','apelido','designação'], def:'Palavra usada para identificar ou diferenciar pessoas, lugares ou objetos.', ex:['Informe seu nome completo no cadastro.','O nome do hotel é famoso.','Escolha um nome de usuário.'] },
        'data':        { sin:['dia','prazo','período','momento','vencimento'], def:'Indicação do dia, mês e ano em que algo ocorre ou ocorreu.', ex:['Confirme a data da reserva.','A data de entrada é amanhã.','Escolha a data de viagem no calendário.'] },
        'endereço':    { sin:['localização','local','sede','domicílio','logradouro'], def:'Informação que indica a localização física de um imóvel ou empresa.', ex:['O endereço do hotel fica no centro.','Informe seu endereço para entrega.','O endereço está no mapa.'] },
        'acesso':      { sin:['entrada','login','ingresso','conexão','permissão'], def:'Ato ou possibilidade de entrar em um lugar ou sistema.', ex:['O acesso ao site é gratuito.','Recupere o acesso à sua conta.','O acesso ao quarto é pelo cartão.'] },
        'senha':       { sin:['código','chave','pin','credencial','autenticação'], def:'Sequência secreta de caracteres usada para autenticar o acesso a um sistema.', ex:['Crie uma senha forte para sua conta.','Esqueceu a senha? Clique aqui.','A senha deve ter pelo menos 8 caracteres.'] },
        'editar':      { sin:['modificar','alterar','corrigir','atualizar','revisar'], def:'Ato de fazer modificações em um conteúdo já existente.', ex:['Clique em editar para atualizar seus dados.','Você pode editar o perfil a qualquer momento.','Edite a reserva antes da confirmação.'] },
        'cancelar':    { sin:['anular','revogar','desfazer','suspender','encerrar'], def:'Ato de desfazer ou interromper algo previamente agendado ou confirmado.', ex:['Você pode cancelar a reserva sem custo.','Cancelar antes do prazo evita multa.','A companhia cancelou o voo.'] },
        'confirmar':   { sin:['validar','aprovar','ratificar','certificar','garantir'], def:'Ato de tornar algo certo ou definitivo, dando uma resposta positiva.', ex:['Confirme sua reserva por e-mail.','Por favor, confirme sua presença.','O pagamento confirmado libera o acesso.'] },
        'novo':        { sin:['recente','moderno','atual','inédito','fresco'], def:'Que existe há pouco tempo ou que acabou de ser criado ou adquirido.', ex:['Criamos um novo pacote de viagem.','O novo hotel abriu na semana passada.','Confira os novos destinos disponíveis.'] },
        'melhor':      { sin:['superior','ótimo','excelente','ideal','preferível'], def:'Que tem maior qualidade, valor ou eficiência em comparação a outros.', ex:['Encontre a melhor oferta de passagens.','O melhor hotel da cidade fica aqui.','Queremos oferecer a melhor experiência.'] },
        'especial':    { sin:['único','diferenciado','exclusivo','singular','distinto'], def:'Que tem características que o destacam dos demais; diferenciado.', ex:['Uma viagem especial para momentos únicos.','Preparamos um pacote especial de aniversário.','O atendimento especial faz a diferença.'] },
        'experiência': { sin:['vivência','prática','conhecimento','convivência','saber'], def:'Conhecimento adquirido por meio da prática ou de situações vividas.', ex:['A experiência da viagem foi transformadora.','Nossa experiência garante viagens perfeitas.','A experiência do guia é fundamental.'] },
        'transporte':  { sin:['condução','locomoção','veículo','deslocamento','mobilidade'], def:'Meio utilizado para mover pessoas ou objetos de um lugar para outro.', ex:['O transporte até o aeroporto está incluído.','Contratamos o transporte privativo.','O transporte público é eficiente na cidade.'] },
        'aeroporto':   { sin:['terminal','aeródromo','pista','hub','embarcadouro'], def:'Instalação onde ocorre o embarque e desembarque de passageiros em aeronaves.', ex:['O aeroporto fica a 30 minutos do hotel.','Chegamos ao aeroporto com antecedência.','O transfer do aeroporto está incluso.'] },
        'cidade':      { sin:['metrópole','município','urbe','localidade','capital'], def:'Área urbana densamente povoada, centro de atividades econômicas e culturais.', ex:['A cidade é famosa por seus monumentos.','Passeamos pela cidade histórica.','A cidade tem uma vida noturna intensa.'] },
        'país':        { sin:['nação','território','estado','pátria','república'], def:'Território delimitado por fronteiras com governo, leis e população próprios.', ex:['O país recebe milhões de turistas por ano.','Cada país tem sua própria cultura.','O país oferece paisagens deslumbrantes.'] },
        'internacional':{ sin:['mundial','global','estrangeiro','exterior','multinacional'], def:'Relativo a ou que envolve mais de um país.', ex:['Viagens internacionais requerem passaporte.','O pacote inclui destinos internacionais.','O aeroporto tem voos internacionais diários.'] },
        'nacional':    { sin:['doméstico','brasileiro','interno','local','regional'], def:'Relativo ao território de um país ou à sua população.', ex:['Turismo nacional valoriza o Brasil.','Os voos nacionais são mais acessíveis.','A gastronomia nacional é rica e variada.'] },
        'férias':      { sin:['recesso','folga','descanso','lazer','feriado'], def:'Período de descanso e recreação longe das atividades habituais.', ex:['Planejar as férias com antecedência economiza dinheiro.','As férias de julho são muito disputadas.','A família viajou nas férias de verão.'] },
        'ocupação':    { sin:['profissão','atividade','trabalho','função','cargo'], def:'Atividade, trabalho ou profissão a que uma pessoa se dedica regularmente.', ex:['A ocupação do hóspede é engenheiro.','Informe sua ocupação no cadastro.','A ocupação principal dela é o turismo.'] },
        'localização': { sin:['posição','lugar','endereço','coordenadas','ponto'], def:'Posição geográfica de um lugar ou objeto no espaço.', ex:['A localização do hotel é privilegiada.','Ative a localização para encontrar o destino.','A localização fica no coração da cidade.'] },
        'avião':       { sin:['aeronave','jato','voo','aparelho','aeroplano'], def:'Veículo de transporte aéreo movido por motores e asas fixas.', ex:['O avião decolou pontualmente.','Viajamos de avião até Lisboa.','O avião tem capacidade para 200 passageiros.'] },
        'voo':         { sin:['viagem aérea','trajeto','rota','vôo','deslocamento'], def:'Deslocamento realizado de avião entre dois pontos.', ex:['O voo durou 11 horas.','O voo direto é mais prático.','Comprei um voo com escala.'] },
        'pousada':     { sin:['hospedaria','albergue','chalé','estância','abrigo'], def:'Estabelecimento de hospedagem menor e mais intimista que um hotel.', ex:['A pousada tem vista para o mar.','Preferimos ficar numa pousada charmosa.','A pousada oferece café da manhã caseiro.'] },
        'resort':      { sin:['complexo','clube','spa','hotel','empreendimento'], def:'Complexo de hospedagem com ampla estrutura de lazer e entretenimento.', ex:['O resort tem três piscinas.','Passamos a lua de mel num resort luxuoso.','O resort inclui todas as refeições.'] },
        'prioridade':  { sin:['preferência','urgência','importância','precedência','relevância'], def:'Qualidade daquilo que deve ser tratado ou atendido primeiro.', ex:['Sua satisfação é nossa prioridade.','A segurança tem prioridade máxima.','O conforto do cliente é sempre a nossa prioridade.'] }
    };

    /* =========================================================
       SINÔNIMOS E SIGNIFICADOS — CLIQUE NA PALAVRA
    ========================================================= */
    var sinCard = null;

    function toggleSinonimos(v) {
        if (!sinCard) {
            sinCard = document.createElement('div');
            sinCard.id = 'acc-sin-card';
            sinCard.innerHTML =
                '<div class="acc-sin-header">'
                + '<button class="acc-sin-back" id="acc-sin-back">&#8592;</button>'
                + '<span class="acc-sin-title">Sinônimos e significados</span>'
                + '</div>'
                + '<div class="acc-sin-body" id="acc-sin-body">'
                + '<div class="acc-sin-placeholder">Clique em qualquer palavra na página para ver seus sinônimos e significados.</div>'
                + '</div>';
            BODY.appendChild(sinCard);

            document.getElementById('acc-sin-back').addEventListener('click', function() {
                sinCard.classList.remove('show');
                estado['sinonimos'] = 0;
                toggleSinonimos(0);
                var card = painel.querySelector('[data-id="sinonimos"]');
                if (card) { card.classList.remove('s1'); card.title = featMap['sinonimos'].estagios[0]; }
                salvarPrefs();
            });
        }

        if (v > 0) {
            sinCard.classList.add('show');
            BODY.classList.add('acc-sin-modo');
            document.addEventListener('mouseover', onSinHover);
            document.addEventListener('mouseout', onSinOut);
            document.addEventListener('click', onSinClick, true);
        } else {
            document.removeEventListener('mouseover', onSinHover);
            document.removeEventListener('mouseout', onSinOut);
            document.removeEventListener('click', onSinClick, true);
            BODY.classList.remove('acc-sin-modo');
            limparSinHover();
            sinCard.classList.remove('show');
        }
    }

    var lastHovered = null;

    function limparSinHover() {
        if (lastHovered) { lastHovered.classList.remove('acc-sin-hover'); lastHovered = null; }
        document.querySelectorAll('.acc-sin-hover').forEach(function(el){ el.classList.remove('acc-sin-hover'); });
    }

    var TAGS_TEXTO = ['P','SPAN','LI','A','H1','H2','H3','H4','H5','H6','TD','TH','LABEL','STRONG','EM','B','I','DIV'];

    function onSinHover(e) {
        if (sinCard && sinCard.contains(e.target)) return;
        if (painel && painel.contains(e.target)) return;
        limparSinHover();
        var el = e.target;
        if (TAGS_TEXTO.indexOf(el.tagName) !== -1 && el.textContent.trim().length > 0) {
            el.classList.add('acc-sin-hover');
            lastHovered = el;
        }
    }

    function onSinOut(e) {
        if (e.target && e.target.classList) e.target.classList.remove('acc-sin-hover');
    }

    function onSinClick(e) {
        /* Ignora cliques dentro do card e do painel */
        if (sinCard && sinCard.contains(e.target)) return;
        if (painel && painel.contains(e.target)) return;

        /* Pega a palavra sob o cursor a partir da posição do clique */
        var palavra = getPalavraDoClique(e);
        if (!palavra || palavra.length < 2) return;

        /* Previne comportamento padrão somente em links para não mudar de página */
        if (e.target.tagName === 'A') e.preventDefault();

        limparSinHover();
        buscarESinônimos(palavra);
    }

    function getPalavraDoClique(e) {
        /* Tenta usar caretRangeFromPoint para pegar a palavra exata clicada */
        var palavra = '';
        try {
            var range;
            if (document.caretRangeFromPoint) {
                range = document.caretRangeFromPoint(e.clientX, e.clientY);
            } else if (document.caretPositionFromPoint) {
                var pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); range.collapse(true); }
            }
            if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
                var txt = range.startContainer.textContent;
                var offset = range.startOffset;
                /* Expande para trás e pra frente até encontrar espaço ou pontuação */
                var inicio = offset;
                var fim = offset;
                while (inicio > 0 && /\w/u.test(txt[inicio - 1])) inicio--;
                while (fim < txt.length && /\w/u.test(txt[fim])) fim++;
                /* Para português: inclui letras acentuadas */
                inicio = offset;
                fim = offset;
                while (inicio > 0 && /[a-zA-ZÀ-ú]/.test(txt[inicio - 1])) inicio--;
                while (fim < txt.length && /[a-zA-ZÀ-ú]/.test(txt[fim])) fim++;
                palavra = txt.substring(inicio, fim).trim();
            }
        } catch(err) {}

        /* Fallback: pega texto do elemento */
        if (!palavra || palavra.length < 2) {
            var el = e.target;
            var raw = el.textContent || '';
            palavra = raw.trim().split(/[\s,.!?;:()\[\]"']+/)[0];
        }

        /* Remove pontuação das bordas */
        palavra = palavra.replace(/^[^a-zA-ZÀ-ú]+|[^a-zA-ZÀ-ú]+$/g, '');
        return palavra;
    }

    function buscarESinônimos(palavraOriginal) {
        var body = document.getElementById('acc-sin-body');
        if (!body) return;

        body.innerHTML = '<div class="acc-sin-loading">Buscando <em>' + escHtml(palavraOriginal) + '</em>...</div>';

        /* 1. Tenta dicionário embutido (normaliza: minúsculo, sem acento) */
        var chave = palavraOriginal.toLowerCase();
        var entrada = DICIONARIO_PT[chave];

        /* Tenta também sem acento */
        if (!entrada) {
            var semAcento = chave.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            Object.keys(DICIONARIO_PT).forEach(function(k) {
                if (!entrada && k.normalize('NFD').replace(/[\u0300-\u036f]/g,'') === semAcento) {
                    entrada = DICIONARIO_PT[k];
                }
            });
        }

        if (entrada) {
            renderSinonimos(palavraOriginal, { sin: entrada.sin, def: entrada.def, ex: entrada.ex });
            return;
        }

        /* 2. Fallback: usa API Claude para gerar via IA */
        buscarViaIA(palavraOriginal)
            .then(function(result) { renderSinonimos(palavraOriginal, result); })
            .catch(function() { renderSinonimos(palavraOriginal, null); });
    }

    function buscarViaIA(palavra) {
        return fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 400,
                messages: [{
                    role: 'user',
                    content: 'Para a palavra em português "' + palavra + '", responda APENAS em JSON válido (sem texto extra, sem markdown): {"sin":["sin1","sin2","sin3","sin4","sin5"],"def":"definição em português em 2 frases","ex":["exemplo 1 com a palavra","exemplo 2 com a palavra","exemplo 3 com a palavra"]}'
                }]
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var text = (data.content || []).map(function(b){ return b.text || ''; }).join('');
            var clean = text.replace(/```json|```/g,'').trim();
            var parsed = JSON.parse(clean);
            return { sin: parsed.sin || [], def: parsed.def || '', ex: parsed.ex || [] };
        });
    }

    function renderSinonimos(palavra, result) {
        var body = document.getElementById('acc-sin-body');
        if (!body) return;

        var sin = result && result.sin && result.sin.length ? result.sin : [];
        var def = result && result.def ? result.def : 'Significado não encontrado para "' + palavra + '".';
        var ex  = result && result.ex && result.ex.length ? result.ex : [
            'Utilizamos "' + palavra + '" em nosso dia a dia.',
            'A importância de "' + palavra + '" é amplamente reconhecida.',
            'Compreender "' + palavra + '" é fundamental para o crescimento.'
        ];

        var html = '<div class="acc-sin-palavra">Palavra selecionada: <strong>' + escHtml(palavra) + '!</strong></div>'
            + '<div class="acc-sin-secao"><strong>Sinônimos</strong></div>'
            + '<div class="acc-sin-lista">' + (sin.length ? sin.map(escHtml).join(' | ') : 'Não encontrado') + '</div>'
            + '<div class="acc-sin-secao"><strong>Significado</strong></div>'
            + '<div class="acc-sin-def">' + escHtml(def) + '</div>'
            + '<div class="acc-sin-secao"><strong>Exemplos de uso</strong></div>'
            + '<ol class="acc-sin-exemplos">';
        ex.forEach(function(e2) {
            html += '<li>"' + escHtml(e2) + '"</li>';
        });
        html += '</ol>';
        body.innerHTML = html;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
    }

    /* =========================================================
       LEITOR DE SITES (Web Speech API)
    ========================================================= */
    var leitorAtivo = false;
    var leitorUtterance = null;

    function buildLeitorBar() {
        var bar = document.createElement('div');
        bar.id = 'acc-leitor-bar';
        bar.innerHTML = '<button id="acc-ler-pausar">⏸ Pausar</button>'
            + '<button id="acc-ler-parar">⏹ Parar</button>'
            + '<span id="acc-ler-status">Lendo página...</span>';
        return bar;
    }

    function toggleLeitor(v) {
        if (!window.speechSynthesis) return;
        if (v === 0) {
            window.speechSynthesis.cancel();
            leitorAtivo = false;
            leitorBar.classList.remove('show');
            return;
        }
        var texto = conteudo ? conteudo.innerText : document.body.innerText;
        texto = texto.replace(/\s+/g, ' ').trim().substring(0, 4000);
        leitorUtterance = new SpeechSynthesisUtterance(texto);
        leitorUtterance.lang = 'pt-BR';
        leitorUtterance.rate = 0.95;
        leitorUtterance.onend = function() {
            leitorBar.classList.remove('show');
            leitorAtivo = false;
            estado['leitor'] = 0;
            var card = painel.querySelector('[data-id="leitor"]');
            if (card) { card.classList.remove('s1'); card.title = featMap['leitor'].estagios[0]; }
            salvarPrefs();
        };
        window.speechSynthesis.speak(leitorUtterance);
        leitorAtivo = true;
        leitorBar.classList.add('show');

        document.getElementById('acc-ler-pausar').onclick = function() {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                this.textContent = '⏸ Pausar';
            } else {
                window.speechSynthesis.pause();
                this.textContent = '▶ Retomar';
            }
        };
        document.getElementById('acc-ler-parar').onclick = function() {
            window.speechSynthesis.cancel();
            leitorBar.classList.remove('show');
            leitorAtivo = false;
            estado['leitor'] = 0;
            var card = painel.querySelector('[data-id="leitor"]');
            if (card) { card.classList.remove('s1'); card.title = featMap['leitor'].estagios[0]; }
            salvarPrefs();
        };
    }

    /* =========================================================
       LUPA DE CONTEÚDO
    ========================================================= */
    function toggleLupa(v) {
        if (v === 0) {
            lupaEl.classList.remove('show');
            document.removeEventListener('mousemove', onLupaMove);
            return;
        }
        document.addEventListener('mousemove', onLupaMove);
    }

    function onLupaMove(e) {
        var el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || el === lupaEl || lupaEl.contains(el)) return;
        var txt = el.textContent ? el.textContent.trim().substring(0, 120) : '';
        if (!txt || txt.length < 2) { lupaEl.classList.remove('show'); return; }
        lupaEl.textContent = txt;
        lupaEl.style.left = Math.min(e.clientX + 16, window.innerWidth - 240) + 'px';
        lupaEl.style.top  = (e.clientY + 16) + 'px';
        lupaEl.classList.add('show');
    }

    /* =========================================================
       MÁSCARA E GUIA
    ========================================================= */
    document.addEventListener('mousemove', function(e) {
        if (BODY.classList.contains('acc-mascara')) {
            var h = 80;
            maskTop.style.top    = '0';
            maskTop.style.height = Math.max(0, e.clientY - h/2) + 'px';
            maskBot.style.top    = (e.clientY + h/2) + 'px';
            maskBot.style.height = window.innerHeight + 'px';
        }
        if (BODY.classList.contains('acc-guia')) {
            guiaLine.style.top = e.clientY + 'px';
        }
    });

    /* =========================================================
       PERSISTÊNCIA — localStorage
    ========================================================= */
    function salvarPrefs() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); } catch(e) {}
    }

    function carregarPrefs() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            var prefs = JSON.parse(saved);
            Object.keys(prefs).forEach(function(id) {
                if (estado.hasOwnProperty(id) && prefs[id] > 0) {
                    estado[id] = prefs[id];
                }
            });
        } catch(e) {}
    }

    function aplicarTodasPrefs() {
        secoes.forEach(function(s) {
            s.cards.forEach(function(c) {
                if (estado[c.id] > 0) c.aplicar(estado[c.id]);
            });
        });
    }

    aplicarTodasPrefs();

})();