package com.projeto.aovivo;

import java.time.Instant;

// Pedido de ajuda de um cliente (botão de emergência). Fica ativo até o guia resolver.
// ATENÇÃO: é só um aviso AO GUIA, não substitui polícia, SAMU ou bombeiros.
public record Emergencia(int id, int usuarioId, String nome, String mensagem,
                         Coordenada posicao, Instant hora) { }
