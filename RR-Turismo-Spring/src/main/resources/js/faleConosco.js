/* ============================================================
   📄 O QUE ESTE ARQUIVO FAZ:
   Valida o formulário do FALE CONOSCO e, estando tudo certo, abre o
   WhatsApp da equipe com a mensagem pronta (wa.me). Não envia nada
   para o servidor do site e não guarda a mensagem.

   Regras: nome (mín. 3 letras), e-mail válido, telefone opcional com
   DDD (10 ou 11 dígitos), assunto escolhido, mensagem de 10 a 500
   caracteres, aceite dos dados. Depois de enviar, espera 30 s para
   enviar outra (evita spam).

   ✏️ ONDE MUDAR O QUÊ: MENSAGEM_MINIMO, ESPERA_MS e as frases de erro.
   ============================================================ */
(function () {
    "use strict";
    var form = document.getElementById("formContato");
    if (!form) return;

    var MENSAGEM_MINIMO = 10;
    var ESPERA_MS = 30000;
    var REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var numero = (form.getAttribute("data-whatsapp") || "").replace(/\D/g, "");

    var nome = document.getElementById("cNome");
    var email = document.getElementById("cEmail");
    var tel = document.getElementById("cTelefone");
    var msg = document.getElementById("cMensagem");
    var aceite = document.getElementById("cAceite");
    var chips = document.querySelectorAll("#chipsAssunto button");
    var aviso = document.getElementById("contatoAviso");
    var assunto = "";

    chips.forEach(function (b) {
        b.addEventListener("click", function () {
            assunto = b.textContent;
            chips.forEach(function (x) {
                var on = x === b;
                x.classList.toggle("ativo", on);
                x.setAttribute("aria-checked", on ? "true" : "false");
            });
            mostrarErro("assunto", "");
        });
    });

    // Máscara (16) 99999-9999
    tel.addEventListener("input", function () {
        var d = tel.value.replace(/\D/g, "").slice(0, 11), r = d;
        if (d.length > 6) r = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length > 10 ? 7 : 6) + "-" + d.slice(d.length > 10 ? 7 : 6);
        else if (d.length > 2) r = "(" + d.slice(0, 2) + ") " + d.slice(2);
        else if (d.length > 0) r = "(" + d;
        tel.value = r;
    });

    msg.addEventListener("input", function () {
        document.getElementById("contador").textContent = msg.value.length + "/500";
    });

    function mostrarErro(campo, texto) {
        var el = form.querySelector('[data-erro="' + campo + '"]');
        if (el) el.textContent = texto;
        var input = document.getElementById(campo);
        if (input) input.classList.toggle("invalido", !!texto);
    }
    function dizerAviso(texto, ok) {
        aviso.hidden = !texto;
        aviso.textContent = texto || "";
        aviso.classList.toggle("ok", !!ok);
    }

    function validar() {
        var erros = {};
        if (nome.value.trim().length < 3) erros.cNome = "Digite seu nome completo.";
        if (!REGEX_EMAIL.test(email.value.trim())) erros.cEmail = "Digite um e-mail válido, como nome@email.com.";
        var dig = tel.value.replace(/\D/g, "");
        if (dig.length > 0 && (dig.length < 10 || dig.length > 11)) erros.cTelefone = "Telefone com DDD, ex: (16) 99999-9999.";
        if (!assunto) erros.assunto = "Escolha um assunto.";
        if (msg.value.trim().length < MENSAGEM_MINIMO) erros.cMensagem = "Escreva pelo menos " + MENSAGEM_MINIMO + " caracteres.";
        if (!aceite.checked) erros.cAceite = "É preciso concordar para enviar.";
        ["cNome", "cEmail", "cTelefone", "assunto", "cMensagem", "cAceite"].forEach(function (c) { mostrarErro(c, erros[c] || ""); });
        return erros;
    }

    function montarTexto() {
        var l = ["Olá, equipe RR Turismo!", "", "*Assunto:* " + assunto, "*Nome:* " + nome.value.trim(), "*E-mail:* " + email.value.trim()];
        if (tel.value.trim()) l.push("*Telefone:* " + tel.value.trim());
        l.push("", "*Mensagem:*", msg.value.trim(), "", "Enviado pelo site RR Turismo");
        return l.join("\n");
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        dizerAviso("");
        var ultimo = 0;
        try { ultimo = parseInt(sessionStorage.getItem("rr_contato_ultimo") || "0", 10) || 0; } catch (x) { }
        if (ultimo && Date.now() - ultimo < ESPERA_MS) {
            dizerAviso("Calma aí: sua mensagem acabou de ser enviada. Aguarde alguns segundos para enviar outra.");
            return;
        }
        var erros = validar();
        if (Object.keys(erros).length) {
            dizerAviso("Confira os campos destacados.");
            var primeiro = form.querySelector(".invalido, .erro:not(:empty)");
            if (primeiro && primeiro.scrollIntoView) primeiro.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (!/^55\d{10,11}$/.test(numero)) {
            dizerAviso("O WhatsApp da equipe ainda não foi configurado neste site.");
            return;
        }
        window.open("https://wa.me/" + numero + "?text=" + encodeURIComponent(montarTexto()), "_blank", "noopener");
        try { sessionStorage.setItem("rr_contato_ultimo", String(Date.now())); } catch (x) { }
        dizerAviso("Abrimos o WhatsApp com a sua mensagem. É só confirmar o envio por lá. Obrigado!", true);
        msg.value = ""; aceite.checked = false;
        document.getElementById("contador").textContent = "0/500";
    });
})();
