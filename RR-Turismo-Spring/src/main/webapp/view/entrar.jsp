<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="jakarta.tags.core" %>
        <%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
            <!DOCTYPE html>
            <html lang="pt-br">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="css/entrar.css?v=3">
                <link rel="stylesheet" href="css/variaveis.css">
                <link rel="stylesheet" href="css/padrao.css">
            </head>

            <body>
                <c:if test="${not empty mensagemErro}">
                    <div class="toast-erro">${mensagemErro}</div>
                </c:if>

                <c:if test="${not empty mensagemSucesso}">
                    <div class="toast-sucesso">${mensagemSucesso}</div>
                </c:if>

                <main>
                    <section class="login-container">

                        <div class="logo-box">
                            <img src="imagens/logo_preta.png" alt="Logo">
                        </div>

                        <h1>Acesse sua conta</h1>
                        <p class="descricao">Entre para salvar favoritos e comprar viagens</p>


                        <form action="/loginUser" method="post">

                            <div class="campo">
                                <input type="text" id="email" name="email" placeholder="" required>
                                <label for="emailProfissional">E-mail:</label>
                            </div>

                            <div class="campo" id="campoSenha">
                                <input type="password" id="senha" name="senha" minlength="8" placeholder="" required>
                                <label for="senha">Senha: (mínimo 8 caracteres)</label>
                            </div>

                            <div class="opcoes-login">

                                <label>
                                    <input type="checkbox">
                                    Lembrar de mim
                                </label>

                                <a href="#">Esqueci a senha</a>

                            </div>

                            <button class="entrar-btn">
                                Entrar
                            </button>

                        </form>

                        <p class="cadastro-link">
                            Não possui conta? <a href="/cadastro">Cadastre-se</a>
                        </p>

                    </section>
                </main>
                <script>
                    const campoSenhaLogin = document.getElementById("campoSenha");
                    const senhaLogin = document.getElementById("senha");

                    senhaLogin.addEventListener("input", function () {
                        campoSenhaLogin.classList.remove("senha-ok", "senha-erro");

                        if (senhaLogin.value.length === 0) {
                            return;
                        }

                        if (senhaLogin.value.length >= 8) {
                            campoSenhaLogin.classList.add("senha-ok");
                        } else {
                            campoSenhaLogin.classList.add("senha-erro");
                        }
                    });
                </script>
            </body>
            </html>
