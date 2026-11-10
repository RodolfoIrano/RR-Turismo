package com.projeto.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.projeto.dto.CartaoViagemDTO;
import com.projeto.model.Viagem;
import com.projeto.service.EditarViagemService;
import com.projeto.service.ImagensDaViagemService;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Páginas PÚBLICAS "de apresentação" do site, iguais às do app:
//   /sobre-nos      → quem somos (foto da dupla, texto, valores)
//   /fale-conosco   → formulário validado que abre o WhatsApp da equipe
//   /favoritos      → viagens que a pessoa curtiu (coração)
//   /privacidade    → como os dados são tratados (rodapé)
//   /termos         → termos de uso (rodapé)
//
// Nenhuma delas guarda dado de pessoa no banco:
//   - Fale conosco só monta o texto e entrega ao WhatsApp do visitante.
//   - Favoritos ficam no navegador (localStorage), separados por conta.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Textos de Sobre nós ........ view/sobreNos.jsp
//   - WhatsApp / assuntos ........ view/faleConosco.jsp (início do arquivo)
//   - Endereços liberados sem login ... config/WebConfig.java
// ============================================================
@Controller
public class SiteInstitucionalController {

    private final EditarViagemService editarViagemService;
    private final ImagensDaViagemService imagensDaViagemService;

    public SiteInstitucionalController(EditarViagemService editarViagemService,
                                       ImagensDaViagemService imagensDaViagemService) {
        this.editarViagemService = editarViagemService;
        this.imagensDaViagemService = imagensDaViagemService;
    }

    @GetMapping("/sobre-nos")
    public String sobreNos(Model model) {
        model.addAttribute("pagina", "sobreNos.jsp");
        return "layout";
    }

    @GetMapping("/fale-conosco")
    public String faleConosco(Model model) {
        model.addAttribute("pagina", "faleConosco.jsp");
        return "layout";
    }

    @GetMapping("/privacidade")
    public String privacidade(Model model) {
        model.addAttribute("pagina", "privacidade.jsp");
        return "layout";
    }

    @GetMapping("/termos")
    public String termos(Model model) {
        model.addAttribute("pagina", "termos.jsp");
        return "layout";
    }

    // Manda TODAS as viagens para a página; o JavaScript (site.js) mostra
    // só as que estão nos favoritos desta pessoa.
    @GetMapping("/favoritos")
    public String favoritos(Model model) {
        List<CartaoViagemDTO> cartoes = editarViagemService.listarTodas().stream()
                .sorted(Comparator.comparingInt(Viagem::getId).reversed())
                .map(v -> CartaoViagemDTO.de(v, imagensDaViagemService.quantidadeDeExtras(v.getId())))
                .toList();
        model.addAttribute("viagens", cartoes);
        model.addAttribute("pagina", "favoritos.jsp");
        return "layout";
    }
}
