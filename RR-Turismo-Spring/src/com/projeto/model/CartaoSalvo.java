package com.projeto.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ============================================================
// CARTAO SALVO (referencia tokenizada, NUNCA o cartao real)
// ------------------------------------------------------------
// Esta tabela guarda apenas o TOKEN devolvido pelo gateway de
// pagamento (ex.: Mercado Pago) e os dados de exibicao (bandeira,
// ultimos 4 digitos, validade e nome impresso).
//
// O numero completo do cartao e o CVV NUNCA chegam a este
// backend nem sao gravados no banco - eles vao direto do app
// para o gateway de pagamento, que devolve o "gatewayToken".
// ============================================================
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartaoSalvo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    private Cadastro usuario;

    // Token opaco devolvido pelo gateway de pagamento (ex: Mercado Pago).
    private String gatewayToken;

    private String bandeira;     // visa, mastercard, elo, amex, ...
    private String ultimosDigitos; // apenas os 4 finais, so para exibicao
    private String nomeImpresso;
    private String validade;     // MM/AA, so para exibicao
}
