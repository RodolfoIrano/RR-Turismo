// Monta o link do WhatsApp a partir do número salvo no banco
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-whatsapp-link").forEach((link) => {
        // Remove tudo que não for dígito
        const numero = (link.dataset.whatsapp || "").replace(/\D/g, "");
        link.href = numero ? `https://wa.me/55${numero}` : "#";
    });
});
