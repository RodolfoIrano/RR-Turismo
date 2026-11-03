package com.projeto.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.projeto.model.Cadastro;
import com.projeto.model.PerfilUsuario;

// ============================================================
// REPOSITÓRIO DE PERFIL DE USUÁRIO (tabela "perfil_usuario")
// ============================================================
@Repository
public interface PerfilUsuarioRepository extends CrudRepository<PerfilUsuario, Integer> {

    // Busca o perfil (foto, redes sociais etc) de um usuário específico.
    Optional<PerfilUsuario> findByUsuario(Cadastro usuario);
}
