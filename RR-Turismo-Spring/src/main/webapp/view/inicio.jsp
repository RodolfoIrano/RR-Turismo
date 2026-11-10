<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página inicial PÚBLICA do site (visitante e viajante). Guia/empresa veem a
  home do painel (inicioPainel.jsp). De cima para baixo:
    1) BANNER GRANDE que passa as viagens em destaque, com a busca (e
       botão de microfone) por cima;
    2) três frases de confiança;
    3) catálogo: filtro por categoria, botão grade/lista e os cartões.
  Os dados vêm do InicioController (viagens, destaques, categorias).

  ✏️ ONDE MUDAR O QUÊ:
    - Slides de reserva (quando há poucas viagens) ... blocos "faltam" abaixo
    - Fotos desses slides ........................... endereços unsplash.com
    - Frases de confiança ........................... <section class="confianca">
    - Visual (tamanhos, cores) ...................... css/site.css e catalogo.css
--%>

<div class="catalogo">

    <%-- ===== BANNER GRANDE ===== --%>
    <c:set var="faltam" value="${3 - destaques.size()}" />
    <section class="banner" id="banner" aria-label="Viagens em destaque">
        <div class="banner-slides">

            <%-- Viagens reais (as mais recentes com foto) --%>
            <c:forEach var="d" items="${destaques}">
                <a class="banner-slide" href="/viagens/${d.id}">
                    <img src="${d.capa}?w=1600" alt="" fetchpriority="low">
                    <div class="banner-texto">
                        <span class="banner-etiqueta">Em destaque<c:if test="${not empty d.categoria}"> · <c:out value="${d.categoria}" /></c:if></span>
                        <h2><c:out value="${d.titulo}" /></h2>
                        <p><span aria-hidden="true">&#9679;</span> <c:out value="${d.local}" /> &nbsp;·&nbsp; <c:out value="${d.periodo}" /></p>
                        <span class="banner-cta">Ver viagem por <strong><c:out value="${d.preco}" /></strong> &rarr;</span>
                    </div>
                </a>
            </c:forEach>

            <%-- Slides de reserva: completam o banner enquanto há poucas viagens --%>
            <c:if test="${faltam >= 1}">
                <a class="banner-slide" href="#viagens">
                    <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80" alt="">
                    <div class="banner-texto">
                        <span class="banner-etiqueta">RR Turismo</span>
                        <h2>Descubra, planeje e explore destinos incríveis</h2>
                        <p>Viagens e excursões criadas por guias e agências de verdade.</p>
                        <span class="banner-cta">Explorar viagens &rarr;</span>
                    </div>
                </a>
            </c:if>
            <c:if test="${faltam >= 2}">
                <a class="banner-slide" href="/inicio?q=praia#viagens">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80" alt="">
                    <div class="banner-texto">
                        <span class="banner-etiqueta">Descanso</span>
                        <h2>Praias para respirar fundo</h2>
                        <p>Encontre roteiros de mar, sol e tranquilidade.</p>
                        <span class="banner-cta">Buscar praias &rarr;</span>
                    </div>
                </a>
            </c:if>
            <c:if test="${faltam >= 3}">
                <a class="banner-slide" href="/inicio?q=aventura#viagens">
                    <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80" alt="">
                    <div class="banner-texto">
                        <span class="banner-etiqueta">Aventura</span>
                        <h2>Montanhas, trilhas e muita natureza</h2>
                        <p>Saia da rotina com quem conhece o caminho.</p>
                        <span class="banner-cta">Buscar aventuras &rarr;</span>
                    </div>
                </a>
            </c:if>
        </div>

        <button type="button" class="banner-seta ant" aria-label="Slide anterior">&#8249;</button>
        <button type="button" class="banner-seta prox" aria-label="Próximo slide">&#8250;</button>

        <%-- Busca por cima do banner (igual ao app) --%>
        <form class="banner-busca" method="get" action="/inicio#viagens" role="search">
            <span class="banner-busca-lupa" aria-hidden="true">&#128269;</span>
            <input id="campoBusca" type="search" name="q" value="<c:out value='${busca}' />"
                   placeholder="Para onde você quer ir?" aria-label="Buscar viagens por destino, cidade ou tipo">
            <c:if test="${not empty categoriaSelecionada}">
                <input type="hidden" name="categoria" value="<c:out value='${categoriaSelecionada}' />">
            </c:if>
            <button type="button" id="botaoVoz" class="banner-busca-voz" aria-label="Buscar falando" title="Buscar falando" hidden>&#127908;</button>
            <button type="submit" class="banner-busca-ok">Buscar</button>
        </form>

        <div class="banner-pontos" aria-label="Escolher slide">
            <c:forEach begin="1" end="${destaques.size() + (faltam > 0 ? faltam : 0)}" var="n">
                <button type="button" aria-label="Slide ${n}"></button>
            </c:forEach>
        </div>
    </section>

    <%-- ===== FRASES DE CONFIANÇA ===== --%>
    <section class="confianca">
        <div><b>&#128205;</b><span><strong>Roteiros de verdade</strong>Criados por guias e agências de turismo.</span></div>
        <div><b>&#128506;</b><span><strong>Tudo antes de ir</strong>Fotos, mapa, datas, vagas e o guia responsável.</span></div>
        <div><b>&#128241;</b><span><strong>Site + aplicativo</strong>A mesma conta nos dois, com a viagem ao vivo.</span></div>
    </section>

    <%-- ===== CATÁLOGO ===== --%>
    <section class="catalogo-topo" id="viagens">
        <div class="catalogo-titulo-linha">
            <div>
                <span class="catalogo-etiqueta">Viagens</span>
                <h1>Descubra sua próxima viagem</h1>
            </div>
            <div class="alternar-visao" role="group" aria-label="Modo de exibição">
                <button type="button" id="visaoGrade" class="ativo" aria-label="Ver em grade" title="Grade">&#9638;</button>
                <button type="button" id="visaoLista" aria-label="Ver em lista" title="Lista">&#9776;</button>
            </div>
        </div>

        <c:if test="${not empty categorias}">
            <nav class="catalogo-categorias" aria-label="Categorias">
                <a href="/inicio<c:if test='${not empty busca}'>?q=<c:out value='${busca}' /></c:if>#viagens"
                   class="${empty categoriaSelecionada ? 'ativa' : ''}">Todas</a>
                <c:forEach var="cat" items="${categorias}">
                    <a href="/inicio?categoria=<c:out value='${cat}' /><c:if test='${not empty busca}'>&q=<c:out value='${busca}' /></c:if>#viagens"
                       class="${cat == categoriaSelecionada ? 'ativa' : ''}"><c:out value="${cat}" /></a>
                </c:forEach>
            </nav>
        </c:if>
    </section>

    <c:choose>
        <c:when test="${empty viagens}">
            <div class="catalogo-vazio">
                <h3>Nenhuma viagem encontrada</h3>
                <p>Tente buscar por outro destino ou limpe os filtros.</p>
                <a class="botao-catalogo" href="/inicio#viagens">Ver todas as viagens</a>
            </div>
        </c:when>
        <c:otherwise>
            <p class="catalogo-contagem">
                <c:out value="${viagens.size()}" />
                <c:choose><c:when test="${viagens.size() == 1}">viagem encontrada</c:when><c:otherwise>viagens encontradas</c:otherwise></c:choose>
            </p>

            <div class="catalogo-grade" id="catalogoGrade">
                <c:forEach var="v" items="${viagens}">
                    <%@ include file="cartaoViagem.jspf" %>
                </c:forEach>
            </div>
        </c:otherwise>
    </c:choose>
</div>
