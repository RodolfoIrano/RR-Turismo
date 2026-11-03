package com.projeto.dto;

import com.projeto.model.CartaoSalvo;

// DTO devolvido pelo backend ao app Mobile com os dados de exibição
// de um cartão salvo. NUNCA inclui o token do gateway, número
// completo ou CVV - só o que é seguro mostrar na tela (bandeira,
// últimos 4 dígitos, nome impresso e validade).
public class CartaoDTO {
    private int id;
    private String bandeira;
    private String ultimosDigitos;
    private String nomeImpresso;
    private String validade;

    public static CartaoDTO de(CartaoSalvo cartao) {
        CartaoDTO dto = new CartaoDTO();
        dto.id = cartao.getId();
        dto.bandeira = cartao.getBandeira();
        dto.ultimosDigitos = cartao.getUltimosDigitos();
        dto.nomeImpresso = cartao.getNomeImpresso();
        dto.validade = cartao.getValidade();
        return dto;
    }

    // Getters (sem setters propositalmente - este objeto é só de
    // leitura, montado pelo método "de" acima e nunca alterado depois).
    public int getId() { return id; }
    public String getBandeira() { return bandeira; }
    public String getUltimosDigitos() { return ultimosDigitos; }
    public String getNomeImpresso() { return nomeImpresso; }
    public String getValidade() { return validade; }
}
