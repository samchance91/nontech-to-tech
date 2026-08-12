/* ============================================================
   PXLesson (Part 6) — renders ONE tagged concept tree into a lesson,
   shaped entirely by the tier the plan() selector hands back.
   Nothing here knows about "courses". It reads plan.core (ordered,
   filtered blocks), plan.enrich (disclosures), and the three tier
   levers — scaffold / pacing / enrichOpen — and lays them out.
   Practice blocks feed the live Adapt engine (answer + hint signals).
   ============================================================ */
(function (global) {
  "use strict";
  var PX = global.PX, Adapt = global.Adapt, C = global.PXContent;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function roleTag(text) { return '<span class="data lb__role">' + text + '</span>'; }

  // ---- core block renderers -------------------------------------------------
  function defineBlock(b) {
    return el("div", "lb lb--define", roleTag("definition") +
      "<h4>" + b.term + "</h4><p>" + b.def + "</p>");
  }
  function exampleBlock(b) {
    return el("div", "lb lb--example", roleTag("worked example") + "<p>" + b.text + "</p>");
  }
  function videoBlock(b, cid, onSignal) {
    var wrap = el("div", "lb lb--video", roleTag("watch first · " + b.mins + " min"));
    var mount = el("div");
    wrap.appendChild(mount);
    if (global.PXVideo) {
      PXVideo.render(mount, b, { conceptId: cid, onSignal: onSignal, altText: b.alt });
    } else {
      mount.appendChild(el("div", "lvideo__frame", '<div class="lvideo__ttl">▶ ' + b.title + "</div></div>"));
    }
    return wrap;
  }
  function transferBlock(b) {
    var wrap = el("div", "lb lb--transfer", roleTag("apply it to your product") + "<p>" + b.task + "</p>");
    var ta = el("textarea"); ta.setAttribute("aria-label", "Your answer for: " + b.task); ta.placeholder = "Type your answer…";
    wrap.appendChild(ta);
    return wrap;
  }
  // Practice — the only block that feeds Adapt. Scaffold controls the hint:
  //   shown → hint visible inline · onRequest → "Need a hint?" button · hidden → none.
  function practiceBlock(b, cid, scaffold, onSignal) {
    var wrap = el("div", "lb lb--practice", roleTag("check yourself"));
    wrap.appendChild(el("p", "t-body-lg", b.q));
    var opts = el("div", "bl-opts lopts"); opts.setAttribute("role", "group"); opts.setAttribute("aria-label", b.q);
    var evalSlot = el("div", "leval");
    var first = true, done = false;
    var t0 = Date.now();
    b.opts.forEach(function (label, i) {
      var btn = el("button", "bl-opt");
      btn.type = "button";
      btn.innerHTML = '<span class="bl-opt__k">' + String.fromCharCode(65 + i) + "</span><span>" + label + "</span>";
      btn.addEventListener("click", function () {
        if (done) return;
        var correct = i === b.a;
        Adapt.answer(cid, { firstAttempt: first, correct: correct, ms: Date.now() - t0 });
        if (onSignal) onSignal(correct ? "answer:correct" : "answer:wrong");
        first = false;
        opts.querySelectorAll(".bl-opt").forEach(function (o) { o.classList.remove("is-picked"); });
        btn.classList.add("is-picked");
        if (correct) {
          done = true;
          opts.querySelectorAll(".bl-opt").forEach(function (o) { o.disabled = true; });
          PX.evaluate(evalSlot, { correct: true, what: "That's the one.", why: b.hint });
        } else {
          PX.evaluate(evalSlot, { correct: false, what: "Not quite — try another.", why: scaffold === "hidden" ? "" : b.hint });
          t0 = Date.now();
        }
      });
      opts.appendChild(btn);
    });
    wrap.appendChild(opts);

    if (scaffold === "shown") {
      wrap.appendChild(el("div", "lhint", '<span class="data">hint</span><div>' + b.hint + "</div>"));
    } else if (scaffold === "onRequest") {
      var hintSlot = el("div");
      var hb = el("button", "btn btn--ghost btn--sm", "Need a hint?");
      hb.type = "button";
      hb.addEventListener("click", function () {
        Adapt.hint(cid); if (onSignal) onSignal("hint");
        hintSlot.innerHTML = '<div class="lhint"><span class="data">hint</span><div>' + b.hint + "</div></div>";
        hb.remove();
      });
      hintSlot.appendChild(hb);
      wrap.appendChild(hintSlot);
    } // hidden → no hint affordance at all (Advanced)

    wrap.appendChild(evalSlot);
    return wrap;
  }

  function coreNode(b, cid, scaffold, onSignal) {
    switch (b.role) {
      case "define": return defineBlock(b);
      case "example": return exampleBlock(b);
      case "video": return videoBlock(b, cid, onSignal);
      case "transfer": return transferBlock(b);
      case "practice": return practiceBlock(b, cid, scaffold, onSignal);
      default: return el("div", "lb", b.text || "");
    }
  }

  // ---- enrichment (disclosures + resources) ---------------------------------
  function discVideo(b, open, cid) {
    var d = el("details", "disc"); if (open) d.open = true;
    var kind = b.kind === "code" ? "learn to code" : "in depth";
    d.appendChild(el("summary", null, "▶ " + b.title + '<span class="disc__tag">' + kind + " · " + b.mins + " min</span>"));
    var body = el("div", "disc__body");
    d.appendChild(body);
    if (global.PXVideo) PXVideo.render(body, b, { conceptId: cid, altText: b.alt });
    else body.appendChild(el("div", "lvideo__frame", '<div class="lvideo__ttl">▶ ' + b.title + "</div></div>"));
    return d;
  }
  function discDeepdive(b, open) {
    var d = el("details", "disc"); if (open) d.open = true;
    d.appendChild(el("summary", null, b.title + '<span class="disc__tag">go deeper</span>'));
    d.appendChild(el("div", "disc__body", b.text));
    return d;
  }
  function resourceList(resources) {
    var wrap = el("div");
    wrap.appendChild(el("span", "data", "source & further reading"));
    var list = el("div", "reslist");
    resources.forEach(function (b) {
      var a = el("a", "res");
      a.href = b.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.innerHTML = "<span>" + b.label + '</span><span class="res__ex">open ↗</span>';
      list.appendChild(a);
    });
    wrap.appendChild(list);
    return wrap;
  }

  // ---- render ---------------------------------------------------------------
  // Returns the plan it used, so callers can show the tier levers it applied.
  function render(container, conceptId, tierIdx, opts) {
    opts = opts || {};
    container = typeof container === "string" ? document.querySelector(container) : container;
    var p = C.plan(conceptId, tierIdx);
    container.innerHTML = "";
    if (!p) { container.textContent = "Unknown concept."; return null; }

    var core = el("div", "lesson");
    var nodes = p.core.map(function (b, i) {
      var n = coreNode(b, conceptId, p.scaffold, opts.onSignal);
      if (i === 0) n.classList.add("is-first");
      return n;
    });

    if (p.pacing === "stepped") {
      // Reveal one block at a time — the scaffolded, low-cognitive-load path.
      nodes.forEach(function (n, i) { if (i > 0) n.classList.add("is-pending"); core.appendChild(n); });
      var revealed = 1;
      var cont = el("div", "lb");
      var btn = el("button", "btn btn--secondary", 'Continue' + PX.icon("arrowR", "btn__i"));
      btn.type = "button";
      cont.appendChild(btn);
      core.appendChild(cont);
      function step() {
        if (revealed >= nodes.length) { cont.remove(); return; }
        nodes[revealed].classList.remove("is-pending");
        revealed++;
        if (opts.onSignal) opts.onSignal("reveal");
        if (revealed >= nodes.length) cont.remove(); else core.appendChild(cont);
      }
      btn.addEventListener("click", step);
    } else {
      // Full: the whole concept at once — for learners who want to move.
      nodes.forEach(function (n) { core.appendChild(n); });
    }
    container.appendChild(core);

    // Enrichment: disclosures, expanded by default only when the tier says so.
    if (p.enrich.length) {
      var ex = el("div", "enrich lesson");
      ex.appendChild(el("span", "data", "extend · optional"));
      var resources = [];
      p.enrich.forEach(function (b) {
        if (b.role === "resource") { resources.push(b); return; }
        if (b.role === "video") ex.appendChild(discVideo(b, p.enrichOpen, conceptId));
        else if (b.role === "deepdive") ex.appendChild(discDeepdive(b, p.enrichOpen));
      });
      if (resources.length) ex.appendChild(resourceList(resources));
      container.appendChild(ex);
    }
    return p;
  }

  global.PXLesson = { render: render };
})(window);
