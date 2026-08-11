/* ============================================================
   Baseline check (Part 4) — adaptive, ≤6 questions, <90s, skippable.
   Each answer narrows the next question's difficulty (up/down staircase).
   Output is a starting TIER, never a score or a grade. The user can
   override the result immediately. Result is stored + versioned.
   ============================================================ */
(function (global) {
  "use strict";
  var PX = global.PX;

  // The four internal tiers (bounds the content matrix; see the brief).
  var TIERS = [
    { key: "novice", label: "Novice", lvl: 1, blurb: "We’ll start with the words themselves — every term defined as it appears, video first, in short steps." },
    { key: "beginner", label: "Beginner", lvl: 2, blurb: "You know the words; we’ll help you apply them, with a hint on hand before every answer." },
    { key: "intermediate", label: "Intermediate", lvl: 3, blurb: "You apply reliably; we’ll set transfer tasks in new contexts, scaffolding only on request." },
    { key: "advanced", label: "Advanced", lvl: 4, blurb: "You’re fluent; problem-first, theory on demand, edge cases and skip-ahead unlocked." }
  ];
  function tierByLevel(l) { return TIERS[Math.min(4, Math.max(1, l)) - 1]; }

  // Difficulty-tagged bank (lvl 1–4). Chosen adaptively; never all shown.
  var BANK = [
    // L1 — vocabulary recognition
    { id: "b1", lvl: 1, area: "web", q: "In an app, the “frontend” is…", opts: ["The part users see and click", "The company’s office", "The database", "The internet cable"], a: 0 },
    { id: "b2", lvl: 1, area: "data", q: "A “database” is where an app…", opts: ["Shows ads", "Stores its data", "Connects to wifi", "Draws buttons"], a: 1 },
    { id: "b3", lvl: 1, area: "delivery", q: "“The cloud” basically means…", opts: ["Weather data", "Someone else’s servers you rent", "A kind of app", "Your phone’s memory"], a: 1 },
    { id: "b4", lvl: 1, area: "collab", q: "A “bug” is…", opts: ["A new feature", "A fault in the software", "A user", "A server"], a: 1 },
    // L2 — simple application
    { id: "b5", lvl: 2, area: "web", q: "You click “Save” and it’s still there after a refresh. Where did it go?", opts: ["The screen", "The backend / database", "The mouse", "Just the browser tab"], a: 1 },
    { id: "b6", lvl: 2, area: "web", q: "A page shows “404”. That means…", opts: ["You’re offline", "The thing wasn’t found", "Payment failed", "You’re logged out"], a: 1 },
    { id: "b7", lvl: 2, area: "api", q: "An API is best described as…", opts: ["A design tool", "A way for two systems to talk", "A database", "A password"], a: 1 },
    { id: "b8", lvl: 2, area: "collab", q: "In agile, a “sprint” is…", opts: ["A bug", "A fixed short work period", "A meeting room", "A server"], a: 1 },
    // L3 — transfer to a less familiar context
    { id: "b9", lvl: 3, area: "data", q: "A report needs fields from two different tables. What combines them?", opts: ["A join", "A deploy", "A commit", "A cache"], a: 0 },
    { id: "b10", lvl: 3, area: "web", q: "Users see old data right after an update. Most likely cause?", opts: ["The database was deleted", "Caching / a stale copy", "Wrong password", "The API is down"], a: 1 },
    { id: "b11", lvl: 3, area: "delivery", q: "“Works on my machine, not in production” usually points to…", opts: ["A broken mouse", "Environment differences", "A typo in the logo", "Too many users"], a: 1 },
    { id: "b12", lvl: 3, area: "api", q: "An integration fails after many quick calls. Which limit did it hit?", opts: ["Rate limit", "Word limit", "Speed limit", "Phone data cap"], a: 0 },
    // L4 — depth / edge cases
    { id: "b13", lvl: 4, area: "security", q: "One customer can see another customer’s data. This is a…", opts: ["Caching bug", "Authorization / multi-tenancy flaw", "CSS bug", "DNS error"], a: 1 },
    { id: "b14", lvl: 4, area: "ai", q: "For Q&A over your own docs, what do you try before fine-tuning?", opts: ["Retrieval (RAG) + good prompts", "Buy more servers", "Fine-tune first, always", "Delete the docs"], a: 0 },
    { id: "b15", lvl: 4, area: "delivery", q: "Safest way to ship a risky change to everyone?", opts: ["All at once, 5pm Friday", "Gradually (canary), ready to roll back", "Email everyone first", "Turn off logging"], a: 1 },
    { id: "b16", lvl: 4, area: "data", q: "When is it right to STORE a value instead of computing it each time?", opts: ["Never", "When recomputing is costly and it rarely changes", "Always store everything", "Only on weekends"], a: 1 }
  ];

  var ASK = 6; // ≤8 per the brief; 6 keeps it well under 90s

  function Baseline(container, opts) {
    opts = opts || {};
    var C = typeof container === "string" ? document.querySelector(container) : container;
    var level = 2, asked = [], seen = {}, t0 = 0, curTier = null;

    function pickAt(l) {
      var order = [l], k;
      for (k = 1; k < 4; k++) { order.push(l + k); order.push(l - k); }
      for (var i = 0; i < order.length; i++) {
        var lv = order[i]; if (lv < 1 || lv > 4) continue;
        var c = BANK.filter(function (q) { return q.lvl === lv && !seen[q.id]; });
        if (c.length) return c[Math.floor(Math.random() * c.length)];
      }
      return null;
    }

    function shell(inner) { return '<div class="bl2">' + inner + '</div>'; }

    function intro() {
      C.innerHTML = shell(
        '<p class="data">before you start</p>' +
        '<h1 class="t-h1">Where should we start you?</h1>' +
        '<p class="reading t-body-lg muted" style="margin-top:var(--s2)">A few quick questions — about a minute. There’s <b>no score and no pass/fail</b>. It just sets a starting point, and the lessons adjust to you from there.</p>' +
        '<div class="row" style="margin-top:var(--s5)">' +
          '<button class="btn" id="blStart" type="button">Start ' + PX.icon("arrowR", "btn__i") + '</button>' +
          '<button class="btn btn--ghost" id="blSkip" type="button">Skip — start me at Beginner</button>' +
        '</div>');
      C.querySelector("#blStart").addEventListener("click", function () { t0 = Date.now(); ask(); });
      C.querySelector("#blSkip").addEventListener("click", skip);
    }

    function dots(n) {
      var h = '<div class="bl-dots" aria-hidden="true">';
      for (var i = 0; i < ASK; i++) h += '<span class="bl-dot' + (i < n ? " is-done" : "") + (i === n ? " is-cur" : "") + '"></span>';
      h += '</div>';
      return h;
    }

    function ask() {
      if (asked.length >= ASK) return finish();
      var q = pickAt(level);
      if (!q) return finish();
      seen[q.id] = true;
      var optsHTML = q.opts.map(function (o, i) {
        return '<button class="bl-opt" data-i="' + i + '" type="button"><span class="bl-opt__k">' + (i + 1) + '</span><span>' + o + '</span></button>';
      }).join("");
      C.innerHTML = shell(
        '<div class="bl-top"><span class="data">question ' + (asked.length + 1) + ' of ' + ASK + '</span>' + dots(asked.length) + '</div>' +
        '<h2 class="bl-q" role="heading" aria-level="2">' + q.q + '</h2>' +
        '<div class="bl-opts" role="group" aria-label="Choose one">' + optsHTML + '</div>' +
        '<p class="data muted" style="margin-top:var(--s4)">No wrong answers here — pick the closest. Keys 1–4 work too.</p>');
      var btns = C.querySelectorAll(".bl-opt");
      btns.forEach(function (b) { b.addEventListener("click", function () { answer(q, parseInt(b.getAttribute("data-i"), 10), b); }); });
      btns[0].focus();
      keyHandler = function (e) { var n = parseInt(e.key, 10); if (n >= 1 && n <= q.opts.length) { e.preventDefault(); btns[n - 1].click(); } };
    }

    var keyHandler = null;
    document.addEventListener("keydown", function (e) { if (keyHandler) keyHandler(e); });

    function answer(q, idx, btnEl) {
      keyHandler = null;
      asked.push({ id: q.id, lvl: q.lvl, correct: idx === q.a });
      level = (idx === q.a) ? Math.min(4, level + 1) : Math.max(1, level - 1); // narrow next difficulty
      if (btnEl) btnEl.classList.add("is-picked");
      // brief press acknowledgement, then advance — we never reveal right/wrong (placement, not a test)
      setTimeout(ask, PX.reduced() ? 0 : 160);
    }

    // ability = average level the learner can handle (right→credit lvl, wrong→credit lvl-1)
    function estimate() {
      if (!asked.length) return 2;
      var s = 0; asked.forEach(function (a) { s += a.correct ? a.lvl : (a.lvl - 1); });
      return Math.min(4, Math.max(1, Math.round(s / asked.length)));
    }

    function persist(tier, overridden, skipped) {
      PX.store.set("baseline", { version: 2, tier: tier.key, tierLevel: tier.lvl, at: Date.now(), seconds: Math.round((Date.now() - t0) / 1000), answers: asked, overridden: !!overridden, skipped: !!skipped });
    }

    function skip() {
      curTier = tierByLevel(2);
      persist(curTier, false, true);
      result(true);
    }

    function finish() { curTier = tierByLevel(estimate()); persist(curTier, false, false); result(false); }

    function result(skipped) {
      var seg = TIERS.map(function (t) {
        return '<button class="bl-seg' + (t.key === curTier.key ? " is-on" : "") + '" data-tier="' + t.key + '" type="button" aria-pressed="' + (t.key === curTier.key) + '">' +
          '<span class="tierchip__fill" style="--lvl:' + (t.lvl * 25) + '%"></span>' + t.label + '</button>';
      }).join("");
      C.innerHTML = shell(
        '<p class="data">your starting point</p>' +
        '<h1 class="t-display" id="blTierName">' + curTier.label + '</h1>' +
        '<p class="reading t-body-lg" id="blBlurb" style="margin-top:var(--s2)">' + curTier.blurb + '</p>' +
        (skipped ? '<p class="data muted" style="margin-top:var(--s2)">Skipped — we’ll fine-tune this from how your first two lessons go.</p>' : '<p class="data muted" style="margin-top:var(--s2)">This isn’t a grade. It only sets where you begin — the platform adjusts to you as you learn.</p>') +
        '<div class="section" style="margin-top:var(--s5)"><p class="data" style="margin-bottom:var(--s2)">You can change this anytime — including right now</p>' +
        '<div class="bl-segs" role="group" aria-label="Choose your tier">' + seg + '</div></div>' +
        '<div class="row" style="margin-top:var(--s6)">' +
          '<button class="btn" id="blGo" type="button">Start learning ' + PX.icon("arrowR", "btn__i") + '</button>' +
          '<button class="btn btn--ghost" id="blRetake" type="button">Retake</button>' +
        '</div>');
      C.querySelectorAll(".bl-seg").forEach(function (s) {
        s.addEventListener("click", function () {
          var key = s.getAttribute("data-tier");
          curTier = TIERS.filter(function (t) { return t.key === key; })[0];
          C.querySelectorAll(".bl-seg").forEach(function (x) { x.classList.toggle("is-on", x === s); x.setAttribute("aria-pressed", x === s); });
          C.querySelector("#blTierName").textContent = curTier.label;
          C.querySelector("#blBlurb").textContent = curTier.blurb;
          persist(curTier, true, skipped);
          PX.toast("Tier set to " + curTier.label + ".", { duration: 2200 });
        });
      });
      C.querySelector("#blRetake").addEventListener("click", function () { level = 2; asked = []; seen = {}; intro(); });
      C.querySelector("#blGo").addEventListener("click", function () { if (opts.onDone) opts.onDone(curTier, asked); });
    }

    intro();
  }

  PX.Baseline = Baseline;
  PX.TIERS = TIERS;
})(window);
