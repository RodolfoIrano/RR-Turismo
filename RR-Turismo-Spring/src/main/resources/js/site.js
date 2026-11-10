/* ============================================================
   📄 O QUE ESTE ARQUIVO FAZ:
   JavaScript do visual novo do site (carregado por layout.jsp):
     1) Menu do topo no celular (botão ☰) e menu lateral do painel.
     2) Banner grande que passa as viagens (home).
     3) Favoritos (coração) - guardados no navegador, por conta.
     4) Mostrar/ocultar viagens na página /favoritos.
     5) Rodapé "sanfona" no celular.  6) Botão grade/lista do catálogo.
     7) Busca por voz (microfone) na home, onde o navegador permitir.

   ✏️ ONDE MUDAR O QUÊ:
     - Tempo de troca do banner ........ TEMPO_BANNER_MS (logo abaixo)
     - Nome da chave dos favoritos ..... PREFIXO_FAVORITOS
   Se este arquivo der erro, as páginas continuam abrindo (só perdem
   os efeitos).
   ============================================================ */
(function () {
    "use strict";

    var TEMPO_BANNER_MS = 6000;
    var PREFIXO_FAVORITOS = "rr_favoritos_";

    function pronto(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    /* ---------------- 1) MENUS NO CELULAR ---------------- */
    function iniciarMenus() {
        var burger = document.getElementById("siteBurger");
        var menu = document.getElementById("siteMenu");
        if (burger && menu) {
            burger.addEventListener("click", function () {
                var aberto = menu.classList.toggle("aberto");
                burger.setAttribute("aria-expanded", aberto ? "true" : "false");
                burger.innerHTML = aberto ? "&#10005;" : "&#9776;";
            });
            // Clicar num link fecha o menu.
            menu.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("#siteNav a")) {
                    menu.classList.remove("aberto");
                    burger.setAttribute("aria-expanded", "false");
                    burger.innerHTML = "&#9776;";
                }
            });
        }

        var pBurger = document.getElementById("painelBurger");
        var barra = document.getElementById("barraLateral");
        var fundo = document.getElementById("painelFundo");
        if (pBurger && barra) {
            function alternar(abrir) {
                barra.classList.toggle("aberta", abrir);
                if (fundo) fundo.classList.toggle("visivel", abrir);
                pBurger.setAttribute("aria-expanded", abrir ? "true" : "false");
            }
            pBurger.addEventListener("click", function () { alternar(!barra.classList.contains("aberta")); });
            if (fundo) fundo.addEventListener("click", function () { alternar(false); });
        }
    }

    /* ---------------- 2) BANNER ---------------- */
    function iniciarBanner() {
        var banner = document.getElementById("banner");
        if (!banner) return;
        var slides = banner.querySelectorAll(".banner-slide");
        if (slides.length === 0) return;

        var atual = 0;
        var timer = null;
        var pontos = banner.querySelectorAll(".banner-pontos button");

        function ir(n) {
            atual = (n + slides.length) % slides.length;
            slides.forEach(function (s, i) { s.classList.toggle("ativo", i === atual); });
            pontos.forEach(function (p, i) {
                p.classList.toggle("ativo", i === atual);
                p.setAttribute("aria-current", i === atual ? "true" : "false");
            });
        }
        function iniciar() {
            parar();
            if (slides.length < 2) return;
            if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            timer = setInterval(function () { ir(atual + 1); }, TEMPO_BANNER_MS);
        }
        function parar() { if (timer) { clearInterval(timer); timer = null; } }

        var ant = banner.querySelector(".banner-seta.ant");
        var prox = banner.querySelector(".banner-seta.prox");
        if (ant) ant.addEventListener("click", function () { ir(atual - 1); iniciar(); });
        if (prox) prox.addEventListener("click", function () { ir(atual + 1); iniciar(); });
        pontos.forEach(function (p, i) { p.addEventListener("click", function () { ir(i); iniciar(); }); });

        banner.addEventListener("mouseenter", parar);
        banner.addEventListener("mouseleave", iniciar);
        banner.addEventListener("focusin", parar);
        banner.addEventListener("focusout", iniciar);

        // Arrastar o dedo no celular troca o slide.
        var xIni = null;
        banner.addEventListener("touchstart", function (e) { xIni = e.touches[0].clientX; }, { passive: true });
        banner.addEventListener("touchend", function (e) {
            if (xIni === null) return;
            var dx = e.changedTouches[0].clientX - xIni;
            if (Math.abs(dx) > 40) { ir(atual + (dx < 0 ? 1 : -1)); iniciar(); }
            xIni = null;
        }, { passive: true });

        // Foto que não carrega: tira a <img> e deixa o degradê azul aparecer.
        banner.querySelectorAll(".banner-slide img").forEach(function (img) {
            img.addEventListener("error", function () { img.remove(); });
        });

        ir(0);
        iniciar();
    }

    /* ---------------- 3) FAVORITOS ---------------- */
    function chaveDosFavoritos() {
        var conta = document.body.getAttribute("data-conta") || "visitante";
        return PREFIXO_FAVORITOS + conta;
    }
    function lerFavoritos() {
        try {
            var lista = JSON.parse(localStorage.getItem(chaveDosFavoritos()) || "[]");
            return Array.isArray(lista) ? lista.map(String) : [];
        } catch (e) { return []; }
    }
    function gravarFavoritos(lista) {
        try { localStorage.setItem(chaveDosFavoritos(), JSON.stringify(lista)); } catch (e) { /* sem armazenamento: ignora */ }
    }
    function pintarCoracoes() {
        var lista = lerFavoritos();
        document.querySelectorAll(".coracao[data-id]").forEach(function (b) {
            var ativo = lista.indexOf(b.getAttribute("data-id")) !== -1;
            b.classList.toggle("ativo", ativo);
            b.setAttribute("aria-pressed", ativo ? "true" : "false");
            b.setAttribute("aria-label", ativo ? "Tirar dos favoritos" : "Salvar nos favoritos");
            var txt = b.querySelector(".coracao-txt");
            if (txt) txt.textContent = ativo ? "Salvo nos favoritos" : "Salvar nos favoritos";
        });
    }
    function atualizarPaginaFavoritos() {
        var grade = document.getElementById("favoritosGrade");
        if (!grade) return;
        var lista = lerFavoritos();
        var visiveis = 0;
        grade.querySelectorAll(".viagem-card-item").forEach(function (c) {
            var mostrar = lista.indexOf(c.getAttribute("data-id")) !== -1;
            c.hidden = !mostrar;
            if (mostrar) visiveis++;
        });
        var vazio = document.getElementById("favoritosVazio");
        if (vazio) vazio.hidden = visiveis > 0;
        grade.hidden = visiveis === 0;
        var cont = document.getElementById("favoritosContagem");
        if (cont) cont.textContent = visiveis === 1 ? "1 viagem salva" : visiveis + " viagens salvas";
    }
    function iniciarFavoritos() {
        document.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest(".coracao[data-id]") : null;
            if (!b) return;
            e.preventDefault();
            e.stopPropagation();
            var id = b.getAttribute("data-id");
            var lista = lerFavoritos();
            var i = lista.indexOf(id);
            if (i === -1) lista.push(id); else lista.splice(i, 1);
            gravarFavoritos(lista);
            pintarCoracoes();
            atualizarPaginaFavoritos();
        });
        pintarCoracoes();
        atualizarPaginaFavoritos();
    }

    /* ---------------- 5) RODAPÉ SANFONA (celular) ---------------- */
    function iniciarRodape() {
        document.querySelectorAll(".rodape-titulo").forEach(function (b) {
            b.addEventListener("click", function () {
                var grupo = b.parentElement;
                var aberto = grupo.classList.toggle("aberto");
                b.setAttribute("aria-expanded", aberto ? "true" : "false");
            });
        });
    }

    /* ---------------- 6) GRADE / LISTA do catálogo ---------------- */
    function iniciarVisao() {
        var grade = document.getElementById("catalogoGrade");
        var bGrade = document.getElementById("visaoGrade");
        var bLista = document.getElementById("visaoLista");
        if (!grade || !bGrade || !bLista) return;
        function aplicar(modo) {
            grade.classList.toggle("lista", modo === "lista");
            bGrade.classList.toggle("ativo", modo !== "lista");
            bLista.classList.toggle("ativo", modo === "lista");
            try { localStorage.setItem("rr_visao", modo); } catch (e) { }
        }
        var salvo = "grade";
        try { salvo = localStorage.getItem("rr_visao") || "grade"; } catch (e) { }
        aplicar(salvo);
        bGrade.addEventListener("click", function () { aplicar("grade"); });
        bLista.addEventListener("click", function () { aplicar("lista"); });
    }

    /* ---------------- 7) BUSCA POR VOZ (Chrome/Edge) ---------------- */
    function iniciarVoz() {
        var botao = document.getElementById("botaoVoz");
        var campo = document.getElementById("campoBusca");
        var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!botao || !campo || !Rec) return;   // navegador sem suporte: o botão fica escondido
        botao.hidden = false;
        var rec = new Rec();
        rec.lang = "pt-BR";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        var ouvindo = false;
        rec.onresult = function (e) {
            campo.value = e.results[0][0].transcript.replace(/[.!?]+$/, "");
            if (campo.form) campo.form.submit();
        };
        rec.onend = function () { ouvindo = false; botao.classList.remove("ouvindo"); };
        rec.onerror = function () { ouvindo = false; botao.classList.remove("ouvindo"); };
        botao.addEventListener("click", function () {
            if (ouvindo) { rec.stop(); return; }
            try { rec.start(); ouvindo = true; botao.classList.add("ouvindo"); } catch (e) { }
        });
    }

    pronto(function () {
        try { iniciarMenus(); } catch (e) { console.error(e); }
        try { iniciarBanner(); } catch (e) { console.error(e); }
        try { iniciarFavoritos(); } catch (e) { console.error(e); }
        try { iniciarRodape(); } catch (e) { console.error(e); }
        try { iniciarVisao(); } catch (e) { console.error(e); }
        try { iniciarVoz(); } catch (e) { console.error(e); }
    });
})();
