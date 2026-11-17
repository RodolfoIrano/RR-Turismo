package com.projeto.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Pequeno AJUSTE do banco que roda sempre que o servidor liga.
//
// Por quê? O formulário de criar viagem aceita descrições de até 2000
// caracteres, mas bancos criados por versões antigas do projeto têm essa
// coluna com só 255. O Hibernate (ddl-auto=update) cria colunas novas, mas
// NÃO aumenta o tamanho de uma coluna que já existe. Então, uma descrição
// um pouco maior dava erro ao salvar a viagem.
//
// Aqui conferimos o tamanho atual e, se for menor que 2000, aumentamos.
// Não apaga nem altera nenhum dado. Se a coluna já está certa, não faz nada.
// ============================================================
@Component
@Order(1)
public class AjusteDoBanco implements ApplicationRunner {

    private static final int TAMANHO_DESCRICAO = 2000;

    private final JdbcTemplate jdbc;

    public AjusteDoBanco(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            Long atual = jdbc.queryForObject(
                    "SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS "
                            + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'viagem' AND COLUMN_NAME = 'descricao'",
                    Long.class);
            if (atual != null && atual < TAMANHO_DESCRICAO) {
                jdbc.execute("ALTER TABLE viagem MODIFY COLUMN descricao VARCHAR(" + TAMANHO_DESCRICAO + ")");
                System.out.println("Banco ajustado: viagem.descricao agora aceita " + TAMANHO_DESCRICAO + " caracteres.");
            }
        } catch (Exception e) {
            // Banco sem a tabela ainda, ou sem permissão: o site continua funcionando normalmente.
        }
    }
}
