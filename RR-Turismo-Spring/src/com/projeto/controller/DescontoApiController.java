package com.projeto.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.service.DescontoService;
import com.projeto.service.DescontoService.ResultadoDesconto;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Rota NOVA (não mexe em nenhuma rota existente) que calcula o
// preço de uma viagem com desconto aplicado, usando o serviço
// SOAP público da aula (ver DescontoService e
// integracao/CalculadoraSoapClient para o "como" e o "porquê").
//
// Rota pública (não exige login), já que é só uma calculadora -
// não expõe nenhum dado sensível.
//
// Exemplo de uso:
//   GET /api/desconto/calcular?precoCentavos=19990&percentual=10
//   -> desconto de 10% em cima de R$ 199,90
// ============================================================
@RestController
@RequestMapping("/api/desconto")
public class DescontoApiController {

    private final DescontoService descontoService;

    public DescontoApiController(DescontoService descontoService) {
        this.descontoService = descontoService;
    }

    @GetMapping("/calcular")
    public ResponseEntity<?> calcular(
            @RequestParam("precoCentavos") long precoCentavos,
            @RequestParam("percentual") int percentual) {

        try {
            ResultadoDesconto resultado = descontoService.calcularComPercentual(precoCentavos, percentual);
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (IOException e) {
            // Acontece se o serviço SOAP externo (dneonline.com) estiver
            // fora do ar, ou se o servidor não tiver acesso à internet.
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("erro", "Não foi possível calcular o desconto agora. Tente novamente em instantes."));
        }
    }
}
