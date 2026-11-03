package com.projeto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// ============================================================
// CLASSE PRINCIPAL (ponto de entrada da aplicação)
// ------------------------------------------------------------
// É esta classe que você roda (botão "play" da IDE, ou
// `java -jar ...`) para subir o servidor Spring Boot. Ao
// iniciar, ele lê src/application.properties (porta 9000,
// conexão com o MySQL etc) e sobe tanto o site (JSP) quanto a
// API REST usada pelo app Mobile (rotas /api/**).
// ============================================================
@SpringBootApplication
public class Principal {
	public static void main(String[] args) {
		SpringApplication.run(Principal.class, args);
	}
}
