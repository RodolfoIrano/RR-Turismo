
package com.projeto.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;
import com.projeto.repository.CriarViagemRepository;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Regras de negócio da tela EDITAR VIAGEM do site: lista as viagens
// (todas ou só as de um criador), busca uma pela id e salva as
// alterações. Quem chama é o EditarViagemController.
// Os dados vêm/vão para o banco pelo CriarViagemRepository.
// ============================================================
@Service
public class EditarViagemService {

    private final CriarViagemRepository criarViagemRepository;

    public EditarViagemService(CriarViagemRepository criarViagemRepository) {
        this.criarViagemRepository = criarViagemRepository;
    }

    // Lista todas as viagens de todos os criadores (visão geral/admin).
    public List<Viagem> listarTodas() {
        List<Viagem> lista = new ArrayList<>();
        criarViagemRepository.findAll().forEach(lista::add);
        return lista;
    }

    // Lista só as viagens criadas por um usuário específico (ex: "minhas viagens").
    public List<Viagem> listarPorCriador(Cadastro criador) {
        if (criador == null) {
            return new ArrayList<>();
        }

        return criarViagemRepository.findByCriadorOrderByIdDesc(criador);
    }

    public Viagem buscarPorId(int id) {
        return criarViagemRepository.findById(id).orElse(null);
    }

    public Viagem salvar(Viagem viagem) {
        return criarViagemRepository.save(viagem);
    }

    public void deletar(int id) {
        criarViagemRepository.deleteById(id);
    }
}
