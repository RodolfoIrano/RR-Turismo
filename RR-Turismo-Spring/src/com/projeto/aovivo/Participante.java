package com.projeto.aovivo;

import java.time.Duration;
import java.time.Instant;

// ============================================================
// PARTICIPANTE (cliente ou guia dentro de uma viagem ao vivo)
// ------------------------------------------------------------
// Guarda quem é, onde está e quando mandou o último sinal.
// A regra de "qual é o status dele" fica AQUI dentro, e não
// espalhada pelo controller (encapsulamento).
//
// Nada disso vai para o banco: vive só em memória enquanto a
// viagem está ao vivo (privacidade: ao encerrar, tudo some).
// ============================================================
public class Participante {

    // Regras do radar (fáceis de ajustar em um lugar só).
    public static final Duration SEM_SINAL_APOS = Duration.ofMinutes(2);
    public static final double DISTANTE_APOS_METROS = 200;

    private final int usuarioId;
    private final String nome;
    private final boolean guia;
    private Coordenada posicao;
    private Instant atualizadoEm;

    public Participante(int usuarioId, String nome, boolean guia) {
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.guia = guia;
    }

    public void atualizarPosicao(Coordenada nova, Instant agora) {
        this.posicao = nova;
        this.atualizadoEm = agora;
    }

    // Decide o status. "emAlerta" vem da sala (ela sabe das emergências).
    public StatusParticipante status(Coordenada posicaoDoGuia, boolean emAlerta, Instant agora) {
        if (emAlerta) return StatusParticipante.ALERTA;
        if (posicao == null || atualizadoEm == null
                || Duration.between(atualizadoEm, agora).compareTo(SEM_SINAL_APOS) > 0) {
            return StatusParticipante.SEM_LOCALIZACAO;
        }
        if (!guia && posicaoDoGuia != null && posicao.distanciaAte(posicaoDoGuia) > DISTANTE_APOS_METROS) {
            return StatusParticipante.DISTANTE;
        }
        return StatusParticipante.COMPARTILHANDO;
    }

    public int getUsuarioId() { return usuarioId; }
    public String getNome() { return nome; }
    public boolean isGuia() { return guia; }
    public Coordenada getPosicao() { return posicao; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
}
