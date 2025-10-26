const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração de sessão otimizada para mobile
app.set('trust proxy', 1);
app.use(session({ 
  secret: 'seu-segredo-aqui-mude-em-producao', 
  resave: false, 
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));
app.use(express.static('public'));

// Banco de dados
const db = new sqlite3.Database('./database.db');

// Criar tabelas e inserir usuário padrão
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    emails TEXT,
    pedidos_recentes TEXT,
    carrinho TEXT,
    cartao TEXT,
    assinaturas TEXT,
    dispositivos TEXT,
    endereco TEXT,
    vale REAL,
    extra TEXT,
    data_cadastro TEXT,
    tipo_pagamento TEXT,
    pedido TEXT,
    valor_pedido REAL,
    valor_vendido REAL,
    vale_status TEXT
  )`);

  // Verificar e adicionar novas colunas apenas se não existirem (para bancos existentes)
  db.all("PRAGMA table_info(clientes)", [], (err, columns) => {
    if (err) {
      console.log('Erro ao verificar colunas:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    const newColumns = [
      { name: 'tipo_pagamento', type: 'TEXT' },
      { name: 'pedido', type: 'TEXT' },
      { name: 'valor_pedido', type: 'REAL' },
      { name: 'valor_vendido', type: 'REAL' },
      { name: 'vale_status', type: 'TEXT' }
    ];
    
    newColumns.forEach(col => {
      if (!columnNames.includes(col.name)) {
        db.run(`ALTER TABLE clientes ADD COLUMN ${col.name} ${col.type}`, (err) => {
          if (err) {
            console.log(`Erro ao adicionar coluna ${col.name}:`, err);
          } else {
            console.log(`Coluna ${col.name} adicionada com sucesso`);
          }
        });
      }
    });
  });

  // Inserir usuário padrão se não existir
  bcrypt.hash('Skandin00', 10, (err, hash) => {
    if (!err) {
      db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', ['Sky', hash]);
    }
  });
});

// Rota de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Tentativa de login:', username);
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.log('Erro no banco:', err);
      return res.send('<html><body style="font-family: Arial; background: #0f0f23; color: #e0e0e0; text-align: center; padding: 50px;"><h2 style="color: #ff4757;">Erro no servidor</h2><p>Tente novamente mais tarde.</p><a href="/" style="color: #00d4ff; text-decoration: none;">Voltar</a></body></html>');
    }
    
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
  });
});

// Rota para cadastrar cliente
app.post('/cadastrar', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  const { nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, vale, extra, tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status } = req.body;
  const data = new Date().toISOString().split('T')[0];
  db.run('INSERT INTO clientes (nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, vale, extra, data_cadastro, tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, parseFloat(vale) || 0, extra, data, tipo_pagamento, pedido, parseFloat(valor_pedido) || 0, parseFloat(valor_vendido) || 0, vale_status], (err) => {
      if (err) {
        console.log('Erro ao cadastrar:', err);
        res.send('Erro ao cadastrar cliente');
      } else {
        res.send('✓ Cliente cadastrado com sucesso!');
      }
    });
});

// Rota para listar clientes
app.get('/clientes', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  db.all('SELECT * FROM clientes ORDER BY id DESC', [], (err, rows) => {
    res.json(rows);
  });
});

// Rota para pegar um cliente específico
app.get('/clientes/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  const { id } = req.params;
  db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send('Erro ao buscar cliente');
    } else if (!row) {
      res.status(404).send('Cliente não encontrado');
    } else {
      res.json(row);
    }
  });
});

// Rota para atualizar cliente
app.put('/clientes/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  const { id } = req.params;
  const { nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, vale, extra, tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status } = req.body;
  
  db.run('UPDATE clientes SET nome = ?, emails = ?, pedidos_recentes = ?, carrinho = ?, cartao = ?, assinaturas = ?, dispositivos = ?, endereco = ?, vale = ?, extra = ?, tipo_pagamento = ?, pedido = ?, valor_pedido = ?, valor_vendido = ?, vale_status = ? WHERE id = ?',
    [nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, parseFloat(vale) || 0, extra, tipo_pagamento, pedido, parseFloat(valor_pedido) || 0, parseFloat(valor_vendido) || 0, vale_status, id], (err) => {
      if (err) {
        console.log('Erro ao atualizar:', err);
        res.send('Erro ao atualizar cliente');
      } else {
        res.send('✓ Cliente atualizado com sucesso!');
      }
    });
});

// Rota para deletar cliente
app.delete('/clientes/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Acesso negado' });
  const { id } = req.params;
  
  db.run('DELETE FROM clientes WHERE id = ?', [id], (err) => {
    if (err) {
      console.log('Erro ao remover:', err);
      res.send('Erro ao remover cliente');
    } else {
      res.send('✓ Cliente removido com sucesso!');
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
