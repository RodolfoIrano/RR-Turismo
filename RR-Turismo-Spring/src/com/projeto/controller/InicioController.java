package com.projeto.controller;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.projeto.dto.CartaoViagemDTO;
import com.projeto.model.Cadastro;
import com.projeto.model.Viagem;
import com.projeto.service.EditarViagemService;
import com.projeto.service.ImagensDaViagemService;

import jakarta.servlet.http.HttpSession;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// PÁGINA INICIAL do site (/ e /inicio). Agora é PÚBLICA: qualquer
// visitante vê o catálogo de viagens (igual ao app), podendo buscar
// por texto e filtrar por categoria - sem precisar entrar na conta.
//
// Quem entra como GUIA (cadastro com "Guia" marcado) vê, além do
// catálogo, atalhos para criar/editar viagens e reservas (ver
// layout.jsp e inicio.jsp).
// ============================================================
@Controller
public class InicioController {

    private final EditarViagemService editarViagemService;
    private final ImagensDaViagemService imagensDaViagemService;

    public InicioController(EditarViagemService editarViagemService,
                            ImagensDaViagemService imagensDaViagemService) {
        this.editarViagemService = editarViagemService;
        this.imagensDaViagemService = imagensDaViagemService;
    }

    @GetMapping({ "/", "/inicio" })
    public String inicio(@RequestParam(name = "q", required = false) String q,
                         @RequestParam(name = "categoria", required = false) String categoria,
                         Model model, HttpSession session) {

        List<Viagem> todas = editarViagemService.listarTodas();

        // Categorias existentes (para os botões de filtro).
        List<String> categorias = todas.stream()
                .map(Viagem::getCategoria)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();

        String busca = q == null ? "" : q.trim();
        String filtroCategoria = categoria == null ? "" : categoria.trim();

        // Mais recentes primeiro + filtros de busca/categoria.
        List<CartaoViagemDTO> cartoes = todas.stream()
                .sorted(Comparator.comparingInt(Viagem::getId).reversed())
                .filter(v -> filtroCategoria.isEmpty()
                        || filtroCategoria.equalsIgnoreCase(v.getCategoria()))
                .filter(v -> busca.isEmpty() || combina(v, busca))
                .map(v -> CartaoViagemDTO.de(v, imagensDaViagemService.quantidadeDeExtras(v.getId())))
                .toList();

        model.addAttribute("viagens", cartoes);
        model.addAttribute("categorias", categorias);
        model.addAttribute("busca", busca);
        model.addAttribute("categoriaSelecionada", filtroCategoria);

        // Atalhos do guia: quantas viagens ele já criou.
        Object logado = session.getAttribute("usuarioLogado");
        if (logado instanceof Cadastro usuario && usuario.isGuia()) {
            model.addAttribute("minhasViagens", editarViagemService.listarPorCriador(usuario).size());
        }

        model.addAttribute("pagina", "inicio.jsp");
        return "layout";
    }

    // Verdadeiro se o texto digitado aparece no destino, local, categoria ou descrição.
    private boolean combina(Viagem v, String busca) {
        String alvo = busca.toLowerCase(Locale.ROOT);
        return contem(v.getNomedestino(), alvo) || contem(v.getLocal(), alvo)
                || contem(v.getCategoria(), alvo) || contem(v.getDescricao(), alvo);
    }

    private boolean contem(String texto, String alvo) {
        return texto != null && texto.toLowerCase(Locale.ROOT).contains(alvo);
    }
}
