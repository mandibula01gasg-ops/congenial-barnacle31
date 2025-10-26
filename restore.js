require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function restore(backupFileName) {
  if (!backupFileName) {
    console.error('❌ Erro: Especifique o arquivo de backup');
    console.log('Uso: node restore.js <nome-do-arquivo-backup.json>');
    process.exit(1);
  }
  
  const filePath = path.join(__dirname, 'backups', backupFileName);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }
  
  console.log(`🔄 Restaurando backup de ${backupFileName}...\n`);
  
  try {
    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`📅 Backup criado em: ${backupData.timestamp}`);
    console.log(`📊 Contém:`);
    console.log(`   - ${backupData.stats.total_users} usuários`);
    console.log(`   - ${backupData.stats.total_clientes} clientes\n`);
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('🗑️  Limpando dados existentes...');
      await client.query('TRUNCATE TABLE clientes CASCADE');
      await client.query('TRUNCATE TABLE users CASCADE');
      console.log('   ✓ Dados existentes removidos\n');
      
      console.log('👤 Restaurando usuários...');
      for (const user of backupData.users) {
        await client.query(
          'INSERT INTO users (username, password) VALUES ($1, $2)',
          [user.username, user.password]
        );
      }
      console.log(`   ✓ ${backupData.users.length} usuários restaurados\n`);
      
      console.log('👥 Restaurando clientes...');
      for (const cliente of backupData.clientes) {
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
      console.log(`   ✓ ${backupData.clientes.length} clientes restaurados\n`);
      
      await client.query('COMMIT');
      console.log('✅ Restauração concluída com sucesso!');
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('❌ Erro durante a restauração:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const backupFileName = process.argv[2];
restore(backupFileName);
