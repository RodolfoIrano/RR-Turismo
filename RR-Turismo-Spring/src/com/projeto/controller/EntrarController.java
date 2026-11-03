package com.projeto.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.projeto.model.Cadastro;
import com.projeto.service.CadastroService;

import jakarta.servlet.http.HttpSession;

// ============================================================
// LOGIN DO SITE (autenticação por sessão/cookie)
// ------------------------------------------------------------
// Rotas usadas pelas páginas JSP do site. Continuam exatamente
// como estavam - o app Mobile usa uma API separada
// (AuthApiController), mas os dois usam o MESMO CadastroService
// por baixo, então é o mesmo usuário/senha nos dois lugares.
// ============================================================
@Controller
public class EntrarController {

    private final CadastroService cadastroService;

    public EntrarController(CadastroService cadastroService) {
        this.cadastroService = cadastroService;
    }

    // Exibe a tela de login. Se o usuário já estiver logado, pula direto para /inicio.
    @GetMapping("/entrar")
    public String entrar(HttpSession session) {
        if (session.getAttribute("usuarioLogado") != null) {
            return "redirect:/inicio";
        }

        return "entrar";
    }

    // Processa o formulário de login (chamado quando o usuário clica em "Entrar").
    @PostMapping("/loginUser")
    public String login(@RequestParam("email") String email,
                        @RequestParam("senha") String senha,
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {

        Cadastro usuario = cadastroService.buscarPorEmailESenha(email.trim(), senha).orElse(null);

        if (usuario == null) {
            redirectAttributes.addFlashAttribute("mensagemErro",
                    "Nao possui login com esse e-mail e senha. Cadastre-se ou tente novamente.");
            return "redirect:/entrar";
        }

        // Salva o usuario na sessao para ele continuar logado enquanto navega no site.
        session.setAttribute("usuarioLogado", usuario);

        String nome = usuario.getNome();
        if (nome == null || nome.trim().isEmpty()) {
            nome = usuario.getEmail();
        }

        redirectAttributes.addFlashAttribute("mensagemSucesso", "Login feito com sucesso. Bem vindo, " + nome + "!");
        return "redirect:/inicio";
    }

    // Encerra a sessão do site (logout).
    @GetMapping("/sair")
    public String sair(HttpSession session) {
        session.invalidate();
        return "redirect:/entrar";
    }
}
