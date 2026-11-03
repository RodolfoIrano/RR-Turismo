const campoNome = document.getElementById("campoNome");
const campoEmail = document.getElementById("campoEmail");
const campoCadastur = document.getElementById("campoCadastur");
const campoCnpj = document.getElementById("campoCnpj");
const campoLocalizacao = document.getElementById("campoLocalizacao");
const campoSenha = document.getElementById("campoSenha");
const campoConfirmarSenha = document.getElementById("campoConfirmarSenha");

const empresa = document.getElementById("empresa");
const guia = document.getElementById("guia");

const tipoEmpresa = document.getElementById("tipoEmpresa");

const empresaFisica = document.getElementById("empresaFisica");
const empresaOnline = document.getElementById("empresaOnline");

const cnpj = document.getElementById("cnpj");
const cadastur = document.getElementById("cadastur");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

const campos = [
    campoNome,
    campoEmail,
    campoCadastur,
    campoCnpj,
    campoLocalizacao,
    campoSenha,
    campoConfirmarSenha
];

function mostrarCampo(campo, obrigatorio) {
    campo.style.display = "block";

    const input = campo.querySelector("input");
    input.disabled = false;
    input.required = obrigatorio;
}

function esconderCampos() {
    campos.forEach((campo) => {
        campo.style.display = "none";

        const input = campo.querySelector("input");
        input.required = false;
        input.disabled = true;
        input.value = "";
    });
}

function limparTipoEmpresa() {
    empresaFisica.checked = false;
    empresaOnline.checked = false;
    tipoEmpresa.style.display = "none";
}

function validarSenhas() {
    campoSenha.classList.remove("senha-ok", "senha-erro");
    campoConfirmarSenha.classList.remove("senha-ok", "senha-erro");
    confirmarSenha.setCustomValidity("");

    if (senha.value.length > 0) {
        campoSenha.classList.add(senha.value.length >= 8 ? "senha-ok" : "senha-erro");
    }

    if (confirmarSenha.value.length === 0) {
        return;
    }

    if (senha.value.length >= 8 && senha.value === confirmarSenha.value) {
        campoConfirmarSenha.classList.add("senha-ok");
    } else {
        campoConfirmarSenha.classList.add("senha-erro");
        confirmarSenha.setCustomValidity("As senhas precisam ser iguais.");
    }
}

esconderCampos();

empresa.addEventListener("change", () => {
    esconderCampos();

    if (empresa.checked) {
        guia.checked = false;
        tipoEmpresa.style.display = "flex";
    } else {
        limparTipoEmpresa();
    }
});

guia.addEventListener("change", () => {
    esconderCampos();
    limparTipoEmpresa();

    if (guia.checked) {
        empresa.checked = false;
        mostrarCampo(campoNome, true);
        mostrarCampo(campoEmail, true);
        mostrarCampo(campoCadastur, true);
        mostrarCampo(campoSenha, true);
        mostrarCampo(campoConfirmarSenha, true);
    }
});

empresaFisica.addEventListener("change", () => {
    esconderCampos();

    if (empresaFisica.checked) {
        empresaOnline.checked = false;
        mostrarCampo(campoNome, true);
        mostrarCampo(campoEmail, true);
        mostrarCampo(campoCnpj, true);
        mostrarCampo(campoLocalizacao, true);
        mostrarCampo(campoSenha, true);
        mostrarCampo(campoConfirmarSenha, true);
    }
});

empresaOnline.addEventListener("change", () => {
    esconderCampos();

    if (empresaOnline.checked) {
        empresaFisica.checked = false;
        mostrarCampo(campoNome, true);
        mostrarCampo(campoEmail, true);
        mostrarCampo(campoCnpj, true);
        mostrarCampo(campoSenha, true);
        mostrarCampo(campoConfirmarSenha, true);
    }
});

cnpj.addEventListener("input", function () {
    let valor = cnpj.value.replace(/\D/g, "");

    if (valor.length > 14) {
        valor = valor.slice(0, 14);
    }

    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");

    cnpj.value = valor;
});

cadastur.addEventListener("input", function () {
    let valor = cadastur.value.replace(/\D/g, "");

    if (valor.length > 11) {
        valor = valor.slice(0, 11);
    }

    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{6})(\d)/, "$1.$2.$3");
    valor = valor.replace(/^(\d{2})\.(\d{6})\.(\d{2})(\d)/, "$1.$2.$3-$4");

    cadastur.value = valor;
});

senha.addEventListener("input", validarSenhas);
confirmarSenha.addEventListener("input", validarSenhas);
