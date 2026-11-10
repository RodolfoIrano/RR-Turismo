<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página FALE CONOSCO (pública). A pessoa preenche nome, e-mail,
  telefone (opcional), assunto e mensagem; tudo é VALIDADO no navegador.
  Ao enviar, abre o WhatsApp da equipe com a mensagem pronta.
  NADA é guardado em banco: o site só monta o texto e entrega ao WhatsApp.
  Embaixo ficam as perguntas frequentes (#perguntas).

  ✏️ ONDE MUDAR O QUÊ:
    - Número do WhatsApp ......... data-whatsapp na <form> (só números, 55+DDD+número)
    - Assuntos (botões) .......... bloco "chips-assunto"
    - Perguntas frequentes ....... <details> da seção #perguntas
    - Regras (tamanho mínimo, espera entre envios) .. js/faleConosco.js
--%>
<div class="catalogo pagina-institucional">

    <section class="catalogo-topo">
        <span class="catalogo-etiqueta">Fale conosco</span>
        <h1>Como podemos ajudar?</h1>
        <p>Escreva sua mensagem: ela abre direto no WhatsApp da nossa equipe, já pronta para enviar.</p>
    </section>

    <div class="contato-layout">

        <form id="formContato" class="contato-form" novalidate data-whatsapp="5516992416492">
            <div class="contato-aviso" id="contatoAviso" role="alert" hidden></div>

            <div class="contato-campo">
                <label for="cNome">Nome completo</label>
                <input id="cNome" type="text" maxlength="80" autocomplete="name"
                       value="<c:out value='${not empty sessionScope.usuarioLogado ? sessionScope.usuarioLogado.nome : ""}' />">
                <small class="erro" data-erro="cNome"></small>
            </div>

            <div class="contato-linha">
                <div class="contato-campo">
                    <label for="cEmail">E-mail</label>
                    <input id="cEmail" type="email" maxlength="120" autocomplete="email" inputmode="email"
                           value="<c:out value='${not empty sessionScope.usuarioLogado ? sessionScope.usuarioLogado.email : ""}' />">
                    <small class="erro" data-erro="cEmail"></small>
                </div>
                <div class="contato-campo">
                    <label for="cTelefone">Telefone <em>(opcional)</em></label>
                    <input id="cTelefone" type="tel" maxlength="15" placeholder="(16) 99999-9999" autocomplete="tel" inputmode="tel">
                    <small class="erro" data-erro="cTelefone"></small>
                </div>
            </div>

            <div class="contato-campo">
                <label id="rotuloAssunto">Assunto</label>
                <div class="chips-assunto" role="radiogroup" aria-labelledby="rotuloAssunto" id="chipsAssunto">
                    <button type="button" role="radio" aria-checked="false">Dúvida</button>
                    <button type="button" role="radio" aria-checked="false">Elogio</button>
                    <button type="button" role="radio" aria-checked="false">Sugestão</button>
                    <button type="button" role="radio" aria-checked="false">Reclamação</button>
                    <button type="button" role="radio" aria-checked="false">Problema no site</button>
                    <button type="button" role="radio" aria-checked="false">Parceria</button>
                    <button type="button" role="radio" aria-checked="false">Outro</button>
                </div>
                <small class="erro" data-erro="assunto"></small>
            </div>

            <div class="contato-campo">
                <label for="cMensagem">Mensagem</label>
                <textarea id="cMensagem" rows="6" maxlength="500" placeholder="Conte como podemos ajudar (mínimo 10 caracteres)"></textarea>
                <div class="contato-contador"><small class="erro" data-erro="cMensagem"></small><span id="contador">0/500</span></div>
            </div>

            <label class="contato-aceite">
                <input id="cAceite" type="checkbox">
                <span>Concordo em usar meus dados (nome, e-mail e telefone) apenas para a equipe do RR Turismo responder esta mensagem.</span>
            </label>
            <small class="erro" data-erro="cAceite"></small>

            <button type="submit" class="contato-enviar">
                <img src="/imagens/whatsapp.png" alt=""> Enviar pelo WhatsApp
            </button>
            <p class="contato-nota">Não guardamos esta mensagem no site: ela vai direto para o seu WhatsApp, e você confirma o envio por lá.</p>
        </form>

        <aside class="contato-lateral">
            <div class="contato-cartao">
                <h3>Prefere falar direto?</h3>
                <p>Chame a equipe pelo WhatsApp.</p>
                <a class="botao-catalogo" target="_blank" rel="noopener" href="https://wa.me/5516992416492?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20RR%20Turismo.">WhatsApp (16) 99241-6492</a>
            </div>
            <div class="contato-cartao">
                <h3>Quem somos</h3>
                <p>Projeto de Rafael e Rodolfo, alunos de Sistemas para Internet na Fatec Taquaritinga.</p>
                <a class="texto-link" href="/sobre-nos">Conheça a equipe &rarr;</a>
            </div>
        </aside>
    </div>

    <section id="perguntas">
        <h2 class="secao-titulo">Perguntas frequentes</h2>
        <div class="faq">
            <details><summary>Como reservar uma viagem?</summary><p>Escolha a viagem na página inicial, confira os detalhes (fotos, mapa, guia e datas) e siga para a reserva. Hoje a reserva é finalizada pelo aplicativo RR Turismo, em “Adicionar ao carrinho”.</p></details>
            <details><summary>Preciso criar uma conta?</summary><p>Para ver as viagens, não. Para reservar e salvar favoritos, sim. Escolha “Viajante” se só quer comprar viagens, ou “Guia/Empresa” se quer anunciar as suas.</p></details>
            <details><summary>Como salvar uma viagem nos favoritos?</summary><p>Clique no coração sobre a foto da viagem. As salvas ficam na página Favoritos.</p></details>
            <details><summary>Como cancelar uma reserva?</summary><p>As condições ficam na página de cada viagem, em “Cancelamento”. Para pedir cancelamento ou reembolso, use este formulário.</p></details>
            <details><summary>Como mudar o idioma do site?</summary><p>Clique no botão com o globo 🌐 no topo da página e escolha o idioma.</p></details>
            <details><summary>Esqueci minha senha</summary><p>Ainda não existe recuperação automática. Fale com a equipe aqui que ajudamos você a voltar a acessar a conta.</p></details>
        </div>
    </section>
</div>
<script src="/js/faleConosco.js?v=1"></script>
