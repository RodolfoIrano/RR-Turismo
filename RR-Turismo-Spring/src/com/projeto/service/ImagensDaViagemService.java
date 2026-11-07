package com.projeto.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projeto.model.ViagemImagem;
import com.projeto.repository.ViagemImagemRepository;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cuida das fotos EXTRAS de cada viagem (2ª a 5ª foto).
// A capa (1ª foto) continua sendo salva pela própria Viagem.
// ============================================================
@Service
public class ImagensDaViagemService {

    // Limite total de fotos por viagem (capa + extras), igual ao do site.
    public static final int MAXIMO_DE_FOTOS = 5;

    private final ViagemImagemRepository repository;

    public ImagensDaViagemService(ViagemImagemRepository repository) {
        this.repository = repository;
    }

    // Troca TODAS as fotos extras da viagem pelas novas.
    // "ordem" começa em 1 (a capa é a posição 0, que fica na tabela viagem).
    @Transactional
    public void substituirExtras(int viagemId, List<byte[]> extras) {
        repository.deleteByViagemId(viagemId);
        int ordem = 1;
        for (byte[] dados : extras) {
            if (dados == null || dados.length == 0) {
                continue;
            }
            repository.save(new ViagemImagem(viagemId, ordem++, dados));
        }
    }

    public int quantidadeDeExtras(int viagemId) {
        return (int) repository.countByViagemId(viagemId);
    }

    // Devolve a foto extra "numero" (1 = 2ª foto da viagem), ou null se não existir.
    public byte[] buscarExtra(int viagemId, int numero) {
        List<ViagemImagem> lista = repository.findByViagemIdOrderByOrdemAsc(viagemId);
        if (numero < 1 || numero > lista.size()) {
            return null;
        }
        return lista.get(numero - 1).getDados();
    }

    @Transactional
    public void apagarDaViagem(int viagemId) {
        repository.deleteByViagemId(viagemId);
    }
}
