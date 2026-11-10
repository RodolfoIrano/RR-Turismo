package com.projeto.controller;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.projeto.dto.UsuarioDTO;
import com.projeto.model.Cadastro;
import com.projeto.model.PerfilUsuario;
import com.projeto.security.TokenAuthInterceptor;
import com.projeto.service.CadastroService;
import com.projeto.service.PerfilUsuarioService;
import com.projeto.util.DetectorDeImagem;

// ============================================================
// PERFIL API CONTROLLER (usado apenas pelo app Mobile)
// ------------------------------------------------------------
// Reaproveita o PerfilUsuarioService/PerfilUsuario ja existentes
// (mesma tabela/coluna "foto" usada pelo site). Nao cria nenhuma
// estrutura de armazenamento de imagem nova.
//
// Protegido pelo TokenAuthInterceptor: o id do usuario logado
// chega pronto em "usuarioApiId".
// ============================================================
@RestController
@RequestMapping("/api/perfil")
public class PerfilApiController {

    private static final long TAMANHO_MAXIMO_BYTES = 5L * 1024 * 1024; // 5MB

    private final CadastroService cadastroService;
    private final PerfilUsuarioService perfilUsuarioService;

    public PerfilApiController(CadastroService cadastroService, PerfilUsuarioService perfilUsuarioService) {
        this.cadastroService = cadastroService;
        this.perfilUsuarioService = perfilUsuarioService;
    }

    @GetMapping("/foto")
    public ResponseEntity<byte[]> foto(@RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId) {
        PerfilUsuario perfil = perfilDoUsuario(usuarioId);
        if (perfil == null || perfil.getFoto() == null || perfil.getFoto().length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(DetectorDeImagem.detectar(perfil.getFoto()))
                .body(perfil.getFoto());
    }

    // Serve o BANNER (imagem de capa/fundo do perfil), reaproveitando
    // a mesma coluna "banner" que o site já usa.
    @GetMapping("/banner")
    public ResponseEntity<byte[]> banner(@RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId) {
        PerfilUsuario perfil = perfilDoUsuario(usuarioId);
        if (perfil == null || perfil.getBanner() == null || perfil.getBanner().length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(DetectorDeImagem.detectar(perfil.getBanner()))
                .body(perfil.getBanner());
    }

    @PostMapping("/foto")
    public ResponseEntity<?> atualizarFoto(
            @RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId,
            @RequestParam("foto") MultipartFile arquivo) {

        ResponseEntity<?> erroValidacao = validarImagem(arquivo);
        if (erroValidacao != null) {
            return erroValidacao;
        }

        Optional<Cadastro> usuario = cadastroService.buscarPorId(usuarioId);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PerfilUsuario perfil = perfilUsuarioService.buscarOuCriar(usuario.get());
        try {
            perfil.setFoto(com.projeto.util.RedimensionadorDeImagem.prepararParaSalvar(arquivo.getBytes(), 900, 150_000));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("erro", "Erro ao processar a imagem."));
        }
        perfil.setUsuario(usuario.get());
        perfilUsuarioService.salvar(perfil);

        return ResponseEntity.ok(Map.of("mensagem", "Foto atualizada com sucesso."));
    }

    // Recebe e salva o BANNER (imagem de capa/fundo do perfil).
    // Mesmas validações do upload da foto.
    @PostMapping("/banner")
    public ResponseEntity<?> atualizarBanner(
            @RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId,
            @RequestParam("banner") MultipartFile arquivo) {

        ResponseEntity<?> erroValidacao = validarImagem(arquivo);
        if (erroValidacao != null) {
            return erroValidacao;
        }

        Optional<Cadastro> usuario = cadastroService.buscarPorId(usuarioId);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PerfilUsuario perfil = perfilUsuarioService.buscarOuCriar(usuario.get());
        try {
            perfil.setBanner(com.projeto.util.RedimensionadorDeImagem.prepararParaSalvar(arquivo.getBytes(), 1600, 300_000));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("erro", "Erro ao processar a imagem."));
        }
        perfil.setUsuario(usuario.get());
        perfilUsuarioService.salvar(perfil);

        return ResponseEntity.ok(Map.of("mensagem", "Banner atualizado com sucesso."));
    }

    // Troca o NOME exibido do usuario (tela "Editar perfil" do app).
    // So mexe no nome: e-mail e senha continuam intactos.
    @PostMapping("/nome")
    public ResponseEntity<?> atualizarNome(
            @RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId,
            @RequestBody Map<String, String> corpo) {

        String nome = corpo == null ? null : corpo.get("nome");
        nome = nome == null ? "" : nome.trim().replaceAll("\\s+", " ");
        if (nome.length() < 2 || nome.length() > 80) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O nome deve ter entre 2 e 80 caracteres."));
        }

        Optional<Cadastro> usuario = cadastroService.buscarPorId(usuarioId);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        usuario.get().setNome(nome);
        cadastroService.salvar(usuario.get());

        PerfilUsuario perfil = perfilUsuarioService.buscarOuCriar(usuario.get());
        return ResponseEntity.ok(UsuarioDTO.de(usuario.get(),
                perfil.getFoto() != null, perfil.getBanner() != null));
    }

    // Validações comuns aos uploads de imagem (tamanho e tipo do arquivo).
    // Retorna null quando está tudo certo.
    private ResponseEntity<?> validarImagem(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nenhuma imagem enviada."));
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_BYTES) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(Map.of("erro", "A imagem deve ter ate 5MB."));
        }
        String tipo = arquivo.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Envie um arquivo de imagem valido."));
        }
        return null;
    }

    private PerfilUsuario perfilDoUsuario(Integer usuarioId) {
        return cadastroService.buscarPorId(usuarioId)
                .map(perfilUsuarioService::buscarOuCriar)
                .orElse(null);
    }
}
