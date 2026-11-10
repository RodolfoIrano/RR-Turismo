<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<%--
  📄 O QUE ESTE ARQUIVO FAZ:
  Página inicial de quem entrou como GUIA ou EMPRESA (painel). É um resumo
  simples e limpo, no estilo do painel antigo: quatro números no topo e a
  tabela das viagens que a pessoa criou. SEM banner e SEM catálogo.
  Os dados vêm do InicioController (método homeDoPainel).

  ✏️ ONDE MUDAR O QUÊ:
    - Os 4 cartões de números ........ <div class="cards"> abaixo
    - Colunas da tabela .............. <table> abaixo
    - Cores e tamanhos ............... css/inicio.css e css/site.css (seção "home do painel")
--%>
<div class="painel-inicio">

    <div class="topo">
        <div>
            <h1>Olá, <c:out value="${empty sessionScope.usuarioLogado.nome ? sessionScope.usuarioLogado.email : sessionScope.usuarioLogado.nome}" />!</h1>
            <p>Resumo das suas viagens.</p>
        </div>
        <a class="botao-principal" href="/criarviagem">+ Criar nova viagem</a>
    </div>

    <div class="cards">
        <div class="card-Inicio">
            <h3>Viagens publicadas</h3>
            <p class="numero"><c:out value="${totalViagens}" /></p>
            <span>no site e no app</span>
        </div>
        <div class="card-Inicio">
            <h3>Vagas no total</h3>
            <p class="numero"><c:out value="${totalVagas}" /></p>
            <span><c:out value="${totalLivres}" /> ainda livres</span>
        </div>
        <div class="card-Inicio">
            <h3>Participantes</h3>
            <p class="numero"><c:out value="${totalParticipantes}" /></p>
            <span>pessoas confirmadas</span>
        </div>
        <div class="card-Inicio">
            <h3>Ocupação</h3>
            <p class="numero"><c:out value="${ocupacao}" />%</p>
            <span>das vagas preenchidas</span>
        </div>
    </div>

    <div class="area-tabela">
        <h2>Minhas viagens</h2>
        <c:choose>
            <c:when test="${empty minhasViagens}">
                <div class="painel-vazio">
                    Você ainda não publicou nenhuma viagem.<br><br>
                    <a class="botao-principal" href="/criarviagem">Criar minha primeira viagem</a>
                </div>
            </c:when>
            <c:otherwise>
                <div style="overflow-x:auto">
                <table>
                    <thead>
                        <tr><th>Destino</th><th>Período</th><th>Preço</th><th>Vagas</th><th>Situação</th><th></th></tr>
                    </thead>
                    <tbody>
                        <c:forEach var="v" items="${minhasViagens}">
                            <tr>
                                <td><a href="/viagens/${v.id}"><c:out value="${v.titulo}" /></a><br><small style="color:#6b7385"><c:out value="${v.local}" /></small></td>
                                <td><c:out value="${v.periodo}" /></td>
                                <td><c:out value="${v.preco}" /></td>
                                <td>
                                    <c:choose>
                                        <c:when test="${v.esgotada}">Sem vagas</c:when>
                                        <c:otherwise><c:out value="${v.vagas}" /> livres</c:otherwise>
                                    </c:choose>
                                </td>
                                <td><span class="status"><c:choose><c:when test="${v.esgotada}">Esgotada</c:when><c:otherwise>Aberta</c:otherwise></c:choose></span></td>
                                <td><a href="/editarviagem/${v.id}">Editar</a></td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
                </div>
            </c:otherwise>
        </c:choose>
    </div>
</div>
