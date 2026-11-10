package com.projeto.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.projeto.dto.ItemCarrinhoDTO;
import com.projeto.model.Viagem;
import com.projeto.service.CompraService;
import com.projeto.service.EditarViagemService;
import com.projeto.service.ImagensDaViagemService;

import jakarta.servlet.http.HttpSession;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// CARRINHO de compras do site. Cada pessoa logada tem o seu, guardado
// na sessão (se o servidor reiniciar ou a pessoa sair, esvazia).
// Rotas:
//   GET  /carrinho              mostra o carrinho
//   POST /carrinho/adicionar    põe uma viagem (viagemId, qtd)
//   POST /carrinho/quantidade   muda a quantidade de pessoas
//   POST /carrinho/remover      tira uma viagem
// A compra em si (pagamento) é no CheckoutController.
//
// ✏️ ONDE MUDAR: limite de pessoas por viagem → CompraService.MAX_POR_VIAGEM.
// ============================================================
@Controller
@RequestMapping("/carrinho")
public class CarrinhoController {

    static final String CHAVE = "carrinho";

    private final EditarViagemService editarViagemService;
    private final ImagensDaViagemService imagensDaViagemService;

    public CarrinhoController(EditarViagemService editarViagemService,
                              ImagensDaViagemService imagensDaViagemService) {
        this.editarViagemService = editarViagemService;
        this.imagensDaViagemService = imagensDaViagemService;
    }

    /** Carrinho da sessão (id da viagem → quantidade). Cria vazio se não existir. */
    @SuppressWarnings("unchecked")
    static Map<Integer, Integer> doCarrinho(HttpSession session) {
        Object atual = session.getAttribute(CHAVE);
        if (atual instanceof Map) {
            return (Map<Integer, Integer>) atual;
        }
        Map<Integer, Integer> novo = new LinkedHashMap<>();
        session.setAttribute(CHAVE, novo);
        return novo;
    }

    /** Total de pessoas no carrinho (número do selinho do topo). */
    static int contar(HttpSession session) {
        Object atual = session.getAttribute(CHAVE);
        if (!(atual instanceof Map)) return 0;
        int soma = 0;
        for (Object q : ((Map<?, ?>) atual).values()) {
            soma += (Integer) q;
        }
        return soma;
    }

    /** Linhas do carrinho prontas para a tela; já remove viagens que não existem mais. */
    List<ItemCarrinhoDTO> linhas(HttpSession session) {
        Map<Integer, Integer> carrinho = doCarrinho(session);
        List<ItemCarrinhoDTO> itens = new ArrayList<>();
        carrinho.keySet().removeIf(id -> editarViagemService.buscarPorId(id) == null);
        for (Map.Entry<Integer, Integer> e : carrinho.entrySet()) {
            Viagem v = editarViagemService.buscarPorId(e.getKey());
            itens.add(new ItemCarrinhoDTO(v, e.getValue(), imagensDaViagemService.quantidadeDeExtras(v.getId())));
        }
        return itens;
    }

    static BigDecimal somar(List<ItemCarrinhoDTO> itens) {
        return itens.stream().map(ItemCarrinhoDTO::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @GetMapping
    public String ver(Model model, HttpSession session) {
        List<ItemCarrinhoDTO> itens = linhas(session);
        model.addAttribute("itens", itens);
        model.addAttribute("total", ItemCarrinhoDTO.moeda(somar(itens)));
        model.addAttribute("pagina", "carrinho.jsp");
        return "layout";
    }

    @PostMapping("/adicionar")
    public String adicionar(@RequestParam("viagemId") int viagemId,
                            @RequestParam(name = "qtd", defaultValue = "1") int qtd,
                            @RequestParam(name = "comprarAgora", defaultValue = "false") boolean comprarAgora,
                            HttpSession session, RedirectAttributes ra) {
        // Guia e empresa publicam viagens; quem compra é o viajante.
        com.projeto.model.Cadastro quem = (com.projeto.model.Cadastro) session.getAttribute("usuarioLogado");
        if (quem != null && (quem.isGuia() || quem.isEmpresa())) {
            ra.addFlashAttribute("mensagemErro", "Contas de guia e empresa não compram viagens. Use uma conta de viajante.");
            return "redirect:/viagens/" + viagemId;
        }
        Viagem v = editarViagemService.buscarPorId(viagemId);
        if (v == null) {
            ra.addFlashAttribute("mensagemErro", "Essa viagem não existe mais.");
            return "redirect:/inicio";
        }
        int vagas = v.getAssentos() - v.getParticipantes();
        if (vagas <= 0) {
            ra.addFlashAttribute("mensagemErro", "Essa viagem está esgotada.");
            return "redirect:/viagens/" + viagemId;
        }
        Map<Integer, Integer> carrinho = doCarrinho(session);
        int limite = Math.min(vagas, CompraService.MAX_POR_VIAGEM);
        int novo = Math.min(carrinho.getOrDefault(viagemId, 0) + Math.max(qtd, 1), limite);
        carrinho.put(viagemId, novo);
        if (comprarAgora) {
            return "redirect:/checkout";
        }
        ra.addFlashAttribute("mensagemSucesso", "Viagem adicionada ao carrinho!");
        return "redirect:/carrinho";
    }

    @PostMapping("/quantidade")
    public String quantidade(@RequestParam("viagemId") int viagemId, @RequestParam("qtd") int qtd,
                             HttpSession session, RedirectAttributes ra) {
        Map<Integer, Integer> carrinho = doCarrinho(session);
        Viagem v = editarViagemService.buscarPorId(viagemId);
        if (v != null && carrinho.containsKey(viagemId)) {
            int limite = Math.min(Math.max(v.getAssentos() - v.getParticipantes(), 1), CompraService.MAX_POR_VIAGEM);
            if (qtd > limite) {
                ra.addFlashAttribute("mensagemErro", "Só há " + limite + " vaga(s) disponível(is) nessa viagem.");
            }
            carrinho.put(viagemId, Math.min(Math.max(qtd, 1), limite));
        }
        return "redirect:/carrinho";
    }

    @PostMapping("/remover")
    public String remover(@RequestParam("viagemId") int viagemId, HttpSession session, RedirectAttributes ra) {
        doCarrinho(session).remove(viagemId);
        ra.addFlashAttribute("mensagemSucesso", "Viagem removida do carrinho.");
        return "redirect:/carrinho";
    }
}
