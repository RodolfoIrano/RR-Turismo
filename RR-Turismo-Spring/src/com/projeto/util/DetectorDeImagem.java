package com.projeto.util;

import org.springframework.http.MediaType;

// ============================================================
// DETECTOR DE FORMATO DE IMAGEM
// ------------------------------------------------------------
// As fotos/banners/imagens de viagem são guardadas no banco só
// como bytes brutos (BLOB) - não guardamos junto qual é o
// formato real do arquivo (JPEG, PNG, etc).
//
// O NAVEGADOR não liga muito pra isso (ele "fareja" os bytes e
// descobre o formato sozinho, então funcionava certinho no
// site). Só que o Android é mais rígido: se a gente disser
// "Content-Type: image/jpeg" no cabeçalho da resposta, mas os
// bytes forem de um PNG de verdade, o carregamento da imagem
// pode falhar silenciosamente no app - foi exatamente o bug que
// fazia as fotos não aparecerem no Mobile.
//
// Esta classe resolve isso olhando os primeiros bytes do
// arquivo (a "assinatura"/"magic number" de cada formato) para
// descobrir o Content-Type CORRETO antes de responder.
// ============================================================
public class DetectorDeImagem {

    // Assinaturas (primeiros bytes) de cada formato de imagem comum.
    private static final byte[] ASSINATURA_PNG = { (byte) 0x89, 0x50, 0x4E, 0x47 };
    private static final byte[] ASSINATURA_JPEG = { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF };
    private static final byte[] ASSINATURA_GIF = { 0x47, 0x49, 0x46 };
    private static final byte[] ASSINATURA_WEBP_RIFF = { 0x52, 0x49, 0x46, 0x46 }; // "RIFF" (WebP começa assim)

    public static MediaType detectar(byte[] bytes) {
        if (comecaCom(bytes, ASSINATURA_PNG)) {
            return MediaType.IMAGE_PNG;
        }
        if (comecaCom(bytes, ASSINATURA_JPEG)) {
            return MediaType.IMAGE_JPEG;
        }
        if (comecaCom(bytes, ASSINATURA_GIF)) {
            return MediaType.IMAGE_GIF;
        }
        if (comecaCom(bytes, ASSINATURA_WEBP_RIFF)) {
            return MediaType.valueOf("image/webp");
        }
        // Não reconhecido: usamos PNG como padrão, já que é o formato
        // que o resto do sistema (site) já assumia até então.
        return MediaType.IMAGE_PNG;
    }

    private static boolean comecaCom(byte[] bytes, byte[] assinatura) {
        if (bytes == null || bytes.length < assinatura.length) {
            return false;
        }
        for (int i = 0; i < assinatura.length; i++) {
            if (bytes[i] != assinatura[i]) {
                return false;
            }
        }
        return true;
    }
}
