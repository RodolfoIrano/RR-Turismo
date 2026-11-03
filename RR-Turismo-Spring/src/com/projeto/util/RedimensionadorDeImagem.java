package com.projeto.util;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;

import org.springframework.http.MediaType;

// ============================================================
// REDIMENSIONADOR DE IMAGEM (versão "leve" para o celular)
// ------------------------------------------------------------
// As fotos do site são guardadas no banco no tamanho ORIGINAL
// (às vezes vários MB, direto da câmera). No computador isso passa
// batido, mas no celular, via Wi-Fi, carregar dezenas de fotos
// gigantes deixa tudo lento ou até faz a foto "não aparecer".
//
// Esta classe gera, sob demanda, uma versão menor (largura máxima
// pedida pelo app, ex: 900 px) em JPEG e guarda em memória (cache)
// para não refazer a conta a cada pedido. O banco NÃO é alterado:
// a foto original continua intacta para o site.
//
// Se a imagem for pequena, ou for de um formato que o Java não lê
// (ex: WebP), devolvemos a original sem mexer.
// ============================================================
public class RedimensionadorDeImagem {

    // Imagem pronta para ser enviada: os bytes e o tipo (Content-Type) certo.
    public record Imagem(byte[] bytes, MediaType tipo) { }

    private static final int TAMANHO_MINIMO_PARA_REDUZIR = 120_000; // ~120 KB
    private static final int MAXIMO_NO_CACHE = 300;
    private static final Map<String, Imagem> CACHE = new ConcurrentHashMap<>();

    private RedimensionadorDeImagem() { }

    // "chave" identifica a imagem (ex: "viagem-3"); larguraMax <= 0 = original.
    public static Imagem servir(String chave, byte[] original, int larguraMax) {
        Imagem semMudanca = new Imagem(original, DetectorDeImagem.detectar(original));
        if (larguraMax <= 0 || original.length < TAMANHO_MINIMO_PARA_REDUZIR) {
            return semMudanca;
        }

        // O tamanho original entra na chave: se a foto for trocada, o cache "invalida" sozinho.
        String chaveCache = chave + "@" + larguraMax + "#" + original.length;
        Imagem pronta = CACHE.get(chaveCache);
        if (pronta != null) return pronta;

        Imagem gerada = gerar(original, larguraMax, semMudanca);
        if (CACHE.size() >= MAXIMO_NO_CACHE) CACHE.clear();
        CACHE.put(chaveCache, gerada);
        return gerada;
    }

    private static Imagem gerar(byte[] original, int larguraMax, Imagem plano) {
        try {
            BufferedImage origem = ImageIO.read(new ByteArrayInputStream(original));
            if (origem == null) return plano; // formato que o Java não lê

            int largura = origem.getWidth();
            int altura = origem.getHeight();
            if (largura <= larguraMax) return plano; // já é pequena

            int novaLargura = larguraMax;
            int novaAltura = Math.max(1, (int) Math.round((double) altura * larguraMax / largura));

            // JPEG não tem transparência: desenhamos sobre fundo branco.
            BufferedImage destino = new BufferedImage(novaLargura, novaAltura, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = destino.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, novaLargura, novaAltura);
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(origem, 0, 0, novaLargura, novaAltura, null);
            g.dispose();

            ImageWriter escritor = ImageIO.getImageWritersByFormatName("jpeg").next();
            ImageWriteParam parametros = escritor.getDefaultWriteParam();
            parametros.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            parametros.setCompressionQuality(0.82f);

            ByteArrayOutputStream saida = new ByteArrayOutputStream();
            try (MemoryCacheImageOutputStream fluxo = new MemoryCacheImageOutputStream(saida)) {
                escritor.setOutput(fluxo);
                escritor.write(null, new IIOImage(destino, null, null), parametros);
            } finally {
                escritor.dispose();
            }

            byte[] reduzida = saida.toByteArray();
            // Só vale a pena se realmente ficou menor.
            return reduzida.length < original.length ? new Imagem(reduzida, MediaType.IMAGE_JPEG) : plano;
        } catch (Exception e) {
            return plano; // qualquer problema: manda a original
        }
    }
}
