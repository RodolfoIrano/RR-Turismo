package com.projeto.service;

import org.springframework.stereotype.Service;

import com.projeto.model.Viagem;
import com.projeto.repository.CriarViagemRepository;

// ============================================================
// CRIAR VIAGEM SERVICE
// ------------------------------------------------------------
// Serviço simples: só salva um novo pacote de viagem no banco.
// ============================================================
@Service
public class CriarViagemService {

    private CriarViagemRepository criarViagemRepository;

    public CriarViagemService(CriarViagemRepository criarViagemRepository) {
        this.criarViagemRepository = criarViagemRepository;
    }

    public Viagem salvar(Viagem viagem) {
        return criarViagemRepository.save(viagem);
    }
}