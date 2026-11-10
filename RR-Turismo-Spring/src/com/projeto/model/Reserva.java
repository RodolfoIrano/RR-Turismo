package com.projeto.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// RESERVA = uma viagem comprada no SITE (uma linha da compra).
// Uma compra com 3 viagens diferentes vira 3 reservas com o mesmo
// "codigoPedido" (ex.: RR202600012).
//
// O pagamento é de TESTE (não existe cobrança real). Por segurança
// NUNCA guardamos número completo do cartão nem o CVV: só a bandeira
// e os 4 últimos dígitos.
//
// Se a viagem for apagada pelo guia, a reserva continua existindo
// (o banco só zera o campo "viagem"; o título fica salvo em "tituloViagem").
//
// ✏️ ONDE MUDAR: formas de pagamento aceitas e a lógica de compra
// ficam em service/CompraService.java.
// ============================================================
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Código que o cliente vê e que agrupa as viagens da mesma compra.
    private String codigoPedido;

    @ManyToOne
    private Cadastro comprador;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Viagem viagem;

    // "Foto" do que foi comprado (continua certo mesmo se a viagem mudar ou sumir).
    private String tituloViagem;
    private String localViagem;
    private String periodoViagem;

    private int quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal total;

    // pix, credito, debito ou boleto (registros antigos podem ter "cartao" = crédito)
    private String formaPagamento;
    private int parcelas = 1;
    private String bandeira;
    private String cartaoFinal;

    // Sempre "Aprovado (teste)" enquanto o pagamento for simulado.
    private String statusPagamento;

    private LocalDateTime criadaEm;

    // ---- Textos prontos para as telas (não são colunas do banco) ----

    public String getCriadaEmTexto() {
        return criadaEm == null ? ""
                : criadaEm.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));
    }

    public String getFormaTexto() {
        if ("pix".equals(formaPagamento)) return "Pix";
        if ("boleto".equals(formaPagamento)) return "Boleto";
        String b = bandeira == null ? "" : bandeira + " ";
        if ("debito".equals(formaPagamento)) {
            return "Cartão de débito " + b + "final " + cartaoFinal;
        }
        return "Cartão de crédito " + b + "final " + cartaoFinal + " em " + parcelas + "x";
    }

    private static String moeda(BigDecimal v) {
        return java.text.NumberFormat.getCurrencyInstance(new java.util.Locale("pt", "BR"))
                .format(v == null ? BigDecimal.ZERO : v).replace('\u00a0', ' ');
    }

    public String getTotalTexto() { return moeda(total); }

    public String getPrecoUnitarioTexto() { return moeda(precoUnitario); }
}
