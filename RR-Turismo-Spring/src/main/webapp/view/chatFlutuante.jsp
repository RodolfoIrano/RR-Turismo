<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Desenha a BOLINHA FLUTUANTE de ajuda (com a logo do RR Turismo) e a
  janelinha do chat. É igual à do app: responde perguntas do site, aceita
  elogio, sugestão e reclamação e leva para a página certa.
  Está incluída em layout.jsp, então aparece em todas as páginas.

  O "cérebro" (perguntas e respostas) fica em js/chatSite.js.
  O visual fica em css/site.css (seção CHAT).
--%>
<c:set var="primeiroNome" value="${not empty sessionScope.usuarioLogado ? sessionScope.usuarioLogado.nome : ''}" />

<button id="chatBolinha" class="chat-bolinha" type="button"
        aria-label="Abrir o assistente de ajuda" aria-controls="chatJanela" aria-expanded="false"
        data-nome="<c:out value='${primeiroNome}' />">
    <img src="/imagens/RRBolinha.png" alt="">
    <span class="chat-ponto" aria-hidden="true"></span>
</button>

<section id="chatJanela" class="chat-janela" role="dialog" aria-label="Assistente RR Turismo" hidden>
    <header class="chat-topo">
        <img class="chat-avatar" src="/imagens/RRBolinha.png" alt="">
        <div class="chat-titulos">
            <strong>Assistente RR Turismo</strong>
            <span><i class="chat-ponto-pequeno"></i> Online agora</span>
        </div>
        <button type="button" id="chatReiniciar" class="chat-btn-topo" aria-label="Nova conversa" title="Nova conversa">&#8635;</button>
        <button type="button" id="chatFechar" class="chat-btn-topo" aria-label="Fechar o chat" title="Fechar">&#10005;</button>
    </header>

    <div id="chatMensagens" class="chat-mensagens" aria-live="polite"></div>
    <div id="chatSugestoes" class="chat-sugestoes"></div>

    <form id="chatForm" class="chat-form" autocomplete="off">
        <input id="chatEntrada" type="text" maxlength="300" placeholder="Escreva sua dúvida..." aria-label="Escreva sua mensagem">
        <button type="submit" aria-label="Enviar">&#10148;</button>
    </form>
</section>
