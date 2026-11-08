<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página inicial PÚBLICA: catálogo de viagens (igual ao app) com busca e
  filtro por categoria. Quem está logado como GUIA vê também uma faixa
  com atalhos (criar viagem, editar viagens, reservas).
  Os dados vêm do InicioController.
--%>

<div class="catalogo">

    <%-- ===== FAIXA DO GUIA (só aparece para guias logados) ===== --%>
    <c:if test="${not empty sessionScope.usuarioLogado and sessionScope.usuarioLogado.guia}">
        <section class="painel-guia">
            <div>
                <span class="painel-guia-etiqueta">Painel do guia</span>
                <h2>Olá, <c:out value="${empty sessionScope.usuarioLogado.nome ? sessionScope.usuarioLogado.email : sessionScope.usuarioLogado.nome}" />!</h2>
                <p>
                    <c:choose>
                        <c:when test="${minhasViagens == 1}">Você tem 1 viagem publicada.</c:when>
                        <c:otherwise>Você tem <c:out value="${minhasViagens}" /> viagens publicadas.</c:otherwise>
                    </c:choose>
                </p>
            </div>
            <div class="painel-guia-acoes">
                <a class="botao-catalogo" href="/criarviagem">+ Criar nova viagem</a>
                <a class="botao-catalogo botao-catalogo-claro" href="/editarviagem">Editar minhas viagens</a>
                <a class="botao-catalogo botao-catalogo-claro" href="/reservas">Reservas</a>
            </div>
        </section>
    </c:if>

    <%-- ===== TOPO + BUSCA ===== --%>
    <section class="catalogo-topo">
        <span class="catalogo-etiqueta">Viagens</span>
        <h1>Descubra sua próxima viagem</h1>
        <p>Roteiros cadastrados pelos nossos guias. Reserve pelo aplicativo RR Turismo.</p>

        <form class="catalogo-busca" method="get" action="/inicio">
            <input type="search" name="q" value="<c:out value='${busca}' />"
                   placeholder="Buscar por destino, cidade ou tipo de viagem" aria-label="Buscar viagens">
            <c:if test="${not empty categoriaSelecionada}">
                <input type="hidden" name="categoria" value="<c:out value='${categoriaSelecionada}' />">
            </c:if>
            <button type="submit">Buscar</button>
        </form>

        <c:if test="${not empty categorias}">
            <nav class="catalogo-categorias" aria-label="Categorias">
                <a href="/inicio<c:if test='${not empty busca}'>?q=<c:out value='${busca}' /></c:if>"
                   class="${empty categoriaSelecionada ? 'ativa' : ''}">Todas</a>
                <c:forEach var="cat" items="${categorias}">
                    <a href="/inicio?categoria=<c:out value='${cat}' /><c:if test='${not empty busca}'>&q=<c:out value='${busca}' /></c:if>"
                       class="${cat == categoriaSelecionada ? 'ativa' : ''}"><c:out value="${cat}" /></a>
                </c:forEach>
            </nav>
        </c:if>
    </section>

    <%-- ===== GRADE DE VIAGENS ===== --%>
    <c:choose>
        <c:when test="${empty viagens}">
            <div class="catalogo-vazio">
                <h3>Nenhuma viagem encontrada</h3>
                <p>Tente buscar por outro destino ou limpe os filtros.</p>
                <a class="botao-catalogo" href="/inicio">Ver todas as viagens</a>
            </div>
        </c:when>
        <c:otherwise>
            <p class="catalogo-contagem">
                <c:out value="${viagens.size()}" />
                <c:choose><c:when test="${viagens.size() == 1}">viagem encontrada</c:when><c:otherwise>viagens encontradas</c:otherwise></c:choose>
            </p>

            <div class="catalogo-grade">
                <c:forEach var="v" items="${viagens}">
                    <a class="viagem-card" href="/viagens/${v.id}">
                        <div class="viagem-card-foto">
                            <c:choose>
                                <c:when test="${not empty v.capa}">
                                    <img src="${v.capa}?w=700" alt="<c:out value='${v.titulo}' />" loading="lazy"
                                         onerror="this.remove()">
                                </c:when>
                            </c:choose>
                            <c:if test="${not empty v.categoria}">
                                <span class="viagem-card-categoria"><c:out value="${v.categoria}" /></span>
                            </c:if>
                            <c:if test="${v.esgotada}">
                                <span class="viagem-card-esgotada">Esgotada</span>
                            </c:if>
                        </div>
                        <div class="viagem-card-corpo">
                            <h3><c:out value="${v.titulo}" /></h3>
                            <p class="viagem-card-local"><c:out value="${v.local}" /></p>
                            <p class="viagem-card-data"><c:out value="${v.periodo}" /></p>
                            <div class="viagem-card-rodape">
                                <strong><c:out value="${v.preco}" /></strong>
                                <span>
                                    <c:choose>
                                        <c:when test="${v.esgotada}">Sem vagas</c:when>
                                        <c:otherwise><c:out value="${v.vagas}" /> vagas</c:otherwise>
                                    </c:choose>
                                </span>
                            </div>
                        </div>
                    </a>
                </c:forEach>
            </div>
        </c:otherwise>
    </c:choose>

    <%-- Visitante (sem login): convite para entrar --%>
    <c:if test="${empty sessionScope.usuarioLogado}">
        <section class="catalogo-convite">
            <div>
                <h3>É guia ou agência de turismo?</h3>
                <p>Entre na sua conta para criar e gerenciar as suas viagens.</p>
            </div>
            <div class="painel-guia-acoes">
                <a class="botao-catalogo" href="/entrar">Entrar</a>
                <a class="botao-catalogo botao-catalogo-claro" href="/cadastro">Criar conta</a>
            </div>
        </section>
    </c:if>
</div>
