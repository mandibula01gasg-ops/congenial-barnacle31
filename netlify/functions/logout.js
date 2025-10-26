const { createLogoutCookie } = require('./utils/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const isProduction = event.headers['x-forwarded-proto'] === 'https';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': createLogoutCookie(isProduction)
    },
    body: JSON.stringify({ success: true })
  };
};
