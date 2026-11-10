package com.projeto.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.projeto.model.Cadastro;
import com.projeto.model.Reserva;

// ============================================================
// REPOSITÓRIO DE RESERVA (tabela "reserva")
// ============================================================
@Repository
public interface ReservaRepository extends CrudRepository<Reserva, Integer> {

    // Todas as reservas de uma pessoa, da mais nova para a mais antiga.
    List<Reserva> findByCompradorOrderByIdDesc(Cadastro comprador);

    // Itens de UMA compra (só se for desta pessoa).
    List<Reserva> findByCodigoPedidoAndCompradorOrderByIdAsc(String codigoPedido, Cadastro comprador);
}
