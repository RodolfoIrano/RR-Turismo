package com.projeto.config;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Faz o site funcionar quando ele fica num SUBCAMINHO do servidor, por exemplo
//     https://lobato.fatectq.edu.br/pi/rrturismo/
// em vez de na raiz (http://localhost:9000/).
//
// O problema: o site escreve links como "/entrar" e "/css/site.css". No servidor
// da Fatec isso aponta para lobato.fatectq.edu.br/entrar (que não existe → 404),
// e o certo seria lobato.fatectq.edu.br/pi/rrturismo/entrar.
//
// A solução (tudo automático, só ligando uma configuração):
//   1) pedidos que chegam COM o prefixo (/pi/rrturismo/entrar) são tratados como
//      /entrar (funciona também se o servidor do professor já tirar o prefixo);
//   2) nas páginas HTML e CSS enviadas, os links que começam com "/" ganham o
//      prefixo, e os redirecionamentos também.
//
// ✏️ COMO LIGAR:  defina a variável de ambiente  BASE_PATH=/pi/rrturismo
//    (ou  rr.base-path=/pi/rrturismo  no application-local.properties).
//    Também funciona sozinho se o servidor mandar o cabeçalho X-Forwarded-Prefix.
//    Sem configurar nada (seu computador, Docker na raiz) este filtro NÃO faz nada.
// ============================================================
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PrefixoDoSiteFilter implements Filter {

    private final String prefixoConfigurado;

    public PrefixoDoSiteFilter(@Value("${rr.base-path:}") String prefixoConfigurado) {
        this.prefixoConfigurado = normalizar(prefixoConfigurado);
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String prefixo = normalizar(request.getHeader("X-Forwarded-Prefix"));
        if (prefixo.isEmpty()) {
            prefixo = prefixoConfigurado;
        }
        if (prefixo.isEmpty()) {
            chain.doFilter(req, res); // sem prefixo: tudo como sempre foi
            return;
        }

        request.setAttribute("RR_BASE", prefixo); // as páginas (JSP) leem isso
        RespostaComPrefixo resposta = new RespostaComPrefixo(response, prefixo);
        try {
            String uri = request.getRequestURI();
            if (uri.equals(prefixo) || uri.startsWith(prefixo + "/")) {
                String resto = uri.substring(prefixo.length());
                request.getRequestDispatcher(resto.isEmpty() ? "/" : resto).forward(request, resposta);
            } else {
                chain.doFilter(request, resposta);
            }
        } finally {
            resposta.concluir();
        }
    }

    // "pi/rrturismo/" -> "/pi/rrturismo"; vazio ou "/" -> "".
    static String normalizar(String valor) {
        if (valor == null) {
            return "";
        }
        String v = valor.trim();
        while (v.endsWith("/")) {
            v = v.substring(0, v.length() - 1);
        }
        if (v.isEmpty()) {
            return "";
        }
        return v.startsWith("/") ? v : "/" + v;
    }

    // ---------------------------------------------------------------
    // Resposta que guarda o conteúdo na memória, acrescenta o prefixo nos links
    // (HTML e CSS) e só então envia ao navegador.
    // ---------------------------------------------------------------
    static class RespostaComPrefixo extends HttpServletResponseWrapper {

        private final String prefixo;
        private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        private ServletOutputStream stream;
        private PrintWriter writer;

        private final Pattern atributos;
        private final Pattern urlCss;
        private final Pattern pastasConhecidas;
        private final String substituicao;

        RespostaComPrefixo(HttpServletResponse response, String prefixo) {
            super(response);
            this.prefixo = prefixo;
            String p = Pattern.quote(prefixo);
            // Já tem o prefixo? Então não repete.
            String jaTem = "(?!" + p + "(?:/|[\"'\\s>]))";
            this.atributos = Pattern.compile(
                    "(\\s(?:href|src|action|poster|formaction|data-path|data-extra-path|data-href|data-url|data-src)"
                    + "\\s*=\\s*[\"'])/(?!/)" + jaTem);
            this.urlCss = Pattern.compile("(url\\(\\s*[\"']?)/(?!/)" + jaTem + "|(@import\\s+[\"'])/(?!/)" + jaTem);
            this.pastasConhecidas = Pattern.compile("([\"'])/(?=(?:imagens|css|js|api)/)" + jaTem);
            this.substituicao = Matcher.quoteReplacement(prefixo);
        }

        @Override
        public ServletOutputStream getOutputStream() throws IOException {
            if (writer != null) {
                throw new IllegalStateException("getWriter() já foi chamado");
            }
            if (stream == null) {
                stream = new ServletOutputStream() {
                    @Override public void write(int b) { buffer.write(b); }
                    @Override public void write(byte[] b, int off, int len) { buffer.write(b, off, len); }
                    @Override public boolean isReady() { return true; }
                    @Override public void setWriteListener(WriteListener listener) { /* não usado */ }
                };
            }
            return stream;
        }

        @Override
        public PrintWriter getWriter() throws IOException {
            if (stream != null) {
                throw new IllegalStateException("getOutputStream() já foi chamado");
            }
            if (writer == null) {
                writer = new PrintWriter(new OutputStreamWriter(buffer, charset()), false);
            }
            return writer;
        }

        private Charset charset() {
            try {
                String nome = getCharacterEncoding();
                return nome == null ? StandardCharsets.UTF_8 : Charset.forName(nome);
            } catch (RuntimeException e) {
                return StandardCharsets.UTF_8;
            }
        }

        // O tamanho final só é conhecido depois de reescrever os links.
        @Override public void setContentLength(int len) { /* ignorado */ }
        @Override public void setContentLengthLong(long len) { /* ignorado */ }
        @Override public void flushBuffer() { /* só envia no final */ }

        @Override
        public void setHeader(String nome, String valor) {
            if (!"Content-Length".equalsIgnoreCase(nome)) {
                super.setHeader(nome, valor);
            }
        }

        @Override
        public void addHeader(String nome, String valor) {
            if (!"Content-Length".equalsIgnoreCase(nome)) {
                super.addHeader(nome, valor);
            }
        }

        @Override
        public void resetBuffer() {
            buffer.reset();
            super.resetBuffer();
        }

        @Override
        public void reset() {
            buffer.reset();
            super.reset();
        }

        @Override
        public void sendRedirect(String local) throws IOException {
            if (local != null && local.startsWith("/") && !local.startsWith("//")
                    && !(local.equals(prefixo) || local.startsWith(prefixo + "/"))) {
                local = prefixo + local;
            }
            super.sendRedirect(local);
        }

        // Chamado no fim: reescreve (se for HTML/CSS) e manda a resposta de verdade.
        void concluir() throws IOException {
            if (writer != null) {
                writer.flush();
            }
            byte[] bytes = buffer.toByteArray();
            if (bytes.length == 0 || super.isCommitted()) {
                return;
            }
            String tipo = getContentType();
            if (tipo != null) {
                String t = tipo.toLowerCase();
                boolean html = t.startsWith("text/html");
                boolean css = t.startsWith("text/css");
                if (html || css) {
                    Charset cs = charset();
                    String texto = new String(bytes, cs);
                    texto = reescrever(texto, html);
                    bytes = texto.getBytes(cs);
                }
            }
            super.setContentLengthLong(bytes.length);
            ServletOutputStream saida = super.getOutputStream();
            saida.write(bytes);
            saida.flush();
        }

        private String reescrever(String texto, boolean html) {
            if (html) {
                texto = atributos.matcher(texto).replaceAll("$1" + substituicao + "/");
                texto = pastasConhecidas.matcher(texto).replaceAll("$1" + substituicao + "/");
            }
            Matcher m = urlCss.matcher(texto);
            StringBuilder sb = new StringBuilder();
            while (m.find()) {
                String inicio = m.group(1) != null ? m.group(1) : m.group(2);
                m.appendReplacement(sb, Matcher.quoteReplacement(inicio + prefixo + "/"));
            }
            m.appendTail(sb);
            return sb.toString();
        }
    }
}
