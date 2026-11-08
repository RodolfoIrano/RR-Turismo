package com.projeto.dto;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.projeto.model.Viagem;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Dados de uma viagem JÁ PRONTOS PARA EXIBIR nas páginas do site
// (catálogo da página inicial e página de detalhes): preço
// formatado em reais, datas em dd/MM/aaaa, vagas livres, lista de
// fotos etc. Assim os arquivos .jsp ficam simples.
// ============================================================
public class CartaoViagemDTO {

    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final int id;
    private final String titulo;
    private final String local;
    private final String categoria;
    private final String descricao;
    private final String preco;
    private final String periodo;
    private final String transporte;
    private final String hotel;
    private final String guiaNome;
    private final int guiaId;
    private final int vagas;
    private final boolean esgotada;
    private final List<String> fotos = new ArrayList<>();

    private CartaoViagemDTO(Viagem v, int fotosExtras) {
        this.id = v.getId();
        this.titulo = v.getNomedestino();
        this.local = v.getLocal();
        this.categoria = v.getCategoria();
        this.descricao = v.getDescricao();
        this.preco = formatarPreco(v.getPreco());
        this.periodo = formatarPeriodo(v.getDataIda(), v.getDataVolta());
        this.transporte = v.getTransporte();
        this.hotel = v.getHotel();
        this.guiaNome = v.getCriador() == null ? null
                : (v.getCriador().getNome() == null || v.getCriador().getNome().isBlank()
                        ? null : v.getCriador().getNome());
        this.guiaId = v.getCriador() == null ? 0 : v.getCriador().getId();
        this.vagas = Math.max(v.getAssentos() - v.getParticipantes(), 0);
        this.esgotada = v.getParticipantes() >= v.getAssentos();

        // Mesmas URLs usadas pelo app (rotas públicas /api/viagens/{id}/imagem...).
        if (v.getImagem() != null && v.getImagem().length > 0) {
            fotos.add("/api/viagens/" + v.getId() + "/imagem");
            for (int n = 1; n <= fotosExtras; n++) {
                fotos.add("/api/viagens/" + v.getId() + "/imagem/" + n);
            }
        }
    }

    public static CartaoViagemDTO de(Viagem viagem, int fotosExtras) {
        return new CartaoViagemDTO(viagem, fotosExtras);
    }

    private static String formatarPreco(BigDecimal valor) {
        if (valor == null) {
            return "Preço a combinar";
        }
        return NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(valor).replace(' ', ' ');
    }

    private static String formatarPeriodo(LocalDate ida, LocalDate volta) {
        if (ida == null) {
            return "Data a combinar";
        }
        if (volta == null || volta.equals(ida)) {
            return ida.format(FORMATO_DATA);
        }
        return ida.format(FORMATO_DATA) + " a " + volta.format(FORMATO_DATA);
    }

    public int getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getLocal() { return local; }
    public String getCategoria() { return categoria; }
    public String getDescricao() { return descricao; }
    public String getPreco() { return preco; }
    public String getPeriodo() { return periodo; }
    public String getTransporte() { return transporte; }
    public String getHotel() { return hotel; }
    public String getGuiaNome() { return guiaNome; }
    public int getGuiaId() { return guiaId; }
    public int getVagas() { return vagas; }
    public boolean isEsgotada() { return esgotada; }
    public List<String> getFotos() { return fotos; }
    public String getCapa() { return fotos.isEmpty() ? null : fotos.get(0); }
}
