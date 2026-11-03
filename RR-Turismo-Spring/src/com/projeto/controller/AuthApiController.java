package com.projeto.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.dto.AuthResponse;
import com.projeto.dto.LoginRequest;
import com.projeto.dto.RegisterRequest;
import com.projeto.dto.UsuarioDTO;
import com.projeto.model.Cadastro;
import com.projeto.service.CadastroService;
import com.projeto.service.PerfilUsuarioService;
import com.projeto.security.TokenAuthInterceptor;
import com.projeto.security.TokenService;

// ============================================================
// AUTH API CONTROLLER (usado apenas pelo app Mobile)
// ------------------------------------------------------------
// Reaproveita o mesmo CadastroService/SenhaService do site - ou
// seja, e o MESMO usuario e a MESMA senha (mesmo hash PBKDF2) do
// login do site em /entrar. Nao existe um banco de usuarios
// separado para o app.
//
// O login do site (JSP, HttpSession) continua funcionando
// exatamente como antes - nada foi alterado nele.
// ============================================================
@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final CadastroService cadastroService;
    private final PerfilUsuarioService perfilUsuarioService;
    private final TokenService tokenService;

    public AuthApiController(CadastroService cadastroService,
                              PerfilUsuarioService perfilUsuarioService,
                              TokenService tokenService) {
        this.cadastroService = cadastroService;
        this.perfilUsuarioService = perfilUsuarioService;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getSenha() == null) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe e-mail e senha."));
        }

        Optional<Cadastro> usuario = cadastroService.buscarPorEmailESenha(
                request.getEmail().trim(), request.getSenha());

        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "E-mail ou senha invalidos."));
        }

        return ResponseEntity.ok(gerarResposta(usuario.get()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getNome() == null || request.getNome().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe o nome."));
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe um e-mail valido."));
        }
        if (request.getSenha() == null || request.getSenha().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("erro", "A senha deve ter ao menos 8 caracteres."));
        }

        String email = request.getEmail().trim();
        if (cadastroService.emailJaCadastrado(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "Este e-mail ja possui cadastro."));
        }

        Cadastro novo = new Cadastro();
        novo.setNome(request.getNome().trim());
        novo.setEmail(email);
        novo.setSenha(cadastroService.protegerSenha(request.getSenha()));

        Cadastro salvo = cadastroService.salvar(novo);
        return ResponseEntity.status(HttpStatus.CREATED).body(gerarResposta(salvo));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        tokenService.revogarToken(TokenService.extrairTokenDoHeader(authorization));
        return ResponseEntity.noContent().build();
    }

    // Rota protegida (passa pelo TokenAuthInterceptor) para o app
    // confirmar quem esta logado e restaurar a sessao ao abrir o app.
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId) {
        Optional<Cadastro> usuario = cadastroService.buscarPorId(usuarioId);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var perfil = perfilUsuarioService.buscarOuCriar(usuario.get());
        return ResponseEntity.ok(UsuarioDTO.de(usuario.get(),
                perfil.getFoto() != null, perfil.getBanner() != null));
    }

    private AuthResponse gerarResposta(Cadastro usuario) {
        var perfil = perfilUsuarioService.buscarOuCriar(usuario);
        String token = tokenService.gerarToken(usuario.getId());
        return new AuthResponse(token, UsuarioDTO.de(usuario,
                perfil.getFoto() != null, perfil.getBanner() != null));
    }
}
