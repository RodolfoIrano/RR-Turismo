<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  COMPROVANTE de uma compra (/compra/{código}): mostra que deu certo, o
  código do pedido, as viagens, a forma de pagamento e o total.
  Os dados são as Reservas gravadas pelo CompraService.

  ✏️ ONDE MUDAR O QUÊ: textos abaixo; visual em css/site.css (seção COMPRA).
--%>
<div class="compra">
    <ol class="compra-passos" aria-label="Etapas da compra">
        <li class="feito"><b>&#10003;</b> Carrinho</li>
        <li class="feito"><b>&#10003;</b> Pagamento</li>
        <li class="ativo"><b>&#10003;</b> Confirmação</li>
    </ol>

    <section class="compra-sucesso">
        <div class="sucesso-selo" aria-hidden="true">&#10003;</div>
        <h1>Compra confirmada!</h1>
        <p>Pedido <strong><c:out value="${primeira.codigoPedido}" /></strong> &middot; <c:out value="${primeira.criadaEmTexto}" /></p>
        <span class="chip-status"><c:out value="${primeira.statusPagamento}" /></span>
    </section>

    <div class="compra-grade">
        <div class="compra-coluna">
            <section class="compra-bloco">
                <h2>Suas viagens</h2>
                <c:forEach var="r" items="${itens}">
                    <div class="revisao-item">
                        <div class="revisao-foto">
                            <c:if test="${not empty r.viagem}"><img src="/api/viagens/${r.viagem.id}/imagem?w=200" alt="" onerror="this.remove()"></c:if>
                        </div>
                        <div>
                            <strong><c:out value="${r.tituloViagem}" /></strong>
                            <p><c:out value="${r.localViagem}" /> &middot; <c:out value="${r.periodoViagem}" /></p>
                            <p><c:out value="${r.quantidade}" /> <c:out value="${r.quantidade == 1 ? 'pessoa' : 'pessoas'}" /> &times; <c:out value="${r.precoUnitarioTexto}" /></p>
                            <c:if test="${not empty r.viagem}"><a class="texto-link" href="/viagens/${r.viagem.id}">Ver a viagem</a></c:if>
                        </div>
                        <strong class="revisao-preco"><c:out value="${r.totalTexto}" /></strong>
                    </div>
                </c:forEach>
            </section>
            <section class="compra-bloco">
                <h2>Cancelamento e dúvidas</h2>
                <p class="compra-dica">Para cancelar ou pedir reembolso, fale com a nossa equipe e informe o código do pedido.</p>
                <a class="botao-catalogo botao-catalogo-azul-claro" href="/fale-conosco">Falar com a equipe</a>
            </section>
        </div>

        <aside class="compra-resumo">
            <h2>Pagamento</h2>
            <div class="resumo-linha"><span>Forma</span><span><c:out value="${primeira.formaTexto}" /></span></div>
            <div class="resumo-linha"><span>Status</span><span><c:out value="${primeira.statusPagamento}" /></span></div>
            <div class="resumo-linha total"><span>Total</span><strong><c:out value="${total}" /></strong></div>
            <a class="botao-catalogo compra-botao" href="/minhas-compras">Ver minhas compras</a>
            <a class="compra-voltar" href="/inicio#viagens">Continuar explorando</a>
            <p class="compra-seguro">&#128274; Compra de teste. Nenhuma cobrança real foi feita.</p>
        </aside>
    </div>
</div>
