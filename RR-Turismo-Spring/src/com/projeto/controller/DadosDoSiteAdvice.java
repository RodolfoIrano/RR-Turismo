package com.projeto.controller;

import java.util.List;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.projeto.model.Viagem;
import com.projeto.service.EditarViagemService;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Entrega para TODAS as páginas do site (as que usam layout.jsp) a
// lista de categorias de viagem que existem hoje (Praia, Aventura...).
// O rodapé usa essa lista para montar os links "Explore por categoria"
// sozinho: criou uma viagem com categoria nova, o link aparece.
//
// ✏️ ONDE MUDAR: para o rodapé mostrar mais/menos categorias, mexa no
// ".limit(6)" abaixo. Só vale para os controllers de PÁGINA listados em
// assignableTypes (a API do app não passa por aqui, então não fica lenta).
// ============================================================
@ControllerAdvice(assignableTypes = {
        InicioController.class,
        ViagemPublicaController.class,
        SiteInstitucionalController.class,
        PerfilUsuarioController.class,
        CriarViagemController.class,
        EditarViagemController.class
})
public class DadosDoSiteAdvice {

    private final EditarViagemService editarViagemService;

    public DadosDoSiteAdvice(EditarViagemService editarViagemService) {
        this.editarViagemService = editarViagemService;
    }

    @ModelAttribute("categoriasRodape")
    public List<String> categoriasRodape() {
        return editarViagemService.listarTodas().stream()
                .map(Viagem::getCategoria)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .limit(6)
                .toList();
    }
}
