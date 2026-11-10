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

/* ============================================================
   📄 O QUE ESTE ARQUIVO FAZ:
   Controla a página CRIAR CONTA (cadastro.jsp):
     - Passo 1: escolher "Quero viajar" (viajante) ou "Sou guia ou empresa".
     - Passo 2: mostrar a frase de boas-vindas e só os campos certos.
     - Máscaras de CNPJ/Cadastur e conferência da senha.
   ✏️ ONDE MUDAR O QUÊ: frases em BOAS_VINDAS; rótulos em rotular().
   ============================================================ */
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

const BOAS_VINDAS = {
    viajante: "<strong>Bem-vindo(a), viajante! &#9992;&#65039;</strong> Crie a sua conta para salvar favoritos e comprar viagens de guias e agências de confiança.",
    guia: "<strong>Quer criar viagens? Cadastre-se aqui! &#129517;</strong> Divulgue seus roteiros para quem quer viajar. Escolha abaixo se você é Guia ou Empresa."
};

const passoEscolha = document.getElementById("passoEscolha");
const passoForm = document.getElementById("passoForm");
const boasVindas = document.getElementById("boasVindas");
const dicaTipo = document.getElementById("dicaTipo");
const tipoConta = document.querySelector(".tipo-conta");
const CHAVE_PERFIL = "rr_perfil_cadastro";

// Troca o texto do rótulo e do placeholder de um campo (o rótulo flutuante usa os dois).
function rotular(campo, texto) {
    const input = campo.querySelector("input");
    const rotulo = campo.querySelector("label");
    if (input) input.placeholder = texto;
    if (rotulo) rotulo.textContent = texto;
}

function rotulosPara(tipo) {
    if (tipo === "viajante") {
        rotular(campoNome, "Seu nome completo");
        rotular(campoEmail, "Seu e-mail");
    } else if (tipo === "guia") {
        rotular(campoNome, "Seu nome (guia)");
        rotular(campoEmail, "E-mail profissional");
    } else {
        rotular(campoNome, "Nome da empresa");
        rotular(campoEmail, "E-mail profissional");
    }
}

function irParaFormulario(perfil) {
    esconderCampos();
    limparTipoEmpresa();
    empresa.checked = false;
    guia.checked = false;
    passoEscolha.hidden = true;
    passoForm.hidden = false;
    boasVindas.innerHTML = BOAS_VINDAS[perfil];
    boasVindas.className = "boas-vindas " + perfil;
    try { sessionStorage.setItem(CHAVE_PERFIL, perfil); } catch (e) { }

    if (perfil === "viajante") {
        // Viajante: nem guia nem empresa. Só nome, e-mail e senha.
        tipoConta.style.display = "none";
        dicaTipo.hidden = true;
        rotulosPara("viajante");
        mostrarCampo(campoNome, true);
        mostrarCampo(campoEmail, true);
        mostrarCampo(campoSenha, true);
        mostrarCampo(campoConfirmarSenha, true);
    } else {
        tipoConta.style.display = "flex";
        dicaTipo.hidden = false;
    }
}

function voltarParaEscolha() {
    esconderCampos();
    limparTipoEmpresa();
    empresa.checked = false;
    guia.checked = false;
    passoForm.hidden = true;
    passoEscolha.hidden = false;
    try { sessionStorage.removeItem(CHAVE_PERFIL); } catch (e) { }
}

document.querySelectorAll(".opcao-perfil").forEach((botao) => {
    botao.addEventListener("click", () => irParaFormulario(botao.dataset.perfil));
});
document.getElementById("voltarEscolha").addEventListener("click", voltarParaEscolha);

esconderCampos();

// Se o servidor devolveu a página com erro (senha diferente, e-mail repetido...),
// volta direto para o passo 2 do tipo que a pessoa tinha escolhido.
if (document.querySelector(".toast-erro")) {
    let anterior = null;
    try { anterior = sessionStorage.getItem(CHAVE_PERFIL); } catch (e) { }
    if (anterior === "viajante" || anterior === "guia") irParaFormulario(anterior);
}

empresa.addEventListener("change", () => {
    esconderCampos();
    dicaTipo.hidden = empresa.checked;

    if (empresa.checked) {
        guia.checked = false;
        tipoEmpresa.style.display = "flex";
    } else {
        limparTipoEmpresa();
        dicaTipo.hidden = false;
    }
});

guia.addEventListener("change", () => {
    esconderCampos();
    limparTipoEmpresa();

    dicaTipo.hidden = guia.checked;
    if (guia.checked) {
        empresa.checked = false;
        rotulosPara("guia");
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
        rotulosPara("empresa");
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
        rotulosPara("empresa");
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

// Segurança: no caminho "guia/empresa" não deixa enviar sem marcar Guia ou Empresa
// (senão a conta seria criada sem nome nem tipo).
document.querySelector("form").addEventListener("submit", (e) => {
    if (!passoForm.hidden && !dicaTipo.hidden) {
        e.preventDefault();
        dicaTipo.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});

senha.addEventListener("input", validarSenhas);
confirmarSenha.addEventListener("input", validarSenhas);
