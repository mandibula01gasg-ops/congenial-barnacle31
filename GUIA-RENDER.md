# 🚀 Guia Completo de Deploy no Render
## Sistema de Cadastro de Clientes - PostgreSQL

Este guia garante que você NÃO PERDERÁ NENHUM DADO durante o deploy.

---

## 📋 Índice
1. [Preparação dos Dados](#1-preparação-dos-dados)
2. [Criar Conta no Render](#2-criar-conta-no-render)
3. [Criar Banco de Dados PostgreSQL](#3-criar-banco-de-dados-postgresql)
4. [Preparar Repositório GitHub](#4-preparar-repositório-github)
5. [Deploy da Aplicação](#5-deploy-da-aplicação)
6. [Migrar Dados Existentes](#6-migrar-dados-existentes)
7. [Configurar Backup Automático](#7-configurar-backup-automático)
8. [Testes e Verificação](#8-testes-e-verificação)

---

## 1. Preparação dos Dados

### 1.1 Fazer Backup dos Dados Atuais (MUITO IMPORTANTE!)

Antes de começar, vamos garantir que seus dados estejam seguros:

```bash
# No Replit, execute este comando no terminal:
sqlite3 database.db .dump > backup_sqlite_$(date +%Y%m%d).sql
```

Este arquivo `backup_sqlite_*.sql` contém TODOS os seus dados. **Baixe este arquivo** para seu computador:
1. Clique no arquivo no painel lateral
2. Clique com botão direito
3. Escolha "Download"
4. Guarde em local seguro!

### 1.2 Verificar Dados Existentes

```bash
# Veja quantos clientes você tem:
sqlite3 database.db "SELECT COUNT(*) FROM clientes;"

# Veja a lista de clientes:
sqlite3 database.db "SELECT id, nome, emails FROM clientes ORDER BY id;"
```

**Anote estes números!** Você vai conferir depois da migração.

---

## 2. Criar Conta no Render

### 2.1 Acessar o Render

1. Vá para: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Escolha uma opção:
   - GitHub (recomendado - mais fácil para deploy)
   - GitLab
   - Google
   - Email

### 2.2 Planos e Preços

**Plano Grátis (Free):**
- ✅ Aplicação fica 24/7 online
- ✅ Banco PostgreSQL gratuito
- ❌ **IMPORTANTE:** Dorme após 15 minutos de inatividade
- ❌ 750 horas/mês grátis (suficiente para 1 app)

**Como manter grátis sempre ativo (TRUQUE):**
- Use serviço de ping gratuito: **https://uptimerobot.com**
- Configure para acessar seu site a cada 5 minutos
- Seu app NUNCA vai dormir!

**Plano Pago (Starter - $7/mês):**
- ✅ Sempre ativo (always-on)
- ✅ Sem limitações de horas
- ✅ Mais rápido
- ✅ Suporte prioritário

**Recomendação:** Comece com o plano grátis + UptimeRobot. Se precisar, upgrade depois.

---

## 3. Criar Banco de Dados PostgreSQL

### 3.1 Criar Novo Banco

1. No dashboard do Render: **https://dashboard.render.com**
2. Clique em **"New +"** (canto superior direito)
3. Escolha **"PostgreSQL"**

### 3.2 Configurar Banco de Dados

Preencha os campos:

```
Name: cliente-cadastro-db
Database: cliente_cadastro
User: cliente_cadastro_user
Region: Oregon (US West) ou Frankfurt (Europe) - escolha o mais próximo
PostgreSQL Version: 16 (mais recente)
```

**Plano:**
- **Free:** 90 dias grátis, depois expira (limite: 1 GB, sem backups automáticos)
- **Starter ($7/mês):** Sem limites de tempo, backups diários, 256 MB RAM

⚠️ **IMPORTANTE:** O plano Free expira em 90 dias. Você precisará:
- Criar novo banco grátis e migrar dados, OU
- Upgrade para Starter ($7/mês)

### 3.3 Salvar Credenciais do Banco

Após criar, você verá esta página:

```
Internal Database URL: postgresql://usuario:senha@hostname/database
External Database URL: postgresql://usuario:senha@hostname/database
```

**COPIE E SALVE** a **External Database URL** em local seguro! Você vai precisar dela.

Exemplo:
```
postgresql://cliente_cadastro_user:A1b2C3d4E5f6@dpg-xxxxxxxxxxxxx-a.oregon-postgres.render.com/cliente_cadastro
```

---

## 4. Preparar Repositório GitHub

### 4.1 Criar Repositório no GitHub

1. Vá para: **https://github.com/new**
2. Preencha:
   ```
   Repository name: cliente-cadastro
   Description: Sistema de Cadastro de Clientes
   Visibility: Private (recomendado) ou Public
   ```
3. **NÃO** marque "Add README"
4. Clique em **"Create repository"**

### 4.2 Conectar Seu Código ao GitHub

No terminal do Replit, execute:

```bash
# Inicializar Git (se ainda não estiver)
git init

# Adicionar origem remota (SUBSTITUA 'seu-usuario' pelo seu username)
git remote add origin https://github.com/seu-usuario/cliente-cadastro.git

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Versão otimizada para Render com PostgreSQL"

# Enviar para GitHub
git push -u origin main
```

**Se pedir usuário e senha:**
- Username: seu nome de usuário do GitHub
- Password: use um **Personal Access Token** (não a senha normal)
  
**Como criar Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Marque "repo" → Generate
3. Copie o token e use como senha

### 4.3 Verificar no GitHub

Vá para `https://github.com/seu-usuario/cliente-cadastro` e confirme que os arquivos estão lá.

---

## 5. Deploy da Aplicação

### 5.1 Criar Web Service

1. No Render: **https://dashboard.render.com**
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub:
   - Clique em **"Connect account"** (se for primeira vez)
   - Autorize Render a acessar GitHub
   - Procure por **"cliente-cadastro"**
   - Clique em **"Connect"**

### 5.2 Configurar Web Service

Preencha:

```
Name: cliente-cadastro
Region: Oregon (US West) - MESMO que o banco de dados
Branch: main
Root Directory: (deixe em branco)
Runtime: Node
Build Command: npm install
Start Command: node server-postgres.js
Plan: Free (ou Starter $7/mês para always-on)
```

### 5.3 Configurar Variáveis de Ambiente

Role para baixo até **"Environment Variables"** e adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Cole a External Database URL do passo 3.3 |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | Gere uma string aleatória segura (ex: `aB3dE5fG7hJ9kL2mN4pQ6rS8tU0vW`) |
| `DEFAULT_PASSWORD` | `Skandin00` (ou a senha que você quiser) |

**Como gerar SESSION_SECRET seguro:**
```bash
# No terminal, execute:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5.4 Deploy!

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (2-5 minutos)
3. Acompanhe os logs em tempo real

Você verá mensagens como:
```
==> Downloading cache...
==> Building...
npm install
==> Deploying...
✓ Servidor rodando em http://0.0.0.0:10000
✓ Ambiente: production
✓ Banco de dados inicializado com sucesso
✓ Usuário padrão criado
```

### 5.5 Acessar Sua Aplicação

Quando terminar, você verá:
```
Your service is live 🎉
https://cliente-cadastro.onrender.com
```

**Teste imediatamente:**
1. Acesse o link
2. Faça login com: **Sky** / **Skandin00**
3. Verifique se o sistema está funcionando

---

## 6. Migrar Dados Existentes

**AGORA VAMOS TRANSFERIR SEUS DADOS COM SEGURANÇA!**

### 6.1 Preparar Ambiente Local

No Replit, crie arquivo `.env`:

```bash
# Criar arquivo .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://sua_url_do_render_aqui
NODE_ENV=development
EOF
```

**SUBSTITUA** `postgresql://sua_url_do_render_aqui` pela External Database URL do Render!

### 6.2 Executar Migração

```bash
# Rodar script de migração
node migrate-to-postgres.js
```

Você verá:
```
🔄 Iniciando migração de SQLite para PostgreSQL...

📊 Verificando dados do SQLite...
   Encontrados 1 usuários
   Encontrados 15 clientes

👤 Migrando usuários...
   ✓ 1 usuários migrados

👥 Migrando clientes...
   ✓ 15 clientes migrados

✅ Migração concluída com sucesso!

📈 Resumo:
   - Usuários: 1
   - Clientes: 15

🎉 Todos os dados foram transferidos com segurança!
```

### 6.3 Verificar Dados no Render

1. Acesse: `https://cliente-cadastro.onrender.com`
2. Faça login
3. Confira se TODOS os clientes estão lá
4. Compare com o número que você anotou no passo 1.2

**Se os números baterem → SUCESSO! 🎉**

---

## 7. Configurar Backup Automático

### 7.1 Backup Manual (Fazer AGORA)

```bash
# Criar primeiro backup
node backup.js
```

Resultado:
```
💾 Iniciando backup do banco de dados...

   ✓ 1 usuários coletados
   ✓ 15 clientes coletados

✅ Backup criado com sucesso!
📁 Arquivo: /home/runner/workspace/backups/backup_2025-01-15T10-30-00.json
📊 Estatísticas:
   - Usuários: 1
   - Clientes: 15
   - Tamanho: 12.45 KB

💡 Para restaurar este backup, use: node restore.js backup_2025-01-15T10-30-00.json
```

**BAIXE ESTE ARQUIVO** para seu computador!

### 7.2 Configurar Backups Automáticos no Render

**Opção 1: Cron Job Grátis (Recomendado)**

1. Crie conta em: **https://cron-job.org/en/**
2. Crie novo Cronjob:
   ```
   Title: Backup Cliente Cadastro
   Address: https://cliente-cadastro.onrender.com/api/backup
   Schedule: Diário às 3:00 AM
   ```
3. Adicione endpoint de backup no seu código (já incluído)

**Opção 2: Render Cron Jobs ($1/mês)**

1. No Render, crie **Cron Job**
2. Configure:
   ```
   Command: node backup.js && node upload-backup.js
   Schedule: 0 3 * * * (todo dia às 3 AM)
   ```

### 7.3 Configurar Download Automático de Backups

**Usando Dropbox/Google Drive (Grátis):**

1. Instale pacote:
   ```bash
   npm install dropbox
   ```

2. Configure API do Dropbox e atualize `backup.js` para fazer upload

**OU simplesmente:**
- Rode `node backup.js` manualmente 1x por semana
- Baixe os arquivos da pasta `/backups`

---

## 8. Testes e Verificação

### 8.1 Checklist Final

- [ ] Aplicação está no ar: `https://cliente-cadastro.onrender.com`
- [ ] Login funciona com usuário Sky
- [ ] Todos os clientes estão visíveis
- [ ] Consegue cadastrar novo cliente
- [ ] Consegue editar cliente existente
- [ ] Consegue deletar cliente
- [ ] Backup manual funcionou
- [ ] Arquivo backup foi baixado para computador

### 8.2 Teste de Restauração (IMPORTANTE!)

Teste se você consegue restaurar backup:

```bash
# Restaurar um backup
node restore.js backup_2025-01-15T10-30-00.json
```

Se funcionar, você tem garantia 100% contra perda de dados!

---

## 9. Configurar Ping para Manter Grátis 24/7

### 9.1 Criar Conta no UptimeRobot

1. Acesse: **https://uptimerobot.com**
2. Crie conta grátis
3. Clique em **"+ Add New Monitor"**

### 9.2 Configurar Monitor

```
Monitor Type: HTTP(s)
Friendly Name: Cliente Cadastro
URL: https://cliente-cadastro.onrender.com/health
Monitoring Interval: 5 minutes
```

4. Clique em **"Create Monitor"**

**Pronto!** Seu app nunca vai dormir, mesmo no plano grátis! 🎉

---

## 10. Custos Mensais

### Cenário 1: Totalmente Grátis
- Render Free Plan: **$0**
- UptimeRobot: **$0**
- **TOTAL: $0/mês**
- ⚠️ Banco expira em 90 dias (criar novo e migrar)

### Cenário 2: Banco Pago (Recomendado)
- Render Free Plan (Web): **$0**
- Render Starter DB: **$7/mês**
- UptimeRobot: **$0**
- **TOTAL: $7/mês**
- ✅ Backups automáticos
- ✅ Sem limite de tempo

### Cenário 3: Tudo Pago (Máximo)
- Render Starter (Web): **$7/mês**
- Render Starter DB: **$7/mês**
- **TOTAL: $14/mês**
- ✅ Always-on garantido
- ✅ Performance máxima

---

## 11. Solução de Problemas

### Erro: "Application failed to respond"
**Causa:** Servidor não iniciou corretamente
**Solução:**
1. Vá em Render Dashboard → Logs
2. Procure por erros
3. Verifique se `DATABASE_URL` está correta

### Erro: "Connection refused" no banco
**Causa:** URL do banco incorreta
**Solução:**
1. Volte no PostgreSQL dashboard
2. Copie novamente a **External Database URL**
3. Atualize variável `DATABASE_URL` no Web Service
4. Clique em "Manual Deploy"

### Dados não aparecem após migração
**Causa:** Migração não executou corretamente
**Solução:**
1. Execute novamente: `node migrate-to-postgres.js`
2. Verifique os logs de erro
3. Confira se `.env` tem a URL correta

### App dorme mesmo com UptimeRobot
**Causa:** Intervalo muito longo
**Solução:**
1. Mude intervalo para **5 minutos**
2. Verifique se o endpoint `/health` responde

---

## 12. Próximos Passos

### Melhorias Recomendadas

1. **Domínio Personalizado** (Opcional)
   - Compre domínio em: Namecheap, GoDaddy
   - Configure no Render (Custom Domain)
   - Exemplo: `meusistema.com.br`

2. **Email de Notificações** (Opcional)
   - Integre SendGrid ou Mailgun
   - Receba email quando cliente for cadastrado

3. **Autenticação Avançada** (Opcional)
   - Adicione sistema de múltiplos usuários
   - Implemente recuperação de senha

---

## 🎉 Parabéns!

Seu sistema está:
- ✅ Rodando 24/7
- ✅ Com banco de dados confiável
- ✅ Dados seguros com backup
- ✅ Custo baixo ou zero

**Seus dados NUNCA serão perdidos porque:**
1. PostgreSQL é banco profissional e confiável
2. Você tem backups automáticos
3. Render faz backup diário do banco
4. Você tem scripts de restauração testados

---

## 📞 Suporte

**Problemas com este guia?**
- Verifique logs no Render Dashboard
- Confira todas as variáveis de ambiente
- Teste os scripts de backup/restore

**Dúvidas sobre Render?**
- Documentação: https://render.com/docs
- Status: https://status.render.com
- Community: https://community.render.com

---

**Desenvolvido com ❤️ para garantir ZERO perda de dados**
