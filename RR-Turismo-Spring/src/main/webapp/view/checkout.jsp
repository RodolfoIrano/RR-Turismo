<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  TELA DE COMPRA (checkout) do site, no estilo das lojas online:
    coluna da esquerda: 1) revise a compra · 2) seus dados · 3) forma de pagamento
                        (Pix com QR Code e copia-e-cola, cartão, boleto);
    coluna da direita: resumo com o total e o botão "Confirmar compra".
  O PAGAMENTO É DE TESTE: nada é cobrado. Quem trata o envio é
  CheckoutController → CompraService; o comportamento da tela (QR, máscaras,
  validação do cartão) está em js/checkout.js.

  ✏️ ONDE MUDAR O QUÊ:
    - Textos e ordem dos blocos ... este arquivo
    - Cores e tamanhos ............ css/site.css (seção COMPRA)
    - Chave/identificação do Pix de teste e prazo do boleto ... js/checkout.js (início)
--%>
<c:set var="u" value="${sessionScope.usuarioLogado}" />
<div class="compra">
    <ol class="compra-passos" aria-label="Etapas da compra">
        <li class="feito"><b>&#10003;</b> Carrinho</li>
        <li class="ativo"><b>2</b> Pagamento</li>
        <li><b>3</b> Confirmação</li>
    </ol>

    <h1 class="compra-titulo">Finalizar compra</h1>
    <div class="compra-aviso-teste"><strong>Ambiente de teste.</strong> Esta compra é uma simulação: nenhuma cobrança real é feita e os dados do cartão não são guardados.</div>

    <form id="formCompra" method="post" action="/checkout/confirmar" class="compra-grade" novalidate>
        <input type="hidden" name="forma" id="campoForma" value="pix">

        <div class="compra-coluna">

            <%-- 1) REVISÃO --%>
            <section class="compra-bloco">
                <h2><span>1</span> Revise sua compra</h2>
                <c:forEach var="i" items="${itens}">
                    <div class="revisao-item">
                        <div class="revisao-foto">
                            <c:if test="${not empty i.viagem.capa}"><img src="${i.viagem.capa}?w=200" alt="" onerror="this.remove()"></c:if>
                        </div>
                        <div>
                            <strong><c:out value="${i.viagem.titulo}" /></strong>
                            <p><c:out value="${i.viagem.local}" /> &middot; <c:out value="${i.viagem.periodo}" /></p>
                            <p><c:out value="${i.quantidade}" /> <c:out value="${i.quantidade == 1 ? 'pessoa' : 'pessoas'}" /> &times; <c:out value="${i.precoUnitarioTexto}" /></p>
                        </div>
                        <strong class="revisao-preco"><c:out value="${i.subtotalTexto}" /></strong>
                    </div>
                </c:forEach>
                <a class="compra-voltar" href="/carrinho">Alterar carrinho</a>
            </section>

            <%-- 2) DADOS --%>
            <section class="compra-bloco">
                <h2><span>2</span> Seus dados</h2>
                <div class="dados-conta">
                    <div><small>Nome</small><strong><c:out value="${empty u.nome ? 'Sem nome cadastrado' : u.nome}" /></strong></div>
                    <div><small>E-mail</small><strong><c:out value="${u.email}" /></strong></div>
                </div>
                <p class="compra-dica">O comprovante fica salvo em <a class="texto-link" href="/minhas-compras">Minhas compras</a>. Para mudar o nome, abra <a class="texto-link" href="/editarperfil">Configurações</a>.</p>
            </section>

            <%-- 3) PAGAMENTO --%>
            <section class="compra-bloco">
                <h2><span>3</span> Como você quer pagar?</h2>

                <div class="pagamento-opcoes" role="radiogroup" aria-label="Forma de pagamento">
                    <button type="button" class="pagamento-opcao ativo" data-forma="pix" role="radio" aria-checked="true">
                        <span class="pg-icone">&#9889;</span>
                        <span><strong>Pix</strong><small>Aprovação na hora</small></span>
                        <em>Recomendado</em>
                    </button>
                    <button type="button" class="pagamento-opcao" data-forma="credito" role="radio" aria-checked="false">
                        <span class="pg-icone">&#128179;</span>
                        <span><strong>Cartão de crédito</strong><small>Até 6x sem juros</small></span>
                    </button>
                    <button type="button" class="pagamento-opcao" data-forma="debito" role="radio" aria-checked="false">
                        <span class="pg-icone">&#127974;</span>
                        <span><strong>Cartão de débito</strong><small>À vista, sai da conta na hora</small></span>
                    </button>
                    <button type="button" class="pagamento-opcao" data-forma="boleto" role="radio" aria-checked="false">
                        <span class="pg-icone">&#128196;</span>
                        <span><strong>Boleto</strong><small>Vence em 3 dias</small></span>
                    </button>
                </div>

                <%-- PIX --%>
                <div class="pagamento-painel" id="painelPix" data-total="${totalNumero}">
                    <div class="pix-grade">
                        <div class="pix-qr" id="pixQr" aria-label="QR Code do Pix de teste"></div>
                        <div class="pix-texto">
                            <h3>Pague com Pix</h3>
                            <ol>
                                <li>Abra o app do seu banco e escolha <strong>Pix</strong>.</li>
                                <li>Escaneie o QR Code ou use o <strong>Pix copia e cola</strong>.</li>
                                <li>Confira o valor de <strong><c:out value="${total}" /></strong> e confirme.</li>
                            </ol>
                            <label for="pixCodigo">Pix copia e cola</label>
                            <div class="copiar-linha">
                                <input id="pixCodigo" type="text" readonly>
                                <button type="button" class="botao-catalogo botao-catalogo-azul-claro" data-copiar="pixCodigo">Copiar</button>
                            </div>
                            <p class="compra-dica">Este QR Code é de <strong>teste</strong> e não consegue receber pagamento. Clique em “Confirmar compra” para simular o Pix aprovado.</p>
                        </div>
                    </div>
                </div>

                <%-- CARTÃO --%>
                <div class="pagamento-painel" id="painelCartao" hidden>
                    <div class="cartao-previa" id="cartaoPrevia" aria-hidden="true">
                        <span class="cartao-topo"><span class="cartao-bandeira" id="cartaoBandeira">Escolha a bandeira</span><span class="cartao-tipo" id="cartaoTipo">CRÉDITO</span></span>
                        <span class="cartao-num" id="previaNumero">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;</span>
                        <span class="cartao-linha"><span id="previaNome">NOME NO CARTÃO</span><span id="previaVal">MM/AA</span></span>
                    </div>
                    <div class="pg-form">
                        <div class="pg-campo">
                            <span class="pg-rotulo" id="rotuloBandeira">Bandeira do cartão</span>
                            <div class="bandeiras" role="radiogroup" aria-labelledby="rotuloBandeira">
                                <button type="button" class="bandeira" data-bandeira="Visa" role="radio" aria-checked="false">Visa</button>
                                <button type="button" class="bandeira" data-bandeira="Mastercard" role="radio" aria-checked="false">Mastercard</button>
                                <button type="button" class="bandeira" data-bandeira="Elo" role="radio" aria-checked="false">Elo</button>
                                <button type="button" class="bandeira" data-bandeira="Hipercard" role="radio" aria-checked="false">Hipercard</button>
                                <button type="button" class="bandeira" data-bandeira="American Express" role="radio" aria-checked="false">Amex</button>
                            </div>
                            <input type="hidden" name="bandeira" id="campoBandeira" value="">
                            <small class="erro" data-erro="campoBandeira"></small>
                        </div>
                        <div class="pg-campo">
                            <label for="cartaoNumero">Número do cartão</label>
                            <input id="cartaoNumero" name="cartaoNumero" type="text" inputmode="numeric" autocomplete="off" maxlength="23" placeholder="0000 0000 0000 0000">
                            <small class="erro" data-erro="cartaoNumero"></small>
                        </div>
                        <div class="pg-campo">
                            <label for="cartaoNome">Nome impresso no cartão</label>
                            <input id="cartaoNome" name="cartaoNome" type="text" autocomplete="off" maxlength="40" placeholder="Como está no cartão">
                            <small class="erro" data-erro="cartaoNome"></small>
                        </div>
                        <div class="pg-linha">
                            <div class="pg-campo">
                                <label for="cartaoValidade">Validade</label>
                                <input id="cartaoValidade" name="cartaoValidade" type="text" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="MM/AA">
                                <small class="erro" data-erro="cartaoValidade"></small>
                            </div>
                            <div class="pg-campo">
                                <label for="cartaoCvv">Código de segurança</label>
                                <input id="cartaoCvv" name="cartaoCvv" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="CVV">
                                <small class="erro" data-erro="cartaoCvv"></small>
                            </div>
                        </div>
                        <div class="pg-campo" id="campoParcelas">
                            <label for="parcelas">Parcelas</label>
                            <select id="parcelas" name="parcelas">
                                <c:forEach var="p" items="${parcelas}" varStatus="s">
                                    <option value="${s.count}"><c:out value="${p}" /></option>
                                </c:forEach>
                            </select>
                        </div>
                        <p class="compra-dica">Para testar (crédito ou débito) use a bandeira <strong>Visa</strong>, o cartão <strong>4111 1111 1111 1111</strong>, qualquer nome, validade futura e CVV <strong>123</strong>. O número e o CVV não são guardados.</p>
                    </div>
                </div>

                <%-- BOLETO --%>
                <div class="pagamento-painel" id="painelBoleto" hidden>
                    <h3>Pague com boleto</h3>
                    <p class="compra-dica">O boleto de teste vence em <strong id="boletoVence">3 dias</strong>. Use o código abaixo no app do banco ou clique em “Confirmar compra” para simular o pagamento.</p>
                    <label for="boletoCodigo">Linha digitável</label>
                    <div class="copiar-linha">
                        <input id="boletoCodigo" type="text" readonly>
                        <button type="button" class="botao-catalogo botao-catalogo-azul-claro" data-copiar="boletoCodigo">Copiar</button>
                    </div>
                    <p class="compra-dica">Este boleto é de <strong>teste</strong> e não pode ser pago em banco nenhum.</p>
                </div>
            </section>
        </div>

        <%-- RESUMO --%>
        <aside class="compra-resumo">
            <h2>Resumo da compra</h2>
            <c:forEach var="i" items="${itens}">
                <div class="resumo-linha"><span><c:out value="${i.viagem.titulo}" /> (<c:out value="${i.quantidade}" />)</span><span><c:out value="${i.subtotalTexto}" /></span></div>
            </c:forEach>
            <div class="resumo-linha total"><span>Total</span><strong><c:out value="${total}" /></strong></div>
            <button type="submit" class="botao-catalogo compra-botao" id="botaoConfirmar">Confirmar compra</button>
            <a class="compra-voltar" href="/carrinho">Voltar ao carrinho</a>
            <p class="compra-seguro">&#128274; Compra de teste. Nenhuma cobrança real.</p>
        </aside>
    </form>
</div>
<script src="/js/qrcode.js?v=1"></script>
<script src="/js/checkout.js?v=3" charset="UTF-8"></script>
