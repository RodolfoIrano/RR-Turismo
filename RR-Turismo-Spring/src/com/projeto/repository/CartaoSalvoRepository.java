package com.projeto.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.projeto.model.Cadastro;
import com.projeto.model.CartaoSalvo;

// ============================================================
// REPOSITÓRIO DE CARTÃO SALVO (tabela "cartao_salvo")
// ------------------------------------------------------------
// Guarda apenas cartões TOKENIZADOS - nunca número completo nem
// CVV (ver comentário completo em model/CartaoSalvo.java).
// ============================================================
@Repository
public interface CartaoSalvoRepository extends CrudRepository<CartaoSalvo, Integer> {

    // Lista os cartões de um usuário específico, mais recente primeiro.
    List<CartaoSalvo> findByUsuarioOrderByIdDesc(Cadastro usuario);
}
