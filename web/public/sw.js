/**
 * DeutschFlow Service Worker (Section 11.1).
 * Caches native-quality audio for offline playback and bandwidth reduction.
 * Audio files are cached after first successful playback.
 */

const CACHE_NAME = "deutschcoach-audio-v1";
const AUDIO_URL_PATTERN = /\/audio\/(.+)\.(mp3|wav|ogg)$/;

// Install — pre-cache nothing; we cache on first use.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate — clean up old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

// Fetch — serve audio from cache when available, otherwise fetch and cache.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle audio requests
  if (!AUDIO_URL_PATTERN.test(url.pathname) && !url.pathname.startsWith("/audio/")) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        if (cached) {
          // Serve cached audio immediately
          return cached;
        }
        // Fetch from network, cache the response, return it
        return fetch(event.request).then((response) => {
          if (response.ok && response.status === 200) {
            // Clone the response — one to cache, one to return
            const clone = response.clone();
            cache.put(event.request, clone);
          }
          return response;
        }).catch(() => {
          // Network failed, try cache one more time (for previously cached files)
          return caches.match(event.request);
        });
      })
    )
  );
});
