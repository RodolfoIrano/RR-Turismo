package com.projeto.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Base64;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ============================================================
// VIAGEM (pacote de turismo cadastrado por uma empresa/guia)
// ------------------------------------------------------------
// Cada linha representa um pacote/viagem criado por um usuário
// do tipo empresa/guia (campo "criador"), que aparece disponível
// para reserva.
// ============================================================
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String nomedestino;
    private String local;
    private String categoria;
    private String transporte;
    private String descricao;

    // Total de vagas e quantas já foram ocupadas.
    private int assentos;
    private int participantes = 0;

    // Quem criou este pacote de viagem (dono/responsável).
    @ManyToOne
    private Cadastro criador;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataIda;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataVolta;

    private BigDecimal preco;
    private String hotel;
    private int pessoas;

    // Imagem da viagem, guardada como bytes brutos (BLOB) no banco.
    @Lob
    private byte[] imagem;

    // Campo "de passagem": recebe o arquivo enviado no formulário
    // (upload), mas NÃO é salvo no banco (@Transient) - serve só
    // para carregar o arquivo até virar bytes em "imagem".
    @Transient
    private MultipartFile imagemFile;

    // Converte os bytes da imagem para uma string Base64 pronta
    // para ser usada direto num atributo "src" de <img> no HTML/JSP
    // (formato "data:image/png;base64,...").
    public String getImagemBase64() {
        if (imagem != null && imagem.length > 0) {
            String base64 = Base64.getEncoder().encodeToString(imagem);
            return "data:image/png;base64," + base64;
        }
        return null;
    }
}
