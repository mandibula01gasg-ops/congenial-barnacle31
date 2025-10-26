const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION';
const JWT_EXPIRY = '7d'; // Token válido por 7 dias

function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id.toString(), 
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return cookies.token || null;
}

function createAuthCookie(token, isSecure = true) {
  const secureFlag = isSecure ? 'Secure;' : '';
  return `token=${token}; Path=/; HttpOnly; ${secureFlag} SameSite=Strict; Max-Age=604800`;
}

function createLogoutCookie(isSecure = true) {
  const secureFlag = isSecure ? 'Secure;' : '';
  return `token=; Path=/; HttpOnly; ${secureFlag} SameSite=Strict; Max-Age=0`;
}

function requireAuth(event) {
  const token = getTokenFromCookie(event.headers.cookie);
  
  if (!token) {
    return {
      authorized: false,
      response: {
        statusCode: 401,
        body: 'Acesso negado'
      }
    };
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return {
      authorized: false,
      response: {
        statusCode: 401,
        body: 'Token inválido ou expirado'
      }
    };
  }

  return {
    authorized: true,
    user: decoded
  };
}

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromCookie,
  createAuthCookie,
  createLogoutCookie,
  requireAuth
};
