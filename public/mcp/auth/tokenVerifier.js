export async function verifyTokenWithBackend(originUrl, token) {
    const res = await fetch(`${originUrl}/api/v1/base/oauth/check_token`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    if (res.status === 401 || res.status === 403) {
      throw new Error('Token invalid or expired');
    }
  
    const data = await res.json();
  
    // 只要 code === 200 即代表令牌有效
    if (!res.ok || data?.code !== 200) {
      throw new Error(data?.message || 'Token invalid or expired');
    }
  
    return true;
}
  