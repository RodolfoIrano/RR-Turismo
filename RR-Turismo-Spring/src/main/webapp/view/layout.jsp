<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  É a "moldura" de TODAS as páginas do site (cada página é encaixada em
  ${pagina}). Ele tem DOIS visuais:

    1) MODO SITE (visitante e viajante, quem só quer comprar viagem):
       menu no topo + rodapé, sem painel lateral.
    2) MODO PAINEL (quem entrou como GUIA ou EMPRESA):
       dashboard com menu lateral para criar/editar viagens e ver reservas.

  ✏️ ONDE MUDAR O QUÊ:
    - Quem vê o painel lateral ............ variável "painel" logo abaixo
    - Links do menu de cima (modo site) ... <nav id="siteNav">
    - Links do menu lateral (modo painel) . <nav id="menuLateral">
    - Colunas do rodapé ................... <footer class="site-rodape">
    - Cores/tamanhos do topo e rodapé ..... css/site.css
    - Chat flutuante (bolinha) ............ view/chatFlutuante.jsp + js/chatSite.js
--%>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <title>RR Turismo</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/variaveis.css">
    <link rel="stylesheet" href="/css/acessibilidade.css">
    <link rel="stylesheet" href="/css/padrao.css?v=8">
    <link rel="stylesheet" href="/css/perfil.css?v=2">
    <c:if test="${pagina == 'editarPerfil.jsp'}">
        <link rel="stylesheet" href="/css/editarPerfil.css?v=2">
    </c:if>
    <c:if test="${pagina == 'perfilPublico.jsp'}">
        <link rel="stylesheet" href="/css/perfilPublico.css?v=2">
    </c:if>
    <link rel="stylesheet" href="/css/inicio.css">
    <link rel="stylesheet" href="/css/criarViagem.css?v=3">
    <link rel="stylesheet" href="/css/editarViagem.css">
    <%-- catalogo.css fica por último para não ser sobrescrito pelos estilos das outras páginas --%>
    <link rel="stylesheet" href="/css/catalogo.css?v=7">
    <%-- site.css: topo, rodapé, banner, chat e responsivo (também usado no painel) --%>
    <link rel="stylesheet" href="/css/site.css?v=8">
    <link rel="icon" href="/imagens/logo_preta.png">
</head>

<%-- "painel" = verdadeiro só para GUIA ou EMPRESA logados (dashboard lateral) --%>
<c:set var="painel" value="${not empty sessionScope.usuarioLogado and (sessionScope.usuarioLogado.guia or sessionScope.usuarioLogado.empresa)}" />
<c:set var="logado" value="${not empty sessionScope.usuarioLogado}" />
<c:set var="nomeUsuario" value="${empty sessionScope.usuarioLogado.nome ? sessionScope.usuarioLogado.email : sessionScope.usuarioLogado.nome}" />

<body class="${painel ? 'modo-painel' : 'modo-site'}" data-conta="${logado ? sessionScope.usuarioLogado.id : ''}">

<!-- SVG FILTROS DALTONISMO (invisível) -->
<svg id="acc-svg-filtros" xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <filter id="acc-deuteranopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="
        0.367 0.861 -0.228 0 0
        0.280 0.673  0.047 0 0
       -0.012 0.043  0.969 0 0
        0     0      0     1 0"/>
    </filter>
    <filter id="acc-protanopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="
        0.152 1.053 -0.205 0 0
        0.115 0.786  0.099 0 0
       -0.004 -0.048 1.052 0 0
        0      0     0     1 0"/>
    </filter>
    <filter id="acc-tritanopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="
        1.256 -0.077 -0.179 0 0
       -0.078  0.931  0.148 0 0
        0.005  0.691  0.304 0 0
        0      0      0     1 0"/>
    </filter>
  </defs>
</svg>
<c:choose>
<c:when test="${painel}">
    <%-- ################ MODO PAINEL (guia / empresa) ################ --%>
    <div class="dashboard">

        <!-- ==================== SIDEBAR ==================== -->
        <aside class="barra-lateral" id="barraLateral">
            <div>
                <div class="logo">
                    <a href="/inicio"><img src="/imagens/logo_branca_recortada.png" alt="RR Turismo"></a>
                </div>

                <nav class="menu" id="menuLateral">
                    <a href="/inicio" data-path="/inicio" data-extra-path="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>Início</a>

                    <%-- "Minhas viagens" abre uma gaveta com as duas opções --%>
                    <div class="menu-grupo" id="grupoViagens">
                        <button type="button" class="menu-grupo-btn" aria-expanded="false" aria-controls="gavetaViagens">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>Minhas viagens<span class="menu-seta" aria-hidden="true"></span>
                        </button>
                        <div class="menu-gaveta" id="gavetaViagens">
                            <div>
                                <a href="/criarviagem"  data-path="/criarviagem" data-extra-path="/cadastrarviagem">Criar viagem</a>
                                <a href="/editarviagem" data-path="/editarviagem">Editar viagens</a>
                            </div>
                        </div>
                    </div>

                    <a href="/favoritos"    data-path="/favoritos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8 3 4.5 6.5 4.5c2 0 3.5 1.1 5.5 3 2-1.9 3.5-3 5.5-3C21 4.5 23 8 21.5 11.8 19.5 16.4 12 21 12 21z"/></svg>Favoritos</a>
                    <a href="/sobre-nos"    data-path="/sobre-nos"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>Sobre nós</a>
                    <a href="/fale-conosco" data-path="/fale-conosco"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z"/></svg>Fale conosco</a>
                </nav>
            </div>

            <div class="sidebar-footer">
                © 2026 RR Turismo<br>
                Todos os direitos reservados
            </div>
        </aside>
        <div class="painel-fundo" id="painelFundo"></div>

        <!-- ==================== CONTEÚDO ==================== -->
        <main class="conteudo">

            <!-- TOPO COM PERFIL DO USUÁRIO -->
            <div class="topo-global">
                <div class="topo-esquerda">
                    <%-- Botão do menu lateral (só aparece no celular) --%>
                    <button class="painel-burger" id="painelBurger" type="button" aria-label="Abrir menu" aria-controls="barraLateral" aria-expanded="false">&#9776;</button>

                    <!-- Botão de idiomas no topo -->
                    <button class="lang-trigger" id="langTrigger" type="button" aria-expanded="false"
                        aria-controls="langModal" onclick="LangSelector.open()">
                        <span class="globe-icon" aria-hidden="true">&#127760;</span>
                        <span id="current-lang-flag">BR</span>
                        <span id="current-lang-label">Portugu&ecirc;s (BR)</span>
                        <svg class="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>

                <div class="user-area">
                    <button class="user-btn" id="userBtn" type="button" aria-expanded="false">
                        <img class="user-avatar-mini" src="/perfil/foto" alt=""
                             onerror="this.src='/imagens/user-placeholder.svg'">
                        <span class="user-name"><c:out value="${nomeUsuario}" /></span>
                        <span class="user-chevron" aria-hidden="true">&#9662;</span>
                    </button>

                    <!-- DROPDOWN -->
                    <div class="perfil-dropdown" id="dropdownPerfil">
                        <a href="/perfil"><span class="dropdown-icone" aria-hidden="true">&#128100;</span>Ver Perfil</a>
                        <a href="/editarperfil"><span class="dropdown-icone" aria-hidden="true">&#9998;</span>Editar Perfil</a>
                        <a href="/sair" class="dropdown-sair"><span class="dropdown-icone" aria-hidden="true">&#8594;</span>Sair</a>
                    </div>
                </div>
            </div>

            <!-- MENSAGENS DE FEEDBACK -->
            <c:if test="${not empty mensagemErro}">
                <div class="toast-erro">${mensagemErro}</div>
            </c:if>
            <c:if test="${not empty mensagemSucesso}">
                <div class="toast-sucesso">${mensagemSucesso}</div>
            </c:if>

            <!-- CONTEÚDO DINÂMICO DA PÁGINA -->
            <jsp:include page="${pagina}" />

        </main>
    </div>
</c:when>

<c:otherwise>
    <%-- ################ MODO SITE (visitante / viajante) ################ --%>
    <header class="site-header">
        <div class="site-header-in">
            <a class="site-logo" href="/inicio"><img src="/imagens/logo_branca_recortada.png" alt="RR Turismo"></a>

            <button class="site-burger" id="siteBurger" type="button" aria-label="Abrir menu"
                    aria-controls="siteMenu" aria-expanded="false">&#9776;</button>

            <div class="site-menu" id="siteMenu">
                <nav class="site-nav" id="siteNav" aria-label="Menu principal">
                    <a href="/inicio"       data-path="/inicio" data-extra-path="/">Início</a>
                    <a href="/favoritos"    data-path="/favoritos">&#9829; Favoritos</a>
                    <a href="/sobre-nos"    data-path="/sobre-nos">Sobre nós</a>
                    <a href="/fale-conosco" data-path="/fale-conosco">Fale conosco</a>
                    <c:if test="${logado}">
                        <a href="/editarperfil" data-path="/editarperfil">Configurações</a>
                    </c:if>
                </nav>

                <div class="site-acoes">
                    <button class="lang-trigger" id="langTrigger" type="button" aria-expanded="false"
                        aria-controls="langModal" onclick="LangSelector.open()">
                        <span class="globe-icon" aria-hidden="true">&#127760;</span>
                        <span id="current-lang-flag">BR</span>
                        <span id="current-lang-label">Portugu&ecirc;s (BR)</span>
                        <svg class="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    <c:choose>
                        <c:when test="${logado}">
                            <div class="user-area">
                                <button class="user-btn" id="userBtn" type="button" aria-expanded="false">
                                    <img class="user-avatar-mini" src="/perfil/foto" alt=""
                                         onerror="this.src='/imagens/user-placeholder.svg'">
                                    <span class="user-name"><c:out value="${nomeUsuario}" /></span>
                                    <span class="user-chevron" aria-hidden="true">&#9662;</span>
                                </button>
                                <div class="perfil-dropdown" id="dropdownPerfil">
                                    <a href="/perfil"><span class="dropdown-icone" aria-hidden="true">&#128100;</span>Ver Perfil</a>
                                    <a href="/editarperfil"><span class="dropdown-icone" aria-hidden="true">&#9881;</span>Configurações</a>
                                    <a href="/favoritos"><span class="dropdown-icone" aria-hidden="true">&#9829;</span>Favoritos</a>
                                    <a href="/sair" class="dropdown-sair"><span class="dropdown-icone" aria-hidden="true">&#8594;</span>Sair</a>
                                </div>
                            </div>
                        </c:when>
                        <c:otherwise>
                            <a class="site-btn-claro" href="/entrar">Entrar</a>
                            <a class="site-btn-destaque" href="/cadastro">Criar conta</a>
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </div>
    </header>

    <main class="conteudo site-conteudo">
        <!-- MENSAGENS DE FEEDBACK -->
        <c:if test="${not empty mensagemErro}">
            <div class="toast-erro">${mensagemErro}</div>
        </c:if>
        <c:if test="${not empty mensagemSucesso}">
            <div class="toast-sucesso">${mensagemSucesso}</div>
        </c:if>

        <!-- CONTEÚDO DINÂMICO DA PÁGINA -->
        <jsp:include page="${pagina}" />
    </main>

    <%-- Faixa de convite (só para quem ainda não é guia/empresa) --%>
    <section class="rodape-convite">
        <div class="rodape-convite-in">
            <div>
                <strong>Tem uma viagem ou excursão para divulgar?</strong>
                <span>Crie sua conta de guia ou empresa e apareça para quem quer viajar.</span>
            </div>
            <a class="site-btn-destaque" href="/cadastro">Anunciar minha viagem</a>
        </div>
    </section>

    <jsp:include page="rodape.jsp" />
</c:otherwise>
</c:choose>

    <%-- Bolinha de ajuda (chat) - aparece em todas as páginas, nos dois modos --%>
    <jsp:include page="chatFlutuante.jsp" />

    <!-- ==================== ACESSIBILIDADE ==================== -->
    <!-- Botão pequeno que expande no hover -->
    <button id="acc-toggle-btn" aria-label="Recursos Assistivos" title="Recursos Assistivos">
        <span class="acc-icon-wrap">♿</span>
        <span class="acc-btn-label">Recursos Assistivos</span>
    </button>

    <!-- VLibras oficial -->
    <div vw class="enabled">
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
            <div class="vw-plugin-top-wrapper"></div>
        </div>
    </div>

    <!-- Google Translate -->
    <div id="google_translate_element" style="display: none;"></div>

    <!-- Modal de idiomas -->
    <div class="lang-overlay" id="langOverlay" onclick="LangSelector.close()"></div>

    <div class="lang-modal" id="langModal" role="dialog" aria-label="Selecione um idioma" aria-modal="true">
        <div class="modal-header">
            <div class="modal-title">
                Selecionar Idioma
                <span id="langCount">0 idiomas</span>
            </div>
            <button class="modal-close" type="button" onclick="LangSelector.close()" aria-label="Fechar">&#10005;</button>
        </div>
        <div class="search-wrap">
            <span class="search-icon" aria-hidden="true">&#128269;</span>
            <input class="search-input" id="langSearch" type="text" placeholder="Pesquisar idioma ou pa&iacute;s..."
                autocomplete="off" oninput="LangSelector.filter(this.value)" />
        </div>
        <div class="region-tabs" id="regionTabs"></div>
        <div class="lang-list-wrap">
            <div class="lang-grid" id="langGrid"></div>
        </div>
        <div class="modal-footer">
            <span class="footer-info">
                Idioma atual: <strong id="footerCurrent">Portugu&ecirc;s (BR)</strong>
            </span>
            <button class="btn-reset" type="button" onclick="LangSelector.reset()">Redefinir</button>
        </div>
    </div>

    <!-- ==================== SCRIPTS ==================== -->

    <!-- Marca link ativo no menu lateral -->
    <script>
        (function () {
            const caminhoAtual = window.location.pathname;
            document.querySelectorAll("#menuLateral a, #siteNav a").forEach((link) => {
                link.classList.remove("ativo");
                const caminhoPrincipal = link.dataset.path;
                const caminhoExtra     = link.dataset.extraPath;
                if (caminhoAtual === caminhoPrincipal
                    || (caminhoExtra && caminhoAtual === caminhoExtra)
                    || caminhoAtual.startsWith(caminhoPrincipal + "/")) {
                    link.classList.add("ativo");
                }
            });
        })();
    </script>

    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>

    <script src="/js/padrao.js?v=4" charset="UTF-8"></script>
    <script src="/js/perfil.js?v=2" charset="UTF-8"></script>
    <script src="/js/site.js?v=2" charset="UTF-8"></script>
    <script src="/js/chatSite.js?v=1" charset="UTF-8"></script>

    <c:if test="${pagina == 'editarPerfil.jsp'}">
        <script src="/js/editarPerfil.js?v=2" charset="UTF-8"></script>
    </c:if>
    <c:if test="${pagina == 'perfilPublico.jsp'}">
        <script src="/js/perfilPublico.js?v=2" charset="UTF-8"></script>
    </c:if>

    <script type="text/javascript"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    <script src="/js/criarViagem.js?v=10"></script>
    <script src="/js/editarViagem.js"></script>
    <script src="/js/acessibilidade.js?v=10"></script>

    <!-- VLibras plugin oficial -->
    <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
    <script>
        new window.VLibras.Widget('https://vlibras.gov.br/app');
    </script>

</body>
</html>
