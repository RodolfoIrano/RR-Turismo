package com.projeto.security;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// ============================================================
// TOKEN AUTH INTERCEPTOR
// ------------------------------------------------------------
// Protege as rotas /api/** (usadas pelo app Mobile), exigindo o
// header "Authorization: Bearer <token>" devolvido pelo
// POST /api/auth/login.
//
// As rotas /api/auth/** (login e cadastro) ficam de fora, pois
// sao publicas (o usuario ainda nao tem token nesse momento).
//
// Em caso de sucesso, o id do usuario autenticado fica disponivel
// via request.getAttribute("usuarioApiId") para os controllers.
// ============================================================
@Component
public class TokenAuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_USUARIO_ID = "usuarioApiId";

    private final TokenService tokenService;

    public TokenAuthInterceptor(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String token = TokenService.extrairTokenDoHeader(request.getHeader("Authorization"));
        Integer usuarioId = tokenService.usuarioIdDoToken(token);

        if (usuarioId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"erro\":\"Token invalido ou expirado. Faca login novamente.\"}");
            return false;
        }

        request.setAttribute(ATRIBUTO_USUARIO_ID, usuarioId);
        return true;
    }
}
