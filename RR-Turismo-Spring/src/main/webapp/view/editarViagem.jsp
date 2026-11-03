<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<div class="ev-wrapper">

    <%-- ── MENSAGENS DO SERVIDOR ── --%>
    <c:if test="${not empty mensagemSucesso}">
        <div class="ev-toast ev-toast-ok" id="evToast">✔ ${mensagemSucesso}</div>
    </c:if>
    <c:if test="${not empty mensagemErro}">
        <div class="ev-toast ev-toast-err" id="evToast">✖ ${mensagemErro}</div>
    </c:if>

    <%-- ── CABEÇALHO DA PÁGINA ── --%>
    <div class="ev-page-header">
        <span class="ev-admin-label">PAINEL ADMINISTRATIVO</span>
        <h1 class="ev-page-title">Gerenciamento de Viagens</h1>
        <p class="ev-page-sub">Edite, filtre e gerencie as viagens cadastradas</p>
    </div>

    <%-- ── BARRA DE BUSCA RÁPIDA ── --%>
    <div class="ev-search-bar">
        <div class="ev-search-field ev-field-destino">
            <label class="ev-search-label">DESTINO</label>
            <div class="ev-search-input-wrap">
                <span class="ev-search-icon-inner">&#128269;</span>
                <input type="text" id="sbDestino" class="ev-search-input"
                       placeholder="Cidade, estado, país ou viagem">
            </div>
        </div>

        <div class="ev-search-field ev-field-date">
            <label class="ev-search-label">IDA</label>
            <input type="date" id="sbIda" class="ev-search-input ev-date-input">
        </div>

        <div class="ev-search-field ev-field-date">
            <label class="ev-search-label">VOLTA</label>
            <input type="date" id="sbVolta" class="ev-search-input ev-date-input">
        </div>

        <div class="ev-search-field ev-field-pessoas">
            <label class="ev-search-label">PESSOAS</label>
            <input type="number" id="sbPessoas" class="ev-search-input"
                   placeholder="2" min="1">
        </div>

        <button class="ev-search-btn" id="btnBuscar">
            &#128269; Buscar
        </button>
    </div>

    <%-- ── CORPO: SIDEBAR + CONTEÚDO ── --%>
    <c:choose>
        <c:when test="${empty viagens}">
            <div class="ev-empty-state">
                <div class="ev-empty-icon">&#9992;&#65039;</div>
                <h3>Nenhuma viagem cadastrada ainda</h3>
                <p>Crie sua primeira viagem para ela aparecer aqui.</p>
                <a href="/criarviagem" class="ev-btn-criar-primeira">+ Criar nova viagem</a>
            </div>
        </c:when>
        <c:otherwise>

            <div class="ev-body">

                <%-- ── SIDEBAR DE FILTROS ── --%>
                <aside class="ev-sidebar">

                    <div class="ev-sidebar-top">
                        <div>
                            <span class="ev-premium-label">FILTROS PREMIUM</span>
                            <h2 class="ev-sidebar-title">Refinar viagens</h2>
                        </div>
                        <button class="ev-reset-btn" id="btnResetFiltros" title="Limpar todos os filtros">&#8635;</button>
                    </div>

                    <div class="ev-filter-group">
                        <label class="ev-filter-label">FAIXA DE PREÇO</label>
                        <div class="ev-price-range">
                            <input type="text" id="precoMin" class="ev-price-input" placeholder="R$ 0,00">
                            <span class="ev-price-sep">—</span>
                            <input type="text" id="precoMax" class="ev-price-input" placeholder="R$ 0,00">
                        </div>
                    </div>

                    <div class="ev-filter-group">
                        <label class="ev-filter-label">TIPO DE VIAGEM</label>
                        <select id="filtroCategoria" class="ev-filter-select">
                            <option value="">Todos os tipos</option>
                            <option value="Praia">&#127958; Praia</option>
                            <option value="Aventura">&#9968; Aventura</option>
                            <option value="Romântico">&#128145; Romântico</option>
                            <option value="Familiar">&#128106; Familiar</option>
                        </select>
                    </div>

                    <div class="ev-filter-group">
                        <label class="ev-filter-label">TRANSPORTE</label>
                        <select id="filtroTransporte" class="ev-filter-select">
                            <option value="">Todos</option>
                            <option value="Ônibus">&#128652; Ônibus</option>
                            <option value="Avião">&#9992; Avião</option>
                            <option value="Van">&#128656; Van</option>
                        </select>
                    </div>

                    <div class="ev-filter-group">
                        <label class="ev-filter-label">STATUS DA VIAGEM</label>
                        <div class="ev-radio-group">
                            <label class="ev-radio-label">
                                <input type="radio" name="statusFiltro" value="" class="ev-radio" checked>
                                <span class="ev-radio-custom"></span>
                                Todas
                            </label>
                            <label class="ev-radio-label">
                                <input type="radio" name="statusFiltro" value="disponivel" class="ev-radio">
                                <span class="ev-radio-custom"></span>
                                Disponível
                            </label>
                            <label class="ev-radio-label">
                                <input type="radio" name="statusFiltro" value="ultimas" class="ev-radio">
                                <span class="ev-radio-custom"></span>
                                Últimas vagas
                            </label>
                            <label class="ev-radio-label">
                                <input type="radio" name="statusFiltro" value="esgotado" class="ev-radio">
                                <span class="ev-radio-custom"></span>
                                Esgotado
                            </label>
                        </div>
                    </div>

                </aside>

                <%-- ── CONTEÚDO PRINCIPAL ── --%>
                <div class="ev-main">

                    <div class="ev-main-top">
                        <div>
                            <h2 class="ev-main-title">Viagens cadastradas</h2>
                            <p class="ev-main-count" id="contadorResultado">carregando...</p>
                        </div>
                        <div class="ev-ordenar-wrap">
                            <span class="ev-ordenar-label">ORDENAR</span>
                            <select id="selectOrdenar" class="ev-ordenar-select">
                                <option value="recente">Relevância</option>
                                <option value="antigo">Mais antigo</option>
                                <option value="preco-asc">Menor preço</option>
                                <option value="preco-desc">Maior preço</option>
                                <option value="nome-az">Nome A–Z</option>
                                <option value="nome-za">Nome Z–A</option>
                            </select>
                        </div>
                    </div>

                    <%-- ── GRID DE CARDS ── --%>
                    <div class="ev-grid" id="viagensGrid">

                        <c:forEach var="v" items="${viagens}">
                            <div class="ev-card-wrapper"
                                 data-id="${v.id}"
                                 data-nome="${v.nomedestino}"
                                 data-local="${v.local}"
                                 data-categoria="${v.categoria}"
                                 data-transporte="${v.transporte}"
                                 data-preco="${v.preco}"
                                 data-assentos="${v.assentos}"
                                 data-ida="${v.dataIda}"
                                 data-volta="${v.dataVolta}"
                                 data-pessoas="${v.pessoas}">

                                <div class="ev-card">

                                    <%-- Imagem --%>
                                    <div class="ev-card-img-wrap">
                                        <img class="ev-card-img"
                                             src="/viagem/imagem/${v.id}"
                                             alt="Imagem de ${v.nomedestino}"
                                             onerror="this.parentElement.classList.add('ev-no-img'); this.style.display='none';">
                                    </div>

                                    <%-- Faixa azul com nome do destino --%>
                                    <div class="ev-card-title-bar">${v.nomedestino} - ${v.local}</div>

                                    <%-- Corpo do card --%>
                                    <div class="ev-card-body">

                                        <div class="ev-card-meta-row">
                                            <span class="ev-status-badge" data-assentos="${v.assentos}">
                                                <%-- preenchido pelo JS --%>
                                            </span>
                                            <span class="ev-card-id">ID #${v.id}</span>
                                        </div>

                                        <p class="ev-card-desc">${v.descricao}</p>

                                        <div class="ev-card-details">
                                            <div class="ev-card-detail-item">
                                                <span class="ev-detail-label">Data:</span>
                                                <span class="ev-detail-val">${v.dataIda}</span>
                                            </div>
                                            <div class="ev-card-detail-item">
                                                <span class="ev-detail-label">Vagas:</span>
                                                <span class="ev-detail-val">${v.assentos}</span>
                                            </div>
                                        </div>

                                        <p class="ev-card-price" data-preco="${v.preco}">R$ ${v.preco}</p>

                                        <div class="ev-card-actions">
                                            <a href="/editarviagem/${v.id}" class="ev-btn-editar">
                                                &#9999;&#65039; Editar viagem
                                            </a>
                                            <button class="ev-btn-deletar"
                                                    data-id="${v.id}"
                                                    data-nome="${v.nomedestino}"
                                                    title="Excluir viagem">
                                                &#128465;&#65039;
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </c:forEach>

                        <%-- Estado vazio pós-filtro --%>
                        <div class="ev-no-results hidden" id="semResultados">
                            <div class="ev-no-results-icon">&#128269;</div>
                            <h3>Nenhuma viagem encontrada</h3>
                            <p>Tente ajustar ou limpar os filtros.</p>
                        </div>

                    </div><%-- /ev-grid --%>
                </div><%-- /ev-main --%>
            </div><%-- /ev-body --%>

        </c:otherwise>
    </c:choose>
</div><%-- /ev-wrapper --%>

<%-- ── MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ── --%>
<div class="ev-modal-overlay hidden" id="modalDeleteOverlay">
    <div class="ev-modal-box">
        <div class="ev-modal-icon">&#128465;&#65039;</div>
        <h3 class="ev-modal-title">Excluir viagem</h3>
        <p class="ev-modal-text">
            Tem certeza que deseja excluir a viagem
            <strong id="nomeViagemDelete"></strong>?<br>
            Esta ação <strong>não pode ser desfeita</strong>.
        </p>
        <div class="ev-modal-btns">
            <button class="ev-modal-cancelar" id="btnCancelarDelete">Cancelar</button>
            <form id="formDeletar" method="post" style="margin:0">
                <button type="submit" class="ev-modal-confirmar">Sim, excluir</button>
            </form>
        </div>
    </div>
</div>
