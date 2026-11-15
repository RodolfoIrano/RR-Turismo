package com.projeto.repository;

import org.springframework.data.jpa.repository.Query;
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

    // Só os NOMES das categorias (sem carregar as fotos das viagens).
    // Usado no rodapé de todas as páginas, por isso precisa ser leve.
    @Query("select distinct v.categoria from Viagem v where v.categoria is not null and trim(v.categoria) <> '' order by v.categoria")
    List<String> listarCategorias();
}
