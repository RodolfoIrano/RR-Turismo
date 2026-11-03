package com.projeto.service;

import java.io.IOException;

import org.springframework.stereotype.Service;

import com.projeto.integracao.CalculadoraSoapClient;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Calcula o preço COM DESCONTO de uma viagem, mas em vez de
// fazer a conta (multiplicação/subtração) aqui dentro do Java
// como seria o normal, delega essas duas operações pro serviço
// SOAP externo da aula (CalculadoraSoapClient) - é uma forma de
// realmente usar o que foi aprendido em SOA, na prática.
//
// TRABALHA SEMPRE EM CENTAVOS (número inteiro), por dois motivos:
// 1. O serviço SOAP da calculadora só aceita números inteiros
//    (não aceita R$ 199,90 direto, por exemplo).
// 2. Trabalhar em centavos é uma boa prática normal em qualquer
//    sistema que mexe com dinheiro, evita erros de arredondamento
//    que podem acontecer com números decimais.
// ============================================================
@Service
public class DescontoService {

    private final CalculadoraSoapClient calculadoraSoap;

    public DescontoService(CalculadoraSoapClient calculadoraSoap) {
        this.calculadoraSoap = calculadoraSoap;
    }

    // Calcula o preço final aplicando um desconto em PERCENTUAL
    // (ex: 10 = 10% de desconto), usando duas chamadas SOAP:
    //   1) Multiply -> calcula quanto é o desconto em centavos
    //   2) Subtract -> subtrai o desconto do preço original
    //
    // A única conta feita aqui em Java (não pelo SOAP) é dividir
    // por 100 no final do passo 1, porque o serviço SOAP só
    // multiplica/soma/subtrai/divide números inteiros - dividir
    // "preco x percentual" por 100 via SOAP arredondaria errado
    // em alguns casos, então fazemos só essa parte localmente.
    public ResultadoDesconto calcularComPercentual(long precoCentavos, int percentual) throws IOException {
        if (percentual < 0 || percentual > 100) {
            throw new IllegalArgumentException("O percentual de desconto deve estar entre 0 e 100.");
        }

        // Passo 1 (via SOAP): preco x percentual
        long produto = calculadoraSoap.multiplicar((int) precoCentavos, percentual);

        // Divisão por 100 feita localmente (ver comentário acima do método).
        long descontoCentavos = produto / 100;

        // Passo 2 (via SOAP): preco - desconto
        long precoComDescontoCentavos = calculadoraSoap.subtrair((int) precoCentavos, (int) descontoCentavos);

        return new ResultadoDesconto(precoCentavos, descontoCentavos, precoComDescontoCentavos, percentual);
    }

    // Objeto simples com o resultado do cálculo, pra devolver pro
    // controller (que depois vira JSON pra resposta da API).
    public static class ResultadoDesconto {
        private final long precoOriginalCentavos;
        private final long descontoCentavos;
        private final long precoComDescontoCentavos;
        private final int percentual;

        public ResultadoDesconto(long precoOriginalCentavos, long descontoCentavos,
                                  long precoComDescontoCentavos, int percentual) {
            this.precoOriginalCentavos = precoOriginalCentavos;
            this.descontoCentavos = descontoCentavos;
            this.precoComDescontoCentavos = precoComDescontoCentavos;
            this.percentual = percentual;
        }

        public long getPrecoOriginalCentavos() { return precoOriginalCentavos; }
        public long getDescontoCentavos() { return descontoCentavos; }
        public long getPrecoComDescontoCentavos() { return precoComDescontoCentavos; }
        public int getPercentual() { return percentual; }
    }
}
