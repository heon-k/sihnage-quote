// ================================================
// 서비스워커 (sw.js)
// 역할: 파일을 폰에 저장해두고, 업데이트를 관리
// ================================================

const CACHE_NAME = 'signage-quote-v11';
const URLS_TO_CACHE = [
  '/sihnage-quote/',
  '/sihnage-quote/index.html',
];

// ① 설치: 처음 앱을 열 때 파일을 폰에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 파일 저장 중...');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  // 새 버전이 있으면 즉시 활성화 (기다리지 않음)
  self.skipWaiting();
});

// ② 활성화: 이전 버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] 이전 버전 삭제:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // 모든 탭에 즉시 적용
  self.clients.claim();
});

// ③ 요청 처리: 네트워크 우선 → 실패 시 저장된 버전 제공
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 네트워크 성공 → 새 버전을 저장하고 제공
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 네트워크 실패 (오프라인) → 저장된 버전 제공
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          return caches.match('/sihnage-quote/index.html');
        });
      })
  );
});
