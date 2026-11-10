<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  "MINHAS COMPRAS": histórico das compras feitas no site por quem está
  logado, da mais nova para a mais antiga. Cada cartão leva ao comprovante.
  (O app guarda as reservas dele no próprio celular; por isso esta lista só
  mostra as compras feitas aqui no site.)

  ✏️ ONDE MUDAR O QUÊ: textos abaixo; visual em css/site.css (seção COMPRA).
--%>
<div class="compra">
    <h1 class="compra-titulo">Minhas compras</h1>

    <c:choose>
        <c:when test="${empty pedidos}">
            <div class="catalogo-vazio">
                <h3>Você ainda não fez nenhuma compra</h3>
                <p>Quando comprar uma viagem, o comprovante aparece aqui.</p>
                <a class="botao-catalogo" href="/inicio#viagens">Explorar viagens</a>
            </div>
        </c:when>
        <c:otherwise>
            <div class="pedidos">
                <c:forEach var="p" items="${pedidos}">
                    <article class="pedido">
                        <header>
                            <div>
                                <strong>Pedido <c:out value="${p.key}" /></strong>
                                <small><c:out value="${p.value[0].criadaEmTexto}" /> &middot; <c:out value="${p.value[0].formaTexto}" /></small>
                            </div>
                            <span class="chip-status"><c:out value="${p.value[0].statusPagamento}" /></span>
                        </header>
                        <ul>
                            <c:forEach var="r" items="${p.value}">
                                <li><span><c:out value="${r.tituloViagem}" /> <small>(<c:out value="${r.quantidade}" /> <c:out value="${r.quantidade == 1 ? 'pessoa' : 'pessoas'}" />)</small></span><span><c:out value="${r.totalTexto}" /></span></li>
                            </c:forEach>
                        </ul>
                        <footer>
                            <strong>Total: <c:out value="${totais[p.key]}" /></strong>
                            <a class="botao-catalogo botao-catalogo-azul-claro" href="/compra/${p.key}">Ver comprovante</a>
                        </footer>
                    </article>
                </c:forEach>
            </div>
        </c:otherwise>
    </c:choose>
</div>
