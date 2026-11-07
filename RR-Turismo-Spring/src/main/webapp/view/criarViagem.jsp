<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>

<%-- Define ação e textos com base no modo --%>
<c:set var="acaoForm"   value="${modoEdicao ? '/atualizarviagem' : '/cadastrarviagem'}"/>
<c:set var="tituloForm" value="${modoEdicao ? 'Editar Viagem'    : 'Criar Nova Viagem'}"/>
<c:set var="txtBotao"   value="${modoEdicao ? 'Salvar Alterações': 'Criar Viagem'}"/>

<div class="row">
    <div class="card">
        <div class="conteudo2">
            <div class="container">
                <c:set var="nomeUsuario" value="${empty sessionScope.usuarioLogado.nome ? sessionScope.usuarioLogado.email : sessionScope.usuarioLogado.nome}" />

                <%-- Link voltar (só aparece no modo edição) --%>
                <c:if test="${modoEdicao}">
                    <a href="/editarviagem" class="cv-voltar-link">&#8592; Voltar para gerenciamento</a>
                </c:if>

                <h1 class="titulo-pagina">${tituloForm}</h1>

                <%-- Mensagem de sucesso --%>
                <c:if test="${false}">
                    <div class="mensagem mensagem-sucesso" id="mensagemTopo">
                        ✔ ${mensagemSucesso}
                    </div>
                </c:if>

                <%-- Mensagem de erro do servidor --%>
                <c:if test="${false}">
                    <div class="mensagem mensagem-erro" id="mensagemTopo">
                        ✖ ${mensagemErro}
                    </div>
                </c:if>

                <form:form action="${acaoForm}" modelAttribute="viagem" id="formViagem"
                           enctype="multipart/form-data"
                           data-modo-edicao="${modoEdicao}"
                           data-viagem-id="${viagem.id}">

                    <%-- ID oculto obrigatório para atualização --%>
                    <c:if test="${modoEdicao}">
                        <input type="hidden" name="id" value="${viagem.id}">
                    </c:if>

                    <%-- ================= 1. GUIA ================= --%>
                    <section class="bloco cv-secao destaque">
                        <header class="cv-secao-topo">
                            <span class="cv-num">1</span>
                            <div>
                                <h2>Guia responsável</h2>
                                <p class="info">Usuário logado. Ele será vinculado à viagem e aparece no app com o perfil dele.</p>
                            </div>
                        </header>
                        <input type="text" value="${nomeUsuario} (logado)" disabled>
                    </section>

                    <%-- ================= 2. IMAGENS ================= --%>
                    <section class="bloco cv-secao">
                        <header class="cv-secao-topo">
                            <span class="cv-num">2</span>
                            <div>
                                <h2>Imagens do destino</h2>
                                <c:choose>
                                    <c:when test="${modoEdicao}">
                                        <p class="info">A viagem já possui uma imagem (veja na pré-visualização).
                                            Envie novas imagens para substituí-la, ou deixe em branco para manter a atual.</p>
                                    </c:when>
                                    <c:otherwise>
                                        <p class="info">Adicione de <b>1 a 5 imagens</b>. A primeira será a capa da viagem no site e no app.</p>
                                    </c:otherwise>
                                </c:choose>
                            </div>
                        </header>
                        <input type="file" id="imagemFile" name="imagens" accept="image/*" multiple>

                        <%-- Foto por LINK (ex.: do Google Imagens): o servidor baixa a imagem e ela entra na lista igual às do computador --%>
                        <div class="cv-link-imagem">
                            <label for="linkImagem" class="cv-link-rotulo">Ou use o link de uma imagem</label>
                            <div class="cv-link-linha">
                                <input type="text" id="linkImagem" placeholder="Cole aqui o link da imagem (ex.: do Google)" autocomplete="off">
                                <button type="button" id="btnAddLink" class="cv-link-botao">Adicionar por link</button>
                            </div>
                            <p class="info cv-link-dica">Dica: no Google Imagens, clique com o botão direito na foto e escolha
                                <b>Copiar endereço da imagem</b>. Depois é só colar aqui.</p>
                        </div>

                        <div id="preview"></div>
                    </section>

                    <%-- ================= 3. DESTINO ================= --%>
                    <section class="bloco cv-secao">
                        <header class="cv-secao-topo">
                            <span class="cv-num">3</span>
                            <div>
                                <h2>Destino e tipo de viagem</h2>
                                <p class="info">Para onde vai e que tipo de experiência é.</p>
                            </div>
                        </header>

                        <div class="grid-2">
                            <div>
                                <label for="nomedestino"><h3>Nome do destino:</h3></label>
                                <input type="text" id="nomedestino" name="nomedestino" maxlength="80"
                                       placeholder="Ex: Fim de semana em Ubatuba"
                                       value="${viagem.nomedestino}">
                            </div>

                            <div>
                                <label for="local"><h3>Local (cidade, estado e país):</h3></label>
                                <div class="campo-autocomplete">
                                    <input type="text" id="local" name="local" autocomplete="off"
                                           placeholder="Digite e escolha uma sugestão..."
                                           value="${viagem.local}">
                                    <div id="localSugestoes" class="lista-sugestoes"></div>
                                </div>
                                <small class="cv-dica">Escolha uma sugestão da lista: é ela que posiciona o mapa no app.</small>
                            </div>

                            <div>
                                <label for="categoria"><h3>Categoria da viagem:</h3></label>
                                <select id="categoria" name="categoria">
                                    <option value="Praia"        ${viagem.categoria == 'Praia'        ? 'selected' : ''}>🏖️ Praia</option>
                                    <option value="Aventura"     ${viagem.categoria == 'Aventura'     ? 'selected' : ''}>⛰️ Aventura</option>
                                    <option value="Romântico"    ${viagem.categoria == 'Romântico'    ? 'selected' : ''}>❤️ Romântico</option>
                                    <option value="Familiar"     ${viagem.categoria == 'Familiar'     ? 'selected' : ''}>👨‍👩‍👧 Familiar</option>
                                    <option value="Cultural"     ${viagem.categoria == 'Cultural'     ? 'selected' : ''}>🏛️ Cultural</option>
                                    <option value="Religioso"    ${viagem.categoria == 'Religioso'    ? 'selected' : ''}>🙏 Religioso</option>
                                    <option value="Ecoturismo"   ${viagem.categoria == 'Ecoturismo'   ? 'selected' : ''}>🌳 Ecoturismo</option>
                                    <option value="Gastronômico" ${viagem.categoria == 'Gastronômico' ? 'selected' : ''}>🍽️ Gastronômico</option>
                                    <option value="Educacional"  ${viagem.categoria == 'Educacional'  ? 'selected' : ''}>🎓 Educacional / Bate-volta</option>
                                </select>
                            </div>

                            <div>
                                <label for="transporte"><h3>Meio de transporte:</h3></label>
                                <select id="transporte" name="transporte">
                                    <option value="Ônibus" ${viagem.transporte == 'Ônibus' ? 'selected' : ''}>🚌 Ônibus</option>
                                    <option value="Avião"  ${viagem.transporte == 'Avião'  ? 'selected' : ''}>✈️ Avião</option>
                                    <option value="Van"    ${viagem.transporte == 'Van'    ? 'selected' : ''}>🚐 Van</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <%-- ================= 4. DATAS, VAGAS E PREÇO ================= --%>
                    <section class="bloco cv-secao">
                        <header class="cv-secao-topo">
                            <span class="cv-num">4</span>
                            <div>
                                <h2>Datas, vagas e preço</h2>
                                <p class="info">As datas aparecem no app com a contagem regressiva ("faltam X dias") para quem comprou.</p>
                            </div>
                        </header>

                        <label class="checkbox-linha" for="bateVolta">
                            <input type="checkbox" id="bateVolta" name="bateVolta" value="true">
                            <span>Viagem <b>bate e volta</b> (ida e volta no mesmo dia, sem hospedagem)</span>
                        </label>

                        <div class="grid-3">
                            <div>
                                <label for="dataIda"><h3>Data de ida:</h3></label>
                                <input type="date" id="dataIda" name="dataIda" value="${viagem.dataIda}">
                            </div>

                            <div>
                                <label for="dataVolta"><h3>Data de volta:</h3></label>
                                <input type="date" id="dataVolta" name="dataVolta" value="${viagem.dataVolta}">
                            </div>

                            <div>
                                <label for="preco"><h3>Preço por pessoa:</h3></label>
                                <input type="text" id="preco" name="precoStr" placeholder="R$ 0,00" inputmode="numeric"
                                       value="${not empty precoFormatado ? precoFormatado : ''}">
                            </div>
                        </div>

                        <%-- Resumo calculado pelo JavaScript (duração e quanto falta) --%>
                        <div id="resumoDatas" class="cv-resumo-datas" style="display:none;"></div>

                        <div class="cv-assentos">
                            <label for="assentos"><h3>Quantidade de assentos (vagas):</h3></label>
                            <div class="controle-assentos">
                                <button type="button" id="menosAssentos">-</button>
                                <input type="number" id="assentos" name="assentos"
                                       value="${viagem.assentos > 0 ? viagem.assentos : 46}" min="1" max="500">
                                <button type="button" id="maisAssentos">+</button>
                            </div>
                            <small class="cv-dica">Ônibus: 46 · Van: 15 · Avião: 180 (preenchido automaticamente ao escolher o transporte).</small>
                        </div>
                    </section>

                    <%-- ================= 5. HOSPEDAGEM ================= --%>
                    <section class="bloco cv-secao">
                        <header class="cv-secao-topo">
                            <span class="cv-num">5</span>
                            <div>
                                <h2>Hospedagem</h2>
                                <p class="info" id="infoHospedagem">Detalhes da estadia durante a viagem.</p>
                            </div>
                        </header>

                        <label for="hotel" id="labelHotel"><h3>Nome do hotel / pousada:</h3></label>
                        <p class="info" id="infoHotel" style="display:none;">
                            Como é bate e volta, coloque aqui o principal local visitado
                            (ex: "Fatec Taquaritinga", "Parque Ibirapuera").
                        </p>
                        <div class="campo-autocomplete">
                            <input type="text" id="hotel" name="hotel" autocomplete="off"
                                   placeholder="Ex: Hotel Praia Azul"
                                   value="${viagem.hotel}">
                            <div id="hotelSugestoes" class="lista-sugestoes"></div>
                        </div>

                        <div id="blocoPessoasQuarto">
                            <label for="pessoas"><h3>Pessoas por quarto:</h3></label>
                            <div class="controle-pessoas">
                                <button type="button" id="menosPessoas">-</button>
                                <input type="number" id="pessoas" name="pessoas"
                                       value="${viagem.pessoas > 0 ? viagem.pessoas : 1}" min="1" max="10">
                                <button type="button" id="maisPessoas">+</button>
                            </div>
                        </div>
                    </section>

                    <%-- ================= 6. DESCRIÇÃO ================= --%>
                    <section class="bloco cv-secao">
                        <header class="cv-secao-topo">
                            <span class="cv-num">6</span>
                            <div>
                                <h2>Descrição da viagem</h2>
                                <p class="info">Conte o roteiro, passeios, o que está incluso e o que levar. Tudo isso aparece no app.</p>
                            </div>
                        </header>
                        <textarea id="descricao" name="descricao" maxlength="2000"
                                  placeholder="Descreva a experiência, atividades, passeios, horário de saída, o que está incluso...">${viagem.descricao}</textarea>
                        <small class="cv-dica" id="contadorDescricao">0 / 2000</small>
                    </section>

                    <button type="button" id="btnCriar">${txtBotao}</button>

                </form:form>

                <%-- Preview card flutuante --%>
                <div id="previewCard" class="preview-wrapper hidden">
                    <div class="preview-box">
                        <button id="btnMinimizar" class="btn-minimizar" title="Minimizar pré-visualização">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>

                        <h3 class="preview-titulo">Pré-visualização</h3>

                        <div class="card-real">
                            <img id="cardImg" src="" alt="Imagem viagem">

                            <h3 id="cardDestino" class="destino">Destino - Local</h3>

                            <div class="card-info">
                                <div class="info-grid">
                                    <p class="linha"><strong>Guia:</strong> <a href="#" id="cardGuia">${nomeUsuario}</a></p>
                                    <p class="linha"><strong>Ida:</strong> <span id="cardIda">--</span></p>
                                    <p class="linha"><strong>Volta:</strong> <span id="cardVolta">--</span></p>
                                </div>
                                <p class="preco" id="cardPreco">R$ 0,00</p>
                                <button class="btn-card">Ver mais</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="iconeFlutuante" class="icone-flutuante" title="Ver pré-visualização">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>

            </div>
        </div>
    </div>
</div>
