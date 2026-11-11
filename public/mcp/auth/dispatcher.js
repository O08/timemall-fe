import { patStrategy } from './patStrategy.js';
import { oauthStrategy } from './oauthStrategy.js';

const strategies = [
  patStrategy,
  oauthStrategy
];

const getOriginUrl = (req) => `${req.protocol}://${req.get('host')}`;

function sendUnauthorized(req, res, errorCode = '') {
  const metadataUrl = `${getOriginUrl(req)}/.well-known/oauth-protected-resource/mcp-gateway/mcp`;
  const errorPart = errorCode ? `, error="${errorCode}"` : '';

  res.setHeader(
    'WWW-Authenticate',
    `Bearer realm="mcp", resource_metadata="${metadataUrl}"${errorPart}`
  );

  return res.status(401).json({
    error: 'Unauthorized: Valid PAT or OAuth2 access token is required.'
  });
}

export const mcpAuthMiddleware = async (req, res, next) => {
  // 放行浏览器 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return next();
  }

  // 全协议拦截鉴权（涵盖 initialize、tools/list、tools/call 等所有请求）
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendUnauthorized(req, res);
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return sendUnauthorized(req, res);
  }

  const matchedStrategy = strategies.find((s) => s.canHandle(token));
  if (!matchedStrategy) {
    return sendUnauthorized(req, res, 'invalid_token');
  }

  try {
    req.auth = await matchedStrategy.verify(token);
    return next();
  } catch (err) {
    console.warn(`[MCP Auth] 策略 [${matchedStrategy.name}] 校验失败:`, err.message);
    return sendUnauthorized(req, res, 'invalid_token');
  }
};
