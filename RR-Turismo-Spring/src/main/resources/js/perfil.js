// Controla o dropdown do perfil no topo
document.addEventListener("DOMContentLoaded", () => {
    iniciarMenuPerfil();
});

function iniciarMenuPerfil() {
    const botao   = document.getElementById("userBtn");
    const dropdown = document.getElementById("dropdownPerfil");

    if (!botao || !dropdown) {
        return;
    }

    botao.addEventListener("click", () => {
        const aberto = dropdown.classList.toggle("show");
        botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    });

    // Fecha ao clicar fora
    document.addEventListener("click", (event) => {
        if (!botao.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove("show");
            botao.setAttribute("aria-expanded", "false");
        }
    });
}
