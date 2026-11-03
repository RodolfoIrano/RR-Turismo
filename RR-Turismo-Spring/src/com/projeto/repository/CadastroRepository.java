package com.projeto.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.projeto.model.Cadastro;
import java.util.Optional;

// ============================================================
// REPOSITÓRIO DE CADASTRO (acesso ao banco, tabela "cadastro")
// ------------------------------------------------------------
// CrudRepository já dá de graça os métodos básicos (save, findById,
// findAll, deleteById...). Aqui só é preciso declarar as buscas
// personalizadas - o Spring Data monta a consulta SQL sozinho a
// partir do NOME do método.
// ============================================================
@Repository
public interface CadastroRepository extends CrudRepository<Cadastro, Integer> {

    // Busca o cadastro mais recente com este e-mail (usado no login).
    Optional<Cadastro> findFirstByEmailOrderByIdDesc(String email);
}
