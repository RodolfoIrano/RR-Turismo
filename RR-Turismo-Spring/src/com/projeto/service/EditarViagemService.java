
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

    // ------------------------------------------------------------
    // MEMÓRIA RÁPIDA (cache) da lista de viagens
    // Carregar todas as viagens traz também as FOTOS (guardadas no banco),
    // o que é pesado. Por isso a lista fica guardada por alguns segundos e
    // é descartada na hora quando uma viagem é salva ou excluída.
    // ------------------------------------------------------------
    private static final long VALIDADE_CACHE_MS = 15_000;
    private volatile List<Viagem> cacheTodas;
    private volatile long cacheEm;

    // Lista todas as viagens de todos os criadores (visão geral/admin).
    public List<Viagem> listarTodas() {
        List<Viagem> guardada = cacheTodas;
        if (guardada != null && System.currentTimeMillis() - cacheEm < VALIDADE_CACHE_MS) {
            return new ArrayList<>(guardada);
        }
        List<Viagem> lista = new ArrayList<>();
        criarViagemRepository.findAll().forEach(lista::add);
        cacheTodas = lista;
        cacheEm = System.currentTimeMillis();
        return new ArrayList<>(lista);
    }

    // Só os nomes das categorias (leve, sem fotos). Usado no rodapé.
    public List<String> listarCategorias() {
        return criarViagemRepository.listarCategorias();
    }

    private void limparCache() {
        cacheTodas = null;
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
        Viagem salva = criarViagemRepository.save(viagem);
        limparCache();
        return salva;
    }

    public void deletar(int id) {
        criarViagemRepository.deleteById(id);
        limparCache();
    }
}
