<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página SOBRE NÓS (pública): foto da dupla, quem somos (Rafael e
  Rodolfo, Fatec Taquaritinga, Sistemas para Internet), o que é o RR
  Turismo, o que oferece para quem viaja e para guias/empresas,
  tecnologias e valores. É a mesma história da tela Sobre nós do app.

  ✏️ ONDE MUDAR O QUÊ:
    - Foto da dupla ........... imagens/RR-Fundadores.jpg (troque o arquivo,
                                 mantendo o nome)
    - Nomes e curso na foto ... <figcaption> logo abaixo
    - Textos .................. cada <p> dentro dos blocos "sobre-bloco"
    - Listas .................. os <li> das duas listas
    - Visual .................. css/site.css (seção SOBRE NÓS)
--%>
<div class="catalogo pagina-institucional">

    <section class="sobre-hero">
        <figure class="sobre-foto">
            <img src="/imagens/RR-Fundadores.jpg" alt="Rafael e Rodolfo, criadores do RR Turismo, com o site aberto no notebook">
            <figcaption>
                <strong>Rafael &amp; Rodolfo</strong>
                <span>Fatec Taquaritinga · Sistemas para Internet</span>
            </figcaption>
        </figure>
        <div class="sobre-hero-texto">
            <span class="catalogo-etiqueta">Sobre nós</span>
            <h1>Viajar começa com uma boa história</h1>
            <p>O RR Turismo conecta guias e agências de turismo a quem quer viajar. Foi criado por dois amigos, como projeto do curso, para dar vitrine a quem trabalha com turismo.</p>
            <div class="sobre-selos"><span>Site + App</span><span>Mapa ao vivo</span><span>Vários idiomas</span></div>
            <a class="botao-catalogo" href="/fale-conosco">Fale conosco</a>
        </div>
    </section>

    <section class="sobre-bloco" id="equipe">
        <h2>&#128101; Quem somos</h2>
        <p>Somos Rafael e Rodolfo, dois amigos que cursam Sistemas para Internet na Fatec Taquaritinga. O RR Turismo nasceu como projeto do curso, com a vontade de ajudar quem trabalha com turismo a divulgar e vender as suas viagens e excursões.</p>
    </section>

    <section class="sobre-bloco">
        <h2>&#9992; O que é o RR Turismo</h2>
        <p>É uma plataforma que conecta guias e empresas de turismo a quem quer viajar. Quem organiza as viagens publica tudo pelo site; quem viaja descobre, reserva e acompanha a viagem pelo site ou pelo aplicativo, com mapa ao vivo, avisos do guia e o idioma que preferir.</p>
    </section>

    <div class="sobre-duas">
        <section class="sobre-bloco">
            <h2>&#128515; Para quem viaja</h2>
            <ul class="sobre-lista">
                <li>Descobrir viagens por categoria, busca e destino</li>
                <li>Salvar as favoritas e reservar com poucos toques</li>
                <li>Acompanhar a viagem ao vivo, com mapa e avisos do guia</li>
                <li>Usar o site e o app no idioma que preferir</li>
            </ul>
        </section>
        <section class="sobre-bloco" id="guias">
            <h2>&#128188; Para guias e empresas</h2>
            <ul class="sobre-lista">
                <li>Criar e divulgar viagens e excursões, com várias fotos</li>
                <li>Gerenciar as reservas pelo painel do site</li>
                <li>Usar o Modo Guia: grupo no mapa e avisos em tempo real</li>
                <li>Ganhar audiência com uma vitrine feita para turismo</li>
            </ul>
            <c:if test="${empty sessionScope.usuarioLogado}">
                <a class="botao-catalogo" href="/cadastro">Criar conta de guia/empresa</a>
            </c:if>
        </section>
    </div>

    <section class="sobre-destaque">
        Cada viagem é uma nova história, e estamos aqui para ajudar a escrever a sua. ✈️
    </section>

    <section class="sobre-bloco">
        <h2>&#128295; Como foi feito</h2>
        <div class="sobre-selos escuro"><span>Spring Boot</span><span>MySQL</span><span>JSP</span><span>React Native</span><span>Expo</span><span>TypeScript</span></div>
    </section>

    <section>
        <h2 class="secao-titulo">Nossos valores</h2>
        <div class="sobre-valores">
            <div><b>&#10084;</b>Paixão</div>
            <div><b>&#9733;</b>Excelência</div>
            <div><b>&#128161;</b>Inovação</div>
            <div><b>&#127807;</b>Sustentabilidade</div>
        </div>
    </section>
</div>
