const { connectToDatabase } = require('./utils/mongodb');
const { requireAuth } = require('./utils/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Verificar autenticação
  const auth = requireAuth(event);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const data = JSON.parse(event.body);
    const {
      nome, emails, pedidos_recentes, carrinho, cartao,
      assinaturas, dispositivos, endereco, vale, extra,
      tipo_pagamento, pedido, valor_pedido, valor_vendido, vale_status
    } = data;

    if (!nome || nome.trim() === '') {
      return {
        statusCode: 400,
        body: 'Nome do cliente é obrigatório'
      };
    }

    const { db } = await connectToDatabase();
    const clientes = db.collection('clientes');

    const cliente = {
      nome,
      emails,
      pedidos_recentes,
      carrinho,
      cartao,
      assinaturas,
      dispositivos,
      endereco,
      vale: parseFloat(vale) || 0,
      extra,
      data_cadastro: new Date().toISOString().split('T')[0],
      tipo_pagamento,
      pedido,
      valor_pedido: parseFloat(valor_pedido) || 0,
      valor_vendido: parseFloat(valor_vendido) || 0,
      vale_status,
      created_at: new Date(),
      created_by: auth.user.username
    };

    await clientes.insertOne(cliente);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: '✓ Cliente cadastrado com sucesso!'
    };

  } catch (error) {
    console.error('Cadastro error:', error);
    return {
      statusCode: 500,
      body: 'Erro ao cadastrar cliente'
    };
  }
};
