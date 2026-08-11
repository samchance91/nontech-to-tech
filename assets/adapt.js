/* ============================================================
   Adapt (Part 5) — continuous adaptation engine.
   Ingests per-concept signals, applies the rules, emits directives.
   Nothing here forces the learner: step-up is an OFFER; remediation is
   injected inline without ever naming a demotion. The user's tier is
   always visible and overridable (see Adapt.setTier).
   ============================================================ */
(function (global) {
  "use strict";
  var S = global.PXStore;
  var TIERS = ["novice", "beginner", "intermediate", "advanced"];
  var LABEL = { novice: "Novice", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
  var MEDIAN_MS = { novice: 45000, beginner: 35000, intermediate: 28000, advanced: 22000 }; // time-on-task medians per tier
  var GAP_RECALL = 3 * 24 * 3600 * 1000; // "long gap" = 3+ days

  function idx(k) { var i = TIERS.indexOf(k); return i < 0 ? 1 : i; }
  function below(k) { return TIERS[Math.max(0, idx(k) - 1)]; }
  function above(k) { return TIERS[Math.min(3, idx(k) + 1)]; }

  function concept(id) {
    var st = S.state;
    if (!st.concepts[id]) st.concepts[id] = {
      firstTry: [],        // booleans, one per first attempt
      hintsTotal: 0, hintsUnit: 0,
      times: [], lastMs: null,
      rewatch: {}, seekBacks: 0, dropOff: null,
      revisits: 0,
      consecClean: 0,      // first-try correct, no hint, below median — in a row
      consecWrong: 0,
      offeredUp: false
    };
    return st.concepts[id];
  }

  var subs = [];
  function emit(d) { subs.forEach(function (fn) { try { fn(d); } catch (e) {} }); }

  var Adapt = {
    TIERS: TIERS, LABEL: LABEL,
    on: function (fn) { subs.push(fn); },
    tier: function () { return S.state.tier; },
    tierLabel: function () { return LABEL[S.state.tier]; },
    median: function () { return MEDIAN_MS[S.state.tier] || 30000; },
    setTier: function (k, o) {
      if (TIERS.indexOf(k) < 0) return;
      S.state.tier = k; S.state.tierOverridden = !!(o && o.overridden); S.save();
      emit({ type: "tierChanged", tier: k, overridden: S.state.tierOverridden });
    },

    // Streak / session cadence + long-gap recall check.
    startSession: function () {
      var st = S.state, now = Date.now();
      var gap = st.session.lastSeen ? now - st.session.lastSeen : 0;
      var today = new Date(now).toDateString();
      if (st.session.lastDay !== today) {
        var y = new Date(now - 864e5).toDateString();
        st.session.streak = (st.session.lastDay === y) ? (st.session.streak + 1) : 1;
        st.session.lastDay = today;
      }
      st.session.lastSeen = now; S.save();
      if (gap > GAP_RECALL) emit({ type: "recallCheck", gapDays: Math.round(gap / 864e5) });
      return { gap: gap, streak: st.session.streak };
    },

    newUnit: function (id) { var c = concept(id); c.hintsUnit = 0; S.save(); },

    // Answer signal (the core adaptive input).
    answer: function (id, s) {
      var c = concept(id);
      if (s.firstAttempt) c.firstTry.push(!!s.correct);
      if (s.ms != null) { c.times.push(s.ms); c.lastMs = s.ms; }
      var clean = s.firstAttempt && s.correct && c.hintsUnit === 0 && s.ms != null && s.ms < Adapt.median();
      if (clean) c.consecClean++; else if (s.correct) c.consecClean = 0;
      if (s.correct) c.consecWrong = 0; else { c.consecWrong++; c.consecClean = 0; }
      S.save();
      // Rule: 2 consecutive clean first-tries → OFFER a step up (never force).
      if (c.consecClean >= 2 && !c.offeredUp && idx(S.state.tier) < 3) {
        c.offeredUp = true; S.save();
        emit({ type: "offerStepUp", conceptId: id, from: S.state.tier, to: above(S.state.tier) });
      }
      // Rule: 2 consecutive incorrect → inject remediation from the tier below, inline.
      if (c.consecWrong >= 2) {
        c.consecWrong = 0; S.save();
        emit({ type: "remediation", conceptId: id, fromTier: below(S.state.tier), reason: "two-incorrect" });
      }
    },

    // Hint reveals. 3 in one unit → inject remediation.
    hint: function (id) {
      var c = concept(id); c.hintsTotal++; c.hintsUnit++; S.save();
      if (c.hintsUnit >= 3) { c.hintsUnit = 0; S.save(); emit({ type: "remediation", conceptId: id, fromTier: below(S.state.tier), reason: "three-hints" }); }
    },

    // Video signals. Rewatching a segment >2× → surface a text/diagram alternative.
    videoRewatch: function (id, segment) {
      var c = concept(id); c.rewatch[segment] = (c.rewatch[segment] || 0) + 1; S.save();
      if (c.rewatch[segment] > 2) emit({ type: "surfaceAlt", conceptId: id, segment: segment, count: c.rewatch[segment] });
    },
    videoSeekBack: function (id) { var c = concept(id); c.seekBacks++; S.save(); },
    videoDropOff: function (id, pct) { var c = concept(id); c.dropOff = pct; S.save(); },

    revisit: function (id) { var c = concept(id); c.revisits++; S.save(); },

    acceptStepUp: function (to) { Adapt.setTier(to, { overridden: false }); },

    signals: function (id) { return id ? concept(id) : S.state.concepts; },
    snapshot: function () { var st = S.state; return { tier: st.tier, overridden: st.tierOverridden, median: Adapt.median(), session: st.session, concepts: st.concepts }; }
  };
  global.Adapt = Adapt;
})(window);
