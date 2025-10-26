const bcrypt = require('bcrypt');
const { connectToDatabase } = require('./utils/mongodb');
const { generateToken, createAuthCookie } = require('./utils/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ username });

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Gerar JWT token
    const token = generateToken(user);
    
    // Detectar se está em produção (HTTPS) ou desenvolvimento
    const isProduction = event.headers['x-forwarded-proto'] === 'https';
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createAuthCookie(token, isProduction)
      },
      body: JSON.stringify({ 
        success: true,
        username: user.username 
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
