package com.projeto.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.projeto.interceptor.LoginInterceptor;
import com.projeto.security.TokenAuthInterceptor;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Define QUEM PRECISA ESTAR LOGADO para abrir cada endereço, e
// libera o acesso do app Mobile ao servidor (CORS).
//
// Existem dois "porteiros":
//   - LoginInterceptor ........ protege as páginas do SITE (sessão).
//   - TokenAuthInterceptor .... protege as rotas /api/** do APP (token).
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Tornar uma página do site PÚBLICA (sem login) → coloque o endereço
//     na lista excludePathPatterns do loginInterceptor (ex.: "/", "/inicio",
//     "/viagens/**" já são públicos).
//   - Tornar uma rota da API pública → lista excludePathPatterns do
//     tokenAuthInterceptor, mais abaixo.
//   - Quais origens podem chamar a API → método addCorsMappings.
// ============================================================
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;
    private final TokenAuthInterceptor tokenAuthInterceptor;

    public WebConfig(LoginInterceptor loginInterceptor, TokenAuthInterceptor tokenAuthInterceptor) {
        this.loginInterceptor = loginInterceptor;
        this.tokenAuthInterceptor = tokenAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Login por sessao (site/JSP) - continua exatamente como estava,
        // apenas passou a ignorar tambem as rotas /api/** (usadas pelo
        // Mobile), que tem sua propria autenticacao por token abaixo.
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/",
                        "/inicio",
                        "/viagens/**",
                        "/sobre-nos",
                        "/fale-conosco",
                        "/favoritos",
                        "/privacidade",
                        "/termos",
                        "/entrar",
                        "/loginUser",
                        "/cadastro",
                        "/cadastrarusuario",
                        "/error",
                        "/css/**",
                        "/js/**",
                        "/imagens/**",
                        "/api/**");

        // Login por token (app Mobile) - protege /api/** exceto as rotas
        // públicas: login/cadastro/logout (mas NÃO o /api/auth/me, que precisa
        // do token para dizer quem está logado), o catálogo de viagens
        // e guias (/api/viagens/**, /api/guias/**), e a calculadora de
        // desconto (/api/desconto/**, que não expõe dado nenhum).
        registry.addInterceptor(tokenAuthInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/logout",
                        "/api/viagens/**",
                        "/api/guias/**",
                        "/api/desconto/**");
    }

    // Permite que o app Mobile (rodando em outra origem: emulador,
    // dispositivo fisico, Expo Go) chame as rotas /api/**. O site
    // (JSP, mesma origem) nao e afetado por isso.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
