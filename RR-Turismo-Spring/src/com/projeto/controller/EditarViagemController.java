package com.projeto.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;
import com.projeto.service.EditarViagemService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

// ============================================================
// EDITAR/GERENCIAR VIAGEM (site)
// ------------------------------------------------------------
// Tela onde o criador de uma viagem (empresa/guia) pode listar,
// editar, atualizar, excluir e ver a imagem das viagens que ele
// mesmo criou.
// ============================================================
@Controller
public class EditarViagemController {

    private final EditarViagemService editarViagemService;

    public EditarViagemController(EditarViagemService editarViagemService) {
        this.editarViagemService = editarViagemService;
    }

    // Lista as viagens do usuário logado.
    @GetMapping({ "/editarviagem", "/editarViagem" })
    public String listarViagens(Model model, HttpSession session) {
        Cadastro usuario = usuarioLogado(session);
        model.addAttribute("viagens", editarViagemService.listarPorCriador(usuario));
        model.addAttribute("pagina", "editarViagem.jsp");
        return "layout";
    }

    // Carrega os dados de uma viagem específica para edição
    // (só se ela pertencer ao usuário logado).
    @GetMapping("/editarviagem/{id}")
    public String carregarEdicao(@PathVariable("id") int id, Model model, HttpSession session) {
        Cadastro usuario = usuarioLogado(session);
        Viagem viagem = editarViagemService.buscarPorId(id);

        if (!pertenceAoUsuario(viagem, usuario)) {
            return "redirect:/editarviagem";
        }

        if (viagem.getPreco() != null) {
            NumberFormat nf = NumberFormat.getNumberInstance(new Locale("pt", "BR"));
            nf.setMinimumFractionDigits(2);
            nf.setMaximumFractionDigits(2);
            model.addAttribute("precoFormatado", "R$ " + nf.format(viagem.getPreco()));
        }

        model.addAttribute("viagem", viagem);
        model.addAttribute("modoEdicao", true);
        model.addAttribute("pagina", "criarViagem.jsp");
        return "layout";
    }

    // Salva as alterações feitas na viagem (formulário de edição).
    @PostMapping({ "/atualizarviagem", "/atualizarViagem" })
    public String atualizarViagem(@ModelAttribute("viagem") Viagem viagem,
                                  HttpServletRequest request,
                                  HttpSession session,
                                  Model model) {
        Cadastro usuario = usuarioLogado(session);
        Viagem original = editarViagemService.buscarPorId(viagem.getId());

        if (!pertenceAoUsuario(original, usuario)) {
            return "redirect:/editarviagem";
        }

        MultipartFile file = viagem.getImagemFile();
        if (file != null && !file.isEmpty()) {
            try {
                viagem.setImagem(file.getBytes());
            } catch (IOException e) {
                model.addAttribute("mensagemErro", "Erro ao atualizar a imagem. Tente novamente.");
                model.addAttribute("viagem", viagem);
                model.addAttribute("modoEdicao", true);
                model.addAttribute("pagina", "criarViagem.jsp");
                return "layout";
            }
        } else {
            viagem.setImagem(original.getImagem());
        }

        String precoStr = request.getParameter("precoStr");
        if (precoStr != null && !precoStr.isEmpty()) {
            try {
                String limpo = precoStr.replaceAll("[R$\\s.]", "").replace(",", ".");
                viagem.setPreco(new BigDecimal(limpo));
            } catch (Exception e) {
                viagem.setPreco(BigDecimal.ZERO);
            }
        }

        viagem.setCriador(usuario);
        Viagem atualizada = editarViagemService.salvar(viagem);

        if (atualizada != null && atualizada.getId() > 0) {
            List<Viagem> viagens = editarViagemService.listarPorCriador(usuario);
            model.addAttribute("viagens", viagens);
            model.addAttribute("mensagemSucesso", "Viagem \"" + atualizada.getNomedestino() + "\" atualizada com sucesso!");
            model.addAttribute("pagina", "editarViagem.jsp");
        } else {
            model.addAttribute("mensagemErro", "Erro ao atualizar a viagem. Tente novamente.");
            model.addAttribute("viagem", viagem);
            model.addAttribute("modoEdicao", true);
            model.addAttribute("pagina", "criarViagem.jsp");
        }

        return "layout";
    }

    // Exclui uma viagem (só se pertencer ao usuário logado).
    @PostMapping("/deletarviagem/{id}")
    public String deletarViagem(@PathVariable("id") int id, Model model, HttpSession session) {
        Cadastro usuario = usuarioLogado(session);
        Viagem viagem = editarViagemService.buscarPorId(id);

        if (!pertenceAoUsuario(viagem, usuario)) {
            model.addAttribute("mensagemErro", "Viagem nao encontrada para este usuario.");
        } else {
            editarViagemService.deletar(id);
            model.addAttribute("mensagemSucesso", "Viagem \"" + viagem.getNomedestino() + "\" excluida com sucesso.");
        }

        model.addAttribute("viagens", editarViagemService.listarPorCriador(usuario));
        model.addAttribute("pagina", "editarViagem.jsp");
        return "layout";
    }

    // Serve a imagem da viagem como um arquivo binário (usada no <img src="..."> das páginas do site).
    @GetMapping("/viagem/imagem/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> getImagem(@PathVariable("id") int id, HttpSession session) {
        Cadastro usuario = usuarioLogado(session);
        Viagem viagem = editarViagemService.buscarPorId(id);

        if (pertenceAoUsuario(viagem, usuario) && viagem.getImagem() != null && viagem.getImagem().length > 0) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(viagem.getImagem());
        }

        return ResponseEntity.notFound().build();
    }

    // Pega o usuário logado a partir da sessão do site.
    private Cadastro usuarioLogado(HttpSession session) {
        return (Cadastro) session.getAttribute("usuarioLogado");
    }

    private boolean pertenceAoUsuario(Viagem viagem, Cadastro usuario) {
        return viagem != null
                && usuario != null
                && viagem.getCriador() != null
                && viagem.getCriador().getId() == usuario.getId();
    }
}
