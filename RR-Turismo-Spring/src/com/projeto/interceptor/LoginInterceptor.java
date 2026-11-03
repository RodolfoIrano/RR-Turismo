package com.projeto.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

// ============================================================
// LOGIN INTERCEPTOR (protege as páginas do SITE)
// ------------------------------------------------------------
// Roda antes de cada requisição às páginas protegidas do site
// (ver a lista de exceções em WebConfig). Se não houver uma
// sessão de login ativa, redireciona para a tela de login.
//
// Isso é EXCLUSIVO do site (JSP/sessão). O app Mobile usa outro
// mecanismo, baseado em token (ver security/TokenAuthInterceptor).
// ============================================================
@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // getSession(false): não cria uma sessão nova, só verifica se já existe uma.
        HttpSession session = request.getSession(false);
        boolean logado = session != null && session.getAttribute("usuarioLogado") != null;

        if (logado) {
            return true; // deixa a requisição continuar normalmente
        }

        // Sem sessão válida -> manda para a tela de login e interrompe a requisição.
        response.sendRedirect("/entrar");
        return false;
    }
}
