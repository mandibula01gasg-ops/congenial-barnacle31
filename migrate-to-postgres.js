require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const sqliteDb = new sqlite3.Database('./database.db');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  console.log('🔄 Iniciando migração de SQLite para PostgreSQL...\n');
  
  try {
    console.log('📊 Verificando dados do SQLite...');
    
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log(`   Encontrados ${users.length} usuários`);
    
    const clientes = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM clientes', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log(`   Encontrados ${clientes.length} clientes\n`);
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('👤 Migrando usuários...');
      for (const user of users) {
        await client.query(
          'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
          [user.username, user.password]
        );
      }
      console.log(`   ✓ ${users.length} usuários migrados\n`);
      
      console.log('👥 Migrando clientes...');
      for (const cliente of clientes) {
        await client.query(
          `INSERT INTO clientes (nome, emails, pedidos_recentes, carrinho, cartao, assinaturas, dispositivos, endereco, vale, extra, data_cadastro, tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            cliente.nome,
            cliente.emails,
            cliente.pedidos_recentes,
            cliente.carrinho,
            cliente.cartao,
            cliente.assinaturas,
            cliente.dispositivos,
            cliente.endereco,
            cliente.vale || 0,
            cliente.extra,
            cliente.data_cadastro,
            cliente.tipo_pagamento,
            cliente.pedido,
            cliente.valor_pedido || 0,
            cliente.valor_vendido || 0,
            cliente.vale_status
          ]
        );
      }
      console.log(`   ✓ ${clientes.length} clientes migrados\n`);
      
      await client.query('COMMIT');
      console.log('✅ Migração concluída com sucesso!');
      console.log(`\n📈 Resumo:`);
      console.log(`   - Usuários: ${users.length}`);
      console.log(`   - Clientes: ${clientes.length}`);
      console.log(`\n🎉 Todos os dados foram transferidos com segurança!`);
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('❌ Erro durante a migração:', err);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pool.end();
  }
}

migrate();
