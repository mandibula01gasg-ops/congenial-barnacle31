const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

// SUBSTITUA AQUI pela sua Connection String do MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://usuario:senha@cluster.mongodb.net/clientes_db?retryWrites=true&w=majority';

async function setup() {
  if (!process.env.MONGODB_URI && MONGODB_URI.includes('usuario:senha')) {
    console.error('❌ ERRO: Configure a variável MONGODB_URI antes de executar!');
    console.log('\nComo usar:');
    console.log('1. Substitua a MONGODB_URI no arquivo setup-mongodb.js');
    console.log('   OU');
    console.log('2. Execute: MONGODB_URI="sua-uri-aqui" node setup-mongodb.js');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await client.connect();
    console.log('✓ Conectado ao MongoDB!');
    
    const db = client.db('clientes_db');
    
    // Criar collections se não existirem
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✓ Collection "users" criada');
    }
    
    if (!collectionNames.includes('clientes')) {
      await db.createCollection('clientes');
      console.log('✓ Collection "clientes" criada');
    }
    
    // Criar índices
    const users = db.collection('users');
    await users.createIndex({ username: 1 }, { unique: true });
    console.log('✓ Índice único em "username" criado');
    
    // Verificar se usuário já existe
    const existingUser = await users.findOne({ username: 'Sky' });
    
    if (existingUser) {
      console.log('\n⚠️  Usuário "Sky" já existe no banco de dados!');
      console.log('Se quiser resetar a senha, delete o usuário no MongoDB Atlas primeiro.');
    } else {
      // Criar usuário padrão
      console.log('\n🔄 Criando usuário padrão...');
      const hash = await bcrypt.hash('Skandin00', 10);
      
      await users.insertOne({
        username: 'Sky',
        password: hash,
        created_at: new Date()
      });
      
      console.log('✅ Usuário padrão criado com sucesso!');
      console.log('\n📝 Credenciais de acesso:');
      console.log('   Username: Sky');
      console.log('   Password: Skandin00');
      console.log('\n⚠️  IMPORTANTE: Altere essas credenciais em produção!');
    }
    
    console.log('\n🎉 Setup concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante o setup:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Dica: Verifique se o usuário e senha estão corretos na URI de conexão');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Dica: Verifique se o IP está autorizado no MongoDB Atlas (Network Access)');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada');
  }
}

// Executar setup
setup();
