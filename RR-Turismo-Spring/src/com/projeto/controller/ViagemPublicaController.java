package com.projeto.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.projeto.dto.CartaoViagemDTO;
import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;
import com.projeto.service.EditarViagemService;
import com.projeto.service.ImagensDaViagemService;

import jakarta.servlet.http.HttpSession;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Página PÚBLICA de detalhes de uma viagem (/viagens/{id}): galeria
// de fotos, descrição, preço, datas, vagas e o guia responsável.
// Qualquer visitante pode ver (não precisa de login). Se quem está
// vendo é o guia dono da viagem, aparece o botão "Editar viagem".
// ============================================================
@Controller
public class ViagemPublicaController {

    private final EditarViagemService editarViagemService;
    private final ImagensDaViagemService imagensDaViagemService;

    public ViagemPublicaController(EditarViagemService editarViagemService,
                                   ImagensDaViagemService imagensDaViagemService) {
        this.editarViagemService = editarViagemService;
        this.imagensDaViagemService = imagensDaViagemService;
    }

    @GetMapping("/viagens/{id}")
    public String detalhes(@PathVariable("id") int id, Model model, HttpSession session) {
        Viagem viagem = editarViagemService.buscarPorId(id);
        if (viagem == null) {
            // Viagem que não existe (ou foi apagada): volta ao catálogo.
            return "redirect:/inicio";
        }

        model.addAttribute("viagem",
                CartaoViagemDTO.de(viagem, imagensDaViagemService.quantidadeDeExtras(id)));

        // Outras viagens do mesmo guia (até 3) - aparecem no fim da página.
        if (viagem.getCriador() != null) {
            List<CartaoViagemDTO> outras = editarViagemService.listarPorCriador(viagem.getCriador()).stream()
                    .filter(v -> v.getId() != id)
                    .sorted(Comparator.comparingInt(Viagem::getId).reversed())
                    .limit(3)
                    .map(v -> CartaoViagemDTO.de(v, 0))
                    .toList();
            model.addAttribute("outrasDoGuia", outras);
        }

        // O dono da viagem (e só ele) ganha o atalho para editar.
        Object logado = session.getAttribute("usuarioLogado");
        boolean ehDono = logado instanceof Cadastro usuario
                && viagem.getCriador() != null
                && viagem.getCriador().getId() == usuario.getId();
        model.addAttribute("ehDono", ehDono);

        model.addAttribute("pagina", "viagemDetalhe.jsp");
        return "layout";
    }
}
