package com.projeto.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.projeto.model.Viagem;
import com.projeto.service.CriarViagemService;
import com.projeto.service.ImagensDaViagemService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

// ============================================================
// CRIAR VIAGEM (formulário do site para cadastrar um pacote novo)
// ============================================================
@Controller
public class CriarViagemController {

    private CriarViagemService criarViagemService;
    private ImagensDaViagemService imagensDaViagemService;

    public CriarViagemController(CriarViagemService criarViagemService,
                                 ImagensDaViagemService imagensDaViagemService) {
        this.criarViagemService = criarViagemService;
        this.imagensDaViagemService = imagensDaViagemService;
    }

    // Abre o formulário de criação de viagem (vazio).
    @GetMapping({"/criarviagem", "/criarViagem", "/criar-viagem"})
    public String abrirCriarViagem(Model model) {
        model.addAttribute("viagem", new Viagem());
        model.addAttribute("pagina", "criarViagem.jsp");
        return "layout";
    }

    // Processa o envio do formulário de criação de viagem.
    @PostMapping({"/cadastrarviagem", "/cadastrarViagem"})
    public String cadastrarViagem(@ModelAttribute("viagem") Viagem viagem,
                                  @RequestParam(name = "imagens", required = false) List<MultipartFile> imagens,
                                  HttpServletRequest request,
                                  HttpSession session,
                                  Model model) {

        // Validação das DATAS no servidor (o JavaScript já confere, mas o
        // servidor é quem garante: ninguém consegue burlar pelo navegador).
        String erroDatas = validarDatas(viagem);
        if (erroDatas != null) {
            model.addAttribute("mensagemErro", erroDatas);
            model.addAttribute("precoFormatado", request.getParameter("precoStr"));
            model.addAttribute("viagem", viagem);
            model.addAttribute("pagina", "criarViagem.jsp");
            return "layout";
        }

        // Fotos enviadas (de 1 a 5): a PRIMEIRA vira a capa (salva na própria
        // viagem) e as outras ficam na tabela de fotos extras.
        List<byte[]> fotos;
        try {
            fotos = lerFotos(imagens, viagem.getImagemFile());
        } catch (IOException e) {
            model.addAttribute("mensagemErro", "Erro ao processar a imagem. Tente novamente.");
            model.addAttribute("viagem", viagem);
            model.addAttribute("pagina", "criarViagem.jsp");
            return "layout";
        }

        if (fotos.isEmpty()) {
            model.addAttribute("mensagemErro", "Adicione pelo menos 1 imagem para cadastrar a viagem.");
            model.addAttribute("viagem", viagem);
            model.addAttribute("pagina", "criarViagem.jsp");
            return "layout";
        }

        viagem.setImagem(fotos.get(0));

        // Processa o preço com máscara (ex: R$ 1.500,00)
        String precoStr = request.getParameter("precoStr");
        if (precoStr != null && !precoStr.isEmpty()) {
            try {
                String limpo = precoStr.replaceAll("[R$\\s.]", "").replace(",", ".");
                viagem.setPreco(new BigDecimal(limpo));
            } catch (Exception e) {
                viagem.setPreco(BigDecimal.ZERO);
            }
        }

        viagem.setCriador((com.projeto.model.Cadastro) session.getAttribute("usuarioLogado"));
        Viagem novaViagem = criarViagemService.salvar(viagem);

        if (novaViagem != null && novaViagem.getId() > 0) {
            imagensDaViagemService.substituirExtras(novaViagem.getId(), fotos.subList(1, fotos.size()));
            model.addAttribute("mensagemSucesso", "Viagem cadastrada com sucesso!");
        } else {
            model.addAttribute("mensagemErro", "Erro ao cadastrar a viagem. Tente novamente.");
        }

        model.addAttribute("viagem", new Viagem());
        model.addAttribute("pagina", "criarViagem.jsp");
        return "layout";
    }

    // Junta as fotos enviadas numa lista de bytes (ignora vazias, máximo 5).
    // "unica" é o campo antigo (uma foto só), mantido por compatibilidade.
    static List<byte[]> lerFotos(List<MultipartFile> imagens, MultipartFile unica) throws IOException {
        List<byte[]> fotos = new ArrayList<>();
        if (imagens != null) {
            for (MultipartFile f : imagens) {
                if (f != null && !f.isEmpty() && fotos.size() < ImagensDaViagemService.MAXIMO_DE_FOTOS) {
                    fotos.add(f.getBytes());
                }
            }
        }
        if (fotos.isEmpty() && unica != null && !unica.isEmpty()) {
            fotos.add(unica.getBytes());
        }
        return fotos;
    }

    // Se mesmo assim a foto passar do limite (20 MB), mostra uma mensagem no
    // proprio formulario em vez de mandar o usuario para a tela inicial.
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public String fotoGrandeDemais(Model model) {
        model.addAttribute("mensagemErro", "A imagem e muito grande (maximo 20 MB). Escolha uma foto menor.");
        model.addAttribute("viagem", new Viagem());
        model.addAttribute("pagina", "criarViagem.jsp");
        return "layout";
    }

    // Confere as datas da viagem. Devolve a mensagem de erro, ou null se estiver tudo certo.
    //   - ida e volta são obrigatórias;
    //   - a ida não pode estar no passado;
    //   - a volta não pode ser antes da ida.
    private String validarDatas(Viagem viagem) {
        java.time.LocalDate ida = viagem.getDataIda();
        java.time.LocalDate volta = viagem.getDataVolta();
        if (ida == null || volta == null) {
            return "Informe a data de ida e a data de volta.";
        }
        if (ida.isBefore(java.time.LocalDate.now())) {
            return "A data de ida não pode estar no passado.";
        }
        if (volta.isBefore(ida)) {
            return "A data de volta não pode ser antes da data de ida.";
        }
        return null;
    }
}
