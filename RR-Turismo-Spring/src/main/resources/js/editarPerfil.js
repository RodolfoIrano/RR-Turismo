// Funcionalidades da página Editar Perfil
document.addEventListener("DOMContentLoaded", () => {
    iniciarPreviewImagens();
    iniciarMascaras();
});


// =========================================================
// PREVIEW DAS IMAGENS (foto e banner)
// =========================================================

function iniciarPreviewImagens() {
    const fotoInput    = document.getElementById("fotoPerfil");
    const fotoPreview  = document.getElementById("previewPerfil");
    const bannerInput  = document.getElementById("bannerInput");
    const bannerPreview = document.getElementById("bannerPreview");

    // Preview da foto de perfil
    fotoInput?.addEventListener("change", () => {
        const arquivo = fotoInput.files[0];
        if (!arquivo || !fotoPreview) return;

        const url = URL.createObjectURL(arquivo);
        fotoPreview.src = url;

        // Atualiza também o avatar no topo
        document.querySelectorAll(".user-avatar-mini").forEach((avatar) => {
            avatar.src = url;
        });
    });

    // Preview do banner
    bannerInput?.addEventListener("change", () => {
        const arquivo = bannerInput.files[0];
        if (!arquivo || !bannerPreview) return;

        // Remove imagem antiga se houver
        const imgAntiga = bannerPreview.querySelector("img");
        if (imgAntiga) imgAntiga.remove();

        const imagem = document.createElement("img");
        imagem.src = URL.createObjectURL(arquivo);
        imagem.alt = "Novo banner";
        bannerPreview.prepend(imagem);
    });
}


// =========================================================
// MÁSCARAS DOS CAMPOS
// =========================================================

function iniciarMascaras() {
    aplicarMascaraWhatsapp();
    aplicarMascaraInstagram();
    aplicarMascaraTwitter();
}

// WhatsApp: (16) 99999-9999
function aplicarMascaraWhatsapp() {
    const campo = document.querySelector('[data-mask="whatsapp"]');
    if (!campo) return;

    campo.addEventListener("input", () => {
        let valor = campo.value.replace(/\D/g, "").slice(0, 11);

        if (valor.length > 6) {
            valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
        } else if (valor.length > 2) {
            valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        } else if (valor.length > 0) {
            valor = `(${valor}`;
        }

        campo.value = valor;
    });
}

// Instagram: @usuario (sem URL, sem caracteres inválidos)
function aplicarMascaraInstagram() {
    const campo = document.querySelector('[data-mask="instagram"]');
    if (!campo) return;

    campo.addEventListener("input", () => {
        let valor = campo.value
            .replace("https://instagram.com/", "")
            .replace("http://instagram.com/", "")
            .replace("instagram.com/", "")
            .replace(/[^a-zA-Z0-9._]/g, "");

        campo.value = valor ? `@${valor.replace(/^@+/, "")}` : "";
    });
}

// Twitter/X: @usuario (sem URL, sem caracteres inválidos)
function aplicarMascaraTwitter() {
    const campo = document.querySelector('[data-mask="twitter"]');
    if (!campo) return;

    campo.addEventListener("input", () => {
        let valor = campo.value
            .replace("https://twitter.com/", "")
            .replace("https://x.com/", "")
            .replace("twitter.com/", "")
            .replace("x.com/", "")
            .replace(/[^a-zA-Z0-9._]/g, "");

        campo.value = valor ? `@${valor.replace(/^@+/, "")}` : "";
    });
}
