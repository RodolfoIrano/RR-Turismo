package com.projeto.dto;

// DTO devolvido pelo login/cadastro: o token de autenticação + os dados do usuário.
public class AuthResponse {
    private String token;
    private UsuarioDTO usuario;

    public AuthResponse(String token, UsuarioDTO usuario) {
        this.token = token;
        this.usuario = usuario;
    }

    public String getToken() { return token; }
    public UsuarioDTO getUsuario() { return usuario; }
}
