package com.projeto.model;

import java.util.Base64;

import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ============================================================
// PERFIL DE USUÁRIO (dados complementares de exibição pública)
// ------------------------------------------------------------
// Relação 1-para-1 com Cadastro (@OneToOne): cada usuário tem no
// máximo um PerfilUsuario, com informações extras que não fazem
// parte do cadastro/login (foto, redes sociais, "sobre mim" etc).
//
// A foto usada pelo app Mobile (item 4 da solicitação de
// alteração) é exatamente o campo "foto" abaixo - tanto o site
// quanto o app leem/gravam nesse mesmo campo.
// ============================================================
@Entity
@Getter
@Setter
@NoArgsConstructor
public class PerfilUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // A quem este perfil pertence.
    @OneToOne
    private Cadastro usuario;

    private String cidade;
    private String estado;

    // "sobre" pode ser um texto longo, por isso @Lob (large object).
    @Lob
    private String sobre;

    private String whatsapp;
    private String instagram;
    private String facebook;
    private String twitter;
    private String site;
    private String idiomas;
    private String especialidades;
    private String videoUrl;

    // Estatísticas exibidas no perfil público (guias/empresas).
    private int clientesAtendidos = 0;
    private int viagensRealizadas = 0;

    // Foto de perfil e banner, guardados como bytes brutos (BLOB) no banco.
    @Lob
    private byte[] foto;

    @Lob
    private byte[] banner;

    // Campos "de passagem" (não gravados no banco, @Transient):
    // recebem o arquivo enviado no formulário de upload antes de
    // ele ser convertido para bytes e guardado em foto/banner.
    @Transient
    private MultipartFile fotoFile;

    @Transient
    private MultipartFile bannerFile;

    // Converte a foto/banner para uma string Base64 pronta para
    // usar direto num "src" de <img> no HTML/JSP.
    public String getFotoBase64() {
        return imagemBase64(foto);
    }

    public String getBannerBase64() {
        return imagemBase64(banner);
    }

    private String imagemBase64(byte[] imagem) {
        if (imagem == null || imagem.length == 0) {
            return null;
        }
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(imagem);
    }
}
