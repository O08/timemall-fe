import { verifyTokenWithBackend } from './tokenVerifier.js';

export const patStrategy = {
  name: 'pat',

  canHandle(token) {
    return token.startsWith('BV_PAT_');
  },

  async verify(token, originUrl) {
    if (token.length <= 7) {
      throw new Error('Invalid Personal Access Token (BV_PAT_) format.');
    }

    try {
      await verifyTokenWithBackend(originUrl, token);
      return {
        strategy: 'pat',
        token: token,
        pat: token
      };
    } catch {
      throw new Error('Personal Access Token (BV_PAT_) has expired or been revoked.');
    }
  }
};
