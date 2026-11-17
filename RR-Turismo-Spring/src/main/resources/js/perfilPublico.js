// Monta o link do WhatsApp a partir do número salvo no banco
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-whatsapp-link").forEach((link) => {
        // Remove tudo que não for dígito
        const numero = (link.dataset.whatsapp || "").replace(/\D/g, "");
        link.href = numero ? `https://wa.me/55${numero}` : "#";
    });
});

// ============================================================
// Foto de perfil e capa ESTILO FACEBOOK
// Clicar na foto/capa abre um menu: "Ver ..." (tela cheia) e, se for o
// dono do perfil, "Trocar ..." (escolhe o arquivo e envia na hora).
// Visitantes (perfil de outra pessoa) só veem a imagem em tela cheia.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("fotoMenu");
    const visualizador = document.getElementById("fotoVisualizador");
    const visualizadorImg = document.getElementById("fotoVisualizadorImg");
    const input = document.getElementById("fotoInput");
    const aviso = document.getElementById("fotoAviso");
    if (!menu || !visualizador || !input) return;

    let alvoAtual = null; // elemento clicado (foto ou capa)

    const textos = {
        foto: { ver: "Ver foto de perfil", trocar: "Trocar foto de perfil", url: "/perfil/trocar-foto" },
        capa: { ver: "Ver capa", trocar: "Trocar foto de capa", url: "/perfil/trocar-capa" },
    };

    function mostrarAviso(texto, erro) {
        aviso.textContent = texto;
        aviso.classList.toggle("erro", !!erro);
        aviso.hidden = false;
        clearTimeout(mostrarAviso.t);
        mostrarAviso.t = setTimeout(() => { aviso.hidden = true; }, 3500);
    }

    function fecharMenu() { menu.hidden = true; }

    function imagemDe(alvo) {
        const img = alvo.querySelector("img");
        return img ? img.getAttribute("src") : "";
    }

    function abrirVisualizador(alvo) {
        const src = imagemDe(alvo);
        if (!src || src.endsWith("user-placeholder.svg")) return;
        visualizadorImg.src = src;
        visualizador.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function fecharVisualizador() {
        visualizador.hidden = true;
        visualizadorImg.src = "";
        document.body.style.overflow = "";
    }

    function abrirMenu(alvo, evento) {
        const tipo = alvo.dataset.fotoMenu;
        const dono = alvo.dataset.dono === "true";
        const tem = alvo.dataset.tem === "true";
        alvoAtual = alvo;

        menu.querySelector('[data-acao="ver"] span').textContent = textos[tipo].ver;
        menu.querySelector('[data-acao="trocar"] span').textContent = textos[tipo].trocar;
        menu.querySelector('[data-acao="ver"]').hidden = !tem;
        menu.querySelector('[data-acao="trocar"]').hidden = !dono;

        menu.hidden = false;
        const larg = menu.offsetWidth;
        const alt = menu.offsetHeight;
        let x = evento.clientX;
        let y = evento.clientY;
        x = Math.max(8, Math.min(x, window.innerWidth - larg - 8));
        y = Math.max(8, Math.min(y, window.innerHeight - alt - 8));
        menu.style.left = x + "px";
        menu.style.top = y + "px";
    }

    document.querySelectorAll("[data-foto-menu]").forEach((alvo) => {
        alvo.addEventListener("click", (e) => {
            e.stopPropagation();
            const dono = alvo.dataset.dono === "true";
            const tem = alvo.dataset.tem === "true";
            if (!dono && !tem) return;
            if (!dono) { abrirVisualizador(alvo); return; } // visitante: só ver
            abrirMenu(alvo, e);
        });
    });

    menu.addEventListener("click", (e) => {
        const botao = e.target.closest("button[data-acao]");
        if (!botao || !alvoAtual) return;
        const alvo = alvoAtual;
        fecharMenu();
        if (botao.dataset.acao === "ver") abrirVisualizador(alvo);
        else input.click();
    });

    // Quando o dono escolhe um arquivo, envia na hora.
    input.addEventListener("change", async () => {
        const arquivo = input.files && input.files[0];
        const alvo = alvoAtual;
        input.value = "";
        if (!arquivo || !alvo) return;

        const tipo = alvo.dataset.fotoMenu;
        const dados = new FormData();
        dados.append("arquivo", arquivo);
        alvo.classList.add("enviando");
        try {
            const resposta = await fetch(textos[tipo].url, { method: "POST", body: dados });
            const json = await resposta.json().catch(() => ({}));
            if (!resposta.ok || !json.ok) throw new Error(json.erro || "Não foi possível enviar a imagem.");

            let img = alvo.querySelector("img");
            if (!img) { // capa que ainda não tinha imagem: troca o fundo padrão pela foto
                const padrao = alvo.querySelector(".banner-padrao");
                img = document.createElement("img");
                img.alt = "Capa do perfil";
                if (padrao) padrao.replaceWith(img); else alvo.prepend(img);
            }
            img.src = json.url;
            alvo.dataset.tem = "true";
            alvo.classList.add("clicavel");
            mostrarAviso(tipo === "foto" ? "Foto de perfil atualizada!" : "Capa atualizada!", false);
        } catch (erro) {
            mostrarAviso(erro.message, true);
        } finally {
            alvo.classList.remove("enviando");
        }
    });

    document.addEventListener("click", (e) => { if (!menu.contains(e.target)) fecharMenu(); });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { fecharMenu(); fecharVisualizador(); }
    });
    window.addEventListener("scroll", fecharMenu, { passive: true });
    visualizador.addEventListener("click", (e) => {
        if (e.target !== visualizadorImg) fecharVisualizador();
    });
});
