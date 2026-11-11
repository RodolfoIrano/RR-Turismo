# RR Turismo Mobile

Aplicativo do **turista** (e do guia durante a viagem), feito com **Expo SDK 58 + React Native + TypeScript**.
Mostra as viagens criadas no site, faz a compra, e acompanha a viagem **ao vivo num mapa** (sua bolinha azul, o guia e o grupo).

O app usa o servidor da pasta [`RR-Turismo-Spring`](../RR-Turismo-Spring), que precisa estar **rodando** (porta 9000).

Dá para rodar de duas formas: no **emulador Android** (principal) ou no **celular** com o Expo Go.

---

## 1. Instalar o que precisa (uma vez só)
- **Node.js 20 ou superior** — https://nodejs.org (confira com `node -v`)
- **Android Studio** — https://developer.android.com/studio (traz o emulador)
- *(Opcional)* **Expo Go** no celular, atualizado

## 2. Instalar as bibliotecas do app (uma vez por computador)
Dentro da pasta `RR-Turismo-Mobile`:
```bash
npm install
```
Isso baixa as bibliotecas para a pasta `node_modules` (inclui `expo-clipboard`, usada no "copia e cola" do Pix, e `expo-notifications`, usada nos avisos). Ela não vai para o GitHub (é pesada e se recria com esse comando), por isso é preciso rodar `npm install` depois de baixar o projeto.

## 3. Ligar o servidor
Rode o Spring antes (veja `../RR-Turismo-Spring/README.md`) e crie pelo menos uma viagem no site.

---

## Opção A — Emulador Android (principal)

**Criar o emulador (uma vez só):**
1. Abra o Android Studio → **More Actions → Virtual Device Manager** (ou *Tools → Device Manager*).
2. **Create Device** → escolha um aparelho (ex.: *Pixel 7*) → **Next**.
3. Escolha uma imagem do Android (ex.: *API 34*) e clique em *Download* se precisar → **Next → Finish**.

**Rodar o app:**
1. Clique no **▶ (Play)** ao lado do aparelho para **ligar o emulador** e espere a tela inicial do Android.
2. No terminal, dentro de `RR-Turismo-Mobile`:
   ```bash
   npm run android
   ```
   (ou `npx expo start -c` e depois aperte a tecla **a**.)
3. Na primeira vez o Expo instala o **Expo Go** no emulador sozinho e abre o app. Pode demorar alguns minutos.

> Se aparecer "adb not found", o Android Studio ainda não configurou o SDK. Abra *Settings → Languages & Frameworks → Android SDK*, anote o caminho do **Android SDK Location** e adicione a subpasta `platform-tools` ao PATH do Windows. Feche e abra o terminal de novo.

O emulador acessa o servidor do computador automaticamente.

## Opção B — Celular com Expo Go
1. Celular e computador na **mesma rede Wi-Fi**.
2. Libere a porta 9000 no firewall do computador (veja o README do Spring, seção 5).
3. Rode:
   ```bash
   npx expo start -c
   ```
4. Abra o **Expo Go** e escaneie o **QR code**. (Android: *Scan QR code* dentro do Expo Go. iPhone: câmera do celular.)

O app **descobre sozinho** o endereço do servidor. Não precisa editar nenhum arquivo.

### Se o app não achar o servidor
1. Copie `.env.exemplo` para `.env` e coloque o IP do computador:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.10:9000/api
   ```
2. Reinicie com `npx expo start -c`.

---

## Emulador e celular ao mesmo tempo (ex.: testar o radar)

Dá para usar os dois juntos, e também só um deles. Os dois conectam no **mesmo servidor do app** (o Metro), por isso o jeito mais flexível é:

1. Com o Spring ligado, no terminal dentro de `RR-Turismo-Mobile`:
   ```bash
   npm start
   ```
   Aparece um **QR code**. O servidor fica rodando.
2. **Emulador:** com o emulador ligado, aperte a tecla **a** no mesmo terminal. O app abre no emulador.
3. **Celular:** abra o Expo Go e escaneie o **QR code** do mesmo terminal.

Pronto: os dois estão no app ao mesmo tempo. E você escolhe: só o emulador (aperte `a`), só o celular (escaneie o QR) ou os dois.

> `npm run android` também liga o servidor e abre o emulador, e o QR code aparece do mesmo jeito. Só que ele **exige um emulador**: sem emulador dá erro. Por isso, prefira `npm start` + tecla `a`.

**Testando o radar com guia e turista:**
- No **emulador**, entre com a conta do **guia** (a que criou a viagem) e abra *Modo Guia*.
- No **celular**, entre com uma conta de **turista**, compre/entre na viagem e abra *Minha viagem*.
- O emulador usa uma localização **simulada**. Para ela ficar diferente da do celular, no emulador abra *Extended controls (⋯) → Location*, escolha um ponto no mapa e clique em **Send**.
- O celular precisa alcançar o servidor: mesma rede Wi-Fi e porta 9000 liberada (README do Spring, seção 5).

---

## Comprar uma viagem no app (teste)
Entre com uma conta de **Viajante**, abra uma viagem e toque em **Adicionar ao carrinho** e depois abra a aba **Carrinho** para finalizar. Na tela de pagamento (Pix, crédito, débito ou boleto) use:

- **Crédito (Visa):** `4111 1111 1111 1111` · validade `12/30` · CVV `123`
- **Débito (Mastercard):** `5555 5555 5555 4444` · validade `12/30` · CVV `123`
- **Pix:** aparece um QR Code de teste e o botão de copiar o código.

O pagamento é **simulado**, nada é cobrado. Ao confirmar, o app envia uma **notificação** de compra confirmada e agenda um lembrete para as 9h do dia anterior à viagem. Se o aparelho não permitir notificações, a compra funciona do mesmo jeito.

---

## Problemas comuns

| Sintoma | Solução |
|---|---|
| `Network request failed` / erro de API no login | Servidor desligado, firewall bloqueando a porta 9000, ou (no celular) outra rede Wi-Fi. |
| Lista de viagens vazia | Nenhuma viagem criada no site, ou o servidor não está acessível. |
| Emulador não abre o app | Deixe o emulador **já ligado** antes de rodar `npm run android`. |
| `adb not found` | Veja a nota na Opção A. |
| Mapa em branco | Precisa de internet (carrega o mapa do OpenStreetMap). Permita a localização quando o app pedir. |
| Erro de versão no Expo Go | Atualize o Expo Go (o projeto usa SDK 58). |
| Erro `Unable to resolve expo-clipboard` / `expo-notifications` | Faltou rodar `npm install` depois de baixar a versão nova. Rode `npm install` e depois `npx expo start -c`. |
| Mudei o código e a tela não atualizou | Reinicie limpando o cache: `npx expo start -c`. |
| Foto de fundo do login não aparece | Ela vem da internet. Sem conexão o app usa o fundo azul. |
| Não chegou notificação | Permita notificações quando o app pedir. No Expo Go pode haver limitações; o restante do app funciona normalmente. |

## Limitações no Expo Go
- Voz "segurar para falar" e localização com o app fechado exigem um *development build*.
- A localização funciona com o app **aberto**.
- No emulador a localização é simulada: use *Extended controls (⋯) → Location* para mudar o ponto.

## Estrutura
```
RR-Turismo-Mobile/
├── app/            ← telas (rotas do expo-router)
├── components/     ← mapa, cartões, inputs...
├── services/       ← conversa com a API (api.ts é a central)
├── hooks/          ← lógica reutilizável (ex.: viagem ao vivo)
├── contexts/ traducoes/ validacoes/ utils/ modelos/ types/ constants/
└── assets/         ← imagens e logo
```
