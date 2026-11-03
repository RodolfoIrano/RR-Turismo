package com.projeto.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.projeto.aovivo.Aviso;
import com.projeto.aovivo.Coordenada;
import com.projeto.aovivo.Emergencia;
import com.projeto.aovivo.Participante;
import com.projeto.aovivo.SalaDeViagem;
import com.projeto.aovivo.StatusParticipante;
import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;

// ============================================================
// VIAGEM AO VIVO SERVICE
// ------------------------------------------------------------
// Orquestra as "salas" de viagem ao vivo. As salas ficam só em
// MEMÓRIA (não mexe no banco de dados): ao reiniciar o servidor
// ou encerrar a viagem, localizações e avisos somem - o que é o
// desejado para privacidade ("quando acabar, o guia não tem mais
// acesso").
//
// Quem pode o quê:
//   - GUIA (criador da viagem): iniciar, encerrar, avisar, ver radar.
//   - CLIENTE: entrar, mandar localização, pedir ajuda, ver avisos.
// ============================================================
@Service
public class ViagemAoVivoService {

    // Erro de regra de negócio, com o código HTTP que o controller deve devolver.
    public static class RegraException extends RuntimeException {
        private final int status;
        public RegraException(int status, String mensagem) { super(mensagem); this.status = status; }
        public int getStatus() { return status; }
    }

    // ---- Formatos de resposta (viram JSON) ----
    public record ParticipanteDTO(int usuarioId, String nome, boolean guia, StatusParticipante status,
                                  Double distanciaM, Double rumoGraus, Long segundosDesdeSinal,
                                  Double lat, Double lng) { }
    public record AvisoDTO(int id, String texto, String tipo, long hora) { }
    public record EmergenciaDTO(int id, int usuarioId, String nome, String mensagem,
                                Double lat, Double lng, long hora) { }
    public record EstadoDTO(boolean ativa, boolean souGuia, boolean entrei, String guiaNome,
                            StatusParticipante meuStatus, int totalParticipantes,
                            List<AvisoDTO> avisos, List<EmergenciaDTO> emergencias,
                            List<ParticipanteDTO> participantes) { }

    private final Map<Integer, SalaDeViagem> salas = new ConcurrentHashMap<>();

    // O guia é o criador da viagem.
    private void exigirGuia(Viagem viagem, Cadastro usuario) {
        if (viagem.getCriador() == null || viagem.getCriador().getId() != usuario.getId()) {
            throw new RegraException(403, "Só o guia desta viagem pode fazer isso.");
        }
    }

    private SalaDeViagem salaAtiva(int viagemId) {
        SalaDeViagem sala = salas.get(viagemId);
        if (sala == null) throw new RegraException(409, "Esta viagem ainda não está ao vivo.");
        return sala;
    }

    public void iniciar(Viagem viagem, Cadastro usuario) {
        exigirGuia(viagem, usuario);
        salas.putIfAbsent(viagem.getId(), new SalaDeViagem(viagem.getId(), usuario.getId(), usuario.getNome()));
    }

    public void encerrar(Viagem viagem, Cadastro usuario) {
        exigirGuia(viagem, usuario);
        salas.remove(viagem.getId()); // apaga tudo: localizações, avisos, emergências
    }

    public void entrar(int viagemId, Cadastro usuario) {
        salaAtiva(viagemId).entrar(usuario.getId(), usuario.getNome());
    }

    public void sair(int viagemId, Cadastro usuario) {
        SalaDeViagem sala = salas.get(viagemId);
        if (sala != null) sala.sair(usuario.getId());
    }

    public void atualizarLocalizacao(int viagemId, Cadastro usuario, double lat, double lng) {
        try {
            salaAtiva(viagemId).atualizarLocalizacao(usuario.getId(), new Coordenada(lat, lng));
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new RegraException(400, e.getMessage());
        }
    }

    public AvisoDTO publicarAviso(Viagem viagem, Cadastro usuario, String texto, String tipo) {
        exigirGuia(viagem, usuario);
        if (texto == null || texto.isBlank()) throw new RegraException(400, "Escreva o aviso.");
        if (texto.length() > 280) throw new RegraException(400, "Aviso muito longo (máx. 280).");
        String tipoFinal = "REUNIR".equals(tipo) ? "REUNIR" : "INFO";
        Aviso a = salaAtiva(viagem.getId()).publicarAviso(texto.trim(), tipoFinal);
        return paraDTO(a);
    }

    public void dispararEmergencia(int viagemId, Cadastro usuario, String mensagem) {
        try {
            String msg = (mensagem == null || mensagem.isBlank()) ? "Preciso de ajuda!" : mensagem.trim();
            salaAtiva(viagemId).dispararEmergencia(usuario.getId(), msg.length() > 200 ? msg.substring(0, 200) : msg);
        } catch (IllegalStateException e) {
            throw new RegraException(400, e.getMessage());
        }
    }

    public void resolverEmergencia(Viagem viagem, Cadastro usuario, int emergenciaId) {
        exigirGuia(viagem, usuario);
        salaAtiva(viagem.getId()).resolverEmergencia(emergenciaId);
    }

    // Monta o que cada pessoa pode ver: o guia vê o radar completo;
    // o cliente vê só os avisos e a própria situação (privacidade).
    public EstadoDTO estado(Viagem viagem, Cadastro usuario) {
        SalaDeViagem sala = salas.get(viagem.getId());
        boolean souGuia = viagem.getCriador() != null && viagem.getCriador().getId() == usuario.getId();
        if (sala == null) {
            return new EstadoDTO(false, souGuia, false, null, null, 0, List.of(), List.of(), List.of());
        }

        Instant agora = Instant.now();
        Coordenada posGuia = sala.posicaoDoGuia();
        boolean entrei = sala.contem(usuario.getId());

        StatusParticipante meuStatus = null;
        Participante eu = sala.participante(usuario.getId());
        if (eu != null) meuStatus = eu.status(posGuia, sala.estaEmAlerta(usuario.getId()), agora);

        List<AvisoDTO> avisos = sala.listarAvisos().stream().map(this::paraDTO).toList();

        List<ParticipanteDTO> radar = new ArrayList<>();
        List<EmergenciaDTO> emergencias = new ArrayList<>();
        if (souGuia) {
            for (Participante p : sala.listarParticipantes()) {
                StatusParticipante st = p.status(posGuia, sala.estaEmAlerta(p.getUsuarioId()), agora);
                Coordenada pos = p.getPosicao();
                boolean temRelativo = pos != null && posGuia != null;
                radar.add(new ParticipanteDTO(
                        p.getUsuarioId(), p.getNome(), p.isGuia(), st,
                        temRelativo ? posGuia.distanciaAte(pos) : null,
                        temRelativo ? posGuia.rumoPara(pos) : null,
                        p.getAtualizadoEm() == null ? null : Duration.between(p.getAtualizadoEm(), agora).toSeconds(),
                        pos == null ? null : pos.lat(), pos == null ? null : pos.lng()));
            }
            emergencias = sala.listarEmergencias().stream().map(this::paraDTO).toList();
        } else if (eu != null) {
            // PARTICIPANTE (que entrou com consentimento): vê SOMENTE o guia desta
            // viagem e a si mesmo - nunca os outros participantes (privacidade).
            for (Participante p : sala.listarParticipantes()) {
                if (!p.isGuia() && p.getUsuarioId() != usuario.getId()) continue;
                StatusParticipante st = p.status(posGuia, sala.estaEmAlerta(p.getUsuarioId()), agora);
                Coordenada pos = p.getPosicao();
                boolean temRelativo = pos != null && posGuia != null;
                radar.add(new ParticipanteDTO(
                        p.getUsuarioId(), p.getNome(), p.isGuia(), st,
                        temRelativo ? posGuia.distanciaAte(pos) : null,
                        temRelativo ? posGuia.rumoPara(pos) : null,
                        p.getAtualizadoEm() == null ? null : Duration.between(p.getAtualizadoEm(), agora).toSeconds(),
                        pos == null ? null : pos.lat(), pos == null ? null : pos.lng()));
            }
            if (sala.estaEmAlerta(usuario.getId())) {
                emergencias = sala.listarEmergencias().stream()
                        .filter(e -> e.usuarioId() == usuario.getId()).map(this::paraDTO).toList();
            }
        }

        return new EstadoDTO(true, souGuia, entrei, sala.getGuiaNome(), meuStatus,
                sala.listarParticipantes().size() - 1, avisos, emergencias, radar);
    }

    private AvisoDTO paraDTO(Aviso a) {
        return new AvisoDTO(a.id(), a.texto(), a.tipo(), a.hora().toEpochMilli());
    }

    private EmergenciaDTO paraDTO(Emergencia e) {
        return new EmergenciaDTO(e.id(), e.usuarioId(), e.nome(), e.mensagem(),
                e.posicao() == null ? null : e.posicao().lat(),
                e.posicao() == null ? null : e.posicao().lng(), e.hora().toEpochMilli());
    }
}
