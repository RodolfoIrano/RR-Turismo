package com.projeto.dto;

import com.projeto.model.Cadastro;

// Representa o usuario em formato simples (JSON) para o app Mobile.
// Nunca inclui a senha (nem o hash) - so os dados publicos do perfil.
public class UsuarioDTO {
    private int id;
    private String nome;
    private String email;
    private String username;
    private boolean temFoto;
    private boolean temBanner;
    private boolean guia; // vem do campo Cadastro.guia (modo Guia no app)

    public static UsuarioDTO de(Cadastro usuario, boolean temFoto) {
        return de(usuario, temFoto, false);
    }

    public static UsuarioDTO de(Cadastro usuario, boolean temFoto, boolean temBanner) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.id = usuario.getId();
        dto.nome = usuario.getNome();
        dto.email = usuario.getEmail();
        // O cadastro do site nao possui campo "username" proprio; usamos a
        // parte antes do "@" do e-mail como identificador simples no app.
        dto.username = usuario.getEmail() != null && usuario.getEmail().contains("@")
                ? usuario.getEmail().substring(0, usuario.getEmail().indexOf("@"))
                : usuario.getEmail();
        dto.temFoto = temFoto;
        dto.temBanner = temBanner;
        dto.guia = usuario.isGuia();
        return dto;
    }

    public int getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public boolean isTemFoto() { return temFoto; }
    public boolean isTemBanner() { return temBanner; }
    public boolean isGuia() { return guia; }
}
