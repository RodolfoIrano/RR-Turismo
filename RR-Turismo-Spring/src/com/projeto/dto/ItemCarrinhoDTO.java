package com.projeto.dto;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

import com.projeto.model.Viagem;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Uma linha do CARRINHO já pronta para a tela: a viagem (foto, título,
// local, datas), a quantidade de pessoas e os valores formatados em R$.
// ============================================================
public class ItemCarrinhoDTO {

    private final CartaoViagemDTO viagem;
    private final int quantidade;
    private final BigDecimal precoUnitario;
    private final BigDecimal subtotal;

    public ItemCarrinhoDTO(Viagem v, int quantidade, int fotosExtras) {
        this.viagem = CartaoViagemDTO.de(v, fotosExtras);
        this.quantidade = quantidade;
        this.precoUnitario = v.getPreco() == null ? BigDecimal.ZERO : v.getPreco();
        this.subtotal = precoUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

    public static String moeda(BigDecimal valor) {
        return NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(valor).replace(' ', ' ');
    }

    public CartaoViagemDTO getViagem() { return viagem; }
    public int getQuantidade() { return quantidade; }
    public BigDecimal getPrecoUnitario() { return precoUnitario; }
    public BigDecimal getSubtotal() { return subtotal; }
    public String getPrecoUnitarioTexto() { return moeda(precoUnitario); }
    public String getSubtotalTexto() { return moeda(subtotal); }
}
