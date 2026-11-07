package com.projeto.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.projeto.model.ViagemImagem;

// ============================================================
// REPOSITÓRIO DAS FOTOS EXTRAS DA VIAGEM (tabela "viagem_imagem")
// ============================================================
@Repository
public interface ViagemImagemRepository extends CrudRepository<ViagemImagem, Integer> {

    // Fotos extras de uma viagem, na ordem do carrossel.
    List<ViagemImagem> findByViagemIdOrderByOrdemAsc(int viagemId);

    long countByViagemId(int viagemId);

    void deleteByViagemId(int viagemId);
}
