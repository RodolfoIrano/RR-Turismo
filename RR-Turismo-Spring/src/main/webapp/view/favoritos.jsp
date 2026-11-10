<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página FAVORITOS: mostra as viagens que a pessoa marcou com o coração.
  O servidor manda TODAS as viagens; o js/site.js esconde as que não estão
  nos favoritos. Os favoritos ficam guardados no NAVEGADOR (por conta),
  então por enquanto não aparecem sozinhos no app, e vice-versa.

  ✏️ ONDE MUDAR O QUÊ: textos abaixo; cartões em cartaoViagem.jspf.
--%>
<div class="catalogo">
    <section class="catalogo-topo">
        <span class="catalogo-etiqueta">Favoritos</span>
        <h1>Suas viagens salvas</h1>
        <p id="favoritosContagem">Carregando…</p>
    </section>

    <div class="catalogo-vazio" id="favoritosVazio" hidden>
        <h3>Você ainda não salvou nenhuma viagem</h3>
        <p>Toque no coração &#9829; nas viagens que você curtir e elas aparecem aqui.</p>
        <a class="botao-catalogo" href="/inicio#viagens">Explorar viagens</a>
    </div>

    <div class="catalogo-grade" id="favoritosGrade" hidden>
        <c:forEach var="v" items="${viagens}">
            <%@ include file="cartaoViagem.jspf" %>
        </c:forEach>
    </div>
</div>
