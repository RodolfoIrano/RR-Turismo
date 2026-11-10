package com.projeto.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projeto.model.Cadastro;
import com.projeto.model.Reserva;
import com.projeto.model.Viagem;
import com.projeto.repository.CriarViagemRepository;
import com.projeto.repository.ReservaRepository;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Finaliza uma COMPRA feita no site (carrinho → checkout).
// Passos:
//   1. confere de novo, no servidor, preço e vagas de cada viagem
//      (nunca confia no que veio do navegador);
//   2. valida a forma de pagamento (cartão: número com algoritmo de
//      Luhn, validade e CVV; Pix e boleto não pedem nada);
//   3. grava uma Reserva por viagem, tira as vagas e devolve o código.
//
// O PAGAMENTO É DE TESTE: ninguém é cobrado. Número completo do cartão
// e CVV são conferidos e DESCARTADOS (só bandeira + 4 últimos dígitos
// ficam salvos).
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Parcelas máximas ............ MAX_PARCELAS
//   - Máximo de pessoas por viagem  MAX_POR_VIAGEM
//   - Formas de pagamento aceitas . método validarForma()
// ============================================================
@Service
public class CompraService {

    public static final int MAX_PARCELAS = 6;
    public static final int MAX_POR_VIAGEM = 10;

    private final CriarViagemRepository viagemRepository;
    private final ReservaRepository reservaRepository;

    public CompraService(CriarViagemRepository viagemRepository, ReservaRepository reservaRepository) {
        this.viagemRepository = viagemRepository;
        this.reservaRepository = reservaRepository;
    }

    /** Dados de pagamento enviados pelo formulário do checkout. */
    public static class Pagamento {
        public String forma;          // pix | credito | debito | boleto  ("cartao" = credito)
        public String bandeira;       // escolhida na tela: Visa, Mastercard, Elo...
        public String cartaoNumero;
        public String cartaoNome;
        public String cartaoValidade;
        public String cartaoCvv;
        public int parcelas = 1;
    }

    /** Erro de regra de negócio, com mensagem já pronta para a pessoa ler. */
    public static class CompraInvalidaException extends RuntimeException {
        public CompraInvalidaException(String mensagem) { super(mensagem); }
    }

    /** Fecha a compra. itens = (id da viagem → quantidade). Devolve o código do pedido. */
    @Transactional
    public synchronized String finalizar(Cadastro comprador, Map<Integer, Integer> itens, Pagamento pg) {
        if (itens == null || itens.isEmpty()) {
            throw new CompraInvalidaException("Seu carrinho está vazio.");
        }
        String forma = validarForma(pg);
        String bandeira = null;
        String final4 = null;
        int parcelas = 1;
        if ("credito".equals(forma) || "debito".equals(forma)) {
            String numero = somenteDigitos(pg.cartaoNumero);
            bandeira = pg.bandeira != null && !pg.bandeira.isBlank() ? pg.bandeira.trim() : bandeiraDoCartao(numero);
            final4 = numero.substring(numero.length() - 4);
            // Débito é sempre à vista; só o crédito pode parcelar.
            if ("credito".equals(forma)) parcelas = Math.min(Math.max(pg.parcelas, 1), MAX_PARCELAS);
        }

        // Valida tudo ANTES de gravar qualquer coisa.
        Map<Viagem, Integer> linhas = new LinkedHashMap<>();
        for (Map.Entry<Integer, Integer> e : itens.entrySet()) {
            Viagem v = viagemRepository.findById(e.getKey()).orElse(null);
            if (v == null) {
                throw new CompraInvalidaException("Uma das viagens do carrinho não existe mais. Remova-a e tente de novo.");
            }
            int qtd = e.getValue();
            int vagas = v.getAssentos() - v.getParticipantes();
            if (qtd < 1 || qtd > MAX_POR_VIAGEM) {
                throw new CompraInvalidaException("Quantidade inválida para “" + v.getNomedestino() + "”.");
            }
            if (qtd > vagas) {
                throw new CompraInvalidaException(vagas <= 0
                        ? "“" + v.getNomedestino() + "” esgotou. Remova-a do carrinho."
                        : "“" + v.getNomedestino() + "” só tem " + vagas + " vaga(s) disponível(is).");
            }
            linhas.put(v, qtd);
        }

        DateTimeFormatter fd = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        List<Reserva> reservas = new ArrayList<>();
        for (Map.Entry<Viagem, Integer> e : linhas.entrySet()) {
            Viagem v = e.getKey();
            int qtd = e.getValue();
            BigDecimal unit = v.getPreco() == null ? BigDecimal.ZERO : v.getPreco();

            Reserva r = new Reserva();
            r.setComprador(comprador);
            r.setViagem(v);
            r.setTituloViagem(v.getNomedestino());
            r.setLocalViagem(v.getLocal());
            r.setPeriodoViagem(v.getDataIda() == null ? "Data a combinar"
                    : (v.getDataVolta() == null || v.getDataVolta().equals(v.getDataIda())
                            ? v.getDataIda().format(fd)
                            : v.getDataIda().format(fd) + " a " + v.getDataVolta().format(fd)));
            r.setQuantidade(qtd);
            r.setPrecoUnitario(unit);
            r.setTotal(unit.multiply(BigDecimal.valueOf(qtd)));
            r.setFormaPagamento(forma);
            r.setParcelas(parcelas);
            r.setBandeira(bandeira);
            r.setCartaoFinal(final4);
            r.setStatusPagamento("Aprovado (teste)");
            r.setCriadaEm(LocalDateTime.now());
            r.setCodigoPedido("provisorio");
            reservas.add(r);

            v.setParticipantes(v.getParticipantes() + qtd);
            viagemRepository.save(v);
        }

        // O código do pedido sai do número da primeira reserva (sempre único).
        Reserva primeira = reservaRepository.save(reservas.get(0));
        String codigo = "RR" + LocalDate.now().getYear() + String.format("%05d", primeira.getId());
        primeira.setCodigoPedido(codigo);
        for (int i = 1; i < reservas.size(); i++) {
            reservas.get(i).setCodigoPedido(codigo);
            reservaRepository.save(reservas.get(i));
        }
        reservaRepository.save(primeira);
        return codigo;
    }

    // ---------------------------------------------------------------
    private String validarForma(Pagamento pg) {
        String forma = pg == null || pg.forma == null ? "" : pg.forma.trim().toLowerCase();
        switch (forma) {
            case "pix":
            case "boleto":
                return forma;
            case "cartao":      // nome antigo = crédito
            case "credito":
            case "debito":
                validarCartao(pg);
                return "cartao".equals(forma) ? "credito" : forma;
            default:
                throw new CompraInvalidaException("Escolha uma forma de pagamento.");
        }
    }

    private void validarCartao(Pagamento pg) {
        String numero = somenteDigitos(pg.cartaoNumero);
        if (numero.length() < 13 || numero.length() > 19 || !luhnValido(numero)) {
            throw new CompraInvalidaException("Número do cartão inválido. Para testar use 4111 1111 1111 1111.");
        }
        // Bandeira: tem que ser uma das aceitas e combinar com o número digitado.
        String escolhida = pg.bandeira == null ? "" : pg.bandeira.trim();
        if (!BANDEIRAS.contains(escolhida)) {
            throw new CompraInvalidaException("Escolha a bandeira do cartão.");
        }
        String detectada = bandeiraDoCartao(numero);
        if (!"Cartão".equals(detectada) && !detectada.equals(escolhida)) {
            throw new CompraInvalidaException("A bandeira escolhida (" + escolhida + ") não combina com o número do cartão (" + detectada + ").");
        }
        if (pg.cartaoNome == null || pg.cartaoNome.trim().length() < 3) {
            throw new CompraInvalidaException("Informe o nome como está escrito no cartão.");
        }
        String val = pg.cartaoValidade == null ? "" : pg.cartaoValidade.trim();
        if (!val.matches("\\d{2}/\\d{2}")) {
            throw new CompraInvalidaException("Validade inválida. Use MM/AA.");
        }
        int mes = Integer.parseInt(val.substring(0, 2));
        int ano = 2000 + Integer.parseInt(val.substring(3, 5));
        if (mes < 1 || mes > 12 || YearMonth.of(ano, mes).isBefore(YearMonth.now())) {
            throw new CompraInvalidaException("Cartão vencido ou validade inválida.");
        }
        String cvv = somenteDigitos(pg.cartaoCvv);
        if (cvv.length() < 3 || cvv.length() > 4) {
            throw new CompraInvalidaException("Código de segurança (CVV) inválido.");
        }
    }

    private static String somenteDigitos(String s) {
        return s == null ? "" : s.replaceAll("\\D", "");
    }

    // Algoritmo de Luhn: o "dígito verificador" que todo cartão real respeita.
    static boolean luhnValido(String numero) {
        int soma = 0;
        boolean dobrar = false;
        for (int i = numero.length() - 1; i >= 0; i--) {
            int d = numero.charAt(i) - '0';
            if (dobrar) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            soma += d;
            dobrar = !dobrar;
        }
        return soma % 10 == 0;
    }

    /** Bandeiras aceitas na tela de pagamento. ✏️ Para incluir outra, acrescente aqui e em checkout.jsp. */
    static final java.util.List<String> BANDEIRAS =
            java.util.List.of("Visa", "Mastercard", "Elo", "Hipercard", "American Express");

    static String bandeiraDoCartao(String n) {
        // Elo primeiro: alguns números dela começam com 4 (como a Visa).
        if (n.matches("^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550).*")) return "Elo";
        if (n.startsWith("4")) return "Visa";
        if (n.matches("^(5[1-5]|2[2-7]).*")) return "Mastercard";
        if (n.matches("^(34|37).*")) return "American Express";
        if (n.startsWith("606282") || n.startsWith("3841")) return "Hipercard";
        return "Cartão";
    }
}
