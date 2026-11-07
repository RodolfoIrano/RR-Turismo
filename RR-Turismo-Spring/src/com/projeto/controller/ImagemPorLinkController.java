package com.projeto.controller;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.projeto.util.DetectorDeImagem;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Permite colocar a foto da viagem pelo LINK da imagem (ex.: a foto
// do Google Imagens), em vez de escolher um arquivo do computador.
//
// COMO FUNCIONA: o navegador não consegue baixar imagens de outros
// sites direto (bloqueio de segurança chamado CORS). Então o site
// pede para ESTE servidor baixar a imagem e devolver os bytes. Depois
// o formulário trata essa foto igual a uma foto escolhida no computador
// (reduz para 800px e mostra na pré-visualização).
//
// SEGURANÇA (importante, o servidor "visita" links que o usuário digita):
//   - só funciona com o usuário LOGADO (o LoginInterceptor já exige);
//   - só aceita http/https nas portas 80 e 443;
//   - recusa endereços internos (localhost, rede local, etc.);
//   - só devolve se os bytes forem mesmo uma imagem;
//   - limite de 10 MB e de 10 segundos.
// ============================================================
@Controller
public class ImagemPorLinkController {

    private static final int MAXIMO_DE_BYTES = 10 * 1024 * 1024;
    private static final int MAXIMO_DE_REDIRECIONAMENTOS = 4;
    private static final String NAVEGADOR =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

    private static final HttpClient CLIENTE = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER) // seguimos "na mão" para validar cada endereço
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @GetMapping("/imagem-por-link")
    @ResponseBody
    public ResponseEntity<?> baixar(@RequestParam("url") String link) {
        try {
            URI endereco = interpretarLink(link);

            for (int tentativa = 0; tentativa <= MAXIMO_DE_REDIRECIONAMENTOS; tentativa++) {
                validarEndereco(endereco);

                HttpRequest pedido = HttpRequest.newBuilder(endereco)
                        .timeout(Duration.ofSeconds(10))
                        .header("User-Agent", NAVEGADOR)
                        .header("Accept", "image/avif,image/webp,image/*,*/*;q=0.8")
                        .GET()
                        .build();
                HttpResponse<InputStream> resposta = CLIENTE.send(pedido, HttpResponse.BodyHandlers.ofInputStream());
                int codigo = resposta.statusCode();

                // Redirecionamento: valida o novo endereço e tenta de novo.
                if (codigo >= 300 && codigo < 400) {
                    resposta.body().close();
                    String destino = resposta.headers().firstValue("Location").orElse(null);
                    if (destino == null) {
                        return erro("O link redireciona para um lugar inválido.");
                    }
                    endereco = endereco.resolve(destino);
                    continue;
                }

                if (codigo == 401 || codigo == 403) {
                    resposta.body().close();
                    return erro("O site dessa imagem não permite baixá-la por link. "
                            + "Salve a foto no computador e envie pelo botão de escolher arquivos.");
                }
                if (codigo != 200) {
                    resposta.body().close();
                    return erro("Não consegui abrir esse link (o site respondeu com erro " + codigo + ").");
                }

                byte[] bytes = lerComLimite(resposta.body());
                if (bytes == null) {
                    return erro("Essa imagem é muito grande (máximo 10 MB). Escolha uma menor.");
                }
                if (!pareceImagem(bytes)) {
                    return erro("Esse link não é de uma imagem. No Google Imagens, clique com o botão direito "
                            + "na foto e escolha \"Copiar endereço da imagem\".");
                }

                MediaType tipo = DetectorDeImagem.detectar(bytes);
                return ResponseEntity.ok().contentType(tipo).body(bytes);
            }
            return erro("O link redireciona muitas vezes. Tente outro link.");

        } catch (IllegalArgumentException e) {
            return erro(e.getMessage());
        } catch (java.net.http.HttpTimeoutException e) {
            return erro("A imagem demorou demais para baixar. Tente outro link.");
        } catch (Exception e) {
            return erro("Não consegui baixar essa imagem. Confira o link e tente de novo.");
        }
    }

    // ----------------------------------------------------------
    // Transforma o texto digitado em endereço. Se for um link da
    // PÁGINA do Google Imagens (".../imgres?imgurl=..."), pega o
    // endereço real da foto que vem dentro dele.
    // ----------------------------------------------------------
    private URI interpretarLink(String texto) {
        String limpo = texto == null ? "" : texto.trim().replace(" ", "%20");
        if (limpo.isEmpty()) {
            throw new IllegalArgumentException("Cole o link da imagem.");
        }
        try {
            URI uri = URI.create(limpo);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            if (host.contains("google.") && uri.getPath() != null && uri.getPath().startsWith("/imgres")
                    && uri.getRawQuery() != null) {
                for (String par : uri.getRawQuery().split("&")) {
                    if (par.startsWith("imgurl=")) {
                        String real = URLDecoder.decode(par.substring(7), StandardCharsets.UTF_8);
                        return URI.create(real.replace(" ", "%20"));
                    }
                }
            }
            return uri;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Esse link não parece válido. Confira se copiou inteiro.");
        }
    }

    // Só deixa passar http/https, portas normais e endereços públicos.
    private void validarEndereco(URI uri) throws Exception {
        String esquema = uri.getScheme();
        if (esquema == null || !(esquema.equalsIgnoreCase("http") || esquema.equalsIgnoreCase("https"))) {
            throw new IllegalArgumentException("O link precisa começar com http:// ou https://");
        }
        int porta = uri.getPort();
        if (porta != -1 && porta != 80 && porta != 443) {
            throw new IllegalArgumentException("Esse tipo de endereço não é permitido.");
        }
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Esse link não parece válido. Confira se copiou inteiro.");
        }
        for (InetAddress ip : InetAddress.getAllByName(host)) {
            if (ehEnderecoInterno(ip)) {
                throw new IllegalArgumentException("Esse tipo de endereço não é permitido.");
            }
        }
    }

    private boolean ehEnderecoInterno(InetAddress ip) {
        if (ip.isAnyLocalAddress() || ip.isLoopbackAddress() || ip.isLinkLocalAddress()
                || ip.isSiteLocalAddress() || ip.isMulticastAddress()) {
            return true;
        }
        byte[] b = ip.getAddress();
        if (b.length == 16 && (b[0] & 0xFE) == 0xFC) {
            return true; // IPv6 privado (fc00::/7)
        }
        // 100.64.0.0/10 (rede compartilhada de operadoras)
        return b.length == 4 && (b[0] & 0xFF) == 100 && (b[1] & 0xC0) == 64;
    }

    // Lê a resposta até o limite; devolve null se passar do limite.
    private byte[] lerComLimite(InputStream entrada) throws Exception {
        try (entrada; ByteArrayOutputStream saida = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[16 * 1024];
            int lidos;
            while ((lidos = entrada.read(buffer)) != -1) {
                saida.write(buffer, 0, lidos);
                if (saida.size() > MAXIMO_DE_BYTES) {
                    return null;
                }
            }
            return saida.toByteArray();
        }
    }

    // Confere os primeiros bytes: JPEG, PNG, GIF, WebP, AVIF ou BMP.
    private boolean pareceImagem(byte[] b) {
        if (b == null || b.length < 12) {
            return false;
        }
        boolean jpeg = (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
        boolean png = (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        boolean gif = b[0] == 'G' && b[1] == 'I' && b[2] == 'F';
        boolean webp = b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        boolean avif = b[4] == 'f' && b[5] == 't' && b[6] == 'y' && b[7] == 'p';
        boolean bmp = b[0] == 'B' && b[1] == 'M';
        return jpeg || png || gif || webp || avif || bmp;
    }

    private ResponseEntity<String> erro(String mensagem) {
        return ResponseEntity.badRequest()
                .contentType(new MediaType("text", "plain", StandardCharsets.UTF_8))
                .body(mensagem);
    }
}
