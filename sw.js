/* ============================================================
   Propelr service worker (Part 8).
   · Precaches the app shell so the app opens instantly and offline.
   · Static assets: stale-while-revalidate (fast, self-healing).
   · Navigations: network-first, falling back to the cached shell.
   · Cross-origin (YouTube embeds, Supabase): passthrough, never cached.
   · Offline writes: queued in an IndexedDB outbox and replayed via
     Background Sync (or an explicit flush) when connectivity returns.
   Bump CACHE to ship a new shell; old caches are cleared on activate.
   ============================================================ */
var CACHE = "propelr-v9";
var SHELL = [
  "./app.html",
  "./manifest.json",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/store.js",
  "./assets/auth.js",
  "./assets/adapt.js",
  "./assets/baseline.js",
  "./assets/content.js",
  "./assets/video.js",
  "./assets/lesson.js",
  "./assets/pwa.js",
  "./assets/fonts/inter.woff2",
  "./assets/fonts/poppins-500.woff2",
  "./assets/fonts/poppins-600.woff2",
  "./assets/fonts/poppins-700.woff2",
  "./assets/fonts/space-mono-400.woff2",
  "./assets/fonts/space-mono-700.woff2",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/audio/session-complete.mp3",
  "./assets/audio/badge-small.mp3",
  "./assets/audio/badge-big.mp3",
  "./assets/audio/level-up.mp3",
  "./assets/levels/level-1.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // addAll is atomic; if any 404s the install fails, so cache items individually.
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isStatic(url) {
  return /\.(css|js|woff2|png|svg|json|jpg|jpeg|webp|ico|mp3|m4a|ogg|wav)$/.test(url.pathname);
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;                 // writes go through the outbox, not here
  var url = new URL(req.url);

  // Cross-origin (youtube-nocookie, supabase, etc.): let the network handle it.
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to the cached shell so the app opens offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match("./app.html"); });
      })
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isStatic(url)) {
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match(req).then(function (cached) {
          var network = fetch(req).then(function (res) {
            if (res && res.status === 200) c.put(req, res.clone());
            return res;
          }).catch(function () { return cached; });
          return cached || network;
        });
      })
    );
  }
});

/* ---- Background-sync outbox for offline writes ---- */
var OUTBOX_DB = "px-outbox", OUTBOX_STORE = "q";
function outboxDB() {
  return new Promise(function (res, rej) {
    var rq = indexedDB.open(OUTBOX_DB, 1);
    rq.onupgradeneeded = function (ev) { ev.target.result.createObjectStore(OUTBOX_STORE, { keyPath: "id", autoIncrement: true }); };
    rq.onsuccess = function () { res(rq.result); };
    rq.onerror = function () { rej(rq.error); };
  });
}
function outboxAll() {
  return outboxDB().then(function (db) {
    return new Promise(function (res) {
      var out = [], cur = db.transaction(OUTBOX_STORE).objectStore(OUTBOX_STORE).openCursor();
      cur.onsuccess = function (e) { var c = e.target.result; if (c) { out.push(Object.assign({ id: c.key }, c.value)); c.continue(); } else res(out); };
      cur.onerror = function () { res(out); };
    });
  });
}
function outboxDelete(id) {
  return outboxDB().then(function (db) {
    return new Promise(function (res) { var t = db.transaction(OUTBOX_STORE, "readwrite"); t.objectStore(OUTBOX_STORE).delete(id); t.oncomplete = res; t.onerror = res; });
  });
}
function drainOutbox() {
  return outboxAll().then(function (items) {
    return items.reduce(function (chain, it) {
      return chain.then(function () {
        return fetch(it.url, { method: it.method || "POST", headers: it.headers || { "Content-Type": "application/json" }, body: it.body })
          .then(function (r) { if (r && r.ok) return outboxDelete(it.id); /* keep on non-2xx to retry later */ })
          .catch(function () { /* offline again — keep it queued */ });
      });
    }, Promise.resolve());
  });
}

self.addEventListener("sync", function (e) {
  if (e.tag === "px-sync") e.waitUntil(drainOutbox());
});

self.addEventListener("message", function (e) {
  var d = e.data || {};
  if (d.type === "SKIP_WAITING") self.skipWaiting();
  if (d.type === "px-flush") e.waitUntil(drainOutbox().then(function () {
    if (e.source && e.source.postMessage) e.source.postMessage({ type: "px-flushed" });
  }));
});
