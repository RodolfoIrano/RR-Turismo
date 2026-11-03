package com.projeto.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.projeto.model.Cadastro;
import com.projeto.service.CadastroService;

// ============================================================
// CADASTRO DO SITE (criar conta pelas páginas JSP)
// ------------------------------------------------------------
// Equivalente, no site, ao que AuthApiController.register faz
// para o app Mobile - os dois usam o mesmo CadastroService por
// baixo.
// ============================================================
@Controller
public class CadastroController {

    private final CadastroService cadastroService;

    public CadastroController(CadastroService cadastroService) {
        this.cadastroService = cadastroService;
    }

    // Exibe o formulário de cadastro vazio.
    @GetMapping("/cadastro")
    public String cadastro(Model model) {
        model.addAttribute("usuario", new Cadastro());
        return "cadastro";
    }

    // Processa o formulário de cadastro.
    @PostMapping("/cadastrarusuario")
    public String cadastrarUsuario(Model model,
                                   @ModelAttribute("usuario") Cadastro cadastro,
                                   @RequestParam("confirmarSenha") String confirmarSenha,
                                   RedirectAttributes redirectAttributes) {

        String email = cadastro.getEmail();

        // Confere se a senha e a confirmação de senha são iguais.
        if (cadastro.getSenha() == null || !cadastro.getSenha().equals(confirmarSenha)) {
            model.addAttribute("mensagemErro", "As senhas nao conferem. Digite novamente.");
            model.addAttribute("usuario", cadastro);
            return "cadastro";
        }

        // Impede e-mail duplicado.
        if (email != null && cadastroService.emailJaCadastrado(email.trim())) {
            model.addAttribute("mensagemErro", "Este e-mail ja possui cadastro. Use outro e-mail ou faca login.");
            model.addAttribute("usuario", cadastro);
            return "cadastro";
        }

        cadastro.setEmail(email == null ? null : email.trim());
        // A senha é protegida (hash) ANTES de salvar - nunca fica em texto puro.
        cadastro.setSenha(cadastroService.protegerSenha(cadastro.getSenha()));
        Cadastro novoUsuario = cadastroService.salvar(cadastro);

        if (novoUsuario != null && novoUsuario.getId() > 0) {
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Usuario cadastrado com sucesso! Agora faca login.");
            return "redirect:/entrar";
        }

        model.addAttribute("mensagemErro", "Erro ao realizar o cadastro.");
        model.addAttribute("usuario", cadastro);
        return "cadastro";
    }
}
