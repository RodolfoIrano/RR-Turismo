<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="jakarta.tags.core" %>
        <%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
            <!DOCTYPE html>
            <html lang="pt-br">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="css/login.css?v=3">
                <link rel="stylesheet" href="css/variaveis.css">
                <link rel="stylesheet" href="css/padrao.css">

            </head>

            <body>
                <c:if test="${not empty mensagemErro}">
                    <div class="toast-erro">${mensagemErro}</div>
                </c:if>

                <main>
                    <section class="cadastro-container">
                        <div class="logo-box">
                            <img src="imagens/logo_preta.png" alt="Logo">
                        </div>

                        <h1>Crie sua conta</h1>
                        <p class="descricao">Plataforma para Agências e Guias Turísticos</p>

                        <form:form action="/cadastrarusuario" modelAttribute="usuario">

                            <div class="tipo-conta">
                                <label for="empresa" class="check-esquerda">
                                    <form:checkbox path="empresa" id="empresa" />
                                    Empresa
                                </label>

                                <label for="guia" class="check-direita">
                                    <form:checkbox path="guia" id="guia" />
                                    Guia
                                </label>
                            </div>


                            <div class="tipo-empresa" id="tipoEmpresa">
                                <label for="empresaFisica">
                                    <form:checkbox path="empresaFisica" id="empresaFisica" />
                                    Empresa física
                                </label>

                                <label for="empresaOnline">
                                    <form:checkbox path="empresaOnline" id="empresaOnline" />
                                    Empresa online
                                </label>
                            </div>


                            <div class="campo" id="campoNome">
                                <form:input path="nome" id="nome" placeholder="Nome da Empresa" required="required" />
                                <label for="nome">Nome da Empresa</label>
                            </div>

                            <div class="campo" id="campoEmail">
                                <form:input path="email" type="email" id="email" placeholder="E-mail Profissional" required="required" />
                                <label for="email">E-mail Profissional</label>
                            </div>

                            <div class="campo localizacao" id="campoLocalizacao">
                                <form:input path="local" id="local" placeholder="Endereço da empresa" />
                                <label for="local">Endereço da empresa</label>
                            </div>

                            <div class="campo" id="campoCadastur">
                                <form:input path="cadastur" id="cadastur" placeholder="Ex: 12.345678.90-1" />
                                <label for="cadastur">Número do Cadastur</label>
                            </div>

                            <div class="campo" id="campoCnpj">
                                <form:input path="cnpj" id="cnpj" placeholder="00.000.000/0000-00" />
                                <label for="cnpj">Coloque o CNPJ da empresa</label>
                            </div>

                            <div class="campo" id="campoSenha">
                                <form:password path="senha" id="senha" minlength="8" placeholder="Senha:" required="required" />
                                <label for="senha">Senha (mínimo 8 caracteres)</label>
                            </div>

                            <div class="campo" id="campoConfirmarSenha">
                                <input type="password" id="confirmarSenha" name="confirmarSenha" minlength="8" placeholder="Confirmar senha" required>
                                <label for="confirmarSenha">Confirmar senha</label>
                            </div>

                            <button class="cadastrar">
                                Cadastrar
                            </button>

                        </form:form>

                        <p class="entrar">
                            J&aacute; possui conta? <a href="/entrar">Fazer login</a>
                        </p>
                    </section>
                </main>
                <script src="/js/login.js?v=3"></script>
            </body>
            </html>
