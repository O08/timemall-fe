if ('serviceWorker' in navigator) {
  let isUpgrading = false; 
  let refreshing = false;

  // 🛠️ 核心强更新辅助函数：全安全挂载，阻断用户全部操作
  function forceSystemUpgrade(waitingWorker) {
    if (isUpgrading) return; // 防止重复触发
    isUpgrading = true; 

    const overlay = document.createElement('div');
    overlay.id = 'pwa-upgrade-overlay';
    overlay.innerHTML = `
      <div style="text-align: center; color: #ffffff; font-family: sans-serif;">
        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #333; border-top: 4px solid #00ffff; border-radius: 50%; -webkit-animation: spin 1s linear infinite; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h2 style="margin: 0 0 10px 0; font-size: 1.2rem; font-weight: 600;">部署系统...</h2>
        <p style="margin: 0; font-size: 0.85rem; color: #888;">正在部署最新系统功能与安全补丁，请稍候</p>
      </div>
      <style>
        @-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
    
    // 高级深色毛玻璃/半透明阻断样式
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
      backgroundColor: 'rgba(15, 15, 15, 0.96)', backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: '999999', userSelect: 'none', webkitUserSelect: 'none'
    });

    // 确保 DOM 没加载完时也能安全挂载，绝对不会引发 js 崩溃死锁
    const targetTarget = document.body || document.documentElement;
    if (targetTarget) {
      targetTarget.appendChild(overlay);
    }
    
    // 向后台的 sw.js 发送切换暗号，直接开始“秒交接”
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }

  window.addEventListener('load', () => {
    const swPath = '/' + 'sw.js'; 

    navigator.serviceWorker.register(swPath, { scope: '/' }).then(registration => {
      console.log('班蔚 PWA 基础层加载成功');

      // 如果老用户刚打开网页时，发现上一次就已经默默下载好了新版
      if (registration.waiting) {
        forceSystemUpgrade(registration.waiting);
        return;
      }

      // 如果用户正在使用软件的途中，服务器发布了新打包的版本
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          // 当新版代码在后台全量下载安装成功的一瞬间
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('班蔚检测到线上有新版发布，直接启动系统级强制更新！');
            forceSystemUpgrade(installingWorker);
          }
        });
      });
    })
    .catch(error => {
      console.log('PWA 初始化失败:', error);
    });
  });

  // 系统级交接班终点站
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || !isUpgrading) return; // 终极卡口：确保只有由我们主动触发的强更才允许刷新
    refreshing = true;
    window.location.reload(); // 🚀 完美交接完毕，网页自动刷新重载
  });
}
