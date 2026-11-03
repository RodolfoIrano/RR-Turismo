package com.projeto.aovivo;

// ============================================================
// STATUS DO PARTICIPANTE
// ------------------------------------------------------------
// Os 4 estados pedidos pelo professor. Um "enum" é um tipo com
// valores fixos - assim ninguém digita "compartilhando" errado.
// ============================================================
public enum StatusParticipante {
    COMPARTILHANDO,   // enviando localização normalmente (verde)
    DISTANTE,         // longe demais do guia (amarelo)
    SEM_LOCALIZACAO,  // sem sinal / parou de enviar (vermelho)
    ALERTA            // apertou o botão de emergência (vermelho piscando)
}
