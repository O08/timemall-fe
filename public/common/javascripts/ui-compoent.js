
import "/common/javascripts/import-jquery.js";

function CustomAlertModal() {

    this.alert = function(message) {
      
      // 🌟单例覆盖的同时，彻底清除老节点的背景定时器，杜绝内存泄漏
      var existingModal = document.querySelector('.alertModal');
      if (existingModal) {
        // 从老节点上取出保存的定时器 ID 并将其掐断
        var oldTimer = existingModal.getAttribute('data-timer-id');
        if (oldTimer) {
          clearTimeout(parseInt(oldTimer, 10));
        }
        existingModal.remove(); // 物理移除老节点
      }
  
      var alertModalHtmlString = `
        <div class="alertModal">
          <div class="custom-notify-body">
            <!-- 右上角标准小叉号图标 -->
            <span class="custom-notify-close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </span>
            ${message}
          </div>
        </div>
      `;
  
      // 原生 DOM 构建与页面挂载
      var modalBox = document.createElement('div');
      modalBox.innerHTML = alertModalHtmlString.trim();
      var notifyNode = modalBox.firstChild; 
      document.body.appendChild(notifyNode);
  
      var autoCloseTimer = null; 
  
      // 封装通用的安全离场销毁逻辑（闭包环境）
      function closeNotification() {
        // 触发离场时，首先切断自动关闭定时器，防止垃圾事件重复触发
        if (autoCloseTimer) {
          clearTimeout(autoCloseTimer);
          autoCloseTimer = null;
        }
  
        if (document.body.contains(notifyNode)) {
          // 触发向上收回至屏幕外的 CSS 过渡动画
          notifyNode.classList.remove('is-show');
          
          // 等待 350ms 离场动画结束后，彻底从 DOM 树及内存中精准粉碎
          setTimeout(function() {
            if (notifyNode && notifyNode.parentNode) {
              notifyNode.remove();
            }
          }, 350);
        }
      }
  
      // 科学的人机交互：唯独点击右上角的叉号按钮才会触发关闭，中间文本区域允许自由复制
      var closeBtn = notifyNode.querySelector('.custom-notify-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.stopPropagation(); // 阻止事件冒泡
          closeNotification();
        });
      }
  
      // 异步触发：给予浏览器 50ms 准备时间，激活动态弹性下滑
      setTimeout(function() {
        if (document.body.contains(notifyNode)) {
          notifyNode.classList.add('is-show');
        }
      }, 50);
      
      // 自动维持 6000 毫秒后安全自销毁
      autoCloseTimer = setTimeout(closeNotification, 6000);
  
      // 🌟 深度优化：将当前定时器的 ID 绑定到 DOM 节点属性上，供下一次连续连击时精准定点清除
      notifyNode.setAttribute('data-timer-id', autoCloseTimer);
    }
  }
  
  export { CustomAlertModal };
  
  
  