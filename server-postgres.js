require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'seu-segredo-aqui-mude-em-producao', 
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(express.static('public'));

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        emails TEXT,
        pedidos_recentes TEXT,
        carrinho TEXT,
        cartao TEXT,
        assinaturas TEXT,
        dispositivos TEXT,
        endereco TEXT,
        vale NUMERIC(10, 2) DEFAULT 0,
        extra TEXT,
        data_cadastro DATE DEFAULT CURRENT_DATE,
        tipo_pagamento VARCHAR(50),
        pedido VARCHAR(255),
        valor_pedido NUMERIC(10, 2) DEFAULT 0,
        valor_vendido NUMERIC(10, 2) DEFAULT 0,
        vale_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
      CREATE INDEX IF NOT EXISTS idx_clientes_data_cadastro ON clientes(data_cadastro);
    `);

    const userExists = await client.query('SELECT * FROM users WHERE username = $1', ['Sky']);
    if (userExists.rows.length === 0) {
      const hash = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'Skandin00', 10);
      await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', ['Sky', hash]);
      console.log('✓ Usuário padrão criado');
    }

    console.log('✓ Banco de dados inicializado com sucesso');
  } catch (err) {
    console.error('Erro ao inicializar banco de dados:', err);
    throw err;
  } finally {
    client.release();
  }
}

initDatabase().catch(err => {
  console.error('Falha crítica ao inicializar banco:', err);
  process.exit(1);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Tentativa de login:', username);
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user) {
      console.log('Usuário não encontrado:', username);
      return res.send('<html><body style="font-family: Arial; background: #0f0f23; color: #e0e0e0; text-align: center; padding: 50px;"><h2 style="color: #ff4757;">Credenciais inválidas</h2><p>Usuário ou senha incorretos.</p><a href="/" style="color: #00d4ff; text-decoration: none;">Voltar</a></body></html>');
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Senha correta?', passwordMatch);
    
    if (passwordMatch) {
      req.session.user = user;
      console.log('Login bem-sucedido!');
      res.redirect('/');
    } else {
      console.log('Senha incorreta');
      res.send('<html><body style="font-family: Arial; background: #0f0f23; color: #e0e0e0; text-align: center; padding: 50px;"><h2 style="color: #ff4757;">Credenciais inválidas</h2><p>Usuário ou senha incorretos.</p><a href="/" style="color: #00d4ff; text-decoration: none;">Voltar</a></body></html>');
    }
  } catch (err) {
    console.error('Erro no banco:', err);
    res.send('<html><body style="font-family: Arial; background: #0f0f23; color: #e0e0e0; text-align: center; padding: 50px;"><h2 style="color: #ff4757;">Erro no servidor</h2><p>Tente novamente mais tarde.</p><a href="/" style="color: #00d4ff; text-decoration: none;">Voltar</a></body></html>');
  }
});

app.post('/cadastrar', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  
  const { nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, vale, extra, tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status } = req.body;
  const data = new Date().toISOString().split('T')[0];
  
  try {
    await pool.query(
      `INSERT INTO clientes (nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, vale, extra, data_cadastro, tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, parseFloat(vale) || 0, extra, data, tipo_pagamento, pedido, parseFloat(valor_pedido) || 0, parseFloat(valor_vendido) || 0, vale_status]
    );
    res.send('✓ Cliente cadastrado com sucesso!');
  } catch (err) {
    console.error('Erro ao cadastrar:', err);
    res.status(500).send('Erro ao cadastrar cliente');
  }
});

app.get('/clientes', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const offset = (page - 1) * limit;
  
  try {
    const result = await pool.query(
      'SELECT * FROM clientes ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    const countResult = await pool.query('SELECT COUNT(*) FROM clientes');
    const totalClientes = parseInt(countResult.rows[0].count);
    
    res.json({
      clientes: result.rows,
      total: totalClientes,
      page: page,
      totalPages: Math.ceil(totalClientes / limit)
    });
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

app.get('/clientes/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).send('Cliente não encontrado');
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).send('Erro ao buscar cliente');
  }
});

app.put('/clientes/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  
  const { id } = req.params;
  const { nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, vale, extra, tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status } = req.body;
  
  try {
    await pool.query(
      `UPDATE clientes SET nome = $1, emails = $2, pedidos_recentes = $3, carrinho = $4, cartao = $5, assinaturas = $6, dispositivos = $7, endereco = $8, vale = $9, extra = $10, tipo_pagamento = $11, pedido = $12, valor_pedido = $13, valor_vendido = $14, vale_status = $15, updated_at = CURRENT_TIMESTAMP WHERE id = $16`,
      [nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, parseFloat(vale) || 0, extra, tipo_pagamento, pedido, parseFloat(valor_pedido) || 0, parseFloat(valor_vendido) || 0, vale_status, id]
    );
    res.send('✓ Cliente atualizado com sucesso!');
  } catch (err) {
    console.error('Erro ao atualizar:', err);
    res.status(500).send('Erro ao atualizar cliente');
  }
});

app.delete('/clientes/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    res.send('✓ Cliente removido com sucesso!');
  } catch (err) {
    console.error('Erro ao remover:', err);
    res.status(500).send('Erro ao remover cliente');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, encerrando conexões...');
  await pool.end();
  process.exit(0);
});
