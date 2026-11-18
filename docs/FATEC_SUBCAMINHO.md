# Rodando o RR Turismo no servidor da Fatec

O site está em `https://lobato.fatectq.edu.br/pi/rrturismo/`, dentro de um subcaminho,
e não na raiz. Por isso os links do site (que começam com `/`) davam 404.

Ajustei o projeto para aceitar um prefixo. Para ligar, é só definir uma configuração
antes de iniciar o Spring. Sem ela, o site roda normal na raiz (`localhost:9000`).

## Como configurar (escolha uma)

**Variável de ambiente:**

    BASE_PATH=/pi/rrturismo

- Linux/Mac: `export BASE_PATH=/pi/rrturismo` e depois `./rodar.sh`
- Windows: `set BASE_PATH=/pi/rrturismo` e depois `rodar.bat`

**Ou no arquivo `application-local.properties`** (ao lado do `rodar.bat`):

    rr.base-path=/pi/rrturismo

Depois reinicie o Spring.

## Observações

- Funciona tanto se o servidor tirar o `/pi/rrturismo` antes de repassar ao Spring
  quanto se repassar com o prefixo.
- Para conferir: abra `/pi/rrturismo/entrar` e faça login. Se aparecer 404 em
  `lobato.fatectq.edu.br/entrar` (sem o prefixo), a variável não foi aplicada
  ou o Spring não foi reiniciado.
- App mobile: o endereço da API no app deve terminar com `/pi/rrturismo/api`
  (variável `EXPO_PUBLIC_API_URL` no `.env`).