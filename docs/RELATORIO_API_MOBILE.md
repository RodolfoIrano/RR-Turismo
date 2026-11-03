# Relatório Técnico — RR Turismo (Mobile + Backend)

Este documento explica, de forma resumida e organizada, como o app Mobile
se comunica com o backend, quais APIs existem, o que cada uma faz, e as
decisões técnicas principais — pronto pra você explicar ao professor.

---

## 1. Visão geral da arquitetura

O projeto tem **dois "lados"**, ligados pelo mesmo backend e banco de dados:

```
┌─────────────────────┐          ┌──────────────────────────┐
│   SITE WEB (JSP)     │          │   APP MOBILE (Expo/RN)   │
│  Quem CRIA viagens   │          │   Quem COMPRA viagens    │
│  Login por SESSÃO    │          │   Login por TOKEN        │
└──────────┬───────────┘          └────────────┬─────────────┘
           │                                    │
           └───────────────┬────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   BACKEND SPRING   │
                  │  (Spring Boot MVC  │
                  │   + REST API)      │
                  └─────────┬──────────┘
                            │
                  ┌─────────▼──────────┐
                  │   MySQL (turismo_db)│
                  └─────────────────────┘
```

**Ponto-chave para explicar ao professor:** não existem dois bancos de
dados nem dois sistemas de usuários separados. O site (feito para quem
*cria* pacotes de viagem) e o app (feito para quem *compra*) são duas
"portas de entrada" diferentes para o **mesmo** backend Spring e o
**mesmo** banco MySQL. Um usuário cadastrado no site consegue logar no
app com a mesma senha, e vice-versa.

---

## 2. Por que o Mobile usa uma API separada do site

O site é uma aplicação **Spring MVC tradicional**: cada clique carrega
uma página HTML nova, gerada no servidor (JSP), e o login fica guardado
numa **sessão** (cookie), que só faz sentido dentro de um navegador.

O app Mobile é diferente: ele **não carrega páginas HTML**, ele pede
**dados prontos (JSON)** pro servidor e desenha a tela ele mesmo. Esse
modelo se chama **API REST**. Como o app não guarda cookie de sessão do
jeito que um navegador guarda, o login dele funciona com um **token**
(uma "senha temporária" que o app manda em toda requisição).

Por isso o projeto tem duas famílias de rotas no mesmo backend:
- Rotas do **site** (`/entrar`, `/inicio`, `/criarviagem`...) → devolvem HTML, usam sessão.
- Rotas da **API** (`/api/...`) → devolvem JSON, usam token. É só essa
  segunda família que o app Mobile conhece/usa.

---

## 3. Autenticação (como o login funciona no Mobile)

| Passo | O que acontece |
|---|---|
| 1 | Usuário digita e-mail/senha no app e toca em "Entrar" |
| 2 | App chama `POST /api/auth/login` |
| 3 | Backend confere a senha (mesmo hash PBKDF2 usado no site) |
| 4 | Se certo, backend gera um **token** aleatório e devolve `{ token, usuario }` |
| 5 | App guarda esse token no aparelho, de forma **criptografada** (`expo-secure-store` — Keychain no iOS / Keystore no Android) |
| 6 | Toda chamada seguinte à API manda o header `Authorization: Bearer <token>` |
| 7 | O backend confere esse token antes de responder (menos nas rotas públicas, como o catálogo de viagens) |

**Observação técnica pro professor:** os tokens ficam guardados em
**memória** no servidor (não numa tabela do banco), por simplicidade —
ou seja, se o servidor Spring reiniciar, todo mundo precisa logar de
novo no app (não afeta o site nem os dados). É uma escolha consciente
de simplicidade para um projeto acadêmico.

---

## 4. Lista completa das rotas da API (`/api/**`)

### 4.1 Autenticação — `AuthApiController`
| Método | Rota | Faz o quê | Precisa de token? |
|---|---|---|---|
| POST | `/api/auth/login` | Login (e-mail + senha) | Não |
| POST | `/api/auth/register` | Criar conta nova | Não |
| POST | `/api/auth/logout` | Encerrar sessão do app | Não |
| GET | `/api/auth/me` | Confirma quem está logado (usado ao abrir o app, pra restaurar a sessão salva) | **Sim** |

### 4.2 Perfil do usuário — `PerfilApiController`
| Método | Rota | Faz o quê | Precisa de token? |
|---|---|---|---|
| GET | `/api/perfil/foto` | Baixa a foto de perfil | **Sim** |
| POST | `/api/perfil/foto` | Envia/troca a foto de perfil | **Sim** |
| GET | `/api/perfil/banner` | Baixa a capa do perfil | **Sim** |
| POST | `/api/perfil/banner` | Envia/troca a capa do perfil | **Sim** |

### 4.3 Catálogo de viagens e guias — `ViagemApiController`
| Método | Rota | Faz o quê | Precisa de token? |
|---|---|---|---|
| GET | `/api/viagens` | Lista todas as viagens cadastradas no site | Não (é o "catálogo público") |
| GET | `/api/viagens/{id}` | Detalhes de uma viagem específica | Não |
| GET | `/api/viagens/{id}/imagem` | Foto da viagem | Não |
| GET | `/api/guias/{id}` | Dados do guia (quem criou a viagem) | Não |
| GET | `/api/guias/{id}/foto` | Foto do guia | Não |
| GET | `/api/guias/{id}/viagens` | Viagens de um guia específico | Não |

> Essas rotas são públicas de propósito: o catálogo de viagens precisa
> aparecer no app mesmo pra quem ainda não fez login — igual à vitrine
> de uma loja, que qualquer um pode olhar antes de entrar.

### 4.4 Cartões salvos (tokenizados) — `CartaoApiController`
| Método | Rota | Faz o quê | Precisa de token? |
|---|---|---|---|
| GET | `/api/cartoes` | Lista os cartões salvos do usuário | **Sim** |
| POST | `/api/cartoes` | Salva um cartão novo (só o token + bandeira + últimos 4 dígitos — nunca o número completo) | **Sim** |
| DELETE | `/api/cartoes/{id}` | Remove um cartão salvo | **Sim** |

### 4.5 Desconto via SOAP (novidade da aula de SOA) — `DescontoApiController`
| Método | Rota | Faz o quê | Precisa de token? |
|---|---|---|---|
| GET | `/api/desconto/calcular?precoCentavos=X&percentual=Y` | Calcula o preço com desconto, delegando a conta pra um serviço **SOAP externo** | Não |

---

## 5. A parte de SOA / SOAP (assunto da sua aula)

Esta é provavelmente a parte mais interessante pra destacar na
apresentação, porque mistura **dois estilos de web service diferentes**
no mesmo projeto:

- O app fala com o **backend Spring via REST** (JSON, como o resto da API).
- O **backend Spring**, por sua vez, fala com um **serviço SOAP externo e público**
  (`http://www.dneonline.com/calculator.asmx`) — a mesma calculadora usada
  nos exemplos da aula (o cliente Python com `zeep`, o HTML com jQuery).

Ou seja: o Spring funciona como **cliente SOAP** aqui, chamando duas
operações do serviço (`Multiply` e `Subtract`) pra calcular o desconto,
sem usar nenhuma biblioteca SOAP pronta — o XML da requisição é montado
"na mão" (arquivo `CalculadoraSoapClient.java`), usando só recursos que
já vêm no Java.

**Fluxo completo de uma chamada de desconto:**
```
App Mobile
  → GET /api/desconto/calcular?precoCentavos=19990&percentual=10
    → Spring monta o XML do "envelope SOAP"
      → POST http://www.dneonline.com/calculator.asmx  (Multiply: 199,90 × 10)
      ← resposta SOAP com o resultado
      → POST http://www.dneonline.com/calculator.asmx  (Subtract: preço - desconto)
      ← resposta SOAP com o resultado final
  ← Spring devolve o resultado em JSON pro app
```

---

## 6. Onde cada tela do app usa qual API

| Tela do Mobile | Serviço (`services/*.ts`) | Rotas da API usadas |
|---|---|---|
| Login / Cadastro | `authService.ts` | `/api/auth/*` |
| Início / Explorar / Favoritos | `tripService.ts`, `CatalogoContext` | `/api/viagens*` |
| Detalhes da Viagem | `CatalogoContext` (reaproveita os dados já carregados) | — (sem chamada nova) |
| Perfil do Guia | `guideService.ts`, `CatalogoContext` | `/api/guias*` |
| Perfil do usuário | `authService.ts` | `/api/perfil/*` |
| Checkout — cartão salvo | `cartaoService.ts` | `/api/cartoes*` |
| Checkout — cupom de desconto | `descontoService.ts` | `/api/desconto/calcular` |

---

## 7. Segurança — pontos que valem ser citados

- **Senha:** nunca fica em texto puro no banco — é transformada com
  **PBKDF2** (hash com "sal" aleatório e 120 mil iterações), tanto pro
  site quanto pro app, porque os dois usam o mesmo `CadastroService`.
- **Cartão de crédito:** o número completo e o CVV **nunca chegam ao
  nosso backend**. O app já tokeniza o cartão antes de enviar — só o
  token, a bandeira e os últimos 4 dígitos são guardados.
- **Token do app:** guardado de forma criptografada no aparelho
  (`expo-secure-store`), não em texto puro.

---

## 8. Como demonstrar/testar ao vivo

1. Suba o MySQL (XAMPP).
2. Rode o projeto Spring (`Principal.java`, botão Run/F5) — confirme
   "Tomcat started on port(s): 9000" no console.
3. Rode o app (`npx expo start` dentro da pasta `to-do`, aperte `a`
   pra abrir no emulador Android).
4. Sugestão de roteiro pra mostrar: login → ver as viagens (mesmas do
   site) → entrar numa viagem e ver o guia → favoritar → adicionar ao
   carrinho → aplicar um cupom de desconto (mostra a integração SOAP)
   → finalizar a reserva → ver em "Minhas Reservas".
