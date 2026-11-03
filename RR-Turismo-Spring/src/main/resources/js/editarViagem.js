/* =========================================================
   RR Turismo — editarViagem.js
   - Filtragem client-side (busca, sidebar, status, preço)
   - Ordenação
   - Modal de confirmação de exclusão
   - Badges de status dinâmicos
   - Máscaras de preço nos inputs de filtro
========================================================= */

/* ── FUNÇÕES GLOBAIS do modal (chamadas inline pelo JSP) ── */
function abrirModalDelete(id, nome) {
    var overlay = document.getElementById("modalDeleteOverlay");
    var nomeEl  = document.getElementById("nomeViagemDelete");
    var form    = document.getElementById("formDeletar");
    if (!overlay || !nomeEl || !form) return;

    nomeEl.textContent = "\u201C" + nome + "\u201D";
    form.action        = "/deletarviagem/" + id;

    overlay.classList.remove("hidden");
    overlay.offsetHeight; // reflow
    overlay.classList.add("ev-modal-active");
}

function fecharModalDelete() {
    var overlay = document.getElementById("modalDeleteOverlay");
    if (!overlay) return;
    overlay.classList.remove("ev-modal-active");
    setTimeout(function () { overlay.classList.add("hidden"); }, 270);
}

window.abrirModalDelete  = abrirModalDelete;
window.fecharModalDelete = fecharModalDelete;

/* ── IIFE PRINCIPAL ── */
(function () {

    var grid = document.getElementById("viagensGrid");
    if (!grid) return;

    var todoCards = Array.from(grid.querySelectorAll(".ev-card-wrapper"));

    /* ─── 1. BADGES DE STATUS ─────────────────────────── */
    todoCards.forEach(function (card) {
        var assentos = parseInt(card.dataset.assentos, 10) || 0;
        var badge    = card.querySelector(".ev-status-badge");
        if (!badge) return;

        if (assentos === 0) {
            badge.textContent = "Esgotado";
            badge.classList.add("ev-badge-esgotado");
            card.dataset.status = "esgotado";
        } else if (assentos <= 5) {
            badge.textContent = "Últimas vagas";
            badge.classList.add("ev-badge-ultimas");
            card.dataset.status = "ultimas";
        } else {
            badge.textContent = "Disponível";
            badge.classList.add("ev-badge-disponivel");
            card.dataset.status = "disponivel";
        }
    });

    /* ─── 2. FORMATAR PREÇOS NOS CARDS ───────────────── */
    grid.querySelectorAll(".ev-card-price[data-preco]").forEach(function (el) {
        var v = parseFloat(el.dataset.preco);
        if (!isNaN(v)) {
            el.textContent = v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }
    });

    /* ─── 3. ESTADO DO FILTRO ─────────────────────────── */
    var estado = {
        busca:      "",
        dataIda:    "",
        dataVolta:  "",
        pessoas:    "",
        categoria:  "",
        transporte: "",
        status:     "",
        precoMin:   null,
        precoMax:   null,
        ordenar:    "recente"
    };

    /* ─── 4. REFERÊNCIAS DE ELEMENTOS ────────────────── */
    var sbDestino       = document.getElementById("sbDestino");
    var sbIda           = document.getElementById("sbIda");
    var sbVolta         = document.getElementById("sbVolta");
    var sbPessoas       = document.getElementById("sbPessoas");
    var btnBuscar       = document.getElementById("btnBuscar");
    var filtroCategoria = document.getElementById("filtroCategoria");
    var filtroTransporte= document.getElementById("filtroTransporte");
    var radioStatus     = document.querySelectorAll("input[name='statusFiltro']");
    var precoMinInput   = document.getElementById("precoMin");
    var precoMaxInput   = document.getElementById("precoMax");
    var selectOrdenar   = document.getElementById("selectOrdenar");
    var btnReset        = document.getElementById("btnResetFiltros");
    var contadorEl      = document.getElementById("contadorResultado");
    var semResultados   = document.getElementById("semResultados");

    /* ─── 5. MÁSCARA DE PREÇO NOS INPUTS ─────────────── */
    function mascaraPreco(input) {
        input.addEventListener("input", function () {
            var digits = this.value.replace(/\D/g, "");
            if (!digits) { this.value = ""; return; }
            var val = (parseInt(digits, 10) / 100).toFixed(2)
                          .replace(".", ",")
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            this.value = "R$ " + val;
        });
    }

    if (precoMinInput) mascaraPreco(precoMinInput);
    if (precoMaxInput) mascaraPreco(precoMaxInput);

    function parseMoeda(str) {
        if (!str) return null;
        var n = parseFloat(str.replace(/[R$\s.]/g, "").replace(",", "."));
        return isNaN(n) ? null : n;
    }

    /* ─── 6. LÓGICA DE FILTRO ─────────────────────────── */
    function aplicarFiltros() {

        estado.precoMin = parseMoeda(precoMinInput ? precoMinInput.value : "");
        estado.precoMax = parseMoeda(precoMaxInput ? precoMaxInput.value : "");

        var visiveis = todoCards.filter(function (card) {

            /* Busca de texto */
            if (estado.busca) {
                var nome  = (card.dataset.nome  || "").toLowerCase();
                var local = (card.dataset.local || "").toLowerCase();
                if (!nome.includes(estado.busca) && !local.includes(estado.busca)) return false;
            }

            /* Data de ida */
            if (estado.dataIda && card.dataset.ida && card.dataset.ida < estado.dataIda) return false;

            /* Data de volta */
            if (estado.dataVolta && card.dataset.volta && card.dataset.volta > estado.dataVolta) return false;

            /* Pessoas */
            if (estado.pessoas) {
                var assentos = parseInt(card.dataset.assentos, 10) || 0;
                if (assentos < parseInt(estado.pessoas, 10)) return false;
            }

            /* Categoria */
            if (estado.categoria && card.dataset.categoria !== estado.categoria) return false;

            /* Transporte */
            if (estado.transporte && card.dataset.transporte !== estado.transporte) return false;

            /* Status */
            if (estado.status && card.dataset.status !== estado.status) return false;

            /* Preço mínimo */
            if (estado.precoMin !== null) {
                var preco = parseFloat(card.dataset.preco || "0");
                if (preco < estado.precoMin) return false;
            }

            /* Preço máximo */
            if (estado.precoMax !== null) {
                var preco2 = parseFloat(card.dataset.preco || "0");
                if (preco2 > estado.precoMax) return false;
            }

            return true;
        });

        /* Ordenação */
        visiveis.sort(function (a, b) {
            switch (estado.ordenar) {
                case "nome-az":
                    return (a.dataset.nome || "").localeCompare(b.dataset.nome || "", "pt-BR");
                case "nome-za":
                    return (b.dataset.nome || "").localeCompare(a.dataset.nome || "", "pt-BR");
                case "preco-asc":
                    return parseFloat(a.dataset.preco || 0) - parseFloat(b.dataset.preco || 0);
                case "preco-desc":
                    return parseFloat(b.dataset.preco || 0) - parseFloat(a.dataset.preco || 0);
                case "antigo":
                    return parseInt(a.dataset.id || 0) - parseInt(b.dataset.id || 0);
                default: /* recente */
                    return parseInt(b.dataset.id || 0) - parseInt(a.dataset.id || 0);
            }
        });

        /* Atualiza DOM */
        todoCards.forEach(function (c) { c.style.display = "none"; });
        visiveis.forEach(function (c) {
            c.style.display = "";
            grid.appendChild(c);
        });

        /* Estado vazio */
        if (semResultados) {
            semResultados.classList.toggle("hidden", visiveis.length > 0);
        }

        /* Contador */
        if (contadorEl) {
            var total = todoCards.length;
            contadorEl.textContent = visiveis.length + " de " + total
                + " viagem" + (total !== 1 ? "s" : "") + " encontrada" + (total !== 1 ? "s" : "");
        }
    }

    /* ─── 7. LISTENERS DE FILTRO ─────────────────────── */

    /* Botão BUSCAR e campos da search bar */
    function lerSearchBar() {
        estado.busca   = sbDestino  ? sbDestino.value.toLowerCase().trim()  : "";
        estado.dataIda = sbIda      ? sbIda.value    : "";
        estado.dataVolta= sbVolta   ? sbVolta.value  : "";
        estado.pessoas = sbPessoas  ? sbPessoas.value : "";
        aplicarFiltros();
    }

    if (btnBuscar) btnBuscar.addEventListener("click", lerSearchBar);

    /* Também filtrar em tempo real ao digitar no destino */
    if (sbDestino) {
        sbDestino.addEventListener("input", function () {
            estado.busca = this.value.toLowerCase().trim();
            aplicarFiltros();
        });
    }

    /* Sidebar: categoria */
    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", function () {
            estado.categoria = this.value;
            aplicarFiltros();
        });
    }

    /* Sidebar: transporte */
    if (filtroTransporte) {
        filtroTransporte.addEventListener("change", function () {
            estado.transporte = this.value;
            aplicarFiltros();
        });
    }

    /* Sidebar: status (radio) */
    radioStatus.forEach(function (radio) {
        radio.addEventListener("change", function () {
            estado.status = this.value;
            aplicarFiltros();
        });
    });

    /* Sidebar: faixa de preço (com debounce) */
    var precoTimer;
    function onPrecoChange() {
        clearTimeout(precoTimer);
        precoTimer = setTimeout(aplicarFiltros, 350);
    }

    if (precoMinInput) precoMinInput.addEventListener("input", onPrecoChange);
    if (precoMaxInput) precoMaxInput.addEventListener("input", onPrecoChange);

    /* Ordenação */
    if (selectOrdenar) {
        selectOrdenar.addEventListener("change", function () {
            estado.ordenar = this.value;
            aplicarFiltros();
        });
    }

    /* ─── 8. BOTÃO RESET ──────────────────────────────── */
    if (btnReset) {
        btnReset.addEventListener("click", function () {
            estado.busca      = "";
            estado.dataIda    = "";
            estado.dataVolta  = "";
            estado.pessoas    = "";
            estado.categoria  = "";
            estado.transporte = "";
            estado.status     = "";
            estado.precoMin   = null;
            estado.precoMax   = null;
            estado.ordenar    = "recente";

            if (sbDestino)        sbDestino.value        = "";
            if (sbIda)            sbIda.value            = "";
            if (sbVolta)          sbVolta.value          = "";
            if (sbPessoas)        sbPessoas.value        = "";
            if (filtroCategoria)  filtroCategoria.value  = "";
            if (filtroTransporte) filtroTransporte.value = "";
            if (precoMinInput)    precoMinInput.value    = "";
            if (precoMaxInput)    precoMaxInput.value    = "";
            if (selectOrdenar)    selectOrdenar.value    = "recente";

            radioStatus.forEach(function (r) { r.checked = r.value === ""; });

            aplicarFiltros();
        });
    }

    /* ─── 9. MODAL DE EXCLUSÃO ────────────────────────── */
    grid.addEventListener("click", function (e) {
        var btn = e.target.closest(".ev-btn-deletar");
        if (btn) abrirModalDelete(btn.dataset.id, btn.dataset.nome);
    });

    var overlay    = document.getElementById("modalDeleteOverlay");
    var btnCancelar = document.getElementById("btnCancelarDelete");

    if (overlay) {
        overlay.addEventListener("click", function (e) {
            if (e.target === this) fecharModalDelete();
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", fecharModalDelete);
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") fecharModalDelete();
    });

    /* ─── 10. APLICAR NA CARGA INICIAL ───────────────── */
    aplicarFiltros();

})();