package com.projeto.integracao;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cliente SOAP "na mão" (sem biblioteca nova) que fala com a
// calculadora SOAP pública usada na sua aula de SOA:
//
//   http://www.dneonline.com/calculator.asmx?wsdl
//
// É EXATAMENTE o mesmo serviço que o "soa_soap_desconto" (o
// cliente Python da aula, feito com a biblioteca "zeep") e o
// "soa_soap_dneonline" (o cliente HTML/jQuery da aula) chamam -
// só que agora quem chama é o próprio backend Spring, em Java.
//
// ------------------------------------------------------------
// COMO FUNCIONA POR DENTRO (o que a aula chama de "SOAP"):
// Uma chamada SOAP é, no fundo, um POST HTTP comum, só que o
// corpo da requisição é um XML num formato específico (o
// "envelope SOAP"). Em vez de usar uma biblioteca pronta pra
// montar esse XML (como o JAX-WS da aula faz), aqui montamos o
// XML manualmente com texto e lemos a resposta com uma expressão
// regular simples - funciona porque a resposta desse serviço é
// bem previsível.
//
// POR QUE ASSIM E NÃO DO JEITO DA AULA (JAX-WS/wsimport)?
// O jeito da aula (usando "wsimport" pra gerar classes Java a
// partir do WSDL) exigiria baixar/gerar arquivos novos e
// configurar isso no seu ambiente Windows. Fazendo na mão com
// HttpURLConnection (que já vem pronto no Java, sem instalar
// nada), o projeto continua compilando exatamente como já
// compilava - risco zero de quebrar o que já funciona.
//
// IMPORTANTE: como este serviço é EXTERNO (fica na internet, não
// no seu computador), o servidor onde o Spring estiver rodando
// precisa ter acesso à internet pra essas chamadas funcionarem -
// isso normalmente não é problema no seu PC.
// ============================================================
@Component
public class CalculadoraSoapClient {

    private static final String ENDPOINT = "http://www.dneonline.com/calculator.asmx";
    private static final String NAMESPACE = "http://tempuri.org/";

    // Soma dois números usando a operação "Add" do serviço SOAP.
    public int somar(int valorA, int valorB) throws IOException {
        return chamarOperacao("Add", "intA", valorA, "intB", valorB, "AddResult");
    }

    // Subtrai dois números usando a operação "Subtract" do serviço SOAP.
    // É esta que usamos pra calcular o preço COM desconto já aplicado
    // (preço total menos o valor do desconto).
    public int subtrair(int valorA, int valorB) throws IOException {
        return chamarOperacao("Subtract", "intA", valorA, "intB", valorB, "SubtractResult");
    }

    // Multiplica dois números usando a operação "Multiply" do serviço SOAP.
    // É esta que usamos pra calcular QUANTO é o desconto (preço vezes o percentual).
    public int multiplicar(int valorA, int valorB) throws IOException {
        return chamarOperacao("Multiply", "intA", valorA, "intB", valorB, "MultiplyResult");
    }

    // Divide dois números usando a operação "Divide" do serviço SOAP.
    public int dividir(int valorA, int valorB) throws IOException {
        return chamarOperacao("Divide", "intA", valorA, "intB", valorB, "DivideResult");
    }

    // ==========================================================
    // MÉTODO GERAL QUE FAZ A CHAMADA SOAP DE VERDADE
    // ----------------------------------------------------------
    // Monta o XML da requisição, envia por POST, e extrai o
    // resultado do XML de resposta.
    // ==========================================================
    private int chamarOperacao(
            String operacao,
            String nomeParametroA, int valorA,
            String nomeParametroB, int valorB,
            String tagResultado) throws IOException {

        // Monta o "envelope" SOAP (o formato de XML que o protocolo exige).
        String envelopeXml =
                "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
                + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
                + "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" "
                + "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
                + "<soap:Body>"
                + "<" + operacao + " xmlns=\"" + NAMESPACE + "\">"
                + "<" + nomeParametroA + ">" + valorA + "</" + nomeParametroA + ">"
                + "<" + nomeParametroB + ">" + valorB + "</" + nomeParametroB + ">"
                + "</" + operacao + ">"
                + "</soap:Body>"
                + "</soap:Envelope>";

        HttpURLConnection conexao = (HttpURLConnection) new URL(ENDPOINT).openConnection();
        conexao.setRequestMethod("POST");
        conexao.setDoOutput(true);
        conexao.setConnectTimeout(8000);
        conexao.setReadTimeout(8000);

        // Cabeçalhos exigidos pelo protocolo SOAP 1.1.
        conexao.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
        conexao.setRequestProperty("SOAPAction", NAMESPACE + operacao);

        // Envia o XML montado acima no corpo da requisição.
        try (OutputStream saida = conexao.getOutputStream()) {
            saida.write(envelopeXml.getBytes(StandardCharsets.UTF_8));
        }

        int codigoResposta = conexao.getResponseCode();
        String corpoResposta = lerFluxo(
                codigoResposta >= 200 && codigoResposta < 300
                        ? conexao.getInputStream()
                        : conexao.getErrorStream()
        );

        if (codigoResposta < 200 || codigoResposta >= 300) {
            throw new IOException("Serviço SOAP respondeu com erro (HTTP " + codigoResposta + "): " + corpoResposta);
        }

        // Extrai o número de dentro da tag de resultado, ex: <AddResult>7</AddResult>
        Pattern padrao = Pattern.compile("<" + tagResultado + ">(-?\\d+)</" + tagResultado + ">");
        Matcher encontrado = padrao.matcher(corpoResposta);

        if (!encontrado.find()) {
            throw new IOException("Não foi possível encontrar o resultado na resposta do serviço SOAP.");
        }

        return Integer.parseInt(encontrado.group(1));
    }

    private String lerFluxo(java.io.InputStream fluxo) throws IOException {
        if (fluxo == null) {
            return "";
        }
        StringBuilder texto = new StringBuilder();
        try (java.io.BufferedReader leitor =
                     new java.io.BufferedReader(new java.io.InputStreamReader(fluxo, StandardCharsets.UTF_8))) {
            String linha;
            while ((linha = leitor.readLine()) != null) {
                texto.append(linha);
            }
        }
        return texto.toString();
    }
}
