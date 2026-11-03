<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>

<div class="perfil-edit-page">

    <!-- MENU LATERAL -->
    <aside class="perfil-sidebar">
        <h2>Meu Perfil</h2>
        <a href="#secao-foto">Foto e Banner</a>
        <a href="#secao-dados">
            <c:choose>
                <c:when test="${sessionScope.usuarioLogado.guia}">Dados do Guia</c:when>
                <c:otherwise>Dados da Empresa</c:otherwise>
            </c:choose>
        </a>
        <a href="#secao-sobre">Sobre</a>
        <a href="#secao-contato">Contato</a>
        <a href="#secao-especialidades">Especialidades</a>
        <a href="#secao-midia">Vídeo</a>
    </aside>

    <!-- CONTEÚDO PRINCIPAL -->
    <main class="perfil-content">

        <div class="perfil-hero-editor">
            <h1>Editar Perfil</h1>
            <p>Atualize as informações que aparecerão para os turistas.</p>
        </div>

        <form:form action="/salvarperfil" modelAttribute="perfil" enctype="multipart/form-data" class="perfil-form">
            <form:hidden path="id" />

            <!-- ========================
                 SEÇÃO: FOTO E BANNER
            ======================== -->
            <section id="secao-foto" class="form-card perfil-card">
                <h2>Foto e Banner</h2>

                <!-- BANNER (separado da foto, sem cobrir) -->
                <div class="banner-wrapper">
                    <div class="banner-preview" id="bannerPreview">
                        <c:if test="${not empty perfil.bannerBase64}">
                            <img src="${perfil.bannerBase64}" alt="Banner atual">
                        </c:if>
                        <label class="upload-banner" title="Alterar banner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Alterar Banner
                            <form:input path="bannerFile" type="file" id="bannerInput" accept="image/*" hidden="hidden" />
                        </label>
                    </div>
                </div>

                <!-- FOTO DO PERFIL (abaixo do banner, nunca sobreposta) -->
                <div class="profile-photo-section">
                    <div class="profile-photo-container">
                        <img src="${not empty perfil.fotoBase64 ? perfil.fotoBase64 : '/imagens/user-placeholder.svg'}"
                             id="previewPerfil"
                             class="profile-photo"
                             alt="Foto do perfil">
                        <label class="upload-photo" title="Alterar foto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            Alterar Foto
                            <form:input path="fotoFile" type="file" id="fotoPerfil" accept="image/*" hidden="hidden" />
                        </label>
                    </div>
                    <p class="foto-hint">Clique em "Alterar Foto" para escolher uma imagem do seu dispositivo.</p>
                </div>
            </section>

            <!-- ========================
                 SEÇÃO: DADOS
            ======================== -->
            <section id="secao-dados" class="form-card perfil-card">
                <h2>
                    <c:choose>
                        <c:when test="${sessionScope.usuarioLogado.guia}">Dados do Guia</c:when>
                        <c:otherwise>Dados da Empresa</c:otherwise>
                    </c:choose>
                </h2>

                <div class="form-grid">

                    <div>
                        <label>
                            <c:choose>
                                <c:when test="${sessionScope.usuarioLogado.guia}">Nome do Guia</c:when>
                                <c:otherwise>Nome da Empresa</c:otherwise>
                            </c:choose>
                        </label>
                        <form:input path="usuario.nome" disabled="true" cssClass="campo-bloqueado" />
                        <small class="locked-help">Vem do cadastro — não é editável aqui.</small>
                    </div>

                    <div>
                        <label>CADASTUR</label>
                        <form:input path="usuario.cadastur" disabled="true" cssClass="campo-bloqueado" />
                        <small class="locked-help">Vem do cadastro — não é editável aqui.</small>
                    </div>

                    <c:if test="${not sessionScope.usuarioLogado.guia}">
                        <div>
                            <label>CNPJ</label>
                            <form:input path="usuario.cnpj" disabled="true" cssClass="campo-bloqueado" />
                            <small class="locked-help">Vem do cadastro — não é editável aqui.</small>
                        </div>
                    </c:if>

                    <div>
                        <label>Local / Endereço Principal</label>
                        <form:input path="usuario.local" disabled="true" cssClass="campo-bloqueado" />
                        <small class="locked-help">Vem do cadastro — não é editável aqui.</small>
                    </div>

                    <div>
                        <label>Cidade</label>
                        <form:input path="cidade" placeholder="Ex: Taquaritinga" />
                    </div>

                    <div>
                        <label>Estado</label>
                        <form:input path="estado" maxlength="2" placeholder="SP" />
                    </div>

                </div>
            </section>

            <!-- ========================
                 SEÇÃO: SOBRE
            ======================== -->
            <section id="secao-sobre" class="form-card perfil-card">
                <h2>
                    <c:choose>
                        <c:when test="${sessionScope.usuarioLogado.guia}">Sobre o Guia</c:when>
                        <c:otherwise>Sobre a Empresa</c:otherwise>
                    </c:choose>
                </h2>
                <form:textarea path="sobre" rows="7"
                    placeholder="Conte sua história, experiência no mercado, diferenciais e tipos de viagens realizadas..." />
            </section>

            <!-- ========================
                 SEÇÃO: CONTATO E REDES
            ======================== -->
            <section id="secao-contato" class="form-card perfil-card">
                <h2>Redes Sociais e Contato</h2>

                <div class="form-grid">

                    <div>
                        <label>
                            <span class="rede-icone rede-whatsapp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                </svg>
                            </span>
                            WhatsApp
                        </label>
                        <form:input path="whatsapp" id="whatsapp" data-mask="whatsapp" placeholder="(16) 99999-9999" />
                        <small class="field-hint">Apenas o número — ex: (16) 99999-9999</small>
                    </div>

                    <div>
                        <label>
                            <span class="rede-icone rede-instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </span>
                            Instagram
                        </label>
                        <form:input path="instagram" id="instagram" data-mask="instagram" placeholder="@seuinstagram" />
                        <small class="field-hint">Digite apenas o @usuário</small>
                    </div>

                    <div>
                        <label>
                            <span class="rede-icone rede-facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </span>
                            Facebook
                        </label>
                        <form:input path="facebook" placeholder="facebook.com/seuperfil" />
                        <small class="field-hint">Perfil ou página no Facebook</small>
                    </div>

                    <div>
                        <label>
                            <span class="rede-icone rede-twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </span>
                            X (Twitter)
                        </label>
                        <form:input path="twitter" id="twitter" data-mask="twitter" placeholder="@seutwitter" />
                        <small class="field-hint">Digite apenas o @usuário</small>
                    </div>

                    <div class="form-grid-full">
                        <label>
                            <span class="rede-icone rede-site">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                            </span>
                            Site Oficial
                        </label>
                        <form:input path="site" placeholder="www.seusite.com.br" />
                        <small class="field-hint">URL do seu site (pode incluir https:// ou não)</small>
                    </div>

                </div>
            </section>

            <!-- ========================
                 SEÇÃO: ESPECIALIDADES
            ======================== -->
            <section id="secao-especialidades" class="form-card perfil-card">
                <h2>Especialidades</h2>

                <div class="form-grid">

                    <div>
                        <label>Idiomas</label>
                        <form:input path="idiomas" placeholder="Português, Inglês, Espanhol" />
                        <small class="field-hint">Separe os idiomas por vírgula</small>
                    </div>

                    <div>
                        <label>Especialidades</label>
                        <form:input path="especialidades" placeholder="Religioso, Cultural, Ecoturismo" />
                        <small class="field-hint">Separe as especialidades por vírgula</small>
                    </div>

                    <div>
                        <label>Clientes Atendidos</label>
                        <input type="number" value="0" disabled class="campo-bloqueado" title="Gerado automaticamente pelo sistema">
                        <small class="locked-help">Calculado automaticamente.</small>
                    </div>

                    <div>
                        <label>Viagens Realizadas</label>
                        <input type="number" value="0" disabled class="campo-bloqueado" title="Gerado automaticamente pelo sistema">
                        <small class="locked-help">Calculado automaticamente.</small>
                    </div>

                </div>
            </section>

            <!-- ========================
                 SEÇÃO: VÍDEO
            ======================== -->
            <section id="secao-midia" class="form-card perfil-card">
                <h2>Vídeo de Apresentação</h2>
                <form:input path="videoUrl" placeholder="https://youtube.com/..." />
                <small class="field-hint">Cole o link do YouTube ou Vimeo</small>
            </section>

            <!-- BOTÃO SALVAR -->
            <section class="save-area">
                <button class="save-btn" type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Salvar Perfil
                </button>
            </section>

        </form:form>
    </main>
</div>
