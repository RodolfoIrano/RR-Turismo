package com.projeto.aovivo;

import java.time.Instant;

// Mensagem que o guia manda para todo o grupo (substitui o grupo de WhatsApp).
// tipo: "INFO" (aviso comum) ou "REUNIR" (hora de voltar - o app do cliente pisca).
public record Aviso(int id, String texto, String tipo, Instant hora) { }
