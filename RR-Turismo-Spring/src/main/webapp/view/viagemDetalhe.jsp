<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página pública de DETALHES de uma viagem: galeria de fotos (clique nas
  miniaturas para trocar), informações, descrição e o guia responsável.
  Dados vindos do ViagemPublicaController.
--%>

<div class="catalogo viagem-detalhe">

    <a class="detalhe-voltar" href="/inicio">&larr; Voltar para as viagens</a>

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
</div>

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
