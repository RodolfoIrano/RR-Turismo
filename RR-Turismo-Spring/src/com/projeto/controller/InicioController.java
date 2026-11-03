package com.projeto.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpSession;

// ============================================================
// TELA INICIAL DO SITE
// ------------------------------------------------------------
// Mostra a página inicial (inicio.jsp) usando um layout comum
// (layout.jsp), mas só para quem já está logado - sem login,
// redireciona para /entrar.
// ============================================================
@Controller
public class InicioController {

@GetMapping({"/", "/inicio"})
	public String inicio(Model model, HttpSession session) {
    if (session.getAttribute("usuarioLogado") == null) {
        return "redirect:/entrar";
    }

    model.addAttribute("pagina", "inicio.jsp");
    return "layout";
}
}
