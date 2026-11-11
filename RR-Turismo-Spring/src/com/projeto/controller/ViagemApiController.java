package com.projeto.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.dto.GuiaDTO;
import com.projeto.dto.ViagemDTO;
import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;
import com.projeto.service.CadastroService;
import com.projeto.service.EditarViagemService;
import com.projeto.service.ImagensDaViagemService;
import com.projeto.service.PerfilUsuarioService;
import com.projeto.util.RedimensionadorDeImagem;

// ============================================================
// VIAGEM API CONTROLLER (usado pelo app Mobile)
// ------------------------------------------------------------
// Entrega para o app as viagens cadastradas pelo site, junto
// com os dados do guia (o usuário que criou a viagem).
//
// Reaproveita o EditarViagemService, que o site já usa para
// listar/buscar viagens - nenhuma lógica foi duplicada.
//
// IMPORTANTE - ROTAS PÚBLICAS:
// Estas rotas NÃO exigem login (estão fora do token), porque o
// catálogo de viagens precisa aparecer no app antes mesmo do
// usuário entrar na conta - igual a uma vitrine de loja. Nenhum
// dado sensível é exposto aqui (ver ViagemDTO/GuiaDTO).
// ============================================================
@RestController
@RequestMapping("/api")
public class ViagemApiController {

    private final EditarViagemService editarViagemService;
    private final CadastroService cadastroService;
    private final PerfilUsuarioService perfilUsuarioService;
    private final ImagensDaViagemService imagensDaViagemService;

    public ViagemApiController(EditarViagemService editarViagemService,
                                CadastroService cadastroService,
                                PerfilUsuarioService perfilUsuarioService,
                                ImagensDaViagemService imagensDaViagemService) {
        this.imagensDaViagemService = imagensDaViagemService;
        this.editarViagemService = editarViagemService;
        this.cadastroService = cadastroService;
        this.perfilUsuarioService = perfilUsuarioService;
    }

    // Lista todas as viagens cadastradas no site.
    @GetMapping("/viagens")
    public ResponseEntity<List<ViagemDTO>> listarViagens() {
        List<ViagemDTO> viagens = editarViagemService.listarTodas().stream()
                .map(this::paraDto)
                .toList();
        return ResponseEntity.ok(viagens);
    }

    // Busca uma viagem específica (tela de detalhes do app).
    @GetMapping("/viagens/{id}")
    public ResponseEntity<ViagemDTO> buscarViagem(@PathVariable("id") int id) {
        Viagem viagem = editarViagemService.buscarPorId(id);
        if (viagem == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(paraDto(viagem));
    }

    // Serve a imagem da viagem (guardada como BLOB no banco).
    @GetMapping("/viagens/{id}/imagem")
    public ResponseEntity<byte[]> imagemViagem(@PathVariable("id") int id,
                                               @RequestParam(name = "w", defaultValue = "0") int w) {
        Viagem viagem = editarViagemService.buscarPorId(id);
        if (viagem == null || viagem.getImagem() == null || viagem.getImagem().length == 0) {
            return ResponseEntity.notFound().build();
        }
        // "w" = largura máxima pedida pelo app (versão leve para o celular).
        RedimensionadorDeImagem.Imagem img = RedimensionadorDeImagem.servir("viagem-" + id, viagem.getImagem(), w);
        return ResponseEntity.ok().contentType(img.tipo()).body(img.bytes());
    }

    // Serve a foto EXTRA número "n" da viagem (1 = 2ª foto, 2 = 3ª...). A capa é /viagens/{id}/imagem.
    @GetMapping("/viagens/{id}/imagem/{n}")
    public ResponseEntity<byte[]> imagemExtraViagem(@PathVariable("id") int id,
                                                    @PathVariable("n") int n,
                                                    @RequestParam(name = "w", defaultValue = "0") int w) {
        byte[] dados = imagensDaViagemService.buscarExtra(id, n);
        if (dados == null || dados.length == 0) {
            return ResponseEntity.notFound().build();
        }
        RedimensionadorDeImagem.Imagem img =
                RedimensionadorDeImagem.servir("viagem-" + id + "-" + n + "-" + dados.length, dados, w);
        return ResponseEntity.ok().contentType(img.tipo()).body(img.bytes());
    }

    // Converte a viagem para o formato do app, já com a lista de fotos.
    private ViagemDTO paraDto(Viagem viagem) {
        return ViagemDTO.de(viagem, imagensDaViagemService.quantidadeDeExtras(viagem.getId()));
    }

    // Dados do guia (usuário que criou as viagens).
    @GetMapping("/guias/{id}")
    public ResponseEntity<GuiaDTO> buscarGuia(@PathVariable("id") int id) {
        Optional<Cadastro> criador = cadastroService.buscarPorId(id);
        if (criador.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(GuiaDTO.de(criador.get(),
                perfilUsuarioService.buscarOuCriar(criador.get())));
    }

    // Foto de perfil do guia (a mesma que ele usa no site).
    @GetMapping("/guias/{id}/foto")
    public ResponseEntity<byte[]> fotoGuia(@PathVariable("id") int id,
                                           @RequestParam(name = "w", defaultValue = "0") int w) {
        Optional<Cadastro> criador = cadastroService.buscarPorId(id);
        if (criador.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        byte[] foto = perfilUsuarioService.buscarOuCriar(criador.get()).getFoto();
        if (foto == null || foto.length == 0) {
            return ResponseEntity.notFound().build();
        }
        RedimensionadorDeImagem.Imagem img = RedimensionadorDeImagem.servir("guia-" + id, foto, w);
        return ResponseEntity.ok().contentType(img.tipo()).body(img.bytes());
    }

    // Banner (capa) do perfil do guia: a mesma imagem que aparece no perfil público do site.
    @GetMapping("/guias/{id}/banner")
    public ResponseEntity<byte[]> bannerGuia(@PathVariable("id") int id,
                                             @RequestParam(name = "w", defaultValue = "0") int w) {
        Optional<Cadastro> criador = cadastroService.buscarPorId(id);
        if (criador.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        byte[] banner = perfilUsuarioService.buscarOuCriar(criador.get()).getBanner();
        if (banner == null || banner.length == 0) {
            return ResponseEntity.notFound().build();
        }
        RedimensionadorDeImagem.Imagem img =
                RedimensionadorDeImagem.servir("guia-banner-" + id + "-" + banner.length, banner, w);
        return ResponseEntity.ok().contentType(img.tipo()).body(img.bytes());
    }

    // Lista as viagens de um guia específico (tela de perfil do guia no app).
    @GetMapping("/guias/{id}/viagens")
    public ResponseEntity<List<ViagemDTO>> viagensDoGuia(@PathVariable("id") int id) {
        Optional<Cadastro> criador = cadastroService.buscarPorId(id);
        if (criador.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<ViagemDTO> viagens = editarViagemService.listarPorCriador(criador.get()).stream()
                .map(this::paraDto)
                .toList();
        return ResponseEntity.ok(viagens);
    }
}
