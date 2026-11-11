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

## O que o projeto faz

**Site (Spring):**
- Cadastro e login de **Viajante**, **Guia** e **Empresa** (o mesmo login serve no app).
- Guias e empresas criam e gerenciam viagens, com fotos, datas e vagas.
- Viajantes veem as viagens, favoritam, **adicionam ao carrinho** ou **compram direto**.
- **Compra de teste** com Pix (QR Code), cartão de crédito (até 6x), cartão de débito e boleto. Nenhum dinheiro de verdade é cobrado.
- **Minhas compras** (histórico com código da reserva), perfil do viajante e **perfil público do guia** (`/guias/{id}`).
- Idioma em português, inglês e outros, pelo botão flutuante.

**Aplicativo (Mobile):**
- Mesmas viagens, login, favoritos, carrinho e tela de compra (Pix, crédito, débito e boleto).
- **Notificações** no celular: compra confirmada e um lembrete às 9h do dia anterior à viagem.
- Perfil do guia com banner, rodapé com contatos e acompanhamento da viagem ao vivo no mapa.

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

### Passo 2.5 — Comprar uma viagem (compra de teste)
1. Saia da conta de guia e crie (ou entre numa) conta de **Viajante**. *Guias e empresas não compram, só criam viagens.*
2. Abra uma viagem, escolha a quantidade e clique em **Comprar agora** ou **Adicionar ao carrinho**.
3. Na tela de pagamento use os **dados de teste** abaixo. O pagamento é **simulado**: aparece "Aprovado (teste)" e nada é cobrado.

| Forma | O que preencher |
|---|---|
| **Cartão de crédito** (Visa) | Número `4111 1111 1111 1111` · Validade `12/30` · CVV `123` · escolha a bandeira **Visa** |
| **Cartão de débito** (Mastercard) | Número `5555 5555 5555 4444` · Validade `12/30` · CVV `123` · escolha a bandeira **Mastercard** |
| **Pix** | Aparece um QR Code e o código "copia e cola" de teste. Clique em confirmar. |
| **Boleto** | Aparece um boleto de teste. Clique em confirmar. |

- A bandeira escolhida precisa combinar com o número do cartão (Visa começa com 4, Mastercard com 5).
- Nome do titular: qualquer um. Só a bandeira e os 4 últimos dígitos ficam guardados.
- A compra aparece em **Minhas compras** (site e app), com o código da reserva (`RR2026...`).

### Passo 3 — Aplicativo (Mobile)
Siga o [`RR-Turismo-Mobile/README.md`](RR-Turismo-Mobile/README.md). Resumo, com o **Spring já rodando**:

```bash
cd RR-Turismo-Mobile
npm install          # só na 1ª vez: baixa as bibliotecas do app
npm run android      # abre o EMULADOR Android e o app
```

> **Atenção:** esta versão do app usa bibliotecas novas (`expo-clipboard` e `expo-notifications`). Se você já tinha o projeto baixado, rode `npm install` de novo antes de abrir o app.

- **Emulador (principal):** instale o Android Studio, crie um aparelho em *Device Manager* e deixe-o ligado. Depois rode `npm run android`.
- **Celular (alternativo):** rode `npx expo start -c` e escaneie o QR code com o app **Expo Go** (celular e computador na **mesma rede Wi-Fi**).

A viagem criada no site aparece no app.

---

## Problemas comuns

| Sintoma | Solução |
|---|---|
| Ao salvar o perfil/viagem com foto o site volta para o início | Foto muito grande para o MySQL do XAMPP. O site já reduz a imagem, mas por segurança coloque `max_allowed_packet=64M` no `my.ini` do MySQL (XAMPP: `C:\xampp\mysql\bin\my.ini`, seção `[mysqld]`) e reinicie o MySQL. |
| No app, a foto de fundo do login não aparece | Ela é carregada da internet. Sem conexão o app mostra o fundo azul, e o resto funciona normalmente. |
| O app não mostra as viagens | Spring desligado ou porta 9000 bloqueada. No emulador o app acessa o servidor em `10.0.2.2:9000` sozinho. |
| Perdi as contas depois de mexer no XAMPP | Os dados ficam na pasta `data` do MySQL. Não substitua essa pasta; faça backup pelo phpMyAdmin (**Exportar**) e guarde o `.sql`. |

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
- **Web (Spring):** site e criação das viagens — _nome do integrante_
- **Mobile:** aplicativo do turista — _nome do integrante_

Guia para subir e atualizar este repositório: [`docs/GUIA_GIT.md`](docs/GUIA_GIT.md)
