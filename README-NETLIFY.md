# 🚀 Deploy do Sistema de Cadastro de Clientes na Netlify

Este guia completo mostrará como fazer o deploy da sua aplicação na Netlify.

## ⚠️ Importante: Mudanças Necessárias

Como a Netlify é uma plataforma **serverless** (sem servidor persistente), fizemos algumas adaptações:

1. ✅ **Backend convertido** para Netlify Functions (funções serverless)
2. ✅ **Estrutura de pastas** ajustada para o padrão Netlify
3. ⚠️ **Banco de dados**: SQLite NÃO funciona na Netlify - você precisa usar um banco externo

## 📋 Pré-requisitos

### 1. Banco de Dados MongoDB (OBRIGATÓRIO)

SQLite não funciona em ambientes serverless porque os arquivos não persistem entre deploys. Você precisa criar um banco de dados MongoDB gratuito:

#### Opção Recomendada: MongoDB Atlas (GRATUITO)

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Crie um cluster gratuito (M0 Sandbox - FREE)
4. Configure:
   - Database Access: Crie um usuário com senha
   - Network Access: Adicione `0.0.0.0/0` (permitir de qualquer IP)
5. Clique em "Connect" → "Connect your application"
6. Copie a **Connection String** (URI de conexão)
   - Exemplo: `mongodb+srv://usuario:senha@cluster.mongodb.net/clientes_db?retryWrites=true&w=majority`

### 2. Conta na Netlify

1. Acesse: https://www.netlify.com/
2. Crie uma conta gratuita (pode usar GitHub/Google)

## 🔧 Passo a Passo: Deploy na Netlify

### Método 1: Deploy via Git (Recomendado)

#### 1. Prepare seu repositório

```bash
# Se ainda não tem um repositório Git, crie um
git init
git add .
git commit -m "Preparado para deploy na Netlify"

# Envie para o GitHub
# (Crie um repositório no GitHub primeiro)
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

#### 2. Conecte com a Netlify

1. Faça login na Netlify: https://app.netlify.com/
2. Clique em "Add new site" → "Import an existing project"
3. Escolha "Deploy with GitHub" (ou GitLab/Bitbucket)
4. Autorize a Netlify a acessar seus repositórios
5. Selecione o repositório do projeto

#### 3. Configure o Build

Na página de configuração do site:

- **Build command**: `npm install` (ou deixe vazio)
- **Publish directory**: `public`
- **Functions directory**: `netlify/functions`

#### 4. Configure as Variáveis de Ambiente (OBRIGATÓRIO)

Antes de fazer o deploy, você PRECISA configurar as variáveis de ambiente:

1. No painel da Netlify, vá em **Site settings** → **Environment variables**
2. Clique em "Add a variable"
3. Adicione as seguintes variáveis:

   **a) MONGODB_URI** (OBRIGATÓRIO)
   - **Key**: `MONGODB_URI`
   - **Value**: Sua connection string do MongoDB Atlas
   - Exemplo: `mongodb+srv://usuario:senha@cluster.mongodb.net/clientes_db?retryWrites=true&w=majority`
   - **IMPORTANTE**: Substitua `usuario` e `senha` pelos dados reais do seu banco!

   **b) JWT_SECRET** (OBRIGATÓRIO - Segurança)
   - **Key**: `JWT_SECRET`
   - **Value**: Uma string longa e aleatória para assinar os tokens de autenticação
   - Exemplo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
   - **Como gerar**: Execute no terminal: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - **IMPORTANTE**: Use uma chave DIFERENTE e ÚNICA para o seu projeto! Nunca compartilhe essa chave!

#### 5. Deploy

1. Clique em "Deploy site"
2. Aguarde o build terminar (1-3 minutos)
3. Seu site estará disponível em: `https://nome-aleatorio.netlify.app`

### Método 2: Deploy via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Inicializar o projeto
netlify init

# Configurar variáveis de ambiente
netlify env:set MONGODB_URI "sua-connection-string-aqui"
netlify env:set JWT_SECRET "$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"

# Fazer deploy
netlify deploy --prod
```

## 📊 Inicializar o Banco de Dados

Após o deploy, você precisa criar o usuário inicial no MongoDB. Temos duas opções:

### Opção 1: Via MongoDB Compass (Interface Gráfica)

1. Baixe MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Conecte usando sua Connection String
3. Crie o banco `clientes_db`
4. Crie a collection `users`
5. Insira um documento:

```json
{
  "username": "Sky",
  "password": "$2b$10$XYZ..." 
}
```

**Nota**: Para gerar o hash da senha, use o script abaixo.

### Opção 2: Script de Inicialização

Crie um arquivo `setup-mongodb.js` no seu projeto:

```javascript
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'SUA_CONNECTION_STRING_AQUI';

async function setup() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB!');
    
    const db = client.db('clientes_db');
    
    // Criar usuário padrão
    const users = db.collection('users');
    const hash = await bcrypt.hash('Skandin00', 10);
    
    await users.insertOne({
      username: 'Sky',
      password: hash
    });
    
    console.log('✓ Usuário padrão criado!');
    console.log('Username: Sky');
    console.log('Password: Skandin00');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

setup();
```

Execute:
```bash
node setup-mongodb.js
```

## 🎯 Credenciais Padrão

Após configurar o banco:

- **Usuário**: Sky
- **Senha**: Skandin00

**⚠️ IMPORTANTE**: Altere essas credenciais em produção!

## ✅ Verificar se está Funcionando

1. Acesse seu site: `https://seu-site.netlify.app`
2. Tente fazer login com as credenciais padrão
3. Tente cadastrar um cliente
4. Verifique se os dados foram salvos no MongoDB

## 🔍 Troubleshooting (Solução de Problemas)

### Erro: "Internal Server Error" ao fazer login

**Causa**: Variável de ambiente `MONGODB_URI` não configurada
**Solução**: Configure a variável no painel da Netlify (veja passo 4)

### Erro: "Network Error" ou timeout

**Causa**: IP não autorizado no MongoDB Atlas
**Solução**: 
1. Acesse MongoDB Atlas
2. Vá em "Network Access"
3. Adicione `0.0.0.0/0` para permitir todos os IPs

### Erro: "Authentication failed"

**Causa**: Usuário/senha incorretos na connection string
**Solução**: Verifique se substituiu corretamente na URI

### Página não carrega / 404 Error

**Causa**: Publish directory incorreto
**Solução**: Certifique-se que está configurado como `public`

### Functions não funcionam

**Causa**: Functions directory não configurado
**Solução**: Configure `netlify/functions` como Functions directory

## 📁 Estrutura de Arquivos para Netlify

```
seu-projeto/
├── public/              # Arquivos estáticos (frontend)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── netlify/
│   └── functions/       # Funções serverless (backend)
│       ├── utils/       # Utilitários compartilhados
│       │   ├── auth.js      # Autenticação JWT
│       │   └── mongodb.js   # Conexão MongoDB
│       ├── login.js
│       ├── cadastrar.js
│       ├── clientes.js
│       └── logout.js
├── netlify.toml         # Configuração da Netlify
├── package.json
└── README-NETLIFY.md    # Este arquivo
```

## 🔐 Segurança

### ✅ Recursos de Segurança Implementados:

1. **Autenticação JWT**: Tokens seguros com assinatura criptográfica e expiração de 7 dias
2. **Cookies HttpOnly**: Proteção contra ataques XSS
3. **Cookies Secure**: Funcionam apenas em HTTPS (produção)
4. **Validação de Tokens**: Todas as rotas protegidas verificam autenticidade
5. **MongoDB Connection**: Reutilização de conexões para melhor performance
6. **Variáveis de Ambiente**: Credenciais nunca expostas no código

### Melhorias Recomendadas para Produção:

1. **Altere as credenciais padrão** (usuário e senha)
2. **Use um JWT_SECRET único e forte** (nunca use o valor de exemplo)
3. **Implemente rate limiting** para prevenir ataques de força bruta
4. **Configure CORS** específico para seu domínio (opcional)
5. **Monitore os logs** da Netlify regularmente
6. **Backup do MongoDB**: Configure backups automáticos no Atlas

## 💰 Custos

- **Netlify**: Plano gratuito (100GB de banda, 300 build minutes/mês)
- **MongoDB Atlas**: Plano M0 gratuito (512MB de armazenamento)
- **Total**: R$ 0,00 para projetos pequenos!

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs da Netlify: Site → Functions → Ver logs
2. Verifique a conexão do MongoDB no MongoDB Atlas
3. Consulte a documentação:
   - Netlify: https://docs.netlify.com/
   - MongoDB: https://docs.mongodb.com/

## 🎉 Pronto!

Seu sistema de cadastro de clientes está agora rodando na Netlify com banco de dados MongoDB!

---

**Desenvolvido e adaptado para Netlify** 
Versão: 1.0 - Outubro 2025
