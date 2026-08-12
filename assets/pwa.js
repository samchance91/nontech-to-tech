/* ============================================================
   PXPWA (Part 8) — service-worker registration, update flow, a
   considered install prompt, and the client side of the sync outbox.
   Install prompt rules (from the brief):
     · never on the first visit,
     · dismissible inline card (not a modal),
     · iOS gets tailored Add-to-Home-Screen instructions,
     · a dismissal is respected for 30 days,
     · nothing shows once the app is running standalone.
   ============================================================ */
(function (global) {
  "use strict";
  var LS_VISITS = "px_visits", LS_DISMISS = "px_install_dismissed";
  var DISMISS_DAYS = 30, MIN_VISITS = 2;
  var deferred = null;

  function lsGet(k, fb) { try { var v = localStorage.getItem(k); return v == null ? fb : v; } catch (e) { return fb; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function isStandalone() { return (global.matchMedia && global.matchMedia("(display-mode: standalone)").matches) || global.navigator.standalone === true; }
  function isIOS() { return /iphone|ipad|ipod/i.test(global.navigator.userAgent) && !global.MSStream; }
  function dismissedRecently() { var t = parseInt(lsGet(LS_DISMISS, "0"), 10); return t && (Date.now() - t) < DISMISS_DAYS * 864e5; }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function mountPoint() { return document.getElementById("px-install") || (function () { var d = el("div"); d.id = "px-install"; d.className = "install-dock"; document.body.appendChild(d); return d; })(); }

  function eligible() {
    if (isStandalone()) return false;
    if (dismissedRecently()) return false;
    if (parseInt(lsGet(LS_VISITS, "0"), 10) < MIN_VISITS) return false;   // not first visit
    return !!deferred || isIOS();                                          // installable, or iOS manual
  }

  function dismiss(node) { lsSet(LS_DISMISS, String(Date.now())); if (node && node.parentNode) node.remove(); }

  function showCard() {
    if (!eligible()) return;
    var host = mountPoint(); host.innerHTML = "";
    var card = el("div", "install-card");
    card.setAttribute("role", "region"); card.setAttribute("aria-label", "Install Propelr");
    if (deferred) {
      card.innerHTML =
        '<div class="install-card__body"><p class="install-card__ttl">Install Propelr</p>' +
        '<p class="muted">Add it to your device — it opens instantly and works offline.</p></div>';
      var actions = el("div", "install-card__actions");
      var install = el("button", "btn btn--sm", "Install");
      install.type = "button";
      install.addEventListener("click", function () {
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; card.remove(); });
      });
      var later = el("button", "btn btn--ghost btn--sm", "Not now");
      later.type = "button"; later.addEventListener("click", function () { dismiss(card); });
      actions.appendChild(install); actions.appendChild(later);
      card.appendChild(actions);
    } else { // iOS: no beforeinstallprompt — show the manual steps
      card.innerHTML =
        '<div class="install-card__body"><p class="install-card__ttl">Add Propelr to your Home Screen</p>' +
        '<p class="muted">Tap the <b>Share</b> icon, then <b>Add to Home Screen</b> — it opens like an app and works offline.</p></div>';
      var close = el("button", "btn btn--ghost btn--sm", "Got it");
      close.type = "button"; close.addEventListener("click", function () { dismiss(card); });
      var a2 = el("div", "install-card__actions"); a2.appendChild(close); card.appendChild(a2);
    }
    host.appendChild(card);
  }

  function registerSW() {
    if (!("serviceWorker" in global.navigator)) return;
    global.navigator.serviceWorker.register("sw.js", { scope: "./" }).then(function (reg) {
      reg.addEventListener("updatefound", function () {
        var sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", function () {
          // a new version is ready while an old one still controls the page
          if (sw.state === "installed" && global.navigator.serviceWorker.controller && global.PX && PX.toast) {
            PX.toast("A new version is ready.", { duration: 6000, undo: null });
          }
        });
      });
    }).catch(function () { /* SW unsupported / blocked — app still works, just not offline */ });
  }

  /* ---- client side of the offline write outbox ---- */
  var ODB = "px-outbox", OSTORE = "q";
  function odb() {
    return new Promise(function (res, rej) {
      var rq = indexedDB.open(ODB, 1);
      rq.onupgradeneeded = function (e) { if (!e.target.result.objectStoreNames.contains(OSTORE)) e.target.result.createObjectStore(OSTORE, { keyPath: "id", autoIncrement: true }); };
      rq.onsuccess = function () { res(rq.result); }; rq.onerror = function () { rej(rq.error); };
    });
  }
  var Sync = {
    enqueue: function (entry) {
      return odb().then(function (db) {
        return new Promise(function (res) {
          var t = db.transaction(OSTORE, "readwrite");
          t.objectStore(OSTORE).add({ url: entry.url, method: entry.method || "POST", headers: entry.headers || { "Content-Type": "application/json" }, body: entry.body, ts: Date.now() });
          t.oncomplete = function () {
            // prefer real Background Sync; fall back to an online-triggered flush
            if ("serviceWorker" in navigator && "SyncManager" in global) {
              navigator.serviceWorker.ready.then(function (r) { return r.sync.register("px-sync"); }).catch(function () {});
            }
            res(true);
          };
          t.onerror = function () { res(false); };
        });
      });
    },
    pending: function () { return odb().then(function (db) { return new Promise(function (res) { var r = db.transaction(OSTORE).objectStore(OSTORE).count(); r.onsuccess = function () { res(r.result); }; r.onerror = function () { res(0); }; }); }); },
    // page-side drain (works without Background Sync, e.g. iOS): replay + delete on success
    flush: function () {
      return odb().then(function (db) {
        return new Promise(function (res) {
          var items = [], cur = db.transaction(OSTORE).objectStore(OSTORE).openCursor();
          cur.onsuccess = function (e) { var c = e.target.result; if (c) { items.push(Object.assign({ id: c.key }, c.value)); c.continue(); } else res(items); };
          cur.onerror = function () { res(items); };
        });
      }).then(function (items) {
        return items.reduce(function (chain, it) {
          return chain.then(function () {
            return fetch(it.url, { method: it.method, headers: it.headers, body: it.body })
              .then(function (r) { if (r && r.ok) return odb().then(function (db) { return new Promise(function (res) { var t = db.transaction(OSTORE, "readwrite"); t.objectStore(OSTORE).delete(it.id); t.oncomplete = res; t.onerror = res; }); }); })
              .catch(function () {});
          });
        }, Promise.resolve());
      });
    }
  };

  var PWA = {
    init: function () {
      lsSet(LS_VISITS, String(parseInt(lsGet(LS_VISITS, "0"), 10) + 1)); // count this visit
      registerSW();
      global.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; showCard(); });
      global.addEventListener("appinstalled", function () { deferred = null; var h = document.getElementById("px-install"); if (h) h.innerHTML = ""; });
      global.addEventListener("online", function () { Sync.flush(); });
      // iOS (no beforeinstallprompt) — decide after boot
      setTimeout(showCard, 800);
    },
    showCard: showCard, eligible: eligible, isStandalone: isStandalone, isIOS: isIOS,
    Sync: Sync
  };
  global.PXPWA = PWA;
  global.PXSync = Sync;
})(window);
