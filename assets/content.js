/* ============================================================
   Content model (Part 6) — ONE tagged tree, not four courses.
   A concept is authored once as a list of BLOCKS. Each block is tagged
   with a tier range and a role. The tier (from Adapt) then decides:
     · sequencing  — the order roles appear (ORDER templates)
     · scaffolding — whether hints show, are on-request, or hidden
     · pacing      — stepped (one practice at a time) vs full
     · optional    — which enrichment blocks render inline vs as disclosures
   Nothing is duplicated per tier.

   Block = { id, role, kind?, tiers:[minIdx,maxIdx], ...content }
     roles: define · video · example · practice · transfer · deepdive · resource
     video kinds: primary (core, ≤10 min) · deep · code
   Tier indices: 0 Novice · 1 Beginner · 2 Intermediate · 3 Advanced
   ============================================================ */
(function (global) {
  "use strict";
  var PX = global.PX, Adapt = global.Adapt;
  var ALL = [0, 3]; // tiers is a [min,max] RANGE — this spans Novice..Advanced

  // Migrated from the existing modules (same text, now tagged). Video IDs are
  // filled with real embeds in Part 7 — here they're marked as primary/deep/code.
  var CONCEPTS = {
    apis: {
      id: "apis", title: "What is an API?", area: "APIs",
      blocks: [
        { id: "d1", role: "define", tiers: ALL, term: "API", def: "A contract between two systems: “send me this, I’ll send you back that.”" },
        { id: "d2", role: "define", tiers: [0, 2], term: "Endpoint", def: "One specific address (URL) in that contract, e.g. /users/123/orders." },
        { id: "v1", role: "video", kind: "primary", tiers: ALL, title: "What is an API? (in plain English)", vid: "s7wmiS2mSXY", mins: 3,
          chapters: [{ t: 0, label: "Intro" }, { t: 75, label: "Core idea" }, { t: 150, label: "Wrap-up" }],
          alt: "An API is a contract between two systems: <b>you send it a request, it sends back a response</b>. Like ordering at a restaurant — you ask the waiter (the API) for a dish, the kitchen (another system) makes it, and it comes back to you. You never step into the kitchen yourself." },
        { id: "v2", role: "video", kind: "deep", tiers: ALL, title: "APIs for beginners — the full walkthrough", vid: "WXsD0ZgxjRw", mins: 140 },
        { id: "v3", role: "video", kind: "code", tiers: ALL, title: "Your first API request in Postman (hands-on)", vid: "cR_FqveTewo", mins: 8 },
        { id: "ex1", role: "example", tiers: [0, 1], text: "When your weather app shows the forecast, it calls a weather company’s API endpoint, gets JSON back, and draws it. Your app never stores the weather — it asks each time." },
        { id: "p1", role: "practice", tiers: ALL, q: "An API is best described as…", opts: ["A design tool", "A way for two systems to talk", "A database", "A password"], a: 1, hint: "Think “contract”, not “storage”." },
        { id: "t1", role: "transfer", tiers: [1, 3], task: "Pick a feature in your own product that pulls data from somewhere else. Write the one endpoint it needs, and what it sends vs. gets back." },
        { id: "dd1", role: "deepdive", tiers: ALL, title: "REST vs GraphQL, rate limits, pagination", text: "REST exposes fixed endpoints; GraphQL lets the client ask for exactly the fields it wants. Both cap traffic with rate limits and hand back big lists in pages." },
        { id: "r1", role: "resource", tiers: ALL, label: "MDN — An overview of HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
        { id: "r2", role: "resource", tiers: ALL, label: "Stripe API reference (a gold-standard example)", url: "https://stripe.com/docs/api" }
      ]
    },
    web: {
      id: "web", title: "How the web works", area: "Web & internet",
      blocks: [
        { id: "d1", role: "define", tiers: ALL, term: "Request / response", def: "The client asks a question; the server sends an answer." },
        { id: "d2", role: "define", tiers: [0, 2], term: "Status codes", def: "200 OK · 404 Not Found · 401 not logged in · 403 not allowed · 500 server broke." },
        { id: "v1", role: "video", kind: "primary", tiers: ALL, title: "How the internet works in 5 minutes", vid: "7_LPdttKXPc", mins: 5,
          chapters: [{ t: 0, label: "Intro" }, { t: 120, label: "How it works" }, { t: 240, label: "Wrap-up" }],
          alt: "You type a name → <b>DNS</b> turns it into a numeric address → your browser sends a <b>request</b> to that server → the server sends a <b>response</b> → the browser draws the page. A “404” means the address was fine but the thing you asked for isn’t there." },
        { id: "v2", role: "video", kind: "deep", tiers: ALL, title: "How the internet works — the full course", vid: "zN8YNNHcaZc", mins: 47 },
        { id: "ex1", role: "example", tiers: [0, 1], text: "You type a name → DNS turns it into an address → your browser requests the page → the server responds → the browser draws it. A “404” means the address was fine but nothing’s there." },
        { id: "p1", role: "practice", tiers: ALL, q: "A page shows “404”. That means…", opts: ["You’re offline", "The thing wasn’t found", "Payment failed", "You’re logged out"], a: 1, hint: "It’s about the thing you asked for, not about you." },
        { id: "t1", role: "transfer", tiers: [1, 3], task: "Open your product in the browser, open the Network tab, and find one request. Note its status code and how long it took." },
        { id: "dd1", role: "deepdive", tiers: ALL, title: "Caching & why users see stale data", text: "A cache is a saved copy so you don’t ask again. Half of “it didn’t update!” bugs are a stale cache between the user and the truth." },
        { id: "r1", role: "resource", tiers: ALL, label: "MDN — How the web works", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works" }
      ]
    },
    data: {
      id: "data", title: "Data & databases", area: "Data & databases",
      blocks: [
        { id: "d1", role: "define", tiers: ALL, term: "Table", def: "Rows and columns — like a spreadsheet the app reads and writes." },
        { id: "d2", role: "define", tiers: [0, 2], term: "Primary / foreign key", def: "A primary key uniquely IDs a row; a foreign key points at another table’s key — that’s how tables relate." },
        { id: "v1", role: "video", kind: "primary", tiers: ALL, title: "What is a database? (in 4 minutes)", vid: "Tk1t3WKK-ZY", mins: 4,
          chapters: [{ t: 0, label: "Intro" }, { t: 90, label: "Types" }, { t: 200, label: "Wrap-up" }],
          alt: "A database is where the app stores facts it needs to keep — rows and columns, like a spreadsheet it reads and writes. Related facts live in separate <b>tables</b> (customers, orders) linked by a shared <b>key</b>, so the app can ask “which orders belong to this customer?”" },
        { id: "v2", role: "video", kind: "code", tiers: ALL, title: "SQL basics — practise your first queries", vid: "Hl4NZB1XR9c", mins: 60 },
        { id: "ex1", role: "example", tiers: [0, 1], text: "One customer, many orders: a customers table and an orders table, where each order carries the customer’s id. To list a customer’s orders you JOIN them on that id." },
        { id: "p1", role: "practice", tiers: ALL, q: "A report needs fields from two tables. What combines them?", opts: ["A join", "A deploy", "A commit", "A cache"], a: 0, hint: "You’re stitching two tables on a shared column." },
        { id: "t1", role: "transfer", tiers: [1, 3], task: "Sketch your product’s two most important tables and the key that links them. Name one report that would need a join." },
        { id: "dd1", role: "deepdive", tiers: ALL, title: "Store vs derive, and why “just add a field” costs", text: "Store facts; derive anything you can recompute. A new field can mean a migration, a backfill, and touching many queries — rarely “just”." },
        { id: "r1", role: "resource", tiers: ALL, label: "select star — SQL, visually", url: "https://selectstarsql.com/" }
      ]
    }
  };

  // Sequencing templates (core roles) per tier index.
  var ORDER = {
    0: ["video", "define", "example", "practice", "transfer"],       // Novice: video before text, worked examples
    1: ["define", "video", "example", "practice", "transfer"],       // Beginner: guided practice
    2: ["define", "practice", "transfer", "video"],                   // Intermediate: transfer, video optional
    3: ["transfer", "practice", "define", "video"]                   // Advanced: problem-first, theory later
  };
  var SCAFFOLD = { 0: "shown", 1: "shown", 2: "onRequest", 3: "hidden" }; // hint visibility
  var PACING = { 0: "stepped", 1: "stepped", 2: "full", 3: "full" };
  var ENRICH_OPEN = { 0: false, 1: false, 2: false, 3: true };            // deepdive expanded by default only for Advanced

  function inRange(b, t) { return t >= b.tiers[0] && t <= b.tiers[1]; }
  function isCoreVideo(b) { return b.role === "video" && b.kind === "primary"; }
  function isEnrich(b) { return b.role === "deepdive" || b.role === "resource" || (b.role === "video" && b.kind !== "primary"); }

  // Produce an ordered, filtered, tier-shaped plan for a concept.
  function plan(conceptId, t) {
    var c = CONCEPTS[conceptId]; if (!c) return null;
    var core = [];
    ORDER[t].forEach(function (role) {
      c.blocks.forEach(function (b) {
        if (isEnrich(b)) return;
        var match = (role === "video") ? isCoreVideo(b) : (b.role === role);
        if (match && inRange(b, t)) core.push(b);
      });
    });
    var enrich = c.blocks.filter(isEnrich); // rendered as disclosures (or open for Advanced)
    return { concept: c, tier: t, core: core, enrich: enrich, scaffold: SCAFFOLD[t], pacing: PACING[t], enrichOpen: ENRICH_OPEN[t] };
  }

  // Flashcards per topic — unlocked once the learner completes that topic.
  var FLASHCARDS = {
    apis: [
      { q: "What is an API, in one line?", a: "A contract between two systems — you send a request, you get a response back." },
      { q: "What is an endpoint?", a: "One specific address (URL) in that contract, e.g. /users/123/orders." },
      { q: "REST vs GraphQL?", a: "REST exposes fixed endpoints; GraphQL lets the client ask for exactly the fields it wants." },
      { q: "What is a rate limit?", a: "A cap on how many calls you can make in a period, protecting the service." },
      { q: "Why do APIs usually return JSON?", a: "It’s a lightweight, standard text format both systems can read and write easily." },
      { q: "What does pagination mean for an API?", a: "Big lists come back in pages (chunks) instead of all at once." }
    ],
    web: [
      { q: "What happens when you open a web address?", a: "DNS turns the name into an address, your browser requests the page, the server responds, the browser draws it." },
      { q: "What does a 404 mean?", a: "The address was fine, but the thing you asked for wasn’t found." },
      { q: "401 vs 403?", a: "401 = you’re not logged in; 403 = you’re logged in but not allowed." },
      { q: "What is a cache?", a: "A saved copy so you don’t have to ask again — a common cause of ‘stale’ data." },
      { q: "Client vs server?", a: "The client (your browser) asks; the server answers." },
      { q: "What is DNS?", a: "The system that turns a human name (site.com) into a numeric address." }
    ],
    data: [
      { q: "What is a database table?", a: "Rows and columns — like a spreadsheet the app reads and writes." },
      { q: "Primary key vs foreign key?", a: "A primary key uniquely IDs a row; a foreign key points at another table’s key." },
      { q: "What is a JOIN?", a: "It stitches two tables together on a shared column." },
      { q: "Store vs derive — the rule?", a: "Store facts; derive anything you can recompute." },
      { q: "Why can ‘just add a field’ be costly?", a: "It can mean a migration, a backfill, and touching many queries." },
      { q: "One customer, many orders — how is it modelled?", a: "A customers table and an orders table, each order carrying the customer’s id." }
    ]
  };

  global.PXContent = { CONCEPTS: CONCEPTS, plan: plan, ORDER: ORDER, SCAFFOLD: SCAFFOLD, FLASHCARDS: FLASHCARDS };
})(window);
