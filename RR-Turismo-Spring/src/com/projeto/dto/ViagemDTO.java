package com.projeto.dto;

import java.time.temporal.ChronoUnit;

import com.projeto.model.Viagem;

// ============================================================
// VIAGEM DTO (formato enviado para o app Mobile)
// ------------------------------------------------------------
// Converte a entidade Viagem (criada pelo site) para o formato
// que as telas do app já esperam (tipo "Trip" do TypeScript).
//
// Alguns campos que o app mostra não existem hoje na tabela
// Viagem (avaliação, itens inclusos, regras, política de
// cancelamento). Eles são preenchidos com valores padrão aqui,
// para não quebrar as telas - e podem virar colunas de verdade
// no futuro, se você quiser que o criador preencha isso no site.
// ============================================================
public class ViagemDTO {

    private String id;
    private String title;
    private String description;
    private String destination;
    private String location;
    private String category;
    private double price;
    private int duration;       // em dias
    private double rating;
    private int reviewCount;
    private String guideId;
    private boolean available;
    private String imageUrl;    // caminho para baixar a imagem da viagem
    private String transporte;
    private String hotel;
    private int assentos;
    private int participantes;
    private String dataIda;
    private String dataVolta;

    public static ViagemDTO de(Viagem viagem) {
        ViagemDTO dto = new ViagemDTO();
        dto.id = String.valueOf(viagem.getId());
        dto.title = viagem.getNomedestino();
        dto.description = viagem.getDescricao();
        dto.destination = viagem.getNomedestino();
        dto.location = viagem.getLocal();
        dto.category = viagem.getCategoria();
        dto.price = viagem.getPreco() != null ? viagem.getPreco().doubleValue() : 0.0;

        // Duração calculada a partir das datas de ida e volta.
        if (viagem.getDataIda() != null && viagem.getDataVolta() != null) {
            long dias = ChronoUnit.DAYS.between(viagem.getDataIda(), viagem.getDataVolta());
            dto.duration = (int) Math.max(dias, 1);
        } else {
            dto.duration = 1;
        }

        // A tabela Viagem ainda não tem avaliações; enviamos 0 para o
        // app não mostrar nota inventada.
        dto.rating = 0.0;
        dto.reviewCount = 0;

        dto.guideId = viagem.getCriador() != null ? String.valueOf(viagem.getCriador().getId()) : null;

        // Considera disponível enquanto houver assentos livres.
        dto.available = viagem.getParticipantes() < viagem.getAssentos();

        // A imagem fica no banco (BLOB), então enviamos o caminho onde
        // o app pode baixá-la, e não a imagem em si.
        dto.imageUrl = viagem.getImagem() != null && viagem.getImagem().length > 0
                ? "/api/viagens/" + viagem.getId() + "/imagem"
                : null;

        dto.transporte = viagem.getTransporte();
        dto.hotel = viagem.getHotel();
        dto.assentos = viagem.getAssentos();
        dto.participantes = viagem.getParticipantes();
        dto.dataIda = viagem.getDataIda() != null ? viagem.getDataIda().toString() : null;
        dto.dataVolta = viagem.getDataVolta() != null ? viagem.getDataVolta().toString() : null;

        return dto;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDestination() { return destination; }
    public String getLocation() { return location; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public int getDuration() { return duration; }
    public double getRating() { return rating; }
    public int getReviewCount() { return reviewCount; }
    public String getGuideId() { return guideId; }
    public boolean isAvailable() { return available; }
    public String getImageUrl() { return imageUrl; }
    public String getTransporte() { return transporte; }
    public String getHotel() { return hotel; }
    public int getAssentos() { return assentos; }
    public int getParticipantes() { return participantes; }
    public String getDataIda() { return dataIda; }
    public String getDataVolta() { return dataVolta; }
}
