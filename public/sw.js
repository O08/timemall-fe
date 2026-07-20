import { manifest, version } from '@parcel/service-worker';

async function install() {
  const cache = await caches.open(version);
  await cache.addAll(manifest); // 自动预缓存 Parcel 打包的所有静态资产（确保包含你的离线路由所需资源）
}

// 安装新版并执行预缓存
addEventListener('install', e => e.waitUntil(install()));

// 自动擦除历史旧版本的死缓存垃圾，释放用户设备空间
addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== version) {
            console.log('正在清理班蔚历史老版本缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 激活后立刻接管所有当前打开的网页窗口
  );
});

// 接收来自 sw-register.js 的强更暗号，跳过漫长的交接班排队
addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // 强制让新版本在后台立即登基生效
  }
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
        return fetch(event.request).catch(() => caches.match('/pwa-bad-network'));
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
