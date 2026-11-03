# Guia do Git — subir o RR Turismo para o GitHub

Objetivo: ter **um único link** com o Spring e o Mobile dentro, para entregar na inscrição da feira e para o professor.
No fim o link será: `https://github.com/RodolfoIrano/RR-Turismo`

---

## Parte 1 — Preparar (só na primeira vez)

### 1. Criar conta no GitHub
Acesse https://github.com/signup e crie a conta (guarde o **nome de usuário**).

### 2. Instalar o Git
- Windows: https://git-scm.com/download/win (instalar clicando *Next* em tudo).
- Depois, abra um terminal **novo** (PowerShell ou o terminal do VS Code) e confira:
  ```
  git --version
  ```

### 3. Dizer ao Git quem é você
```
git config --global user.name "Seu Nome"
git config --global user.email "o-mesmo-email-do-github@exemplo.com"
```

---

## Parte 2 — Criar o repositório no GitHub (a "caixa" vazia)

1. No GitHub, clique no **+** (canto superior direito) → **New repository**.
2. **Repository name:** `RR-Turismo`
3. Marque **Public** (assim o professor e a feira abrem o link sem precisar de convite).
4. **NÃO marque** "Add a README", ".gitignore" nem "license" (o projeto já tem).
5. Clique em **Create repository**.

A página seguinte mostra o endereço, parecido com `https://github.com/SEU-USUARIO/RR-Turismo.git`. Copie.

---

## Parte 3 — Enviar o projeto

1. **Extraia** o zip `RR-Turismo.zip`. Você terá a pasta `RR-Turismo` com `RR-Turismo-Spring`, `RR-Turismo-Mobile`, `banco` e `docs` dentro.
2. Abra essa pasta **`RR-Turismo`** no VS Code (*File → Open Folder*) e abra o terminal (*Terminal → New Terminal*).
3. Rode **um comando por vez** (troque `SEU-USUARIO`):
   ```
   git init
   git branch -M main
   git add .
   git commit -m "Primeira versão do RR Turismo (Spring + Mobile)"
   git remote add origin https://github.com/SEU-USUARIO/RR-Turismo.git
   git push -u origin main
   ```
4. No `git push` vai abrir uma janela do navegador pedindo para entrar no GitHub: faça login e autorize.
   O envio leva alguns minutos (a pasta `lib` tem ~55 MB).
5. Atualize a página do repositório: devem aparecer as pastas e o `README.md` com as instruções.

### Conferir antes de entregar
- [ ] Aparecem `RR-Turismo-Spring`, `RR-Turismo-Mobile`, `banco`, `docs` e o `README.md`.
- [ ] Dentro de `RR-Turismo-Spring` existe a pasta `lib`.
- [ ] **Não** existe `application-local.properties` (é onde fica a sua senha do MySQL — o `.gitignore` já impede).
- [ ] Não existe `node_modules` nem `bin`.

### O link para a feira e para o professor
```
https://github.com/SEU-USUARIO/RR-Turismo
```
Na tela inicial do repositório o `README.md` já ensina a **baixar** (Code → Download ZIP, ou `git clone`) e a **rodar**.

---

## Parte 4 — Testar como o professor vai testar
Em outra pasta (ou outro computador):
```
git clone https://github.com/SEU-USUARIO/RR-Turismo.git
```
e siga o `README.md`. Se funcionar do zero, está perfeito.

---

## Parte 5 — Modificar o projeto depois (dia a dia)

Sempre que mudar algo:
```
git status
git add .
git commit -m "Descreva o que mudou"
git push
```
Para pegar mudanças feitas por outra pessoa (ex.: o colega do site):
```
git pull
```

### Trabalhar em dupla (você + colega do Spring)
No GitHub: repositório → **Settings → Collaborators → Add people** e coloque o usuário do colega.
Ele faz `git clone`, altera, e usa `git add . / git commit / git push`. Antes de começar a mexer, sempre rode `git pull`.

### Pedir ajuda para corrigir
Com o projeto no GitHub, basta me passar o `usuario/RR-Turismo` (e o erro que apareceu). Eu leio o código direto do repositório e aponto/ajusto as correções.

---

## Se algo der errado

| Mensagem | O que fazer |
|---|---|
| `warning: LF will be replaced by CRLF` (ou o contrário) | É só um aviso do Windows sobre quebra de linha. **Pode ignorar**, o envio continua normal. |
| `git: command not found` / "não reconhecido" | Instale o Git e **abra um terminal novo**. |
| `remote origin already exists` | `git remote set-url origin https://github.com/SEU-USUARIO/RR-Turismo.git` |
| `failed to push ... rejected` | Alguém mudou o repositório. Rode `git pull --rebase` e depois `git push`. |
| `Authentication failed` | Refaça o login na janela do navegador, ou use um *Personal Access Token* (GitHub → Settings → Developer settings → Tokens) como senha. |
| Subiu a senha do MySQL sem querer | **Troque a senha do MySQL** imediatamente (apagar o arquivo depois não remove do histórico). |
