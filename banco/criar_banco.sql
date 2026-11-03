-- ============================================================
-- RR TURISMO - BANCO DE DADOS (MySQL 8)
-- ------------------------------------------------------------
-- Este script é OPCIONAL: o Spring já cria o banco "turismo_db"
-- e todas as tabelas sozinho na primeira vez que roda.
-- Use só se quiser criar o banco manualmente:
--     mysql -u root -p < banco/criar_banco.sql
-- ============================================================
CREATE DATABASE IF NOT EXISTS turismo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Tabelas criadas automaticamente pelo Spring (JPA):
--   cadastro        -> contas de guias, empresas e turistas
--   perfil_usuario  -> foto, banner e dados do perfil
--   viagem          -> pacotes de viagem criados no site
--   cartao_salvo    -> cartões salvos (tokenizados)
