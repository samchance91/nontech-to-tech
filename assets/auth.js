/* ============================================================
   PXAuth (invite-only login + profile) for the adaptive app.
   Talks to the same Supabase project as the classic app, but over
   plain REST (no CDN library) so it stays self-contained and offline
   friendly. Sign-up is intentionally absent — accounts are provisioned
   by invite; people request access by email.

   Session + profile live in PXStore.state.auth:
     { email, userId, name, avatar, pictures[], token, refresh, at }
   Avatar and pictures are kept on-device (data URLs); the name is also
   mirrored to the Supabase `profiles` table when reachable.
   ============================================================ */
(function (global) {
  "use strict";
  var S = global.PXStore;
  var URL = "https://kxrlsvbgzjhmncodnyzp.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4cmxzdmJnempobW5jb2RueXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MTU2MDEsImV4cCI6MjEwMTQ5MTYwMX0.lruqycQV-EdxjOyL4ILncV_kWX55pVWIxikNEOcXYHw";

  function headers(extra) { return Object.assign({ apikey: ANON, "Content-Type": "application/json" }, extra || {}); }
  function A() { return S.state.auth || null; }
  function norm(e) { return String(e || "").trim().toLowerCase(); }

  var Auth = {
    configured: function () { return !!URL && !!ANON; },
    session: function () { var a = A(); return (a && a.email) ? a : null; },

    login: function (email, password) {
      email = norm(email);
      if (!email || !password) return Promise.resolve({ error: "Enter your email and password." });
      return fetch(URL + "/auth/v1/token?grant_type=password", {
        method: "POST", headers: headers(), body: JSON.stringify({ email: email, password: password })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) return { error: d.error_description || d.msg || d.error || "That didn’t work. Check your details, or your invite may not be active yet." };
          var user = d.user || {};
          return Auth._getProfile(d.access_token, user.id).catch(function () { return null; }).then(function (prof) {
            var name = (prof && prof.name) || (user.user_metadata && user.user_metadata.name) || email.split("@")[0];
            var prev = A();
            S.state.auth = {
              email: email, userId: user.id, name: name,
              // keep any avatar/pictures already saved on this device for this same account
              avatar: (prev && prev.email === email ? prev.avatar : null) || null,
              pictures: (prev && prev.email === email ? prev.pictures : null) || [],
              token: d.access_token, refresh: d.refresh_token, at: Date.now()
            };
            S.save();
            return { ok: true };
          });
        });
      }).catch(function () {
        return { error: "Can’t reach the server right now — check your connection and try again.", offline: true };
      });
    },

    // Request an invite: records the visitor's email in Supabase `invite_requests`
    // (anon insert). No admin address is ever exposed on the page.
    requestInvite: function (email) {
      email = norm(email);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.resolve({ error: "Enter a valid email address." });
      // Send only the email; the DB fills requested_at/id from its own defaults,
      // so this can't fail on a schema that omits an optional column.
      return fetch(URL + "/rest/v1/invite_requests", {
        method: "POST", headers: headers({ Prefer: "return=minimal" }),
        body: JSON.stringify({ email: email })
      }).then(function (r) {
        if (r.ok || r.status === 201 || r.status === 409) return { ok: true };   // 409 = already requested, still fine
        return { error: "Couldn’t send your request just now. Please try again shortly." };
      }).catch(function () { return { error: "Can’t reach the server — check your connection and try again.", offline: true }; });
    },

    _getProfile: function (token, id) {
      if (!id) return Promise.resolve(null);
      return fetch(URL + "/rest/v1/profiles?id=eq." + id + "&select=*", { headers: headers({ Authorization: "Bearer " + token }) })
        .then(function (r) { return r.ok ? r.json() : []; }).then(function (a) { return (a && a[0]) || null; });
    },

    // Local-first: update the on-device profile immediately; mirror the name to Supabase when possible.
    saveProfile: function (patch) {
      var a = A(); if (!a) return Promise.resolve({ error: "Not signed in." });
      Object.assign(a, patch); S.state.auth = a; S.save();
      if (a.token && a.userId && patch && patch.name != null) {
        return fetch(URL + "/rest/v1/profiles?on_conflict=id", {
          method: "POST",
          headers: headers({ Authorization: "Bearer " + a.token, Prefer: "resolution=merge-duplicates,return=minimal" }),
          body: JSON.stringify({ id: a.userId, email: a.email, name: a.name })
        }).then(function () { return { ok: true }; }).catch(function () { return { ok: true, synced: false }; });
      }
      return Promise.resolve({ ok: true });
    },

    logout: function () {
      var a = A();
      // Clear + persist immediately so an instant reload can't restore the session.
      var clear = function () { S.state.auth = null; return S.flush ? S.flush() : Promise.resolve(S.save()); };
      if (a && a.token) {
        return fetch(URL + "/auth/v1/logout", { method: "POST", headers: headers({ Authorization: "Bearer " + a.token }) }).then(clear, clear);
      }
      return clear();
    },

    initials: function () {
      var a = A(); if (!a) return "?";
      var n = (a.name || a.email || "?").trim();
      var parts = n.split(/\s+/);
      var s = (parts[0] ? parts[0][0] : "") + (parts.length > 1 ? (parts[parts.length - 1][0] || "") : "");
      return (s || n[0] || "?").toUpperCase();
    },

    // ---- cross-device progress sync (Supabase `progress` table) ----
    // The learning state only — never the auth tokens or on-device photos.
    _cloudState: function () {
      var st = S.state;
      return { v: st.v, baseline: st.baseline, tier: st.tier, tierOverridden: st.tierOverridden, tracks: st.tracks, track: st.track, tracksCompleted: st.tracksCompleted, concepts: st.concepts, session: st.session, updatedAt: st.updatedAt };
    },
    pullProgress: function () {
      var a = A(); if (!a || !a.token || !a.userId) return Promise.resolve();
      return fetch(URL + "/rest/v1/progress?user_id=eq." + a.userId + "&select=data", { headers: headers({ Authorization: "Bearer " + a.token }) })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (rows) {
          var data = rows && rows[0] && rows[0].data;
          if (data && typeof data === "object") {
            ["baseline", "tier", "tierOverridden", "tracks", "track", "tracksCompleted", "concepts", "session"].forEach(function (k) { if (data[k] != null) S.state[k] = data[k]; });
            _syncing = true; S.save(); _syncing = false;   // persist locally without re-triggering a push
          }
        }).catch(function () { /* offline / unreachable — local state stands */ });
    },
    pushProgress: function () {
      var a = A(); if (!a || !a.token || !a.userId) return Promise.resolve();
      return fetch(URL + "/rest/v1/progress?on_conflict=user_id", {
        method: "POST",
        headers: headers({ Authorization: "Bearer " + a.token, Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify({ user_id: a.userId, data: Auth._cloudState(), updated_at: new Date().toISOString() })
      }).catch(function () { /* kept locally; retries on next save */ });
    },

    // ---- Showcase (shared project wall, Supabase `posts`) ----
    listPosts: function () {
      var a = A();
      return fetch(URL + "/rest/v1/posts?select=*&order=created_at.desc", { headers: headers(a && a.token ? { Authorization: "Bearer " + a.token } : {}) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rows) { if (rows) { S.state.posts = rows; S.save(); return rows; } return S.state.posts || []; })
        .catch(function () { return S.state.posts || []; });   // offline: show the local cache
    },
    addPost: function (post) {
      var a = A(); if (!a) return Promise.resolve({ error: "Not signed in." });
      var row = { user_id: a.userId, name: a.name || a.email, kind: post.kind || "project", title: post.title, body: post.body, link: post.link || null };
      var local = Object.assign({ id: "local-" + Date.now(), created_at: new Date().toISOString(), _mine: true, fields: post.fields || null, valid: !!post.valid }, row);
      S.state.posts = [local].concat(S.state.posts || []); S.save();   // optimistic
      if (a.token && a.userId) {
        return fetch(URL + "/rest/v1/posts", { method: "POST", headers: headers({ Authorization: "Bearer " + a.token, Prefer: "return=representation" }), body: JSON.stringify(row) })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (saved) { if (saved && saved[0]) { S.state.posts = (S.state.posts || []).map(function (p) { return p === local ? Object.assign({ _mine: true }, saved[0]) : p; }); S.save(); } return { ok: true }; })
          .catch(function () { return { ok: true, synced: false }; });
      }
      return Promise.resolve({ ok: true });
    },
    deletePost: function (id) {
      var a = A();
      S.state.posts = (S.state.posts || []).filter(function (p) { return p.id !== id; }); S.save();
      if (a && a.token && String(id).indexOf("local-") !== 0) {
        return fetch(URL + "/rest/v1/posts?id=eq." + id, { method: "DELETE", headers: headers({ Authorization: "Bearer " + a.token }) }).catch(function () {});
      }
      return Promise.resolve();
    },
    mine: function (post) { var a = A(); return post._mine || (a && post.user_id === a.userId); }
  };

  // Mirror every local save up to Supabase (debounced) whenever signed in.
  var _syncing = false, _pushTimer = null;
  if (S && typeof S.save === "function") {
    var _origSave = S.save.bind(S);
    S.save = function () {
      _origSave();
      if (_syncing) return;
      if (!Auth.session()) return;
      clearTimeout(_pushTimer);
      _pushTimer = setTimeout(function () { Auth.pushProgress(); }, 800);
    };
  }

  global.PXAuth = Auth;
})(window);
