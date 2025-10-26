# 🔧 Solução: Erro "database does not exist" no Render

## ❌ O Problema

O erro acontece porque a DATABASE_URL está apontando para um banco com nome incorreto:
```
database "cliente cadastro" does not exist
```

O banco correto deveria ser: `cliente_cadastro` (com underline)

## ✅ Solução Passo a Passo

### 1️⃣ Verificar se o Banco de Dados foi Criado

1. Acesse o **Dashboard do Render** (https://dashboard.render.com)
2. Vá em **PostgreSQL** no menu lateral
3. Verifique se o banco `cliente-cadastro-db` existe
4. **Se NÃO existir**, clique em **New → PostgreSQL** e crie com estas configurações:
   - **Name**: `cliente-cadastro-db`
   - **Database**: `cliente_cadastro` 
   - **User**: `cliente_cadastro_user`
   - **Plan**: Free ou Starter (escolha conforme necessário)

### 2️⃣ Copiar a DATABASE_URL Correta

1. No banco de dados `cliente-cadastro-db`, vá em **Info**
2. Localize o campo **Internal Database URL** ou **External Database URL**
3. Clique em **Copy** para copiar a URL completa
   - A URL deve ter este formato:
   ```
   postgresql://cliente_cadastro_user:senha@dpg-xxxxx/cliente_cadastro
   ```
   - **IMPORTANTE**: O final da URL deve ser `/cliente_cadastro` (com underline)

### 3️⃣ Configurar a Variável de Ambiente no Serviço Web

1. Vá no seu serviço web `cliente-cadastro`
2. Clique em **Environment**
3. Procure pela variável `DATABASE_URL`
   - **Se NÃO existir**, clique em **Add Environment Variable**
   - **Se existir**, clique em **Edit**

4. Configure assim:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a URL que você copiou no passo 2
   - Clique em **Save Changes**

### 4️⃣ Fazer o Redeploy

1. Ainda na página do serviço web, vá em **Manual Deploy**
2. Clique em **Deploy latest commit** ou **Clear build cache & deploy**
3. Aguarde o deploy terminar

### 5️⃣ Verificar os Logs

1. Vá em **Logs** no serviço web
2. Você deve ver estas mensagens:
   ```
   ✓ Servidor rodando em http://0.0.0.0:10000
   ✓ Ambiente: production
   ✓ Banco de dados inicializado com sucesso
   ✓ Usuário padrão criado
   ```

## 🎯 Solução Alternativa (Se render.yaml não criou o banco automaticamente)

Se o Render não criou o banco automaticamente usando o `render.yaml`, você pode:

### Opção A: Criar manualmente via Dashboard (Recomendado)
Siga os passos 1️⃣ a 5️⃣ acima

### Opção B: Atualizar o render.yaml
Se você preferir que o Render crie tudo automaticamente:

1. Certifique-se que o `render.yaml` está correto (já está!)
2. Delete o serviço web atual no Render
3. Crie um novo serviço via **New → Blueprint**
4. Aponte para o repositório do GitHub
5. O Render vai ler o `render.yaml` e criar tudo automaticamente

## 🚨 Atenção aos Nomes

O PostgreSQL é sensível a nomes com espaços e hífens:

- ✅ **CORRETO**: `cliente_cadastro` (underline)
- ❌ **ERRADO**: `cliente cadastro` (espaço)
- ❌ **ERRADO**: `cliente-cadastro` (hífen - pode causar problemas)

## 📋 Checklist Final

Antes de tentar novamente, confirme:

- [ ] O banco de dados PostgreSQL foi criado no Render
- [ ] O nome do banco é `cliente_cadastro` (com underline)
- [ ] A DATABASE_URL termina com `/cliente_cadastro`
- [ ] A DATABASE_URL foi configurada nas variáveis de ambiente do serviço web
- [ ] Você fez o redeploy após configurar a variável

## 💡 Dica Extra

Se você quiser testar a conexão com o banco antes do deploy, pode usar um cliente PostgreSQL como:
- **TablePlus** (https://tableplus.com)
- **DBeaver** (https://dbeaver.io)
- **pgAdmin** (https://www.pgadmin.org)

Use a **External Database URL** do Render para conectar.

## 🆘 Ainda não Funcionou?

Se mesmo após seguir todos os passos o erro persistir:

1. Verifique se a DATABASE_URL não tem espaços extras no início ou fim
2. Confirme que está usando a URL **Internal** (não External) se o serviço web está na mesma região
3. Verifique se o plano Free do PostgreSQL não expirou (Render Free dura 90 dias)
4. Tente usar a External Database URL ao invés da Internal

---

**Após resolver, seu sistema estará rodando perfeitamente no Render! 🚀**
