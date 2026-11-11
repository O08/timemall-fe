import { EnvWebsite } from '../../common/javascripts/tm-constant.js';

export function getOriginUrl(req) {
  const host = req.headers['x-forwarded-host']?.split(',')[0]?.trim() || req.get('host') || '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  return isLocal ? EnvWebsite.LOCAL : EnvWebsite.PROD;
}
