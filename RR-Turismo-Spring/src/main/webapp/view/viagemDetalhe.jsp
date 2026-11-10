<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página pública de DETALHES de uma viagem, igual à do app: galeria de
  fotos, informações, descrição, MAPA "Onde fica", guia responsável,
  política de cancelamento e outras viagens do mesmo guia.
  Dados vindos do ViagemPublicaController.

  ✏️ ONDE MUDAR O QUÊ:
    - Texto do cancelamento ..... seção "Cancelamento" (mais abaixo)
    - Mapa (busca do local) ..... js/mapaViagem.js
    - Visual .................... css/catalogo.css e css/site.css
--%>

<div class="catalogo viagem-detalhe">

    <div class="detalhe-topo">
        <a class="detalhe-voltar" href="/inicio#viagens">&larr; Voltar para as viagens</a>
        <button type="button" class="coracao coracao-texto" data-id="${viagem.id}" aria-pressed="false">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8 3 4.5 6.5 4.5c2 0 3.5 1.1 5.5 3 2-1.9 3.5-3 5.5-3C21 4.5 23 8 21.5 11.8 19.5 16.4 12 21 12 21z"/></svg>
            <span class="coracao-txt">Salvar nos favoritos</span>
        </button>
    </div>

    <div class="detalhe-layout">

        <%-- ===== GALERIA ===== --%>
        <section class="detalhe-galeria">
            <div class="detalhe-foto-principal">
                <c:choose>
                    <c:when test="${not empty viagem.fotos}">
                        <img id="fotoPrincipal" src="${viagem.capa}?w=1200" alt="<c:out value='${viagem.titulo}' />">
                    </c:when>
                    <c:otherwise>
                        <div class="detalhe-sem-foto">Esta viagem ainda não tem fotos</div>
                    </c:otherwise>
                </c:choose>
                <c:if test="${viagem.esgotada}">
                    <span class="viagem-card-esgotada">Esgotada</span>
                </c:if>
            </div>

            <c:if test="${viagem.fotos.size() > 1}">
                <div class="detalhe-miniaturas">
                    <c:forEach var="foto" items="${viagem.fotos}" varStatus="s">
                        <button type="button" class="${s.first ? 'ativa' : ''}"
                                data-grande="${foto}?w=1200" aria-label="Foto ${s.count}">
                            <img src="${foto}?w=240" alt="" loading="lazy">
                        </button>
                    </c:forEach>
                </div>
            </c:if>
        </section>

        <%-- ===== INFORMAÇÕES ===== --%>
        <aside class="detalhe-info">
            <c:if test="${not empty viagem.categoria}">
                <span class="viagem-card-categoria viagem-card-categoria-solta"><c:out value="${viagem.categoria}" /></span>
            </c:if>
            <h1><c:out value="${viagem.titulo}" /></h1>
            <p class="viagem-card-local"><c:out value="${viagem.local}" /></p>

            <p class="detalhe-preco"><c:out value="${viagem.preco}" /> <small>por pessoa</small></p>

            <ul class="detalhe-lista">
                <li><span>Período</span><strong><c:out value="${viagem.periodo}" /></strong></li>
                <c:if test="${not empty viagem.transporte}">
                    <li><span>Transporte</span><strong><c:out value="${viagem.transporte}" /></strong></li>
                </c:if>
                <c:if test="${not empty viagem.hotel}">
                    <li><span>Hospedagem</span><strong><c:out value="${viagem.hotel}" /></strong></li>
                </c:if>
                <li><span>Vagas</span>
                    <strong>
                        <c:choose>
                            <c:when test="${viagem.esgotada}">Esgotada</c:when>
                            <c:otherwise><c:out value="${viagem.vagas}" /> disponíveis</c:otherwise>
                        </c:choose>
                    </strong>
                </li>
                <c:if test="${not empty viagem.guiaNome}">
                    <li><span>Guia</span><strong><c:out value="${viagem.guiaNome}" /></strong></li>
                </c:if>
            </ul>

            <div class="detalhe-reserva">
                <strong>Quer reservar?</strong>
                <p>As reservas são feitas pelo aplicativo RR Turismo. Procure esta viagem no app e toque em “Adicionar ao carrinho”.</p>
            </div>

            <a class="botao-catalogo botao-catalogo-azul-claro" target="_blank" rel="noopener"
               href="https://wa.me/5516992416492?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20a%20viagem%20%23${viagem.id}%20no%20RR%20Turismo">Tirar dúvida no WhatsApp</a>

            <c:if test="${ehDono}">
                <a class="botao-catalogo" href="/editarviagem/${viagem.id}">Editar esta viagem</a>
            </c:if>
        </aside>
    </div>

    <c:if test="${not empty viagem.descricao}">
        <section class="detalhe-descricao">
            <h2>Sobre a viagem</h2>
            <p><c:out value="${viagem.descricao}" /></p>
        </section>
    </c:if>

    <%-- ===== MAPA ===== --%>
    <section class="detalhe-descricao" id="blocoMapa">
        <h2>Onde fica</h2>
        <div id="mapaViagem" class="mapa-viagem"
             data-destino="<c:out value='${viagem.titulo}' />"
             data-local="<c:out value='${viagem.local}' />"></div>
        <p class="mapa-status" id="mapaStatus">Procurando o local no mapa…</p>
        <a class="mapa-link" id="mapaLink" target="_blank" rel="noopener" href="#" hidden>Abrir no Google Maps &rarr;</a>
    </section>

    <%-- ===== GUIA RESPONSÁVEL ===== --%>
    <c:if test="${not empty viagem.guiaNome}">
        <section class="detalhe-descricao guia-cartao">
            <img src="/api/guias/${viagem.guiaId}/foto?w=200" alt="" onerror="this.onerror=null;this.src='/imagens/user-placeholder.svg'">
            <div>
                <span class="catalogo-etiqueta">Guia responsável</span>
                <h2><c:out value="${viagem.guiaNome}" /></h2>
                <p>Quem organiza e acompanha esta viagem. Dúvidas antes de reservar? É só chamar a equipe.</p>
            </div>
            <a class="botao-catalogo" href="/fale-conosco">Falar com a equipe</a>
        </section>
    </c:if>

    <%-- ===== CANCELAMENTO ===== --%>
    <section class="detalhe-descricao">
        <h2>Cancelamento</h2>
        <p>Consulte as condições de cancelamento diretamente com o guia responsável. Para pedir cancelamento ou reembolso, fale com a nossa equipe pelo <a href="/fale-conosco" class="texto-link">Fale conosco</a>.</p>
    </section>

    <%-- ===== OUTRAS VIAGENS DO GUIA ===== --%>
    <c:if test="${not empty outrasDoGuia}">
        <section>
            <h2 class="secao-titulo">Outras viagens deste guia</h2>
            <div class="catalogo-grade">
                <c:forEach var="v" items="${outrasDoGuia}">
                    <%@ include file="cartaoViagem.jspf" %>
                </c:forEach>
            </div>
        </section>
    </c:if>
</div>

<script src="/js/mapaViagem.js?v=1"></script>
<script>
    // Troca a foto grande ao clicar numa miniatura.
    (function () {
        var principal = document.getElementById("fotoPrincipal");
        var botoes = document.querySelectorAll(".detalhe-miniaturas button");
        if (!principal || !botoes.length) return;
        botoes.forEach(function (b) {
            b.addEventListener("click", function () {
                principal.src = b.getAttribute("data-grande");
                botoes.forEach(function (x) { x.classList.remove("ativa"); });
                b.classList.add("ativa");
            });
        });
    })();
</script>
