package com.projeto.aovivo;

// ============================================================
// COORDENADA (objeto de valor)
// ------------------------------------------------------------
// Um ponto no mapa (latitude + longitude). Por ser um "record",
// é IMUTÁVEL: depois de criada, não muda - para mover alguém,
// cria-se uma nova Coordenada. Esse é um conceito de orientação
// a objetos chamado "objeto de valor" (value object).
//
// Os cálculos geográficos ficam DENTRO da própria classe
// (encapsulamento): quem usa só pergunta "qual a distância até
// aquele ponto?" sem precisar saber a fórmula.
// ============================================================
public record Coordenada(double lat, double lng) {

    private static final double RAIO_DA_TERRA_METROS = 6_371_000.0;

    // Garante que ninguém crie uma coordenada impossível (ex.: lat 500).
    public Coordenada {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180 || Double.isNaN(lat) || Double.isNaN(lng)) {
            throw new IllegalArgumentException("Coordenada inválida.");
        }
    }

    // Distância em metros até outro ponto (fórmula de Haversine).
    public double distanciaAte(Coordenada outro) {
        double dLat = Math.toRadians(outro.lat - lat);
        double dLng = Math.toRadians(outro.lng - lng);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat)) * Math.cos(Math.toRadians(outro.lat))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return RAIO_DA_TERRA_METROS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Direção em graus (0 = Norte, 90 = Leste...) para chegar até o outro ponto.
    public double rumoPara(Coordenada outro) {
        double lat1 = Math.toRadians(lat);
        double lat2 = Math.toRadians(outro.lat);
        double dLng = Math.toRadians(outro.lng - lng);
        double y = Math.sin(dLng) * Math.cos(lat2);
        double x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        return (Math.toDegrees(Math.atan2(y, x)) + 360) % 360;
    }
}
