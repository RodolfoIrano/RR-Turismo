<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>

<c:set var="usuario" value="${perfil.usuario}" />
<c:set var="nomePerfil" value="${empty usuario.nome ? usuario.email : usuario.nome}" />
<c:set var="isGuia" value="${usuario.guia}" />
<%-- viajante = nem guia nem empresa (só compra viagens) --%>
<c:set var="isViajante" value="${not usuario.guia and not usuario.empresa}" />

<div class="public-profile-page">

    <!-- BANNER -->
    <section class="public-banner">
        <c:choose>
            <c:when test="${not empty perfil.bannerBase64}">
                <img src="${perfil.bannerBase64}" alt="Banner do perfil">
            </c:when>
            <c:otherwise>
                <div class="banner-padrao"></div>
            </c:otherwise>
        </c:choose>
    </section>

    <!-- PERFIL: FOTO + NOME (sem sobrepor o banner) -->
    <section class="public-profile">

        <div class="public-avatar-wrapper">
            <img src="${not empty perfil.fotoBase64 ? perfil.fotoBase64 : '/imagens/user-placeholder.svg'}"
                 class="public-avatar"
                 alt="Foto do perfil">
        </div>

        <h1><c:out value="${nomePerfil}" /></h1>

        <div class="badges">
            <span>
                <c:choose>
                    <c:when test="${isGuia}">&#10004; Guia Verificado</c:when>
                    <c:when test="${isViajante}">&#9992; Viajante</c:when>
                    <c:otherwise>&#10004; Empresa Verificada</c:otherwise>
                </c:choose>
            </span>
            <c:if test="${not empty usuario.cadastur}">
                <span>&#10004; CADASTUR</span>
            </c:if>
        </div>

        <c:if test="${not empty perfil.cidade || not empty perfil.estado || not empty usuario.local}">
            <p class="location">
                &#128205;
                <c:choose>
                    <c:when test="${not empty perfil.cidade || not empty perfil.estado}">
                        <c:out value="${perfil.cidade}" />
                        <c:if test="${not empty perfil.cidade && not empty perfil.estado}"> - </c:if>
                        <c:out value="${perfil.estado}" />
                    </c:when>
                    <c:otherwise>
                        <c:out value="${usuario.local}" />
                    </c:otherwise>
                </c:choose>
            </p>
        </c:if>

        <c:if test="${not empty perfil.idiomas}">
            <p class="languages">&#127758; <c:out value="${perfil.idiomas}" /></p>
        </c:if>

    </section>

    <!-- ESTATÍSTICAS -->
    <c:if test="${not isViajante}">
    <section class="stats-public">
        <div class="stat-card">
            <h2>0</h2>
            <p>Clientes Atendidos</p>
        </div>
        <div class="stat-card">
            <h2>0</h2>
            <p>Viagens Realizadas</p>
        </div>
        <div class="stat-card">
            <h2>0</h2>
            <p>Avaliações</p>
        </div>
    </section>
    </c:if>

    <!-- SOBRE (título muda conforme tipo) -->
    <section class="public-section">
        <h2>
            <c:choose>
                <c:when test="${isGuia}">Sobre o Guia</c:when>
                <c:when test="${isViajante}">Sobre mim</c:when>
                <c:otherwise>Sobre a Empresa</c:otherwise>
            </c:choose>
        </h2>
        <p>
            <c:choose>
                <c:when test="${not empty perfil.sobre}">
                    <c:out value="${perfil.sobre}" />
                </c:when>
                <c:otherwise>Este perfil ainda não possui uma descrição cadastrada.</c:otherwise>
            </c:choose>
        </p>
    </section>

    <!-- ESPECIALIDADES -->
    <c:if test="${not empty perfil.especialidades}">
        <section class="public-section">
            <h2>Especialidades</h2>
            <div class="specialties">
                <c:forEach var="item" items="${fn:split(perfil.especialidades, ',')}">
                    <span><c:out value="${fn:trim(item)}" /></span>
                </c:forEach>
            </div>
        </section>
    </c:if>

    <!-- VÍDEO -->
    <c:if test="${not empty perfil.videoUrl}">
        <section class="public-section">
            <h2>Vídeo de Apresentação</h2>
            <div class="video-wrapper">
                <iframe src="${perfil.videoUrl}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
            </div>
        </section>
    </c:if>

    <!-- CONTATO: ícones bonitos -->
    <section class="public-section">
        <h2>Entre em Contato</h2>
        <div class="contact-buttons">

            <c:if test="${not empty perfil.whatsapp}">
                <a href="#"
                   data-whatsapp="${perfil.whatsapp}"
                   target="_blank"
                   rel="noopener"
                   class="contact-icon js-whatsapp-link"
                   aria-label="WhatsApp"
                   title="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                </a>
            </c:if>

            <c:if test="${not empty perfil.instagram}">
                <a href="https://instagram.com/${perfil.instagram}"
                   target="_blank"
                   rel="noopener"
                   class="contact-icon"
                   aria-label="Instagram"
                   title="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#insta-grad)">
                        <defs>
                            <linearGradient id="insta-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#f09433"/>
                                <stop offset="25%" style="stop-color:#e6683c"/>
                                <stop offset="50%" style="stop-color:#dc2743"/>
                                <stop offset="75%" style="stop-color:#cc2366"/>
                                <stop offset="100%" style="stop-color:#bc1888"/>
                            </linearGradient>
                        </defs>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                </a>
            </c:if>

            <c:if test="${not empty perfil.facebook}">
                <a href="${perfil.facebook}"
                   target="_blank"
                   rel="noopener"
                   class="contact-icon"
                   aria-label="Facebook"
                   title="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                </a>
            </c:if>

            <c:if test="${not empty perfil.twitter}">
                <a href="https://x.com/${perfil.twitter}"
                   target="_blank"
                   rel="noopener"
                   class="contact-icon"
                   aria-label="X (Twitter)"
                   title="X (Twitter)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </a>
            </c:if>

            <c:if test="${not empty perfil.site}">
                <a href="${perfil.site}"
                   target="_blank"
                   rel="noopener"
                   class="contact-site"
                   aria-label="Site Oficial"
                   title="Site Oficial">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Site Oficial
                </a>
            </c:if>

        </div>
    </section>

</div>
