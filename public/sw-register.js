// pwa register serviceWorker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(
      new URL('/sw.js', import.meta.url),
      { type: 'module' } // Use 'module' for ES module support in the worker
    )
    .then(registration => {
      console.log('SW registered:', registration);
    })
    .catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}