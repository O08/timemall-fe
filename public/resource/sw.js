const VERSION = 'banwei-v1';

// 💥 纯图片与核心门面资产轻量化静态列表（手工配置最核心的秒开文件）
const ASSETS_TO_CACHE = [
  '/',
  '/pwa-bad-network'
];

// 🛠️ 升级为大厂级健壮性容错预缓存机制
addEventListener('install', (e) => {
  e.waitUntil(
      caches.open(VERSION).then(async (cache) => {
          console.log('班蔚 PWA：正在执行系统资产预缓存...');
          
          // 将原本脆弱的 addAll 升级为逐个 add 并捕获 404 错误
          const promises = ASSETS_TO_CACHE.map(async (url) => {
              try {
                  const response = await fetch(url);
                  if (!response.ok) {
                      throw new Error(`HTTP 错误! 状态码: ${response.status}`);
                  }
                  await cache.put(url, response);
              } catch (error) {
                  console.error(`❌ 班蔚预缓存文件失败 (已跳过此文件): ${url} ->`, error.message);
              }
          });
          
          return Promise.all(promises);
      })
  );
});

addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => { if (key !== VERSION) return caches.delete(key); })
        )).then(() => self.clients.claim())
    );
});

addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});


//  智能资源加载管理（网络拦截与断网救援）
addEventListener('fetch', (event) => {
  // 只拦截标准的 GET 核心网络请求
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 💥 放行所有动态 API 数据接口，确保用户登录、发帖、商号订单永远真实实时
  if (url.pathname.includes('/api/')) return;

  // ⚡️ 智能分流策略：如果是网页导航请求（用户直接输入网址、站内跳转、刷新页面等）
  const isNav = event.request.mode === 'navigate';
  const isHtmlHeader = event.request.headers.get('accept')?.includes('text/html');

  if (isNav || isHtmlHeader) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // 如果缓存里有对应的物理网页文件，直接秒开
        if (cachedResponse) return cachedResponse;

        // 如果本地匹配不到（证明是无后缀的虚拟路由链接，如 /rainbow），则强制发起网络拉取
        // 一旦捕获到用户完全没有网络（网络报错触发 catch），
        // 强制降级去本地缓存里掏出你专属的无网络提示页面 '/pwa-bad-network' 甩给用户，彻底告别浏览器默认的恐龙断网白屏！
        return fetch(event.request).catch(() => caches.match(new Request('/pwa-bad-network')));

      })
    );
    return; // 结束当前分支拦截
  }

  // 保持标准的“缓存优先”策略，释放极致的秒开加速性能，并节省服务器带宽
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

