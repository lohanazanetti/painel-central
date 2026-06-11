# Setup do Painel Central Creator Mobile

Guia passo a passo para configurar o Firebase e o Cloudflare Worker. Escrito para quem não é dev.

## 1. Criar o projeto Firebase

1. Acesse https://console.firebase.google.com/ e faça login com sua conta Google.
2. Clique em "Adicionar projeto".
3. Dê o nome `painel-central-creator` (ou outro nome de sua preferência).
4. Pode desativar o Google Analytics (não é necessário para esse projeto).
5. Clique em "Criar projeto" e aguarde a finalização.

### 1.1. Criar o Firestore

1. No menu lateral, clique em "Firestore Database".
2. Clique em "Criar banco de dados".
3. Escolha o modo "Produção".
4. Selecione a localização `southamerica-east1` (São Paulo) ou a mais próxima de você.
5. Clique em "Ativar".

### 1.2. Configurar as regras de segurança

Na aba "Regras" do Firestore, cole o conteúdo abaixo (vamos ajustar conforme avançarmos nas fases):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Coleções dos clientes: leitura pública (para os links públicos),
    // escrita apenas autenticada (admin)
    match /clientes/{clienteId}/posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /clientes/{clienteId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 1.3. Ativar autenticação

1. No menu lateral, clique em "Authentication".
2. Clique em "Vamos começar".
3. Ative o provedor "E-mail/senha".
4. Na aba "Users", adicione manualmente seu usuário admin (e-mail e senha que você vai usar para logar no painel).

### 1.4. Pegar as credenciais do projeto (Firebase Config)

1. Clique no ícone de engrenagem > "Configurações do projeto".
2. Em "Seus aplicativos", clique no ícone "</>" (Web) para registrar um novo app.
3. Dê o nome `painel-central-web` e clique em "Registrar app".
4. Copie o objeto `firebaseConfig` que aparece (algo como abaixo). Vamos colar isso no arquivo `js/firebase-config.js` do projeto:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Guarde esses dados, vou pedir para você colar aqui no projeto quando chegarmos nessa etapa.

## 2. Criar o Cloudflare Worker (usado na Fase 2)

Esse passo só será necessário quando formos implementar o comando de voz (Fase 2). Por enquanto, deixe anotado:

1. Crie uma conta gratuita em https://dash.cloudflare.com/
2. No menu lateral, vá em "Workers & Pages".
3. Clique em "Create application" > "Create Worker".
4. Dê um nome, por exemplo `painel-central-voz`.
5. Vamos colar o código do Worker quando chegarmos na Fase 2.
6. Em "Settings" > "Variables", adicione uma variável secreta `ANTHROPIC_API_KEY` com a chave da API Claude (a mesma com os créditos de 5 dólares já disponíveis).

## 3. GitHub Pages

O repositório já está criado: `lohanazanetti/painel-central`. Para publicar:

1. No GitHub, vá em "Settings" > "Pages".
2. Em "Source", selecione a branch principal (`main`) e a pasta raiz (`/`).
3. Salve. O painel ficará disponível em `https://lohanazanetti.github.io/painel-central/`.

## Status

- [ ] Projeto Firebase criado
- [ ] Firestore configurado com regras
- [ ] Authentication com e-mail/senha ativado
- [ ] Firebase Config copiado para o projeto
- [ ] GitHub Pages ativado
- [ ] Cloudflare Worker criado (Fase 2)
