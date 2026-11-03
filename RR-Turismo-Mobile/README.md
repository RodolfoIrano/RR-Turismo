# RR Turismo Mobile

Aplicativo do **turista** (e do guia durante a viagem), feito com **Expo SDK 58 + React Native + TypeScript**.
Mostra as viagens criadas no site, faz a compra, e acompanha a viagem **ao vivo num mapa** (sua bolinha azul, o guia e o grupo).

O app usa o servidor da pasta [`RR-Turismo-Spring`](../RR-Turismo-Spring) — ele precisa estar **rodando**.

---

## 1. Instalar o que precisa
- **Node.js 20 ou superior** — https://nodejs.org (`node -v` para conferir)
- **Expo Go** no celular, atualizado (Play Store / App Store)
- Celular e computador na **mesma rede Wi-Fi**

## 2. Instalar as dependências
Dentro desta pasta (`RR-Turismo-Mobile`):
```bash
npm install
```

## 3. Ligar o servidor
Rode o Spring antes (veja `../RR-Turismo-Spring/README.md`) e crie pelo menos uma viagem no site.

## 4. Iniciar o app
```bash
npx expo start -c
```
Abra o **Expo Go** e escaneie o **QR code** do terminal.
(Android: botão *Scan QR code* dentro do Expo Go. iPhone: câmera do celular.)

O app **descobre sozinho** o endereço do servidor (usa o IP do computador que está rodando o `expo start`). Não precisa editar nenhum arquivo.

### Emulador Android
Funciona do mesmo jeito; se não achar o servidor, ele tenta `10.0.2.2` automaticamente.

### Se o app não achar o servidor
1. Copie `.env.exemplo` para `.env` e coloque o IP do computador:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.10:9000/api
   ```
2. Reinicie com `npx expo start -c`.

---

## Problemas comuns

| Sintoma | Solução |
|---|---|
| `Network request failed` / "erro de API" no login | Servidor desligado, ou firewall bloqueando a porta 9000 (veja o README do Spring, seção 5), ou celular em outra rede. |
| Lista de viagens vazia | Nenhuma viagem criada no site ainda, ou o servidor não está acessível. |
| Mapa em branco | Precisa de internet no celular (carrega o mapa do OpenStreetMap). Permita a localização quando o app pedir. |
| Erro de versão no Expo Go | Atualize o Expo Go (o projeto usa SDK 58). |

## Limitações do Expo Go
- Voz "segurar para falar" e localização com o app fechado exigem um *development build*.
- A localização funciona com o app **aberto**.

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
