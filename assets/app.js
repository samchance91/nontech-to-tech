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
    spark: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>'
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
