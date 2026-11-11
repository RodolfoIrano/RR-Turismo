# RR Turismo — Spring (site + API)

Servidor Java que entrega o **site** (páginas JSP para guias/empresas) e a **API REST** (`/api/**`) usada pelo aplicativo Mobile.
Roda na porta **9000** e guarda tudo num banco **MySQL** chamado `turismo_db`.

Este guia serve para **qualquer computador** (Windows, Mac ou Linux), do zero.

---

## 1. Instalar o que precisa

### 1.1 Java (JDK 17 ou superior)
1. Baixe o **Temurin 21** em https://adoptium.net e instale (marque a opção de adicionar ao PATH / `JAVA_HOME`).
2. Abra um terminal **novo** e confira:
   ```
   java -version
   javac -version
   ```
   Os dois precisam mostrar **17 ou mais** (o recomendado é o 21). Se o `javac` der erro, você instalou o JRE em vez do JDK.

#### Não consigo instalar o Java (computador da escola / sem administrador)
Dá para usar o JDK **sem instalar**, só extraindo uma pasta:
1. Baixe o JDK 21 em formato **.zip**: https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse
   (ou em https://adoptium.net → *Temurin 21* → Windows, x64, **JDK**, arquivo **.zip**).
2. Extraia o zip. Vai sair uma pasta com nome parecido com `jdk-21.0.x+y`.
3. Dentro dessa pasta tem que existir `bin`, `lib` etc. Renomeie a pasta para **`jdk`** e coloque-a **dentro de `RR-Turismo-Spring`**, ao lado do `rodar.bat`.
   O caminho final precisa ser: `RR-Turismo-Spring\jdk\bin\javac.exe`.
4. Dê duplo clique no `rodar.bat`. Ele usa essa pasta `jdk` automaticamente (a pasta não vai para o GitHub).

> Versões muito novas (24 ou mais) podem falhar com o Lombok. Prefira o JDK **21**.

### 1.2 MySQL 8
1. Baixe o **MySQL Installer** em https://dev.mysql.com/downloads/installer/ (ou use XAMPP / MariaDB).
2. Durante a instalação defina uma **senha para o usuário `root`** e **anote**.
3. Deixe o serviço MySQL **ligado** (porta `3306`).

Não precisa criar tabelas: o Spring cria o banco `turismo_db` e todas as tabelas sozinho.

---

## 2. Configurar a senha do banco

O Spring entra no MySQL com o usuário **`root`**. Por segurança, a senha **não fica no código** (o código vai para o GitHub). Ela fica num arquivo pessoal do seu computador.

### Caso A — Seu MySQL **não tem senha**
**Não faça nada.** Pule para o passo 3. O projeto já vem pronto para usuário `root` sem senha.

### Caso B — Seu MySQL **tem senha**
Você vai **copiar um arquivo modelo e colar na mesma pasta**, só com outro nome.

**Onde:** tudo acontece dentro da pasta `RR-Turismo-Spring`. Nela você vê, entre outros: `lib`, `src`, `rodar.bat` e um arquivo chamado **`application-local.properties.exemplo`**.

1. Dentro da pasta `RR-Turismo-Spring`, clique com o **botão direito** em `application-local.properties.exemplo` e escolha **Copiar**.
2. Ainda **na mesma pasta** (`RR-Turismo-Spring`), clique com o botão direito num espaço vazio e escolha **Colar**.
   Vai aparecer um segundo arquivo: `application-local.properties - Copia.exemplo` (ou parecido).
3. Clique com o botão direito nesse arquivo novo → **Renomear**, apague tudo e digite **exatamente**:
   ```
   application-local.properties
   ```
   Aperte Enter. Se o Windows avisar que o arquivo pode ficar inutilizável, clique em **Sim**.
   > Se você não vê o `.exemplo` no fim dos nomes, ative em **Exibir → Mostrar → Extensões de nomes de arquivos** (no Explorador de Arquivos).
4. Abra o arquivo novo (botão direito → **Abrir com** → Bloco de Notas, ou VS Code) e troque o texto depois de `password=` pela senha do seu MySQL:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=SUA_SENHA_AQUI
   ```
5. Salve (`Ctrl + S`).

Ao final, a pasta `RR-Turismo-Spring` terá **os dois arquivos**: o `.exemplo` (modelo, continua lá) e o `application-local.properties` (o seu, com a senha).

*Atalho pelo terminal* (dentro da pasta `RR-Turismo-Spring`): `cp application-local.properties.exemplo application-local.properties` (Git Bash / Mac / Linux) ou `copy application-local.properties.exemplo application-local.properties` (Prompt de Comando).

Esse arquivo é só seu e **nunca vai para o Git**.

*Outro usuário do MySQL?* No mesmo arquivo troque `root` pelo seu usuário.

---

## 3. Rodar

| Sistema | Como |
|---|---|
| **Windows** | Duplo clique em **`rodar.bat`** (ou, no terminal: `.\rodar.bat`) |
| **Mac / Linux** | No terminal: `chmod +x rodar.sh` (só na 1ª vez) e depois `./rodar.sh` |

O script compila o projeto e inicia o servidor. Espere aparecer:

```
Tomcat started on port 9000
```

Abra no navegador: **http://localhost:9000**

Para parar: `Ctrl + C` na janela do terminal.

> **Não use o botão "Run" do VS Code.** Ele pode usar outra versão do Java e dar erro `Unsupported class file major version`. Use sempre o `rodar.bat` / `rodar.sh`.

---

## 4. Primeiro uso

1. Em http://localhost:9000 abra o **Cadastro** e crie uma conta de **Guia** ou **Empresa** (senha com no mínimo 8 caracteres).
2. Entre e use **Criar viagem**: preencha os dados, as datas, envie uma foto (até 20 MB) e salve.
3. A viagem aparece no site e no aplicativo Mobile.
4. Para testar a compra, entre com uma conta de **Viajante** (guias e empresas não compram), abra a viagem e clique em **Comprar agora** ou **Adicionar ao carrinho**. Cartão de teste: `4111 1111 1111 1111`, validade `12/30`, CVV `123`, bandeira Visa. O pagamento é simulado e nada é cobrado. As compras ficam em **Minhas compras**.

---

## 5. Usar com o aplicativo no celular

O celular precisa alcançar o computador pela rede:
1. Computador e celular na **mesma rede Wi-Fi**.
2. Libere a porta 9000 no firewall.
   **Windows** (terminal como Administrador):
   ```
   netsh advfirewall firewall add rule name="RR Turismo 9000" dir=in action=allow protocol=TCP localport=9000
   ```
3. Teste no navegador do celular: `http://IP-DO-COMPUTADOR:9000/api/viagens` (deve mostrar um texto JSON, mesmo que vazio `[]`).
   Para descobrir o IP: `ipconfig` (Windows) ou `ifconfig` / `ip a` (Mac/Linux).

---

## 6. Estrutura

```
RR-Turismo-Spring/
├── src/
│   ├── application.properties      ← porta, banco, upload
│   ├── com/projeto/
│   │   ├── Principal.java          ← classe que inicia tudo
│   │   ├── controller/             ← rotas do site e da API
│   │   ├── service/  repository/   ← regras e acesso ao banco
│   │   ├── model/  dto/            ← tabelas e formatos da API
│   │   ├── security/ interceptor/  ← login, token do app
│   │   └── aovivo/                 ← rastreio ao vivo da viagem
│   └── main/
│       ├── webapp/view/            ← páginas JSP
│       └── resources/              ← css, js e imagens
├── lib/                            ← bibliotecas .jar
├── rodar.bat / rodar.sh
└── application-local.properties.exemplo
```

---

## 7. Problemas comuns

| Mensagem / sintoma | Causa e solução |
|---|---|
| `Access denied for user 'root'` | Seu MySQL tem senha: crie o `application-local.properties` (passo 2, caso B) ou corrija a senha dele. |
| `Communications link failure` / `Connection refused` | MySQL desligado. Ligue o serviço do MySQL. |
| `Port 9000 was already in use` | Já há um servidor rodando. Feche a janela antiga (ou o processo `java`). |
| `release version 17 not supported` | Seu `javac` é mais antigo que 17 (ex.: Java 8 ou 11). Instale o JDK 21 e confira com `javac -version`. |
| `Unsupported class file major version` | Você rodou pelo botão Run do VS Code. Use `rodar.bat` / `rodar.sh`. |
| Código cheio de linhas vermelhas no VS Code, mas o servidor roda | É só o editor. `Ctrl+Shift+P` → **Java: Clean Java Language Server Workspace** → **Restart and delete**. Abra a pasta `RR-Turismo-Spring` direto (não a pasta de cima). |
| Erro ao criar viagem com foto grande | O limite é 20 MB. Use uma foto menor. |
| Salvar perfil/viagem com foto volta para o início | O MySQL do XAMPP aceita pacotes de 1 MB por padrão. O site já reduz as fotos, mas coloque `max_allowed_packet=64M` na seção `[mysqld]` do `my.ini` (`C:\xampp\mysql\bin\my.ini`) e reinicie o MySQL. |
