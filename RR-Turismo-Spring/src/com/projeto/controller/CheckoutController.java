package com.projeto.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.projeto.dto.ItemCarrinhoDTO;
import com.projeto.model.Cadastro;
import com.projeto.model.Reserva;
import com.projeto.repository.ReservaRepository;
import com.projeto.service.CompraService;
import com.projeto.service.CompraService.CompraInvalidaException;

import jakarta.servlet.http.HttpSession;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// TELA DE COMPRA (checkout) do site e as páginas depois dela.
//   GET  /checkout              tela de pagamento (dados, Pix/cartão/boleto, resumo)
//   POST /checkout/confirmar    finaliza (pagamento de TESTE) e cria as reservas
//   GET  /compra/{codigo}       comprovante da compra
//   GET  /minhas-compras        histórico de compras de quem está logado
// Só quem está logado entra aqui (o LoginInterceptor cuida disso).
//
// ✏️ ONDE MUDAR: textos e visual → view/checkout.jsp, compra.jsp,
// minhasCompras.jsp e css/site.css (seção COMPRA). Regras → CompraService.
// ============================================================
@Controller
public class CheckoutController {

    private final CarrinhoController carrinhoController;
    private final CompraService compraService;
    private final ReservaRepository reservaRepository;

    public CheckoutController(CarrinhoController carrinhoController,
                              CompraService compraService,
                              ReservaRepository reservaRepository) {
        this.carrinhoController = carrinhoController;
        this.compraService = compraService;
        this.reservaRepository = reservaRepository;
    }

    @GetMapping("/checkout")
    public String checkout(Model model, HttpSession session, RedirectAttributes ra) {
        List<ItemCarrinhoDTO> itens = carrinhoController.linhas(session);
        if (itens.isEmpty()) {
            ra.addFlashAttribute("mensagemErro", "Seu carrinho está vazio. Escolha uma viagem primeiro.");
            return "redirect:/inicio";
        }
        BigDecimal total = CarrinhoController.somar(itens);
        model.addAttribute("itens", itens);
        model.addAttribute("totalNumero", total.setScale(2, RoundingMode.HALF_UP).toPlainString());
        model.addAttribute("total", ItemCarrinhoDTO.moeda(total));
        model.addAttribute("parcelas", opcoesDeParcela(total));
        model.addAttribute("pagina", "checkout.jsp");
        return "layout";
    }

    @PostMapping("/checkout/confirmar")
    public String confirmar(@RequestParam(name = "forma", defaultValue = "") String forma,
                            @RequestParam(name = "bandeira", defaultValue = "") String bandeira,
                            @RequestParam(name = "cartaoNumero", defaultValue = "") String cartaoNumero,
                            @RequestParam(name = "cartaoNome", defaultValue = "") String cartaoNome,
                            @RequestParam(name = "cartaoValidade", defaultValue = "") String cartaoValidade,
                            @RequestParam(name = "cartaoCvv", defaultValue = "") String cartaoCvv,
                            @RequestParam(name = "parcelas", defaultValue = "1") int parcelas,
                            HttpSession session, RedirectAttributes ra) {
        Cadastro comprador = (Cadastro) session.getAttribute("usuarioLogado");
        Map<Integer, Integer> carrinho = CarrinhoController.doCarrinho(session);

        CompraService.Pagamento pg = new CompraService.Pagamento();
        pg.forma = forma;
        pg.bandeira = bandeira;
        pg.cartaoNumero = cartaoNumero;
        pg.cartaoNome = cartaoNome;
        pg.cartaoValidade = cartaoValidade;
        pg.cartaoCvv = cartaoCvv;
        pg.parcelas = parcelas;

        try {
            String codigo = compraService.finalizar(comprador, new java.util.LinkedHashMap<>(carrinho), pg);
            carrinho.clear();   // o cartão e o CVV nunca saem desta chamada
            return "redirect:/compra/" + codigo;
        } catch (CompraInvalidaException e) {
            ra.addFlashAttribute("mensagemErro", e.getMessage());
            return "redirect:/checkout";
        }
    }

    @GetMapping("/compra/{codigo}")
    public String compra(@PathVariable("codigo") String codigo, Model model, HttpSession session,
                         RedirectAttributes ra) {
        Cadastro comprador = (Cadastro) session.getAttribute("usuarioLogado");
        List<Reserva> itens = reservaRepository.findByCodigoPedidoAndCompradorOrderByIdAsc(codigo, comprador);
        if (itens.isEmpty()) {
            ra.addFlashAttribute("mensagemErro", "Compra não encontrada.");
            return "redirect:/minhas-compras";
        }
        model.addAttribute("itens", itens);
        model.addAttribute("primeira", itens.get(0));
        model.addAttribute("total", ItemCarrinhoDTO.moeda(somaReservas(itens)));
        model.addAttribute("totalNumero", somaReservas(itens).setScale(2, RoundingMode.HALF_UP).toPlainString());
        model.addAttribute("pagina", "compra.jsp");
        return "layout";
    }

    @GetMapping("/minhas-compras")
    public String minhasCompras(Model model, HttpSession session) {
        Cadastro comprador = (Cadastro) session.getAttribute("usuarioLogado");
        // Agrupa as reservas pelo código do pedido, mantendo a ordem (mais nova primeiro).
        Map<String, List<Reserva>> pedidos = new java.util.LinkedHashMap<>();
        for (Reserva r : reservaRepository.findByCompradorOrderByIdDesc(comprador)) {
            pedidos.computeIfAbsent(r.getCodigoPedido(), k -> new ArrayList<>()).add(r);
        }
        Map<String, String> totais = new java.util.LinkedHashMap<>();
        pedidos.forEach((k, v) -> totais.put(k, ItemCarrinhoDTO.moeda(somaReservas(v))));
        model.addAttribute("pedidos", pedidos);
        model.addAttribute("totais", totais);
        model.addAttribute("pagina", "minhasCompras.jsp");
        return "layout";
    }

    private static BigDecimal somaReservas(List<Reserva> itens) {
        return itens.stream().map(Reserva::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Textos do seletor de parcelas: "1x de R$ 300,00 sem juros", "2x de ..."
    private static List<String> opcoesDeParcela(BigDecimal total) {
        List<String> opcoes = new ArrayList<>();
        for (int n = 1; n <= CompraService.MAX_PARCELAS; n++) {
            BigDecimal parcela = total.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
            opcoes.add(n + "x de " + ItemCarrinhoDTO.moeda(parcela) + " sem juros");
        }
        return opcoes;
    }
}
