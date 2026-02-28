
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 Minutes
// worker.js
const ports = new Set();
let lastActivity = Date.now();
let userLogined = false;
let timer = null;

self.onconnect = (e) => {
  const port = e.ports[0];
  ports.add(port);

  port.onmessage = (event) => {
    if (event.data === 'activity') {
      lastActivity = Date.now();
    } else if (event.data.type === 'loginStatus') {
      userLogined = event.data.value;
    }
  };

  // Logic to handle tab closing (optional but recommended)
  port.onmessageerror = () => ports.delete(port);
  
  if (!timer) {

    timer = setInterval(() => {
      const isIdle = (Date.now() - lastActivity) > IDLE_TIMEOUT;
      if (!isIdle && userLogined) {
        fetch('/api/v1/web_mall/online/heartbeat/ping', { method: 'POST', keepalive: true });
      }
    }, 60000);
  }
};



