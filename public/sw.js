
import { manifest, version } from '@parcel/service-worker';

async function install() {
  const cache = await caches.open(version);
  await cache.addAll(manifest); // Pre-cache all files bundled by Parcel
}

addEventListener('install', e => e.waitUntil(install()));
