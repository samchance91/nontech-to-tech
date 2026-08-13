/* ============================================================
   Propelr Adaptive Learning — component library
   The four feedback registers as reusable, dependency-free components.
     PX.toast      · Register 2 · Confirmation (optimistic + undo)
     PX.evaluate   · Register 3 · Evaluative (what · why · next)
     PX.miniAtlas  · Register 4 · Progressive (mastery fills at the moment of action)
   Register 1 (Instant: press/hover/focus) is CSS-driven in styles.css.
   ============================================================ */
(function (global) {
  "use strict";

  var ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    undo: '<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>',
    spark: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    map: '<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    cards: '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
    flame: '<path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1.5.6-2.8 1.3-3.8C9 8 9 6.5 8.5 5.5 10.5 6 12 8 12 8s.4-3.5 0-6z"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  function reduced() { return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- Register 2 · Confirmation: toast with undo ---------- */
  function toastLayer() {
    var l = document.getElementById("px-toasts");
    if (!l) { l = el("div"); l.id = "px-toasts"; l.setAttribute("role", "status"); l.setAttribute("aria-live", "polite"); document.body.appendChild(l); }
    return l;
  }
  function toast(message, opts) {
    opts = opts || {};
    var duration = opts.duration == null ? 4000 : opts.duration;
    var t = el("div", "toast");
    t.appendChild(el("span", "toast__msg", message));
    var timer = null, dismissed = false;
    function dismiss() {
      if (dismissed) return; dismissed = true;
      clearTimeout(timer); t.classList.remove("is-in");
      var done = function () { if (t.parentNode) t.parentNode.removeChild(t); };
      if (reduced()) done(); else setTimeout(done, 240);
    }
    if (opts.undo) {
      var u = el("button", "toast__undo"); u.type = "button"; u.textContent = "Undo";
      u.addEventListener("click", function () { try { opts.undo(); } catch (e) {} dismiss(); });
      t.appendChild(u);
    }
    toastLayer().appendChild(t);
    // enter (Instant→Confirmation): next frame so transition runs
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add("is-in"); }); });
    function arm() { if (duration > 0) timer = setTimeout(dismiss, duration); }
    // pause auto-dismiss on hover/focus so a reader isn't rushed
    t.addEventListener("mouseenter", function () { clearTimeout(timer); });
    t.addEventListener("mouseleave", arm);
    t.addEventListener("focusin", function () { clearTimeout(timer); });
    t.addEventListener("focusout", arm);
    arm();
    return { dismiss: dismiss, node: t };
  }

  /* ---------- Register 3 · Evaluative: answer response ---------- */
  // result = { correct:bool, what:string, why:string, next:{label, href|onClick} }
  function evaluate(container, result) {
    container = typeof container === "string" ? document.querySelector(container) : container;
    var ok = !!result.correct;
    var card = el("div", "evalcard " + (ok ? "is-correct" : "is-wrong"));
    card.setAttribute("role", "status");
    card.setAttribute("tabindex", "-1");
    card.innerHTML =
      '<div class="evalcard__hd"><span class="evalcard__ic">' + icon(ok ? "check" : "x") + '</span>' +
        '<span>' + (ok ? "Correct" : "Not quite") + '</span></div>' +
      (result.what ? '<div class="evalcard__what">' + result.what + '</div>' : '') +
      (result.why ? '<div class="evalcard__why">' + result.why + '</div>' : '') +
      '<div class="evalcard__next"></div>';
    var slot = card.querySelector(".evalcard__next");
    if (result.next) {
      var a;
      if (result.next.href) { a = el("a", "btn btn--sm"); a.href = result.next.href; }
      else { a = el("button", "btn btn--sm"); a.type = "button"; if (result.next.onClick) a.addEventListener("click", result.next.onClick); }
      a.innerHTML = result.next.label + icon("arrowR", "btn__i");
      slot.appendChild(a);
    }
    container.innerHTML = ""; container.appendChild(card);
    // move focus so a screen reader hears the outcome (not on reduced-motion scroll)
    setTimeout(function () { card.focus({ preventScroll: false }); }, 30);
    return card;
  }

  /* ---------- Register 4 · Progressive: the Atlas node (mastery fill) ---------- */
  // A tiny horizontal atlas: nodes fill as checkpoints flip; the avatar walks to the frontier.
  function hexPoints(cx, cy, r) {
    var p = [];
    for (var i = 0; i < 6; i++) { var a = Math.PI / 180 * (60 * i - 90); p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return p.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ");
  }
  function miniAtlas(container, opts) {
    container = typeof container === "string" ? document.querySelector(container) : container;
    opts = opts || {};
    var nodes = opts.nodes || [{ label: "DNS", total: 3, filled: 0 }, { label: "HTTP", total: 3, filled: 0 }, { label: "APIs", total: 4, filled: 0 }];
    var W = 460, H = 150, r = 30, ys = 78;
    var xs = nodes.map(function (_, i) { return 70 + i * ((W - 140) / (nodes.length - 1)); });
    var frontier = 0;
    while (frontier < nodes.length && nodes[frontier].filled >= nodes[frontier].total) frontier++;
    if (frontier >= nodes.length) frontier = nodes.length - 1;

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Learning atlas — your mastery so far">';
    // trails
    for (var i = 0; i < nodes.length - 1; i++) {
      var done = nodes[i].filled >= nodes[i].total;
      svg += '<path class="atlas-trail' + (done ? ' is-done' : '') + '" data-trail="' + i + '" d="M' + xs[i] + ' ' + ys + ' L' + xs[i + 1] + ' ' + ys + '"/>';
    }
    // nodes
    nodes.forEach(function (n, i) {
      var frac = n.total ? n.filled / n.total : 0;
      var clip = "inset(" + ((1 - frac) * 100).toFixed(1) + "% 0 0 0)";
      var isF = i === frontier;
      svg += '<g class="hexnode' + (isF ? ' is-frontier' : '') + '" data-node="' + i + '" transform="translate(0,0)">' +
        '<clipPath id="clip' + i + '"><polygon points="' + hexPoints(xs[i], ys, r) + '"/></clipPath>' +
        '<polygon class="hexnode__fill" data-fill="' + i + '" points="' + hexPoints(xs[i], ys, r) + '" clip-path="url(#clip' + i + ')" style="clip-path:' + clip + '"/>' +
        '<polygon class="hexnode__ring" points="' + hexPoints(xs[i], ys, r) + '"/>' +
        '<text x="' + xs[i] + '" y="' + (ys + r + 18) + '" text-anchor="middle" font-family="var(--font-data)" font-size="11" fill="var(--ink-2)" style="text-transform:uppercase;letter-spacing:.04em">' + n.label + '</text>' +
        '</g>';
    });
    // avatar
    svg += '<g class="atlas-avatar" data-avatar transform="translate(' + xs[frontier] + ',' + (ys - r - 12) + ')"><circle cx="0" cy="0" r="7"/></g>';
    svg += '</svg>';

    var instr = '<div class="instrument" data-instr></div>';
    container.innerHTML = '<div class="miniatlas">' + svg + '</div>' + instr;

    function totalMastered() { return nodes.reduce(function (a, n) { return a + n.filled; }, 0); }
    function totalAll() { return nodes.reduce(function (a, n) { return a + n.total; }, 0); }
    function paint() {
      nodes.forEach(function (n, i) {
        var frac = n.total ? n.filled / n.total : 0;
        var f = container.querySelector('[data-fill="' + i + '"]');
        if (f) f.style.clipPath = "inset(" + ((1 - frac) * 100).toFixed(1) + "% 0 0 0)";
        var g = container.querySelector('[data-node="' + i + '"]');
        if (g) g.classList.toggle("is-frontier", i === frontier);
        if (i < nodes.length - 1) { var tr = container.querySelector('[data-trail="' + i + '"]'); if (tr) tr.classList.toggle("is-done", nodes[i].filled >= nodes[i].total); }
      });
      var av = container.querySelector("[data-avatar]");
      if (av) av.setAttribute("transform", "translate(" + xs[frontier] + "," + (ys - r - 12) + ")");
      var line = container.querySelector("[data-instr]");
      if (line) line.innerHTML = '<b>' + totalMastered() + " / " + totalAll() + '</b> checkpoints mastered · frontier: <span class="hot">' + nodes[frontier].label + '</span>';
    }
    function masterOne() {
      var n = nodes[frontier];
      if (n.filled < n.total) n.filled++;
      if (n.filled >= n.total && frontier < nodes.length - 1) frontier++;
      paint();
      container.dispatchEvent(new CustomEvent("px:mastery", { bubbles: true, detail: { mastered: totalMastered(), total: totalAll() } }));
    }
    paint();
    return { masterOne: masterOne, state: function () { return { mastered: totalMastered(), total: totalAll() }; } };
  }

  /* ---------- tiny local store (becomes IndexedDB-backed in Part 5) ---------- */
  var store = {
    get: function (k, fb) { try { var v = JSON.parse(localStorage.getItem("px_" + k)); return v == null ? fb : v; } catch (e) { return fb; } },
    set: function (k, v) { try { localStorage.setItem("px_" + k, JSON.stringify(v)); } catch (e) {} }
  };

  global.PX = { toast: toast, evaluate: evaluate, miniAtlas: miniAtlas, icon: icon, reduced: reduced, store: store };
})(window);
