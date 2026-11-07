package com.projeto.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda as FOTOS EXTRAS de uma viagem (a 2ª, 3ª, 4ª e 5ª).
// A foto de capa (a 1ª) continua na própria tabela "viagem"
// (campo "imagem"), exatamente como já era - assim nada que
// já funcionava no site quebra.
//
// Cada linha = uma foto extra:
//   viagemId -> de qual viagem ela é
//   ordem    -> posição no carrossel (1 = 2ª foto, 2 = 3ª...)
//   dados    -> os bytes da imagem (BLOB)
// ============================================================
@Entity
@Getter
@Setter
@NoArgsConstructor
public class ViagemImagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int viagemId;

    private int ordem;

    @Lob
    private byte[] dados;

    public ViagemImagem(int viagemId, int ordem, byte[] dados) {
        this.viagemId = viagemId;
        this.ordem = ordem;
        this.dados = dados;
    }
}
