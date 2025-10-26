require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function backup() {
  console.log('💾 Iniciando backup do banco de dados...\n');
  
  try {
    const client = await pool.connect();
    
    const users = await client.query('SELECT * FROM users');
    console.log(`   ✓ ${users.rows.length} usuários coletados`);
    
    const clientes = await client.query('SELECT * FROM clientes ORDER BY id');
    console.log(`   ✓ ${clientes.rows.length} clientes coletados\n`);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      users: users.rows,
      clientes: clientes.rows,
      stats: {
        total_users: users.rows.length,
        total_clientes: clientes.rows.length
      }
    };
    
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    const fileName = `backup_${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;
    const filePath = path.join(backupDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup criado com sucesso!');
    console.log(`📁 Arquivo: ${filePath}`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - Usuários: ${users.rows.length}`);
    console.log(`   - Clientes: ${clientes.rows.length}`);
    console.log(`   - Tamanho: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB\n`);
    
    console.log('💡 Para restaurar este backup, use: node restore.js ' + fileName);
    
    client.release();
    await pool.end();
    
  } catch (err) {
    console.error('❌ Erro ao criar backup:', err);
    process.exit(1);
  }
}

backup();
