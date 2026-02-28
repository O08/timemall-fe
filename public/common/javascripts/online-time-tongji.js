// Define functions FIRST (they are hoisted safely)
function setupActivityListeners(onActivity) {
    let throttleTimer;
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => {
            if (!throttleTimer) {
                onActivity('activity');
                throttleTimer = setTimeout(() => { throttleTimer = null; }, 2000);
            }
        }, { passive: true });
    });
}

function loadOnlineTimeTongjiWorker() {
    // Use a local variable to avoid bundler conflicts with 's'
    const workerPath = new URL('/common/javascripts/online-time-tongji-worker.js', import.meta.url);
    const workerInstance = new SharedWorker(workerPath, { 
        type: 'module',
        name: 'OnlineTimeTongjiWorker' // Optional: helpful for debugging in chrome://inspect/#workers
    });
    const port = workerInstance.port;

    port.postMessage({
        type: 'loginStatus',
        value: !!localStorage.getItem("Tidentity001")
    });

    port.start();
    setupActivityListeners((msg) => port.postMessage(msg));
}



(function() {
  // EXECUTE LAST
    if (window.SharedWorker) {
        console.log("loading Online Time Tongji Worker...");

        loadOnlineTimeTongjiWorker();
    } else {
        console.warn("SharedWorker is not supported in this browser. Heartbeat will not run.");
    }
  
})();
