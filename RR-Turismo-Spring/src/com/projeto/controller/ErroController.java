package com.projeto.controller;

import java.util.Map;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

// ============================================================
// TRATAMENTO DE ERROS DO SITE
// ------------------------------------------------------------
// Quando o Spring Boot encontra um erro (página não encontrada,
// erro interno, etc), ele redireciona automaticamente para
// "/error". Esta classe intercepta essa rota e, em vez de
// mostrar uma tela de erro feia padrão do Spring, manda o
// usuário de volta para a tela inicial com uma mensagem amigável.
// ============================================================
@Controller
public class ErroController implements ErrorController {

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request, RedirectAttributes redirectAttributes) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        // ROTAS DA API (app Mobile): devolve o erro em JSON, NUNCA a página
        // HTML do site. Antes, qualquer erro em /api/** virava um redirect
        // para a tela inicial (HTML) e o app mostrava "JSON Parse error: <".
        Object uri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        if (uri != null && uri.toString().startsWith("/api/")) {
            int codigo = status != null ? Integer.parseInt(status.toString()) : 500;
            Object excecao = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
            String detalhe = excecao instanceof Throwable t
                    ? t.getClass().getSimpleName() + ": " + t.getMessage()
                    : "HTTP " + codigo;
            return ResponseEntity.status(HttpStatus.valueOf(codigo)).body(Map.of("erro", detalhe));
        }

        String mensagem = "Ops! Algo deu errado. Voce voltou para a tela inicial.";

        if (status != null && status.toString().equals("404")) {
            mensagem = "Pagina nao encontrada. Voce voltou para a tela inicial.";
        }

        redirectAttributes.addFlashAttribute("mensagemErro", mensagem);
        return "redirect:/inicio";
    }
}
