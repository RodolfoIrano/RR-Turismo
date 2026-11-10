package com.projeto.controller;

import java.io.IOException;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.projeto.model.Cadastro;
import com.projeto.model.PerfilUsuario;
import com.projeto.service.PerfilUsuarioService;

import jakarta.servlet.http.HttpSession;

// ============================================================
// PERFIL DE USUÁRIO (site) - visualizar, editar, servir foto/banner
// ------------------------------------------------------------
// Rotas usadas pelas páginas JSP do site (/perfil, /editarperfil
// etc, protegidas por sessão). O app Mobile usa as rotas
// equivalentes em PerfilApiController (protegidas por token),
// que reaproveita este mesmo PerfilUsuarioService por baixo -
// ou seja, é a mesma foto/perfil nos dois lugares.
// ============================================================
@Controller
public class PerfilUsuarioController {

    private final PerfilUsuarioService perfilUsuarioService;

    public PerfilUsuarioController(PerfilUsuarioService perfilUsuarioService) {
        this.perfilUsuarioService = perfilUsuarioService;
    }

    // Mostra o perfil público do usuário logado.
    @GetMapping({ "/perfil", "/visualizarperfil" })
    public String visualizarPerfil(Model model, HttpSession session) {
        Cadastro usuario = usuarioLogado(session);
        PerfilUsuario perfil = perfilUsuarioService.buscarOuCriar(usuario);

        model.addAttribute("perfil", perfil);
        model.addAttribute("pagina", "perfilPublico.jsp");
        return "layout";
    }

    // Abre o formulário de edição de perfil.
    @GetMapping({ "/editarperfil", "/editar-perfil" })
    public String editarPerfil(Model model, HttpSession session) {
        Cadastro usuario = usuarioLogado(session);

        model.addAttribute("perfil", perfilUsuarioService.buscarOuCriar(usuario));
        model.addAttribute("pagina", "editarPerfil.jsp");
        return "layout";
    }

    // Salva as alterações feitas no formulário de perfil (dados + foto + banner).
    @PostMapping("/salvarperfil")
    public String salvarPerfil(@ModelAttribute("perfil") PerfilUsuario perfilFormulario,
                               HttpSession session,
                               RedirectAttributes redirectAttributes) {
        Cadastro usuario = usuarioLogado(session);
        PerfilUsuario perfil = perfilUsuarioService.buscarOuCriar(usuario);

        copiarCampos(perfil, perfilFormulario);
        salvarImagem(perfilFormulario.getFotoFile(), perfil, true);
        salvarImagem(perfilFormulario.getBannerFile(), perfil, false);

        perfil.setUsuario(usuario);
        perfilUsuarioService.salvar(perfil);

        session.setAttribute("usuarioLogado", usuario);

        redirectAttributes.addFlashAttribute("mensagemSucesso", "Perfil salvo com sucesso!");
        return "redirect:/perfil";
    }

    // Serve a foto de perfil como imagem binária (usada em <img src="/perfil/foto">).
    @GetMapping("/perfil/foto")
    @ResponseBody
    public ResponseEntity<byte[]> fotoPerfil(HttpSession session) {
        PerfilUsuario perfil = perfilUsuarioService.buscarOuCriar(usuarioLogado(session));
        return imagem(perfil.getFoto());
    }

    // Serve o banner do perfil como imagem binária.
    @GetMapping("/perfil/banner")
    @ResponseBody
    public ResponseEntity<byte[]> bannerPerfil(HttpSession session) {
        PerfilUsuario perfil = perfilUsuarioService.buscarOuCriar(usuarioLogado(session));
        return imagem(perfil.getBanner());
    }

    private Cadastro usuarioLogado(HttpSession session) {
        return (Cadastro) session.getAttribute("usuarioLogado");
    }

    // Copia campo a campo do formulário enviado para o perfil já existente no banco.
    private void copiarCampos(PerfilUsuario destino, PerfilUsuario origem) {
        destino.setCidade(origem.getCidade());
        destino.setEstado(origem.getEstado());
        destino.setSobre(origem.getSobre());
        destino.setWhatsapp(origem.getWhatsapp());
        destino.setInstagram(origem.getInstagram());
        destino.setFacebook(origem.getFacebook());
        destino.setTwitter(origem.getTwitter());
        destino.setSite(origem.getSite());
        destino.setIdiomas(origem.getIdiomas());
        destino.setEspecialidades(origem.getEspecialidades());
        destino.setVideoUrl(origem.getVideoUrl());
    }

    // Se um arquivo novo foi enviado, converte para bytes e substitui a foto/banner atual.
    private void salvarImagem(MultipartFile arquivo, PerfilUsuario perfil, boolean foto) {
        if (arquivo == null || arquivo.isEmpty()) {
            return;
        }
        try {
            if (foto) {
                perfil.setFoto(com.projeto.util.RedimensionadorDeImagem.prepararParaSalvar(arquivo.getBytes(), 900, 150_000));
            } else {
                perfil.setBanner(com.projeto.util.RedimensionadorDeImagem.prepararParaSalvar(arquivo.getBytes(), 1600, 300_000));
            }
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao salvar imagem do perfil.", e);
        }
    }

    // Monta a resposta HTTP com a imagem (ou 404, se não houver imagem).
    private ResponseEntity<byte[]> imagem(byte[] arquivo) {
        if (arquivo == null || arquivo.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.IMAGE_JPEG)
                .body(arquivo);
    }
}
