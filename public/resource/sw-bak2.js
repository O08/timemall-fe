
const VERSION = 'banwei-ultimate-v2';

// 💥 静态预缓存列表（必须 100% 确保真实存在于你服务器上的本地同源物理资产）
const ASSETS_TO_CACHE = [
    '/'
];

// 专门用来克制和约束用户在使用途中动态回填的阿里云 OSS 等静态图片的总数量
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // 💥 核心过滤：只针对静态图片和资产文件进行数量控制，绝对不能误删 API 的 JSON 数据请求！
  const staticKeys = keys.filter(request => !request.url.includes('/api/'));
  
  if (staticKeys.length > maxItems) {
    // 🎯 精准锁死：staticKeys[0] 才是队列里最老、最久没被读取过的那一张图的目标 Request 对象
    console.log(`⚠️ 班蔚缓存：静态文件超出 ${maxItems} 个，正在自动淘汰最旧资产: ${staticKeys[0].url}`);
    await cache.delete(staticKeys[0]); // 从固态硬盘中优雅抹除
    
    // 递归检查，确保清理干净
    await limitCacheSize(cacheName, maxItems);
  }
}

// =========================================================================
// 📥 1. 安装生命周期事件（冷启动锁保险箱）
// =========================================================================
addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(VERSION).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// =========================================================================
// 激活生命周期事
// =========================================================================
addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 💥 安全闭环：只会精准定点清除【历史老旧版本】的缓存，绝对不会误删当前最新版本下的 API 数据！
          if (cacheName !== VERSION) {
            console.log('正在清理班蔚历史版本死缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // ⚡️ 激活完毕后，不需要重启软件，立刻强行接管全站所有打开的窗口
  );
});

// =========================================================================
// 通信事件（配合 sw-register.js 的全屏毛玻璃强更阻断）
// =========================================================================
addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // 强行跳过漫长死板的排队等待，让新版本在后台直接登基生效！
  }
});

// =========================================================================
// 智能网络流拦截控制
// =========================================================================
addEventListener('fetch', (event) => {
  // 仅拦截标准的安全 GET 核心拉取请求，放行所有 POST 提交和表单接口
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // -------------------------------------------------------------------------
  // 分流策略一：【API 动态数据网络优先容灾管道 —— 精准离线先验优化版】
  // -------------------------------------------------------------------------
  if (url.pathname.includes('/api/')) {
    // ⚡️【极客体验核心】：如果系统原生探测到当前设备完全没有网络信号（如在地下室、电梯里、坐飞机）
    if (!navigator.onLine) {
      console.log(`班蔚检测到设备处于离线状态，直接提取本地缓存数据: ${url.pathname}`);
      event.respondWith(
        caches.match(event.request).then((cachedApiResponse) => {
          if (cachedApiResponse) return cachedApiResponse; // 🎯 场景 A：命中之前有网时存下的 JSON，瞬间无感秒开！
          
          // 🎯 场景 B：断网且本地也是首次点击该位置（没存过数据），伪造合规空 JSON，100%阻断前端 Vue 报错卡死崩溃
          return new Response(JSON.stringify({ status: "offline", data: [], message: "当前处于离线状态" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        })
      );
      return; // 💥 直接彻底拦截跳出，绝对不让请求去网络层硬撞浪费超时时间！
    }

    // 🌐 如果系统检测到当前有网络，正常走标准的“网络优先，实时拉取并静默回填”策略
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        // 只要服务器成功返回了合规的 200 动态数据，顺手把它更新覆盖进 VERSION 主保险箱里，保持时效性
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(VERSION).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse; // 把最热乎的线上数据扔给网页渲染
      }).catch(async () => {
        // 🛡️ 极端弱网第二道防线：防止那种手机看着满格信号但实际由于基站拥堵请求超时失败的魔鬼场景
        const cachedApiResponse = await caches.match(event.request);
        if (cachedApiResponse) return cachedApiResponse;
        return new Response(JSON.stringify({ status: "offline", data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      })
    );
    return; // 彻底结束 API 拦截分支
  }

  // -------------------------------------------------------------------------
  // ⚡️ 分流策略二：【网页导航与纯路径虚拟路由拦截 —— 彻底消灭恐龙白屏】
  // -------------------------------------------------------------------------
  const isNav = event.request.mode === 'navigate';
  const isHtmlHeader = event.request.headers.get('accept')?.includes('text/html');

  if (isNav || isHtmlHeader) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        //场景 A：如果本地物理缓存里有这个网页，直接秒开
        if (cachedResponse) return cachedResponse;

        // 场景 B：如果断网手动刷新了无后缀的伪静态虚拟路由（如 /rainbow），fetch 报错
        // 强制降级去本地掏出最万能、被 Parcel 预缓存 100% 存在的主首页外壳 '/'（即 index.html）甩给浏览器！
        // 确保网页框架在断网下安全加载成功，并顺畅触发你前端写的“无感断网红条提示”，体验逼近原生大厂！
        return fetch(event.request).catch(() => caches.match('/'));
      })
    );
    return; // 彻底结束网页导航分流分支
  }

  // -------------------------------------------------------------------------
  // 💥 分流策略三：【静态长效资产加载策略 —— 缓存优先 + 强制 CORS 注入 + 3000张淘汰】
  // -------------------------------------------------------------------------
  
  // =========================================================================
  // 💥 静态长效资产加载策略（缓存优先 + 3000张图片限额自动清理，保持不变）
  // =========================================================================
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif|woff2|css|js)$/i);

        if (isStaticAsset) {
          const responseToCache = networkResponse.clone();
          event.waitUntil(
            caches.open(VERSION).then(async (cache) => {
              await cache.put(event.request, responseToCache); // 稳固焊进用户硬盘
              await limitCacheSize(VERSION, 3000); // 触发数量垃圾清理，约束文件上限
            })
          );
        }

        return networkResponse;
      });
    })
  );


});

