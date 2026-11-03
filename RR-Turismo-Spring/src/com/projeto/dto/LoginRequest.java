package com.projeto.dto;

// DTO (formato de dados) do corpo enviado por POST /api/auth/login: apenas email + senha.
public class LoginRequest {
    private String email;
    private String senha;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}
