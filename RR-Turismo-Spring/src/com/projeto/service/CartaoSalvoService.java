package com.projeto.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.projeto.model.Cadastro;
import com.projeto.model.CartaoSalvo;
import com.projeto.repository.CartaoSalvoRepository;

// ============================================================
// CARTÃO SALVO SERVICE
// ------------------------------------------------------------
// Regras de negócio dos cartões tokenizados: listar, salvar e
// excluir - sempre restrito ao dono do cartão (um usuário nunca
// consegue ver ou apagar o cartão de outro).
// ============================================================
@Service
public class CartaoSalvoService {

    private final CartaoSalvoRepository cartaoSalvoRepository;

    public CartaoSalvoService(CartaoSalvoRepository cartaoSalvoRepository) {
        this.cartaoSalvoRepository = cartaoSalvoRepository;
    }

    public List<CartaoSalvo> listarPorUsuario(Cadastro usuario) {
        return cartaoSalvoRepository.findByUsuarioOrderByIdDesc(usuario);
    }

    public CartaoSalvo salvar(CartaoSalvo cartao) {
        return cartaoSalvoRepository.save(cartao);
    }

    // Exclui um cartão, mas só se ele realmente pertencer ao
    // usuário que está pedindo a exclusão (evita que alguém exclua
    // o cartão de outra pessoa só sabendo o ID). Retorna true se
    // conseguiu excluir, false se não encontrou ou não é o dono.
    public boolean excluir(Cadastro usuario, int cartaoId) {
        return cartaoSalvoRepository.findById(cartaoId)
                .filter(c -> c.getUsuario() != null && c.getUsuario().getId() == usuario.getId())
                .map(c -> {
                    cartaoSalvoRepository.deleteById(c.getId());
                    return true;
                })
                .orElse(false);
    }
}
