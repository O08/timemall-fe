import express from 'express';
import crypto from 'crypto';
import { verifyTokenWithBackend } from './tokenVerifier.js';


// 自动适配本地与线上环境的根域名
const getOriginUrl = (req) => `${req.protocol}://${req.get('host')}`;
// 防钓鱼
function isSafeRedirectUri(uri) {
  try {
    const parsed = new URL(uri);
    if (['javascript:', 'data:', 'vbscript:'].includes(parsed.protocol)) {
      return false;
    }
    const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    // 公网网页必须使用 HTTPS；本地调试允许 HTTP；桌面应用允许自定义协议 (cursor:// 等)
    if (parsed.protocol === 'http:' && !isLocalhost) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}


// 写入临时会话
async function saveOAuthState(originUrl, key, dataObj) {
  const res = await fetch(`${originUrl}/api/v1/web_mall/mcp/session/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, payload: JSON.stringify(dataObj) })
  });
  const result = await res.json();
  if (!res.ok || result.code !== 200) {
    throw new Error(`Failed to save OAuth state: ${result.message || res.status}`);
  }
}

//  获取临时会话
async function consumeOAuthState(originUrl, key) {
  const res = await fetch(`${originUrl}/api/v1/web_mall/mcp/session/consume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  const result = await res.json();
  if (!res.ok || result.code !== 200 || !result.payload) {
    return null;
  }
  return JSON.parse(result.payload);
}

export const oauthStrategy = {
  name: 'oauth2',

  canHandle(token) {
    return Boolean(token) && !token.startsWith('BV_PAT_');
  },

  async verify(token, originUrl) {
    await verifyTokenWithBackend(originUrl, token);
    return {
      strategy: 'oauth2',
      token: token
    };
  }
};


export function createMcpOAuthRouter() {
  const router = express.Router();

  // 受保护资源元数据 (RFC 9728 标准根路径前缀)
  router.get(
    [
      '/.well-known/oauth-protected-resource/mcp-gateway/mcp',
      '/.well-known/oauth-protected-resource'
    ],
    (req, res) => {
      const originUrl = getOriginUrl(req);
      res.json({
        resource: `${originUrl}/mcp-gateway/mcp`,
        authorization_servers: [originUrl],
        bearer_methods_supported: ['header'],
        scopes_supported: ['mcp:tools']
      });
    }
  );

  // 授权服务器元数据 (RFC 8414 标准根路径，端点隔离在 /mcp-gateway/oauth 下)
  router.get('/.well-known/oauth-authorization-server', (req, res) => {
    const originUrl = getOriginUrl(req);
    const oauthPrefix = `${originUrl}/mcp-gateway/oauth`;

    res.json({
      issuer: originUrl,
      authorization_endpoint: `${oauthPrefix}/authorize`,
      token_endpoint: `${oauthPrefix}/token`,
      registration_endpoint: `${oauthPrefix}/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      token_endpoint_auth_methods_supported: ['none'],
      code_challenge_methods_supported: ['S256']
    });
  });

  // 动态客户端注册 (RFC 7591)
  router.post('/mcp-gateway/oauth/register', express.json(), (req, res) => {
    const clientId = `mcp_client_${crypto.randomBytes(8).toString('hex')}`;
    res.status(201).json({
      client_id: clientId,
      client_name: req.body?.client_name || 'MCP Client',
      redirect_uris: req.body?.redirect_uris || [],
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none'
    });
  });

  // 授权跳转：托管状态到 Java 后端 -> 跳转到前端登录页
  router.get('/mcp-gateway/oauth/authorize', async (req, res) => {
    try {
      const { redirect_uri, state, code_challenge, code_challenge_method } = req.query;
      if (!redirect_uri || !isSafeRedirectUri(redirect_uri)) {
        return res.status(400).send('Invalid redirect_uri parameter');
      }

      const originUrl = getOriginUrl(req);
      const sessionId = crypto.randomBytes(16).toString('hex');

      await saveOAuthState(originUrl, `session:${sessionId}`, {
        clientRedirectUri: redirect_uri,
        clientState: state,
        code_challenge,
        code_challenge_method
      });

      const cleanCallbackUrl = `${originUrl}/mcp-gateway/oauth/callback`;
      const loginUrl = new URL(`${originUrl}/login`);
      loginUrl.searchParams.set('redirect_uri', cleanCallbackUrl);
      loginUrl.searchParams.set('state', sessionId);

      res.redirect(loginUrl.toString());
    } catch (err) {
      console.error('[MCP OAuth] /mcp-gateway/oauth/authorize 异常:', err);
      res.status(500).send('OAuth authorization initialization failed');
    }
  });

  // 登录回调中转：向后端获取会话 -> 绑定授权码 -> 重定向回 MCP 客户端
  router.get('/mcp-gateway/oauth/callback', async (req, res) => {
    try {
      const { state: sessionId, code } = req.query;
      if (!sessionId || !code) {
        return res.status(400).send('Missing state or code parameter');
      }

      const originUrl = getOriginUrl(req);
      const session = await consumeOAuthState(originUrl, `session:${sessionId}`);
      if (!session) {
        return res.status(400).send('Invalid or expired OAuth session');
      }

      await saveOAuthState(originUrl, `code:${code}`, session);

      const clientRedirect = new URL(session.clientRedirectUri);
      clientRedirect.searchParams.set('code', code);
      if (session.clientState) {
        clientRedirect.searchParams.set('state', session.clientState);
      }

      res.redirect(clientRedirect.toString());
    } catch (err) {
      console.error('[MCP OAuth] /mcp-gateway/oauth/callback 异常:', err);
      res.status(500).send('OAuth callback processing failed');
    }
  });

  // 换取 Token 代理：后端获取 code 校验 PKCE -> 调用 exchangeToken
  router.post('/mcp-gateway/oauth/token', express.urlencoded({ extended: true }), express.json(), async (req, res) => {
    const { grant_type, code, code_verifier } = req.body;
    const originUrl = getOriginUrl(req);

    if (grant_type !== 'authorization_code' || !code) {
      return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    try {
      const session = await consumeOAuthState(originUrl, `code:${code}`);
      if (!session) {
        return res.status(400).json({ error: 'invalid_grant', error_description: 'Code invalid or expired' });
      }

      // PKCE 校验
      if (session.code_challenge && session.code_challenge_method === 'S256') {
        const expectedChallenge = crypto
          .createHash('sha256')
          .update(code_verifier || '')
          .digest('base64url');
        if (expectedChallenge !== session.code_challenge) {
          return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
        }
      }

      // 调用 后端 Token 接口
      const formParams = new URLSearchParams();
      formParams.append('code', code);

      const upstreamRes = await fetch(`${originUrl}/api/v1/web_mall/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formParams.toString()
      });

      const tokenData = await upstreamRes.json();
      if (!upstreamRes.ok) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: tokenData.message || 'Failed to exchange code'
        });
      }

      return res.status(200).json(tokenData);
    } catch (err) {
      console.error('[MCP OAuth] /mcp-gateway/oauth/token 异常:', err);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
}
