<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
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
</head>

<body>

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
    <div class="dashboard">

        <!-- ==================== SIDEBAR ==================== -->
        <aside class="barra-lateral">
            <div>
                <div class="logo">
                    <img src="/imagens/logo_branca.png" alt="RR Turismo">
                </div>

                <nav class="menu" id="menuLateral">
                    <a href="/inicio"       data-path="/inicio"       data-extra-path="/">Inicio</a>
                    <a href="/criarviagem"  data-path="/criarviagem"  data-extra-path="/cadastrarviagem">Criar nova viagem</a>
                    <a href="/editarviagem" data-path="/editarviagem">Editar viagem</a>
                    <a href="/reservas"     data-path="/reservas">Reservas</a>
                </nav>
            </div>

            <div class="sidebar-footer">
                © 2026 RR Turismo<br>
                Todos os direitos reservados
            </div>
        </aside>

        <!-- ==================== CONTEÚDO ==================== -->
        <main class="conteudo">

            <!-- TOPO COM PERFIL DO USUÁRIO -->
            <div class="topo-global">
                <div class="topo-esquerda">

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
                        <img class="user-avatar-mini"
                             src="/perfil/foto"
                             alt=""
                             onerror="this.src='/imagens/user-placeholder.svg'">
                        <span class="user-name">
                            <c:out value="${empty sessionScope.usuarioLogado.nome
                                           ? sessionScope.usuarioLogado.email
                                           : sessionScope.usuarioLogado.nome}" />
                        </span>
                        <span class="user-chevron" aria-hidden="true">&#9662;</span>
                    </button>

                    <!-- DROPDOWN -->
                    <div class="perfil-dropdown" id="dropdownPerfil">
                        <a href="/perfil">
                            <span class="dropdown-icone" aria-hidden="true">&#128100;</span>
                            Ver Perfil
                        </a>
                        <a href="/editarperfil">
                            <span class="dropdown-icone" aria-hidden="true">&#9998;</span>
                            Editar Perfil
                        </a>
                        <a href="/sair" class="dropdown-sair">
                            <span class="dropdown-icone" aria-hidden="true">&#8594;</span>
                            Sair
                        </a>
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
            document.querySelectorAll("#menuLateral a").forEach((link) => {
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
