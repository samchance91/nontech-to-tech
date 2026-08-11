/* ============================================================
   PXStore (Part 5) — local-first state.
   Source of truth: IndexedDB. Memory cache for synchronous UI reads.
   localStorage mirror for an instant first paint + a fallback when IDB
   is unavailable (private mode, etc.). One state blob; syncs to a server
   later (Part 8) — the shape is sync-ready.
   ============================================================ */
(function (global) {
  "use strict";
  var DB = "px-learn", STORE = "state", KEY = "app", LS = "px_state";
  var mem = null, db = null, saveTimer = null, ready = null;

  function blank() {
    return {
      v: 1,
      baseline: null,
      tier: "beginner",
      tierOverridden: false,
      concepts: {},                                   // per-concept signals
      session: { lastSeen: 0, lastDay: null, streak: 0 },
      updatedAt: 0
    };
  }
  function openIDB() {
    return new Promise(function (res) {
      if (!global.indexedDB) return res(null);
      var rq;
      try { rq = indexedDB.open(DB, 1); } catch (e) { return res(null); }
      rq.onupgradeneeded = function (e) { try { e.target.result.createObjectStore(STORE); } catch (x) {} };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { res(null); };
    });
  }
  function idbGet() {
    return new Promise(function (res) {
      if (!db) return res(null);
      try { var t = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY); t.onsuccess = function () { res(t.result || null); }; t.onerror = function () { res(null); }; }
      catch (e) { res(null); }
    });
  }
  function idbPut(v) { try { if (db) db.transaction(STORE, "readwrite").objectStore(STORE).put(v, KEY); } catch (e) {} }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }

  var Store = {
    init: function () {
      if (ready) return ready;
      ready = openIDB().then(function (d) {
        db = d;
        return idbGet();
      }).then(function (fromIdb) {
        mem = fromIdb || lsGet(LS) || blank();
        // one-time migration of Part 4's px_baseline
        if (!mem.baseline) {
          var lb = lsGet("px_baseline");
          if (lb) { mem.baseline = lb; if (lb.tier) mem.tier = lb.tier; }
        }
        return mem;
      });
      return ready;
    },
    get state() { return mem || (mem = blank()); },
    save: function () {
      mem.updatedAt = Date.now();
      try { localStorage.setItem(LS, JSON.stringify(mem)); } catch (e) {}
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { idbPut(mem); }, 200);
    },
    reset: function () { mem = blank(); this.save(); }
  };
  global.PXStore = Store;
})(window);
