const { connectToDatabase } = require('./utils/mongodb');
const { requireAuth } = require('./utils/auth');
const { ObjectId } = require('mongodb');

exports.handler = async (event) => {
  // Verificar autenticação
  const auth = requireAuth(event);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { db } = await connectToDatabase();
    const clientes = db.collection('clientes');

    // Extrair ID da URL se presente
    const pathParts = event.path.split('/');
    const clienteId = pathParts[pathParts.length - 1];
    const hasId = clienteId && clienteId !== 'clientes' && ObjectId.isValid(clienteId);

    // GET all clientes
    if (event.httpMethod === 'GET' && !hasId) {
      const rows = await clientes.find({}).sort({ created_at: -1 }).toArray();
      
      // Converter _id para id para compatibilidade com o frontend
      const clientesFormatted = rows.map(c => ({
        ...c,
        id: c._id.toString()
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientesFormatted)
      };
    }

    // GET specific cliente
    if (event.httpMethod === 'GET' && hasId) {
      const cliente = await clientes.findOne({ _id: new ObjectId(clienteId) });
      
      if (!cliente) {
        return {
          statusCode: 404,
          body: 'Cliente não encontrado'
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cliente,
          id: cliente._id.toString()
        })
      };
    }

    // PUT (update) cliente
    if (event.httpMethod === 'PUT' && hasId) {
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

      const updateData = {
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
        tipo_pagamento,
        pedido,
        valor_pedido: parseFloat(valor_pedido) || 0,
        valor_vendido: parseFloat(valor_vendido) || 0,
        vale_status,
        updated_at: new Date(),
        updated_by: auth.user.username
      };

      const result = await clientes.updateOne(
        { _id: new ObjectId(clienteId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return {
          statusCode: 404,
          body: 'Cliente não encontrado'
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: '✓ Cliente atualizado com sucesso!'
      };
    }

    // DELETE cliente
    if (event.httpMethod === 'DELETE' && hasId) {
      const result = await clientes.deleteOne({ _id: new ObjectId(clienteId) });

      if (result.deletedCount === 0) {
        return {
          statusCode: 404,
          body: 'Cliente não encontrado'
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: '✓ Cliente removido com sucesso!'
      };
    }

    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };

  } catch (error) {
    console.error('Clientes error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};
