package com.projeto.aovivo;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// ============================================================
// SALA DE VIAGEM (uma viagem "ao vivo")
// ------------------------------------------------------------
// Agrupa tudo de UMA viagem: o guia, os participantes, os avisos
// e as emergências. Cada método público é uma AÇÃO possível na
// sala (entrar, mandar aviso...) e já valida as regras dela.
//
// Os métodos são "synchronized" porque vários celulares chamam
// ao mesmo tempo (threads diferentes no servidor).
// ============================================================
public class SalaDeViagem {

    private final int viagemId;
    private final int guiaId;
    private final String guiaNome;
    private final Map<Integer, Participante> participantes = new LinkedHashMap<>();
    private final List<Aviso> avisos = new ArrayList<>();
    private final List<Emergencia> emergencias = new ArrayList<>();
    private int proximoId = 1;

    public SalaDeViagem(int viagemId, int guiaId, String guiaNome) {
        this.viagemId = viagemId;
        this.guiaId = guiaId;
        this.guiaNome = guiaNome;
        // O guia também é um ponto no radar (o centro).
        participantes.put(guiaId, new Participante(guiaId, guiaNome, true));
    }

    public synchronized void entrar(int usuarioId, String nome) {
        participantes.computeIfAbsent(usuarioId, id -> new Participante(id, nome, false));
    }

    public synchronized void sair(int usuarioId) {
        if (usuarioId == guiaId) return; // o guia só sai encerrando a viagem
        participantes.remove(usuarioId);
        emergencias.removeIf(e -> e.usuarioId() == usuarioId);
    }

    public synchronized boolean contem(int usuarioId) {
        return participantes.containsKey(usuarioId);
    }

    public synchronized void atualizarLocalizacao(int usuarioId, Coordenada posicao) {
        Participante p = participantes.get(usuarioId);
        if (p == null) throw new IllegalStateException("Você não entrou nesta viagem.");
        p.atualizarPosicao(posicao, Instant.now());
    }

    public synchronized Aviso publicarAviso(String texto, String tipo) {
        Aviso aviso = new Aviso(proximoId++, texto, tipo, Instant.now());
        avisos.add(aviso);
        return aviso;
    }

    public synchronized Emergencia dispararEmergencia(int usuarioId, String mensagem) {
        Participante p = participantes.get(usuarioId);
        if (p == null) throw new IllegalStateException("Você não entrou nesta viagem.");
        Emergencia e = new Emergencia(proximoId++, usuarioId, p.getNome(), mensagem,
                p.getPosicao(), Instant.now());
        emergencias.add(e);
        return e;
    }

    public synchronized void resolverEmergencia(int emergenciaId) {
        emergencias.removeIf(e -> e.id() == emergenciaId);
    }

    public synchronized boolean estaEmAlerta(int usuarioId) {
        return emergencias.stream().anyMatch(e -> e.usuarioId() == usuarioId);
    }

    // Cópias para leitura (quem lê não consegue mexer na lista interna).
    public synchronized List<Participante> listarParticipantes() { return new ArrayList<>(participantes.values()); }
    public synchronized List<Aviso> listarAvisos() { return new ArrayList<>(avisos); }
    public synchronized List<Emergencia> listarEmergencias() { return new ArrayList<>(emergencias); }
    public synchronized Participante participante(int usuarioId) { return participantes.get(usuarioId); }
    public synchronized Coordenada posicaoDoGuia() { return participantes.get(guiaId).getPosicao(); }

    public int getViagemId() { return viagemId; }
    public int getGuiaId() { return guiaId; }
    public String getGuiaNome() { return guiaNome; }
}
