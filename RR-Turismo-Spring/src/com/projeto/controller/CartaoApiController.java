package com.projeto.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.dto.CartaoDTO;
import com.projeto.dto.SalvarCartaoRequest;
import com.projeto.model.Cadastro;
import com.projeto.model.CartaoSalvo;
import com.projeto.security.TokenAuthInterceptor;
import com.projeto.service.CadastroService;
import com.projeto.service.CartaoSalvoService;

// ============================================================
// CARTAO API CONTROLLER (usado apenas pelo app Mobile)
// ------------------------------------------------------------
// IMPORTANTE SOBRE SEGURANCA:
// Este controller NUNCA recebe nem grava numero completo de
// cartao ou CVV. O app Mobile deve enviar o numero do cartao
// diretamente para o SDK do gateway de pagamento (ex: Mercado
// Pago), que devolve um "token" - e SOMENTE esse token (mais
// bandeira/ultimos 4 digitos/validade, so para exibicao) chega
// aqui e vai para o banco.
//
// Isso segue a mesma logica exigida por bandeiras de cartao
// (PCI-DSS): o backend da aplicacao nunca deve tocar no numero
// real do cartao.
// ============================================================
@RestController
@RequestMapping("/api/cartoes")
public class CartaoApiController {

    private final CadastroService cadastroService;
    private final CartaoSalvoService cartaoSalvoService;

    public CartaoApiController(CadastroService cadastroService, CartaoSalvoService cartaoSalvoService) {
        this.cadastroService = cadastroService;
        this.cartaoSalvoService = cartaoSalvoService;
    }

    @GetMapping
    public ResponseEntity<?> listar(@RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId) {
        Cadastro usuario = usuarioOuErro(usuarioId);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<CartaoDTO> cartoes = cartaoSalvoService.listarPorUsuario(usuario).stream()
                .map(CartaoDTO::de)
                .toList();

        return ResponseEntity.ok(cartoes);
    }

    @PostMapping
    public ResponseEntity<?> salvar(
            @RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId,
            @RequestBody SalvarCartaoRequest request) {

        Cadastro usuario = usuarioOuErro(usuarioId);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (request.getGatewayToken() == null || request.getGatewayToken().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro",
                    "Token do gateway de pagamento ausente. O cartao precisa ser tokenizado no app antes de ser salvo."));
        }

        CartaoSalvo cartao = new CartaoSalvo();
        cartao.setUsuario(usuario);
        cartao.setGatewayToken(request.getGatewayToken());
        cartao.setBandeira(request.getBandeira());
        cartao.setUltimosDigitos(request.getUltimosDigitos());
        cartao.setNomeImpresso(request.getNomeImpresso());
        cartao.setValidade(request.getValidade());

        CartaoSalvo salvo = cartaoSalvoService.salvar(cartao);
        return ResponseEntity.status(HttpStatus.CREATED).body(CartaoDTO.de(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(
            @RequestAttribute(TokenAuthInterceptor.ATRIBUTO_USUARIO_ID) Integer usuarioId,
            @PathVariable("id") int id) {

        Cadastro usuario = usuarioOuErro(usuarioId);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean removido = cartaoSalvoService.excluir(usuario, id);
        if (!removido) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    private Cadastro usuarioOuErro(Integer usuarioId) {
        Optional<Cadastro> usuario = cadastroService.buscarPorId(usuarioId);
        return usuario.orElse(null);
    }
}
