# RR Turismo

Plataforma de turismo com **site para guias/empresas** (Spring Boot) e **aplicativo para turistas** (React Native / Expo).
Os dois usam o **mesmo servidor, o mesmo banco de dados e o mesmo login**.

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
└── docs/                      ← relatório da API 
```

## Equipe
- **Web (Spring):** site e criação das viagens — Rafael Rodrigues
- **Mobile:** aplicativo do turista — Rodolfo Miguel Irano


