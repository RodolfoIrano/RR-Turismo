package com.projeto.security;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

// ============================================================
// TOKEN SERVICE (autenticacao do app Mobile)
// ------------------------------------------------------------
// O site (JSP) continua usando HttpSession normalmente - isso
// NAO foi alterado.
//
// O app Mobile e "stateless" (nao guarda sessao/cookie), entao
// ele precisa de um token que identifique o usuario a cada
// requisicao (enviado no header "Authorization: Bearer <token>").
//
// Para manter o projeto simples (sem adicionar bibliotecas de
// JWT/Spring Security, que exigiriam baixar novos .jar em lib/),
// este servico gera um token opaco (aleatorio) e guarda em
// memoria a relacao token -> id do usuario.
//
// Importante para o TCC/projeto: como fica em memoria, os tokens
// sao perdidos quando o servidor reinicia (o usuario so precisa
// logar de novo no app - nao afeta o banco nem o site). Se no
// futuro for necessario manter os tokens entre reinicializacoes,
// da para trocar esta implementacao por uma tabela no banco sem
// mudar a forma como os controllers usam esta classe.
// ============================================================
@Service
public class TokenService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentHashMap<String, Integer> tokensAtivos = new ConcurrentHashMap<>();

    public String gerarToken(int usuarioId) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokensAtivos.put(token, usuarioId);
        return token;
    }

    public Integer usuarioIdDoToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        return tokensAtivos.get(token);
    }

    public void revogarToken(String token) {
        if (token != null) {
            tokensAtivos.remove(token);
        }
    }

    public static String extrairTokenDoHeader(String headerAuthorization) {
        if (headerAuthorization == null || !headerAuthorization.startsWith("Bearer ")) {
            return null;
        }
        return headerAuthorization.substring("Bearer ".length()).trim();
    }
}
