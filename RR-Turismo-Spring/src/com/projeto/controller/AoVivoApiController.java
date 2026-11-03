package com.projeto.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;
import com.projeto.security.TokenAuthInterceptor;
import com.projeto.service.CadastroService;
import com.projeto.service.EditarViagemService;
import com.projeto.service.ViagemAoVivoService;
import com.projeto.service.ViagemAoVivoService.RegraException;

import jakarta.servlet.http.HttpServletRequest;

// ============================================================
// AO VIVO API CONTROLLER (Modo Guia / Minha Viagem do Mobile)
// ------------------------------------------------------------
// Rotas /api/ao-vivo/{viagemId}/... Todas exigem token (login).
// A lógica fica no ViagemAoVivoService; aqui só recebemos o
// pedido, descobrimos quem é o usuário e devolvemos o JSON.
// ============================================================
@RestController
@RequestMapping("/api/ao-vivo/{viagemId}")
public class AoVivoApiController {

    public record LocalizacaoRequest(double lat, double lng) { }
    public record AvisoRequest(String texto, String tipo) { }
    public record EmergenciaRequest(String mensagem) { }

    private final ViagemAoVivoService servico;
    private final EditarViagemService viagemService;
    private final CadastroService cadastroService;

    public AoVivoApiController(ViagemAoVivoService servico, EditarViagemService viagemService,
                               CadastroService cadastroService) {
        this.servico = servico;
        this.viagemService = viagemService;
        this.cadastroService = cadastroService;
    }

    private Cadastro usuario(HttpServletRequest req) {
        int id = (Integer) req.getAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID);
        return cadastroService.buscarPorId(id)
                .orElseThrow(() -> new RegraException(401, "Usuário não encontrado."));
    }

    private Viagem viagem(int id) {
        Viagem v = viagemService.buscarPorId(id);
        if (v == null) throw new RegraException(404, "Viagem não encontrada.");
        return v;
    }

    private static ResponseEntity<Map<String, Object>> ok() {
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ---- Guia ----
    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciar(@PathVariable("viagemId") int viagemId, HttpServletRequest req) {
        servico.iniciar(viagem(viagemId), usuario(req));
        return ok();
    }

    @PostMapping("/encerrar")
    public ResponseEntity<?> encerrar(@PathVariable("viagemId") int viagemId, HttpServletRequest req) {
        servico.encerrar(viagem(viagemId), usuario(req));
        return ok();
    }

    @PostMapping("/avisos")
    public ResponseEntity<?> aviso(@PathVariable("viagemId") int viagemId, @RequestBody AvisoRequest corpo,
                                   HttpServletRequest req) {
        return ResponseEntity.ok(servico.publicarAviso(viagem(viagemId), usuario(req), corpo.texto(), corpo.tipo()));
    }

    @PostMapping("/emergencias/{emergenciaId}/resolver")
    public ResponseEntity<?> resolver(@PathVariable("viagemId") int viagemId, @PathVariable("emergenciaId") int emergenciaId,
                                      HttpServletRequest req) {
        servico.resolverEmergencia(viagem(viagemId), usuario(req), emergenciaId);
        return ok();
    }

    // ---- Cliente ----
    @PostMapping("/entrar")
    public ResponseEntity<?> entrar(@PathVariable("viagemId") int viagemId, HttpServletRequest req) {
        viagem(viagemId);
        servico.entrar(viagemId, usuario(req));
        return ok();
    }

    @PostMapping("/sair")
    public ResponseEntity<?> sair(@PathVariable("viagemId") int viagemId, HttpServletRequest req) {
        servico.sair(viagemId, usuario(req));
        return ok();
    }

    @PostMapping("/emergencia")
    public ResponseEntity<?> emergencia(@PathVariable("viagemId") int viagemId, @RequestBody EmergenciaRequest corpo,
                                        HttpServletRequest req) {
        servico.dispararEmergencia(viagemId, usuario(req), corpo.mensagem());
        return ok();
    }

    // ---- Os dois ----
    @PostMapping("/localizacao")
    public ResponseEntity<?> localizacao(@PathVariable("viagemId") int viagemId, @RequestBody LocalizacaoRequest corpo,
                                         HttpServletRequest req) {
        servico.atualizarLocalizacao(viagemId, usuario(req), corpo.lat(), corpo.lng());
        return ok();
    }

    // O app consulta isto a cada poucos segundos (radar, avisos, emergências).
    @GetMapping("/estado")
    public ResponseEntity<?> estado(@PathVariable("viagemId") int viagemId, HttpServletRequest req) {
        return ResponseEntity.ok(servico.estado(viagem(viagemId), usuario(req)));
    }

    // Converte erros de regra em JSON {"erro": "..."} (o app já sabe ler esse formato).
    @ExceptionHandler(RegraException.class)
    public ResponseEntity<Map<String, String>> tratar(RegraException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("erro", e.getMessage()));
    }
}
