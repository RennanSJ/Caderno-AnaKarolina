# Caderno de Erros — Ana Karolina

Aplicativo web para registrar, classificar, revisar e acompanhar a superação dos erros de estudo para concursos públicos.

- **Tecnologia:** React, TypeScript, Tailwind CSS e Vite
- **Login e dados:** Firebase (login com Google e banco Firestore), no plano gratuito
- **Hospedagem:** Netlify, no endereço `caderno-ana-karolina.netlify.app`
- **Instalável como aplicativo (PWA):** abre com ícone na tela do celular e funciona sem internet

Cada conta Google que entrar tem o próprio caderno, privado. Tudo é gravado no aparelho na hora e sincronizado com a conta. Sem internet, as alterações ficam guardadas e sobem sozinhas quando a conexão volta.

---

## Passo a passo para colocar no ar

Leva uns 30 minutos na primeira vez. Você vai precisar de três contas gratuitas: Google, GitHub e Netlify.

### 1. Criar o projeto no Firebase

1. Acesse **console.firebase.google.com** e entre com a sua conta Google.
2. Clique em **Criar um projeto** (ou **Adicionar projeto**). Dê o nome `caderno-de-erros`. O Google Analytics pode ficar desativado.
3. Na página do projeto, clique no ícone **`</>`** (Web) para adicionar um app.
4. Dê o apelido `site` e clique em **Registrar app**. Não marque o Firebase Hosting.
5. Aparece um bloco de código com `const firebaseConfig = { ... }`. **Deixe essa tela aberta**: você vai copiar os seis valores dele no passo 6.

### 2. Ativar o login com Google

1. No menu da esquerda, abra **Criação → Authentication** e clique em **Vamos começar**.
2. Na aba **Método de login**, escolha **Google**, ative e escolha seu e-mail como e-mail de suporte. Salve.

### 3. Criar o banco de dados

1. No menu, abra **Criação → Firestore Database** e clique em **Criar banco de dados**.
2. Local: escolha **southamerica-east1 (São Paulo)**.
3. Escolha **Iniciar no modo de produção** e conclua.
4. Abra a aba **Regras**, apague o que estiver lá e cole o conteúdo do arquivo `firestore.rules` deste projeto. Clique em **Publicar**.

Essas regras garantem que cada pessoa só veja e altere o próprio caderno.

### 4. Autorizar o endereço do site

1. Em **Authentication → Configurações → Domínios autorizados**, clique em **Adicionar domínio**.
2. Digite `caderno-ana-karolina.netlify.app` e salve.

Sem isso, o botão **Entrar com Google** mostra o aviso de endereço não autorizado.

### 5. Enviar o código para o GitHub

1. Acesse **github.com**, crie a conta se ainda não tiver e clique em **New repository**.
2. Nome: `caderno-de-erros`. Pode deixar **Private**. Clique em **Create repository**.
3. Na página do repositório vazio, clique em **uploading an existing file**.
4. Descompacte o arquivo `.zip` no computador, abra a pasta `caderno-ana-karolina` e **arraste todo o conteúdo dela** (não a pasta em si) para a página do GitHub.
5. Clique em **Commit changes**.

### 6. Publicar no Netlify

1. Acesse **app.netlify.com** e entre com a conta do GitHub.
2. Clique em **Add new site → Import an existing project → GitHub** e escolha o repositório `caderno-de-erros`.
3. As configurações de build já vêm do arquivo `netlify.toml`. Não mude nada.
4. Em **Site name**, escreva `caderno-ana-karolina`.
5. Antes de publicar, clique em **Add environment variables** e cadastre estes seis valores, copiados da tela do passo 1:

| Variável no Netlify | Valor no `firebaseConfig` |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

Esses valores identificam o seu projeto e podem ficar no site; quem protege os dados são as regras do passo 3.

6. Clique em **Deploy**. Em um ou dois minutos o site estará em **https://caderno-ana-karolina.netlify.app**.

Se você cadastrar as variáveis depois do primeiro deploy, vá em **Deploys → Trigger deploy → Deploy site** para publicar de novo com elas.

### 7. Trazer os erros que você já registrou

1. No caderno antigo, abra **Backup e configurações → Exportar backup**.
2. No site novo, entre com a sua conta, abra **Backup e configurações → Importar** e escolha o arquivo.

A importação não apaga nem duplica registros. Registros sem origem entram como "Não classificado".

### 8. Instalar no celular

Abra o site no celular e entre com a conta.

- **Android (Chrome):** menu ⋮ → **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** botão Compartilhar → **Adicionar à Tela de Início**.

No computador, o Chrome e o Edge mostram um ícone de instalar na barra de endereço. A página **Backup e configurações** também mostra o botão **Instalar** quando o navegador permite.

---

## Como alterar o site depois

Qualquer mudança enviada ao GitHub é publicada sozinha pelo Netlify em cerca de um minuto.

- **Pelo navegador (até no celular):** abra o arquivo no GitHub, clique no lápis ✏️, edite e clique em **Commit changes**.
- **Frases motivacionais:** ficam em `src/constants.ts`, na lista `FRASES`.
- **Matérias sugeridas no formulário:** `MATERIAS_SUGERIDAS`, no mesmo arquivo.
- **Cores:** variáveis no início de `src/index.css`.
- **Ilustração:** substitua `public/avatar.webp` por outra imagem com o mesmo nome.

Se um deploy falhar, o Netlify mantém a versão anterior no ar. Abra **Deploys**, clique no deploy com erro e veja o motivo no log.

## Rodar no computador (opcional)

Precisa do Node.js 20 ou mais novo.

```bash
npm install
cp .env.example .env     # preencha com os valores do Firebase
npm run dev              # abre em http://localhost:5173
npm run typecheck        # verifica os tipos do TypeScript
```

Para testar o login localmente, `localhost` já vem autorizado no Firebase. Sem o arquivo `.env`, o app funciona só com o armazenamento do navegador e mostra um aviso no cabeçalho.

## Estrutura

```
src/
  App.tsx              cabeçalho, menu, login e janelas
  constants.ts         classificações, origens, frases e matérias sugeridas
  types.ts             formato dos dados
  lib/
    caderno.ts         regras: contagens, filtros, catálogo sem duplicação, backup
    useCaderno.ts      armazenamento local e sincronização com o Firestore
    firebase.ts        conexão e login com Google
    install.ts         instalação como aplicativo
  views/               Dashboard, Meus erros, Segundo ciclo, Minha evolução,
                       Matérias e tópicos, Backup e configurações, Login
  components/          ícones, gráficos, formulário, revisão e confirmações
firestore.rules        regras de segurança do banco
netlify.toml           configuração de build e publicação
```

## Custos

O plano gratuito do Firebase (Spark) e o do Netlify cobrem com folga o uso de um caderno pessoal.
