<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Tela do CARRINHO: lista as viagens escolhidas (foto, local, datas), deixa
  mudar a quantidade de pessoas (− / +), remover, e mostra o total com o
  botão "Continuar para o pagamento". Os dados vêm do CarrinhoController.

  ✏️ ONDE MUDAR O QUÊ: textos abaixo; cores/tamanhos em css/site.css (seção COMPRA).
--%>
<div class="compra">
    <ol class="compra-passos" aria-label="Etapas da compra">
        <li class="ativo"><b>1</b> Carrinho</li>
        <li><b>2</b> Pagamento</li>
        <li><b>3</b> Confirmação</li>
    </ol>

    <h1 class="compra-titulo">Seu carrinho</h1>

    <c:choose>
        <c:when test="${empty itens}">
            <div class="catalogo-vazio">
                <h3>Seu carrinho está vazio</h3>
                <p>Escolha uma viagem, toque em “Adicionar ao carrinho” e ela aparece aqui.</p>
                <a class="botao-catalogo" href="/inicio#viagens">Explorar viagens</a>
            </div>
        </c:when>
        <c:otherwise>
            <div class="compra-grade">
                <div class="compra-coluna">
                    <c:forEach var="i" items="${itens}">
                        <article class="carrinho-item">
                            <a class="carrinho-foto" href="/viagens/${i.viagem.id}">
                                <c:if test="${not empty i.viagem.capa}"><img src="${i.viagem.capa}?w=400" alt="" onerror="this.remove()"></c:if>
                            </a>
                            <div class="carrinho-info">
                                <a class="carrinho-nome" href="/viagens/${i.viagem.id}"><c:out value="${i.viagem.titulo}" /></a>
                                <p><c:out value="${i.viagem.local}" /></p>
                                <p><c:out value="${i.viagem.periodo}" /></p>
                                <div class="carrinho-acoes">
                                    <form method="post" action="/carrinho/quantidade" class="quantidade">
                                        <input type="hidden" name="viagemId" value="${i.viagem.id}">
                                        <button type="submit" name="qtd" value="${i.quantidade - 1}" aria-label="Menos uma pessoa" ${i.quantidade <= 1 ? 'disabled' : ''}>&minus;</button>
                                        <span><c:out value="${i.quantidade}" /> <c:out value="${i.quantidade == 1 ? 'pessoa' : 'pessoas'}" /></span>
                                        <button type="submit" name="qtd" value="${i.quantidade + 1}" aria-label="Mais uma pessoa">+</button>
                                    </form>
                                    <form method="post" action="/carrinho/remover">
                                        <input type="hidden" name="viagemId" value="${i.viagem.id}">
                                        <button type="submit" class="link-remover">Remover</button>
                                    </form>
                                </div>
                            </div>
                            <div class="carrinho-preco">
                                <strong><c:out value="${i.subtotalTexto}" /></strong>
                                <small><c:out value="${i.precoUnitarioTexto}" /> por pessoa</small>
                            </div>
                        </article>
                    </c:forEach>
                </div>

                <aside class="compra-resumo">
                    <h2>Resumo</h2>
                    <div class="resumo-linha"><span>Viagens</span><span><c:out value="${itens.size()}" /></span></div>
                    <div class="resumo-linha total"><span>Total</span><strong><c:out value="${total}" /></strong></div>
                    <a class="botao-catalogo compra-botao" href="/checkout">Continuar para o pagamento</a>
                    <a class="compra-voltar" href="/inicio#viagens">Continuar explorando</a>
                    <p class="compra-seguro">&#128274; Pagamento de teste: nenhuma cobrança real é feita.</p>
                </aside>
            </div>
        </c:otherwise>
    </c:choose>
</div>
