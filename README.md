# 📋 Sistema de Cadastro de Clientes

Sistema web profissional para gerenciamento de cadastro de clientes com autenticação segura e banco de dados PostgreSQL.

## 🚀 Deploy Rápido no Render (Recomendado)

**Custo: $0-7/mês** | **Tempo: 15 minutos** | **Garantia: Zero perda de dados**

👉 **[SIGA O GUIA COMPLETO AQUI](GUIA-RENDER.md)** 👈

O guia inclui:
- ✅ Passo a passo detalhado com screenshots
- ✅ Como migrar seus dados existentes com segurança
- ✅ Configurar backup automático
- ✅ Manter grátis 24/7 com truque do UptimeRobot
- ✅ Solução de problemas comuns

## 📊 O que este sistema faz?

- 🔐 Login seguro com bcrypt
- 👥 Cadastro completo de clientes em formato quiz interativo
- 📝 Campos dinâmicos (pedidos, carrinho, cartões, dispositivos)
- 💾 Banco de dados PostgreSQL (confiável e profissional)
- 🎨 Interface moderna dark mode com glassmorphism
- 📱 100% responsivo para mobile
- ✏️ Edição e exclusão de clientes
- 💰 Controle de pagamentos (PIX/Vale-presente)
- 📈 Otimizado com paginação

## 🛠️ Tecnologias

- **Backend:** Node.js + Express
- **Banco:** PostgreSQL (produção) / SQLite (desenvolvimento)
- **Frontend:** HTML5 + CSS3 + JavaScript puro
- **Segurança:** bcrypt + express-session
- **Deploy:** Render (recomendado), Replit, Railway

## 🏃 Executar Localmente

### Com PostgreSQL (Produção):

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua DATABASE_URL

# 3. Rodar servidor
node server-postgres.js
```

### Com SQLite (Desenvolvimento):

```bash
# 1. Instalar dependências
npm install

# 2. Rodar servidor
npm start
```

Acesse: `http://localhost:5000`

**Credenciais padrão:**
- Usuário: `Sky`
- Senha: `Skandin00`

## 📦 Scripts Disponíveis

```bash
# Servidor SQLite (desenvolvimento)
npm start

# Servidor PostgreSQL (produção)
node server-postgres.js

# Migrar dados SQLite → PostgreSQL
node migrate-to-postgres.js

# Criar backup do banco
node backup.js

# Restaurar backup
node restore.js backup_YYYY-MM-DDTHH-MM-SS.json
```

## 🔧 Migração de Dados

Se você já tem dados no SQLite e quer migrar para PostgreSQL:

```bash
# 1. Configure .env com DATABASE_URL do PostgreSQL
# 2. Execute:
node migrate-to-postgres.js
```

O script transfere TODOS os dados com segurança e mostra progresso em tempo real.

## 💾 Backup e Restauração

### Criar Backup:
```bash
node backup.js
```
Gera arquivo JSON em `/backups` com todos os dados.

### Restaurar Backup:
```bash
node restore.js backup_2025-01-15T10-30-00.json
```

**Recomendação:** Faça backup antes de qualquer mudança importante!

## 📁 Estrutura do Projeto

```
├── server.js                 # Servidor SQLite (desenvolvimento)
├── server-postgres.js        # Servidor PostgreSQL (produção)
├── migrate-to-postgres.js    # Script migração SQLite → PostgreSQL
├── backup.js                 # Script de backup
├── restore.js                # Script de restauração
├── render.yaml               # Config Render (deploy automático)
├── GUIA-RENDER.md           # Guia completo deploy Render
├── public/
│   ├── index.html           # Interface do sistema
│   ├── style.css            # Estilos glassmorphism
│   └── script.js            # Lógica frontend
├── backups/                 # Pasta de backups (criada automaticamente)
└── database.db              # Banco SQLite (desenvolvimento)
```

## 🔐 Segurança

- ✅ Senhas hashadas com bcrypt (10 rounds)
- ✅ Sessions HTTP-only cookies
- ✅ Proteção contra SQL Injection (prepared statements)
- ✅ Proteção contra XSS (APIs DOM seguras)
- ✅ Variáveis de ambiente para secrets

## 🌐 Opções de Deploy

### 1. Render (Recomendado) - $0-7/mês
- ✅ Mais fácil
- ✅ PostgreSQL incluído
- ✅ SSL automático
- ✅ Backups diários
- 👉 [Ver guia completo](GUIA-RENDER.md)

### 2. Replit - $30-45/mês
- ✅ Já está aqui
- ✅ IDE integrada
- ❌ Mais caro

### 3. Railway - $5-10/mês
- ✅ Interface simples
- ✅ Deploy rápido
- ⚠️ Pay-as-you-go

## 📈 Funcionalidades

### Quiz Interativo de Cadastro
- 10 perguntas sobre o cliente
- Barra de progresso visual
- Navegação anterior/próximo
- Validação em tempo real

### Campos Dinâmicos
- **Pedidos Recentes:** Múltiplas entradas
- **Carrinho:** Lista de itens
- **Cartões:** Número + Validade (formatação automática)
- **Dispositivos:** Nome + Número de série

### Gestão de Clientes
- Visualização em cards
- Expandir/recolher detalhes
- Editar com dados pré-preenchidos
- Deletar com confirmação

### Pagamentos
- Suporte PIX e Vale-presente
- Status do vale (Na Conta / Pendente)
- Valor do pedido e valor vendido

## 🔄 Atualizações Recentes

- ✅ Migrado para PostgreSQL (mais confiável)
- ✅ Adicionado paginação (melhor performance)
- ✅ Pool de conexões otimizado
- ✅ Scripts de backup/restore
- ✅ Índices no banco para queries rápidas
- ✅ Timestamps automáticos
- ✅ Health check endpoint
- ✅ Graceful shutdown

## 🆘 Precisa de Ajuda?

1. **Problemas com deploy:** Leia [GUIA-RENDER.md](GUIA-RENDER.md)
2. **Perdi meus dados:** Use `node restore.js <arquivo-backup>`
3. **Erro no servidor:** Verifique logs e variáveis de ambiente
4. **Banco não conecta:** Confirme DATABASE_URL no .env

## 📝 Licença

Este projeto é de código aberto. Sinta-se livre para usar e modificar.

---

**Desenvolvido com ❤️ para gestão profissional de clientes**

🌟 Se este projeto foi útil, considere dar uma estrela no GitHub!
