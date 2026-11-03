package com.projeto.service;

import org.springframework.stereotype.Service;

import com.projeto.model.Cadastro;
import com.projeto.model.PerfilUsuario;
import com.projeto.repository.PerfilUsuarioRepository;

// ============================================================
// PERFIL DE USUÁRIO SERVICE
// ------------------------------------------------------------
// Regras de negócio do perfil (foto, redes sociais, "sobre
// mim"). Normaliza (arruma o formato de) os links de redes
// sociais antes de salvar, para aceitar tanto "@usuario" quanto
// a URL completa, por exemplo.
// ============================================================
@Service
public class PerfilUsuarioService {

    private final PerfilUsuarioRepository perfilUsuarioRepository;

    public PerfilUsuarioService(PerfilUsuarioRepository perfilUsuarioRepository) {
        this.perfilUsuarioRepository = perfilUsuarioRepository;
    }

    // Busca o perfil do usuário; se ele ainda não tiver um (primeiro
    // acesso), cria um perfil vazio automaticamente.
    public PerfilUsuario buscarOuCriar(Cadastro usuario) {
        return perfilUsuarioRepository.findByUsuario(usuario).orElseGet(() -> {
            PerfilUsuario perfil = new PerfilUsuario();
            perfil.setUsuario(usuario);
            perfil.setClientesAtendidos(0);
            perfil.setViagensRealizadas(0);
            return perfilUsuarioRepository.save(perfil);
        });
    }

    // Salva o perfil, arrumando o formato dos campos de rede social.
    //
    // ATENÇÃO (comportamento já existente, não alterado por mim):
    // este método sempre zera "clientesAtendidos" e
    // "viagensRealizadas" ao salvar. Isso já acontecia antes,
    // inclusive quando o próprio site salva o perfil - só estou
    // documentando aqui para você saber. Se um dia quiser preservar
    // esses números ao salvar outros campos do perfil (como a
    // foto), essas duas linhas precisariam ser removidas ou
    // ajustadas para não zerar valores que já existiam.
    public PerfilUsuario salvar(PerfilUsuario perfil) {
        perfil.setWhatsapp(limparNumero(perfil.getWhatsapp()));
        perfil.setInstagram(normalizarInstagram(perfil.getInstagram()));
        perfil.setFacebook(normalizarUrl(perfil.getFacebook(), "https://facebook.com/"));
        perfil.setTwitter(normalizarTwitter(perfil.getTwitter()));
        perfil.setSite(normalizarUrl(perfil.getSite(), "https://"));
        perfil.setClientesAtendidos(0);
        perfil.setViagensRealizadas(0);
        return perfilUsuarioRepository.save(perfil);
    }

    // Remove espaços em branco no início/fim do texto.
    private String limpar(String valor) {
        return valor == null ? null : valor.trim();
    }

    // Remove tudo que nao eh digito do whatsapp
    private String limparNumero(String valor) {
        valor = limpar(valor);
        if (valor == null || valor.isEmpty()) {
            return valor;
        }
        return valor.replaceAll("\\D", "");
    }

    // Aceita "@usuario", link completo ou só o nome, e guarda
    // sempre no mesmo formato (só o nome de usuário, sem "@" ou link).
    private String normalizarInstagram(String valor) {
        valor = limpar(valor);
        if (valor == null || valor.isEmpty()) {
            return valor;
        }
        valor = valor.replace("https://instagram.com/", "")
                .replace("http://instagram.com/", "")
                .replace("instagram.com/", "")
                .replace("@", "")
                .trim();
        return valor;
    }

    // Mesma ideia do Instagram, mas aceitando tanto twitter.com quanto x.com.
    private String normalizarTwitter(String valor) {
        valor = limpar(valor);
        if (valor == null || valor.isEmpty()) {
            return valor;
        }
        valor = valor.replace("https://twitter.com/", "")
                .replace("https://x.com/", "")
                .replace("twitter.com/", "")
                .replace("x.com/", "")
                .replace("@", "")
                .trim();
        return valor;
    }

    // Garante que a URL sempre comece com http(s)://, adicionando
    // o prefixo padrão se o usuário digitou sem.
    private String normalizarUrl(String valor, String prefixoPadrao) {
        valor = limpar(valor);
        if (valor == null || valor.isEmpty()) {
            return valor;
        }
        if (valor.startsWith("http://") || valor.startsWith("https://")) {
            return valor;
        }
        return prefixoPadrao + valor;
    }
}
