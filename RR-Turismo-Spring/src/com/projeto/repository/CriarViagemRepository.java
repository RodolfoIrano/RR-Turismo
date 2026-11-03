package com.projeto.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;
import java.util.List;

// ============================================================
// REPOSITÓRIO DE VIAGEM (tabela "viagem")
// ============================================================
@Repository
public interface CriarViagemRepository extends CrudRepository<Viagem, Integer> {

    // Lista as viagens criadas por um usuário específico, mais recentes primeiro.
    List<Viagem> findByCriadorOrderByIdDesc(Cadastro criador);
}
