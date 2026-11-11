package com.projeto.dto;

import com.projeto.model.Cadastro;
import com.projeto.model.PerfilUsuario;

// ============================================================
// GUIA DTO (formato enviado para o app Mobile)
// ------------------------------------------------------------
// O "guia" no app é, na prática, o usuário do site que CRIOU a
// viagem (campo "criador" da Viagem). Aqui juntamos os dados do
// Cadastro dele com os dados públicos do PerfilUsuario (cidade,
// sobre, idiomas, especialidades...).
//
// Nenhum dado sensível (senha, e-mail, CPF/CNPJ) é enviado.
// ============================================================
public class GuiaDTO {

    private String id;
    private String name;
    private String location;
    private String bio;
    private String languages;
    private String specialties;
    private int tripsCompleted;
    private int clientesAtendidos;
    private double rating;
    private int reviewCount;
    private boolean cadastur;
    private String photoUrl; // caminho para baixar a foto do guia
    private String bannerUrl; // caminho para baixar o banner (capa) do perfil do guia

    // Redes de contato públicas (as mesmas do perfil do guia no site).
    private String whatsapp;
    private String instagram;
    private String facebook;
    private String twitter;
    private String site;
    private String videoUrl;

    public static GuiaDTO de(Cadastro criador, PerfilUsuario perfil) {
        GuiaDTO dto = new GuiaDTO();
        dto.id = String.valueOf(criador.getId());
        dto.name = criador.getNome() != null && !criador.getNome().isBlank()
                ? criador.getNome()
                : criador.getEmail();

        // Indica se ele tem número CADASTUR informado (selo "verificado" no site).
        dto.cadastur = criador.getCadastur() != null && !criador.getCadastur().isBlank();

        if (perfil != null) {
            // Monta "cidade - estado" quando os dois existirem.
            String cidade = perfil.getCidade();
            String estado = perfil.getEstado();
            if (cidade != null && estado != null && !cidade.isBlank() && !estado.isBlank()) {
                dto.location = cidade + " - " + estado;
            } else if (cidade != null && !cidade.isBlank()) {
                dto.location = cidade;
            } else {
                dto.location = criador.getLocal();
            }

            dto.whatsapp = perfil.getWhatsapp();
            dto.instagram = perfil.getInstagram();
            dto.facebook = perfil.getFacebook();
            dto.twitter = perfil.getTwitter();
            dto.site = perfil.getSite();
            dto.videoUrl = perfil.getVideoUrl();
            dto.bio = perfil.getSobre();
            dto.languages = perfil.getIdiomas();
            dto.specialties = perfil.getEspecialidades();
            dto.tripsCompleted = perfil.getViagensRealizadas();
            dto.clientesAtendidos = perfil.getClientesAtendidos();
            dto.photoUrl = perfil.getFoto() != null && perfil.getFoto().length > 0
                    ? "/api/guias/" + criador.getId() + "/foto"
                    : null;
            dto.bannerUrl = perfil.getBanner() != null && perfil.getBanner().length > 0
                    ? "/api/guias/" + criador.getId() + "/banner"
                    : null;
        } else {
            dto.location = criador.getLocal();
        }

        // Ainda não existe sistema de avaliações no banco.
        dto.rating = 0.0;
        dto.reviewCount = 0;

        return dto;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public String getBio() { return bio; }
    public String getLanguages() { return languages; }
    public String getSpecialties() { return specialties; }
    public int getTripsCompleted() { return tripsCompleted; }
    public int getClientesAtendidos() { return clientesAtendidos; }
    public double getRating() { return rating; }
    public int getReviewCount() { return reviewCount; }
    public boolean isCadastur() { return cadastur; }
    public String getPhotoUrl() { return photoUrl; }
    public String getBannerUrl() { return bannerUrl; }
    public String getWhatsapp() { return whatsapp; }
    public String getInstagram() { return instagram; }
    public String getFacebook() { return facebook; }
    public String getTwitter() { return twitter; }
    public String getSite() { return site; }
    public String getVideoUrl() { return videoUrl; }
}
