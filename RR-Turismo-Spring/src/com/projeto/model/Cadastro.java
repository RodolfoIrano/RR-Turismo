package com.projeto.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ============================================================
// CADASTRO (usuário do sistema)
// ------------------------------------------------------------
// Representa cada linha da tabela "cadastro" no banco. É o
// usuário principal do sistema: tanto quem faz login no site
// quanto quem faz login no app Mobile (mesma tabela para os
// dois - ver AuthApiController).
//
// As anotações do Lombok (@Getter, @Setter, @NoArgsConstructor,
// @AllArgsConstructor) geram automaticamente, em tempo de
// compilação, os métodos getX()/setX() e os construtores (vazio
// e com todos os campos) - por isso essa classe não tem esses
// métodos escritos "na mão".
// ============================================================
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cadastro {

    // Identificador único, gerado automaticamente pelo banco (auto-incremento).
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Indica se o cadastro é de uma empresa (em vez de pessoa física).
    private boolean empresa;

    // Indica se o cadastro é de um guia de turismo.
    private boolean guia;

    // Sub-tipo de empresa: física ou online. Só fazem sentido quando "empresa" é true.
    private boolean empresaFisica;
    private boolean empresaOnline;

    private String nome;
    private String email;
    private String local;

    // Número de cadastro no CADASTUR (órgão oficial de cadastro de prestadores de turismo).
    private String cadastur;
    private String cnpj;

    // Guarda o HASH da senha (gerado por SenhaService, com PBKDF2), NUNCA a senha em texto puro.
    private String senha;
}
