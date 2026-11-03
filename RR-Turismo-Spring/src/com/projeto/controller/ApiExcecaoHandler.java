package com.projeto.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Pega QUALQUER erro inesperado dos controllers da API (/api/**)
// e devolve em JSON: {"erro": "Classe: mensagem"}. Também imprime
// o erro completo no console do Spring, para você ver a causa
// real (ex: coluna faltando no banco). O app Mobile mostra essa
// mensagem no lugar de um erro genérico.
//
// Só vale para classes marcadas com @RestController (a API) - o
// site (JSP) continua tratando erros do jeito dele.
// ============================================================
@RestControllerAdvice(annotations = org.springframework.web.bind.annotation.RestController.class)
public class ApiExcecaoHandler {

    // Pedido mal formado (ex: id que não é número, JSON inválido) = erro do cliente (400).
    @ExceptionHandler({ org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
                        org.springframework.http.converter.HttpMessageNotReadableException.class })
    public ResponseEntity<Map<String, String>> pedidoInvalido(Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", "Pedido inválido: " + e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> tratar(Exception e) {
        e.printStackTrace(); // mostra o erro completo no console do Spring
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erro", e.getClass().getSimpleName() + ": " + e.getMessage()));
    }
}
