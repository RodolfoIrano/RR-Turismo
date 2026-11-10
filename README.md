# RR Turismo

Plataforma de turismo com **site** (Spring Boot) e **aplicativo** (React Native / Expo).
Os dois usam o **mesmo servidor, o mesmo banco de dados e o mesmo login**.

Projeto de **Rafael e Rodolfo** — Fatec Taquaritinga, curso de **Sistemas para Internet**.

## O que o RR Turismo faz

| Tipo de conta | O que pode fazer |
|---|---|
| **Viajante** (quem só quer comprar viagem) | Ver as viagens, salvar favoritos, ver mapa, guia e datas de cada viagem, falar com a equipe |
| **Guia** ou **Empresa** | Tudo do viajante + **painel** para criar e editar as próprias viagens |

**No site:** banner com as viagens em destaque, busca (inclusive por voz), filtro por categoria, página de cada viagem com mapa, Favoritos, Sobre nós, Fale conosco (abre o WhatsApp da equipe), chat de ajuda (bolinha no canto), tradução do site e recursos de acessibilidade (modo escuro, contraste, VLibras).
**No app:** catálogo, viagem com mapa, favoritos, perfil e configurações, chat de ajuda, Fale conosco, Sobre nós e o Modo Guia (acompanhar a viagem ao vivo).

---

| Parte | Pasta | Tecnologia | Quem usa |
|---|---|---|---|
| Site + API | [`RR-Turismo-Spring`](RR-Turismo-Spring) | Java 17+, Spring Boot 3, JSP, MySQL | Guias/empresas criam as viagens |
| Aplicativo | [`RR-Turismo-Mobile`](RR-Turismo-Mobile) | Expo SDK 58, React Native, TypeScript | Turistas compram e acompanham a viagem |
| Banco | [`banco`](banco) | MySQL 8 | Criado automaticamente |
| Documentos | [`docs`](docs) | — | Relatório da API do app |

---

## 1. Como baixar o projeto

**Opção A — com Git (recomendado):**
```bash
git clone https://github.com/RodolfoIrano/RR-Turismo.git
cd RR-Turismo
```

**Opção B — sem Git:** na página do repositório clique em **Code → Download ZIP** e extraia o arquivo.

> A pasta `RR-Turismo-Spring/lib` já vem com todas as bibliotecas Java. Não precisa de Maven nem de internet para compilar.

---

## 2. O que instalar (uma vez só)

| Programa | Para quê | Onde baixar |
|---|---|---|
| **JDK 17 ou superior** (recomendado 21) | Rodar o Spring | https://adoptium.net (Temurin 21) |
| **MySQL 8** | Banco de dados | https://dev.mysql.com/downloads/installer/ |
| **Node.js 20 ou superior** | Rodar o app | https://nodejs.org (versão LTS) |
| **Android Studio** (emulador) | Rodar o app no computador | https://developer.android.com/studio |
| **Expo Go** (opcional, no celular) | Abrir o app no celular | Play Store / App Store |

Confira no terminal: `javac -version` (deve mostrar 17 ou mais), `node -v` (20 ou mais), e se o MySQL está ligado.

---

## 3. Rodar em 3 passos

### Passo 1 — Servidor (Spring)
Siga o [`RR-Turismo-Spring/README.md`](RR-Turismo-Spring/README.md). Resumo:
1. **Só se o seu MySQL tem senha:** dentro de `RR-Turismo-Spring`, copie `application-local.properties.exemplo`, cole na mesma pasta, renomeie a cópia para `application-local.properties` e escreva sua senha nela (passo a passo detalhado no README do Spring, seção 2). **Se o MySQL não tem senha, pule este passo.**
2. **Windows:** duplo clique em `rodar.bat` · **Mac/Linux:** `./rodar.sh`
3. Aguarde `Tomcat started on port 9000` e abra http://localhost:9000

### Passo 2 — Criar uma viagem (site)
1. No site, abra **Cadastro** e crie uma conta de **Guia** ou **Empresa** (senha com no mínimo 8 caracteres).
2. Entre e abra **Criar nova viagem** no menu. Preencha, envie uma foto e salve.

### Passo 3 — Aplicativo (Mobile)
Siga o [`RR-Turismo-Mobile/README.md`](RR-Turismo-Mobile/README.md). Resumo, com o **Spring já rodando**:

```bash
cd RR-Turismo-Mobile
npm install          # só na 1ª vez: baixa as bibliotecas do app
npm run android      # abre o EMULADOR Android e o app
```

- **Emulador (principal):** instale o Android Studio, crie um aparelho em *Device Manager* e deixe-o ligado. Depois rode `npm run android`.
- **Celular (alternativo):** rode `npx expo start -c` e escaneie o QR code com o app **Expo Go** (celular e computador na **mesma rede Wi-Fi**).

A viagem criada no site aparece no app.

---

## Teste rápido (para quem vai avaliar o projeto)

1. Suba o servidor (Passo 1) e abra http://localhost:9000 — o site abre sem precisar de login.
2. Clique em **Criar conta → Viajante**, cadastre-se e veja o menu de viajante (menu no topo, rodapé, favoritos).
3. Saia, clique em **Criar conta → Guia/Empresa**, cadastre-se e entre: aparece o **painel** (menu lateral). Em **Minhas viagens → Criar viagem** publique uma viagem com foto.
4. Volte ao site como visitante: a viagem aparece no banner e no catálogo. Abra-a para ver o mapa, o guia e o coração de favoritos.
5. (Opcional) Abra o app (Passo 3) com a mesma conta: a viagem criada no site aparece no app.

> O banco começa **vazio**: as viagens aparecem depois que um guia cria a primeira.

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `javac` não encontrado / "release 17 not supported" | Instale o **JDK 21** (ou coloque-o na pasta `jdk`, veja o README do Spring) |
| Erro de conexão com o MySQL / "Access denied" | Confira se o MySQL está ligado e a senha em `application-local.properties` |
| A porta 9000 já está em uso | Feche o outro servidor Spring que estiver aberto |
| O mapa ou as fotos de destaque não aparecem | Precisam de internet (mapa e fotos de exemplo vêm da web) |
| O app não conecta no servidor | Celular e computador na **mesma rede Wi-Fi**, Spring rodando; veja o README do Mobile |

---

## Estrutura do repositório

```
RR-Turismo/
├── README.md                  ← este arquivo
├── RR-Turismo-Spring/         ← site + API (Java)
│   ├── src/                   ← código (controller, service, model, JSP, CSS, JS)
│   ├── lib/                   ← bibliotecas (.jar)
│   ├── rodar.bat / rodar.sh   ← compilam e iniciam o servidor
│   └── README.md              ← como rodar o Spring em qualquer computador
├── RR-Turismo-Mobile/         ← aplicativo (Expo / React Native)
│   ├── app/                   ← telas
│   ├── components/ services/ hooks/ ...
│   └── README.md              ← como rodar o app
├── banco/criar_banco.sql      ← script do banco (opcional)
└── docs/                      ← relatório da API e guia do Git
```

## Equipe
- **Rafael** e **Rodolfo** — Fatec Taquaritinga, Sistemas para Internet.
- Contato: WhatsApp (16) 99241-6492 (também pelo "Fale conosco" do site e do app).


