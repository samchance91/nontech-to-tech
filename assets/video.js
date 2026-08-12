/* ============================================================
   PXVideo (Part 7) — the VideoBlock.
   Non-negotiables from the brief:
     · NO outbound YouTube links — every video embeds via the
       youtube-nocookie.com facade. Nothing loads until the learner
       presses play (privacy + performance).
     · Reserved 16:9 box — the poster and the iframe occupy the same
       fixed frame, so swapping one for the other causes no layout shift.
     · IFrame API signals (play · pause · seek · progress · ended) feed
       the Adapt engine. Seeking back to a chapter repeatedly surfaces a
       text alternative (Adapt.videoRewatch → surfaceAlt).
     · Timestamped chapters seek in place (player.seekTo) — never a reload,
       never a new tab.
     · Captions on by default (cc_load_policy) + a speed control.
     · Graceful fallback when the embed can't load (offline, or a strict
       host CSP): a text panel with Retry, never a dead black frame and
       never a link off to youtube.com.
   The signal logic lives in small internal methods (_state/_progress) so
   it is testable without a live YouTube connection.
   ============================================================ */
(function (global) {
  "use strict";
  var PX = global.PX, Adapt = global.Adapt;
  var NOCOOKIE = "https://www.youtube-nocookie.com/embed/";
  var seq = 0;

  // ---- lazy, one-time IFrame API loader (only after a real play press) ----
  var apiPromise = null;
  function loadAPI() {
    if (global.YT && global.YT.Player) return Promise.resolve(global.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(function (res, rej) {
      var prev = global.onYouTubeIframeAPIReady;
      global.onYouTubeIframeAPIReady = function () { if (typeof prev === "function") { try { prev(); } catch (e) {} } res(global.YT); };
      var s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api"; s.async = true;
      s.onerror = function () { rej(new Error("yt-api-blocked")); };
      document.head.appendChild(s);
      setTimeout(function () { if (!(global.YT && global.YT.Player)) rej(new Error("yt-api-timeout")); }, 6000);
    });
    return apiPromise;
  }

  function fmt(t) { t = Math.max(0, Math.round(t)); var m = Math.floor(t / 60), s = t % 60; return m + ":" + (s < 10 ? "0" : "") + s; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function kindLabel(block) {
    if (block.kind === "deep") return "in depth";
    if (block.kind === "code") return "learn to code";
    return "primary";
  }

  // block = { vid, title, mins, kind, chapters?:[{t,label}], alt? }
  function render(container, block, opts) {
    opts = opts || {};
    container = typeof container === "string" ? document.querySelector(container) : container;
    var cid = opts.conceptId || "concept";
    var onSignal = opts.onSignal || function () {};
    var id = "yt" + (++seq);

    var wrap = el("div", "vblock");
    // Reserved 16:9 stage — poster and iframe share it; never reflows.
    var stage = el("div", "vstage");
    stage.setAttribute("data-vstage", "");
    var poster = buildPoster(block, id);
    stage.appendChild(poster);
    wrap.appendChild(stage);

    // Controls row (chapters + speed + read-instead) — below the stage.
    var controls = el("div", "vctrls");
    wrap.appendChild(controls);
    var altSlot = el("div", "valt");
    wrap.appendChild(altSlot);

    container.appendChild(wrap);

    // ---- state ----
    var player = null, ready = false, activated = false, watchdog = null;
    var lastT = 0, maxT = 0, duration = block.mins ? block.mins * 60 : 0;
    var pendingSeek = null, poll = null, rewatchedSeg = {};

    function segAt(t) {
      if (!block.chapters || !block.chapters.length) return "video";
      var name = block.chapters[0].label;
      block.chapters.forEach(function (ch) { if (t >= ch.t) name = ch.label; });
      return name;
    }

    // ---- signal core (testable) ----
    function _state(s) {
      // YT states: -1 unstarted · 0 ended · 1 playing · 2 paused · 3 buffering
      if (s === 1) { Adapt.video(cid, "play"); onSignal("play"); startPoll(); }
      else if (s === 2) { Adapt.video(cid, "pause"); onSignal("pause"); stopPoll(); dropoffCheck(); }
      else if (s === 0) { Adapt.video(cid, "ended"); onSignal("ended"); stopPoll(); }
    }
    function _progress(curT) {
      if (duration) { var pct = Math.min(100, Math.round(curT / duration * 100)); Adapt.video(cid, "progress", { pct: pct }); }
      if (curT < lastT - 2) {                        // jumped backward → a seek-back
        Adapt.videoSeekBack(cid);
        var seg = segAt(curT);
        rewatchedSeg[seg] = (rewatchedSeg[seg] || 0) + 1;
        Adapt.videoRewatch(cid, seg);                // 3rd time in one segment → surfaceAlt
        onSignal("seekBack");
      }
      lastT = curT; if (curT > maxT) maxT = curT;
    }
    function dropoffCheck() {
      if (duration && maxT / duration < 0.9) Adapt.videoDropOff(cid, Math.round(maxT / duration * 100));
    }
    function startPoll() { stopPoll(); poll = setInterval(function () { if (player && player.getCurrentTime) { try { var d = player.getDuration && player.getDuration(); if (d) duration = d; _progress(player.getCurrentTime()); } catch (e) {} } }, 1000); }
    function stopPoll() { if (poll) { clearInterval(poll); poll = null; } }

    // ---- activation (facade → embed) ----
    function activate() {
      if (activated) return; activated = true;
      if (global.navigator && global.navigator.onLine === false) { showFallback("offline"); activated = false; return; }
      // swap poster → iframe inside the SAME fixed stage (no layout shift)
      var origin = (global.location && global.location.origin && global.location.origin !== "null") ? "&origin=" + encodeURIComponent(global.location.origin) : "";
      var src = NOCOOKIE + encodeURIComponent(block.vid) +
        "?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&cc_load_policy=1&autoplay=1" + origin;
      var iframe = el("iframe", "vframe");
      iframe.id = id; iframe.src = src; iframe.title = block.title;
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      stage.innerHTML = ""; stage.appendChild(iframe);
      onSignal("activate");

      // Bind the IFrame API (only now — after intent). If it can't load, we
      // keep the iframe (it still plays on the live site) and, after a grace
      // period with no player, surface a "can't load here" note.
      watchdog = setTimeout(function () { if (!ready) showFallback("blocked", true); }, 4000);
      loadAPI().then(function (YT) {
        player = new YT.Player(id, {
          events: {
            onReady: function () { ready = true; clearTimeout(watchdog); enableSpeed(); if (pendingSeek != null) { doSeek(pendingSeek); pendingSeek = null; } },
            onStateChange: function (e) { _state(e.data); },
            onError: function () { showFallback("error", true); }
          }
        });
      }).catch(function () { /* API blocked; iframe may still play. Watchdog handles the note. */ });
    }

    function doSeek(t) { if (player && player.seekTo) { try { player.seekTo(t, true); player.playVideo && player.playVideo(); } catch (e) {} } }
    function seekChapter(t) {
      if (!activated) { pendingSeek = t; activate(); return; }
      if (ready) doSeek(t); else pendingSeek = t;   // applied on ready
      onSignal("chapter");
    }

    // ---- fallback panel (offline / blocked / error) — never a YouTube link ----
    function showFallback(reason, asNote) {
      var msg = reason === "offline"
        ? "You're offline — here's the key idea in text. The video will play when you're back online."
        : "This video can't load in this preview. It plays on the live site. Here's the idea in text meanwhile.";
      var body = block.alt || (opts.altText) || ("<b>" + block.title + "</b>");
      var panel = el("div", "vfallback",
        '<p class="data">' + (reason === "offline" ? "offline" : "can't load here") + "</p>" +
        "<p>" + msg + "</p><div class=\"vfallback__idea\">" + body + "</div>");
      var retry = el("button", "btn btn--secondary btn--sm", "Retry");
      retry.type = "button";
      retry.addEventListener("click", function () { activated = false; ready = false; stage.innerHTML = ""; stage.appendChild(buildPoster(block, id)); wireStage(); });
      panel.appendChild(retry);
      if (asNote) {            // keep the (possibly blocked) iframe, add a note beneath
        altSlot.innerHTML = ""; altSlot.appendChild(panel);
      } else {                 // replace the stage entirely (offline: never requested the frame)
        stage.innerHTML = ""; stage.appendChild(panel);
      }
      onSignal("fallback:" + reason);
    }

    // ---- speed control (enabled once the player is ready) ----
    var speedSel = null;
    function enableSpeed() { if (speedSel) { speedSel.disabled = false; } }
    function buildControls() {
      controls.innerHTML = "";
      // chapters
      if (block.chapters && block.chapters.length) {
        var chWrap = el("div", "vchapters");
        chWrap.appendChild(el("span", "data", "chapters"));
        block.chapters.forEach(function (ch) {
          var b = el("button", "vchip");
          b.type = "button";
          b.innerHTML = '<span class="vchip__t">' + fmt(ch.t) + "</span>" + ch.label;
          b.setAttribute("aria-label", "Jump to " + fmt(ch.t) + " — " + ch.label);
          b.addEventListener("click", function () { seekChapter(ch.t); });
          chWrap.appendChild(b);
        });
        controls.appendChild(chWrap);
      }
      // speed + captions note
      var meta = el("div", "vmeta");
      var speeds = [0.75, 1, 1.25, 1.5];
      var sWrap = el("label", "vspeed", '<span class="data">speed</span>');
      speedSel = el("select", "vspeed__sel");
      speedSel.disabled = true;
      speeds.forEach(function (r) { var o = document.createElement("option"); o.value = r; o.textContent = r + "×"; if (r === 1) o.selected = true; speedSel.appendChild(o); });
      speedSel.addEventListener("change", function () { if (player && player.setPlaybackRate) { try { player.setPlaybackRate(parseFloat(speedSel.value)); } catch (e) {} } });
      sWrap.appendChild(speedSel);
      meta.appendChild(sWrap);
      meta.appendChild(el("span", "data muted", "CC on · " + (block.mins ? block.mins + " min" : "")));
      controls.appendChild(meta);

      // always-available "prefer to read?" — the text alternative, on demand
      if (block.alt || opts.altText) {
        var readBtn = el("button", "btn btn--ghost btn--sm", "Prefer to read it?");
        readBtn.type = "button";
        readBtn.addEventListener("click", function () {
          altSlot.innerHTML = '<div class="vfallback"><p class="data">read instead</p><div class="vfallback__idea">' + (block.alt || opts.altText) + "</div></div>";
          onSignal("readInstead");
        });
        controls.appendChild(readBtn);
      }
    }

    function wireStage() {
      var pb = stage.querySelector("[data-play]");
      if (!pb) return;
      pb.addEventListener("click", activate);
      pb.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } });
    }

    buildControls();
    wireStage();

    // testable/public surface
    return {
      activate: activate, seekChapter: seekChapter,
      _state: _state, _progress: _progress,
      _fallback: showFallback,
      _pending: function () { return pendingSeek; },
      _isActivated: function () { return activated; },
      el: wrap
    };
  }

  function buildPoster(block, id) {
    var poster = el("button", "vposter");
    poster.type = "button";
    poster.setAttribute("data-play", "");
    poster.setAttribute("aria-label", "Play video: " + block.title);
    poster.innerHTML =
      '<span class="vposter__play" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' +
      '<span class="vposter__meta">' +
        '<span class="data">' + kindLabel(block) + (block.mins ? " · " + block.mins + " min" : "") + "</span>" +
        '<span class="vposter__ttl">' + block.title + "</span>" +
      "</span>" +
      '<span class="data vposter__hint">tap to play — nothing loads until you do</span>';
    return poster;
  }

  global.PXVideo = { render: render, _loadAPI: loadAPI };
})(window);
