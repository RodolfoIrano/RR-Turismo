package com.projeto.dto;

// O app Mobile nunca envia numero de cartao/CVV para cá.
// Ele envia o token ja gerado pelo SDK do gateway de pagamento
// (ex: Mercado Pago) e apenas os dados necessarios para exibir
// o cartao na lista (bandeira, ultimos 4 digitos, validade).
public class SalvarCartaoRequest {
    private String gatewayToken;
    private String bandeira;
    private String ultimosDigitos;
    private String nomeImpresso;
    private String validade;

    public String getGatewayToken() { return gatewayToken; }
    public void setGatewayToken(String gatewayToken) { this.gatewayToken = gatewayToken; }

    public String getBandeira() { return bandeira; }
    public void setBandeira(String bandeira) { this.bandeira = bandeira; }

    public String getUltimosDigitos() { return ultimosDigitos; }
    public void setUltimosDigitos(String ultimosDigitos) { this.ultimosDigitos = ultimosDigitos; }

    public String getNomeImpresso() { return nomeImpresso; }
    public void setNomeImpresso(String nomeImpresso) { this.nomeImpresso = nomeImpresso; }

    public String getValidade() { return validade; }
    public void setValidade(String validade) { this.validade = validade; }
}
