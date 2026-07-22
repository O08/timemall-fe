import { manifest, version } from '@parcel/service-worker';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkOnly, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import * as navigationPreload from 'workbox-navigation-preload';

// ============ 常量配置 ============
const STATIC_CACHE = `static-${version}`;
const API_CACHE = `api-${version}`;
const ALL_CACHES = [STATIC_CACHE, API_CACHE];

const offlineFallbackPage = "/pwa-bad-network.html"; 

const NETWORK_ONLY_WHITELIST = ['/sse/connect', '/rtm', '/sse/close'];


const DEBUG = false; // 生产环境关掉日志
const log = (...args) => DEBUG && console.log('[SW]', ...args);

// ============ 安装 ============
async function install() {
    const cache = await caches.open(STATIC_CACHE);
    // 用 allSettled 替代 addAll，单个资源失败不影响整体安装
    const results = await Promise.allSettled(
        manifest.map(url => cache.add(url))
    );
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
        log('预缓存失败:', failed.length, '个资源');
    }
}

addEventListener('install', e => {
  e.waitUntil(install());

  if (EventTarget.prototype.addRoutes) {
    e.addRoutes([
      {
          condition: {
              urlPattern: "*/{api/v1/ms/sse/connect,api/v1/ms/sse/close,rtm}*"
          },
          source: "network" 
      }
    ]); 
  }
});

// ============ 激活 ============
addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !ALL_CACHES.includes(name))
                    .map((name) => {
                        log('清理旧缓存:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ============ SKIP_WAITING ============
addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// ============ Navigation Preload ============
if (navigationPreload.isSupported()) {
    navigationPreload.enable();
}

// ============ 智能路径重映射 ============
async function smartCacheMatch(request, cacheName) {
    const cache = await caches.open(cacheName);

    const exactMatch = await cache.match(request);
    if (exactMatch) {
        log('精确命中:', request.url);
        return exactMatch;
    }

    const url = new URL(request.url);

    if (!url.pathname.includes('.')) {
        let cleanPathname = url.pathname;
        if (cleanPathname.endsWith('/')) {
            cleanPathname = cleanPathname.slice(0, -1);
        }

        const physicalFileUrl = `${url.origin}${cleanPathname}.html`;
        const extensionMatch = await cache.match(physicalFileUrl);
        if (extensionMatch) {
            log('重映射命中:', physicalFileUrl);
            return extensionMatch;
        }

        if (cleanPathname === '' || cleanPathname === '/index') {
            const indexMatch = await cache.match(`${url.origin}/index.html`);
            if (indexMatch) {
                log('首页命中');
                return indexMatch;
            }
        }
    }

    return null;
}




// ============ Worker请求 ============
registerRoute(
  ({ url, request }) => {
      const isWorker = request.destination === 'worker' || request.destination === 'sharedworker';
      const isTongji = url.pathname.includes('online-time-tongji');
      return isWorker || isTongji;
  },
  async ({ request }) => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) {
          log('Worker缓存命中');
          return cached;
      }
      return fetch(request);
  }
);


// ============ 非GET请求 → 直通网络 ============
registerRoute(
    ({ request }) => request.method !== 'GET',
    new NetworkOnly()
);


// ============ 文件上传下载 → 直通网络 ============
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/file/'),
    new NetworkOnly()
);

// ============ API → NetworkFirst ============
registerRoute(
    ({ url, request }) => { 
        const isLongConnectionApi = NETWORK_ONLY_WHITELIST.some(path => url.pathname.includes(path));

       return !isLongConnectionApi && url.pathname.includes('/api/') && request.method === 'GET'
      },
    new NetworkFirst({
        cacheName: API_CACHE,
        networkTimeoutSeconds: 2.0,
        matchOptions: { ignoreVary: true },
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 86400 }),
            {
                handlerDidError: async () => {
                    return new Response(
                        JSON.stringify({ error: "Offline", message: "服务暂时不可用" }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                }
            }
        ]
    })
);


// ============ 静态资源 → CacheFirst（提前到导航前面）============
// ✅ 关键改动：静态资源正则放在导航路由前面，让 .js/.css/.png 等请求秒匹配
const STATIC_EXT_RE = /\.(js|css|avif|png|jpg|jpeg|gif|svg|ico|webp|woff2?|json|mp3|mp4|webm|wav|wasm|txt|xml|map|ttf)$/i;

registerRoute(
    ({ request, url }) => {
        // 非HTML文档 + 有明确后缀 → 静态资源，秒匹配
        if (request.mode === 'navigate') return false;
        if (request.destination === 'document') return false;
        if (request.headers.get('accept')?.includes('text/html')) return false;
        return STATIC_EXT_RE.test(url.pathname);
    },
    new CacheFirst({
        cacheName: STATIC_CACHE,
        plugins: [
            new ExpirationPlugin({ maxEntries: 1500, maxAgeSeconds: 30 * 86400 }),
            new CacheableResponsePlugin({ statuses: [200] })
        ]
    })
);

// ============ 导航/Clean URL → StaleWhileRevalidate ============
// 效果：立刻用缓存渲染页面（0等待），同时后台更新缓存
registerRoute(
    ({ request, url }) => {
        const isNavigate = request.mode === 'navigate';
        const isHtmlDoc = request.destination === 'document'
            || request.headers.get('accept')?.includes('text/html');
        const isApi = url.pathname.includes('/api/') || url.pathname.startsWith('/rtm');
        // 无后缀的非API路径视为页面路由
        const isCleanUrlPage = !STATIC_EXT_RE.test(url.pathname) && !isApi;
        return isNavigate || isHtmlDoc || isCleanUrlPage;
    },
    new StaleWhileRevalidate({
        cacheName: STATIC_CACHE,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            {
                handlerDidError: async ({ request }) => {
                    const offlinePage = await smartCacheMatch(request, STATIC_CACHE);
                    if (offlinePage) return offlinePage;
                    const cache = await caches.open(STATIC_CACHE);
                    return await cache.match(offlineFallbackPage);
                }
            }
        ]
    })
);

// ============ 全局兜底 ============
setCatchHandler(async ({ event }) => {
    if (!event || event.request.method !== 'GET') return Response.error();

    if (
        event.request.mode === 'navigate' ||
        event.request.destination === 'document' ||
        event.request.headers.get('accept')?.includes('text/html')
    ) {
        const offlinePage = await smartCacheMatch(event.request, STATIC_CACHE);
        if (offlinePage) return offlinePage;
        const cache = await caches.open(STATIC_CACHE);
        const fallback = await cache.match(offlineFallbackPage);
        if (fallback) return fallback;
    }

    return Response.error();
});