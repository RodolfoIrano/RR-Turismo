<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  RODAPÉ completo do site (modo visitante/viajante). No computador aparece
  em colunas; no celular as colunas viram seções que abrem e fecham (toque
  no título), para a tela não ficar enorme.
  Está incluído por layout.jsp.

  ✏️ ONDE MUDAR O QUÊ:
    - Redes sociais ............ as 3 variáveis "link..." logo abaixo
                                  (enquanto estiverem vazias o ícone some)
    - WhatsApp da equipe ....... variável "zap" logo abaixo
    - Textos e links das colunas  blocos <div class="rodape-col"> mais abaixo
    - Cores e espaçamentos ..... css/site.css (seção RODAPÉ)
--%>
<%-- 👈 COLOQUE AQUI os endereços das redes sociais da equipe (https://...) --%>
<c:set var="linkInstagram" value="" />
<c:set var="linkFacebook" value="" />
<c:set var="linkYoutube" value="" />
<%-- 👈 WhatsApp da equipe: 55 + DDD + número (só números) --%>
<c:set var="zap" value="5516992416492" />

<footer class="site-rodape">
    <div class="site-rodape-in">

        <%-- ===== Marca + descrição + redes ===== --%>
        <div class="rodape-marca">
            <a href="/inicio"><img src="/imagens/logo_branca_recortada.png" alt="RR Turismo"></a>
            <p>Descubra novos destinos, viva experiências incríveis e encontre a sua próxima aventura com guias e agências de confiança.</p>

            <div class="rodape-redes" aria-label="Redes sociais">
                <a href="https://wa.me/${zap}" target="_blank" rel="noopener" aria-label="WhatsApp">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.200Zm4.5-6.1c-.2-.1-1.500-.7-1.700-.8s-.4-.1-.6.100-.6.800-.8 1-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.3-.4.300-.4.800-1.400.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.300 3 3 0 0 0-.9 2.200 5.200 5.200 0 0 0 1.100 2.800 11.900 11.900 0 0 0 4.600 4c1.700.7 2.400.8 3.200.7a2.700 2.700 0 0 0 1.800-1.300 2.200 2.200 0 0 0 .2-1.300c-.1-.1-.3-.2-.5-.3Z"/></svg>
                </a>
                <c:if test="${not empty linkInstagram}">
                    <a href="${linkInstagram}" target="_blank" rel="noopener" aria-label="Instagram">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.500" cy="6.500" r="1" fill="currentColor" stroke="none"/></svg>
                    </a>
                </c:if>
                <c:if test="${not empty linkFacebook}">
                    <a href="${linkFacebook}" target="_blank" rel="noopener" aria-label="Facebook">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.500 22v-8.200h2.800l.4-3.300h-3.200V8.400c0-.9.300-1.600 1.600-1.600h1.700V3.900A22 22 0 0 0 14.400 3.800c-2.400 0-4.100 1.500-4.100 4.200v2.500H7.500v3.300h2.800V22h3.200Z"/></svg>
                    </a>
                </c:if>
                <c:if test="${not empty linkYoutube}">
                    <a href="${linkYoutube}" target="_blank" rel="noopener" aria-label="YouTube">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.600 7.200a2.600 2.600 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.600 2.600 0 0 0 2.400 7.200 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.800 2.600 2.600 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.600 2.600 0 0 0 1.800-1.800A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.800ZM10 15V9l5.200 3L10 15Z"/></svg>
                    </a>
                </c:if>
            </div>
        </div>

        <%-- ===== Colunas (no celular viram seções que abrem/fecham) ===== --%>
        <div class="rodape-col">
            <button type="button" class="rodape-titulo" aria-expanded="false">Explore <span class="rodape-seta" aria-hidden="true"></span></button>
            <div class="rodape-lista">
                <a href="/inicio">Todas as viagens</a>
                <%-- Categorias que existem hoje (vêm do DadosDoSiteAdvice) --%>
                <c:forEach var="cat" items="${categoriasRodape}">
                    <a href="/inicio?categoria=<c:out value='${cat}' />#viagens"><c:out value="${cat}" /></a>
                </c:forEach>
                <a href="/favoritos">Meus favoritos</a>
            </div>
        </div>

        <div class="rodape-col">
            <button type="button" class="rodape-titulo" aria-expanded="false">Institucional <span class="rodape-seta" aria-hidden="true"></span></button>
            <div class="rodape-lista">
                <a href="/sobre-nos">Sobre nós</a>
                <a href="/sobre-nos#equipe">Nossa equipe</a>
                <a href="/fale-conosco">Fale conosco</a>
                <a href="/fale-conosco#faq">Perguntas frequentes</a>
            </div>
        </div>

        <div class="rodape-col">
            <button type="button" class="rodape-titulo" aria-expanded="false">Para guias e empresas <span class="rodape-seta" aria-hidden="true"></span></button>
            <div class="rodape-lista">
                <a href="/cadastro">Anunciar minhas viagens</a>
                <a href="/entrar">Entrar no painel</a>
                <c:if test="${not empty sessionScope.usuarioLogado}">
                    <a href="/perfil">Meu perfil</a>
                    <a href="/editarperfil">Configurações</a>
                    <a href="/sair">Sair</a>
                </c:if>
            </div>
        </div>

        <div class="rodape-col">
            <button type="button" class="rodape-titulo" aria-expanded="false">Contato <span class="rodape-seta" aria-hidden="true"></span></button>
            <div class="rodape-lista">
                <a href="https://wa.me/${zap}" target="_blank" rel="noopener">WhatsApp: (16) 99241-6492</a>
                <span>Fatec Taquaritinga</span>
                <span>Sistemas para Internet</span>
            </div>
        </div>

        <%-- ===== Novidades: abre o WhatsApp (nada é guardado no site) ===== --%>
        <div class="rodape-novidades">
            <div>
                <h4>Receba novidades sobre viagens</h4>
                <p>Fique por dentro de novos destinos e dicas de viagem. É só mandar um oi para a nossa equipe.</p>
            </div>
            <a class="rodape-btn-zap" target="_blank" rel="noopener"
               href="https://wa.me/${zap}?text=Ol%C3%A1%21%20Quero%20receber%20novidades%20sobre%20viagens%20do%20RR%20Turismo.">Quero receber novidades</a>
        </div>
    </div>

    <div class="rodape-meio">
        <button type="button" class="rodape-idioma" onclick="LangSelector.open()">
            <span aria-hidden="true">&#127760;</span> Idioma: Português (BR) &middot; Moeda: BRL
        </button>
    </div>

    <div class="site-rodape-base">
        <span>© 2026 RR Turismo. Todos os direitos reservados.</span>
        <span class="rodape-legal"><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a></span>
    </div>
</footer>
