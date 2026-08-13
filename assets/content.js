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
    },
    diagrams: {
      id: "diagrams", title: "Diagrams & flowcharts", area: "Visual mapping",
      blocks: [
        { id: "d1", role: "define", tiers: ALL, term: "Flowchart", def: "A picture of a process — boxes for steps, a diamond for decisions, arrows for the flow." },
        { id: "d2", role: "define", tiers: [0, 2], term: "The core shapes", def: "Oval = start/end · rectangle = a step · diamond = a decision (yes/no) · parallelogram = data in or out · arrow = the direction of flow." },
        { id: "v1", role: "video", kind: "primary", tiers: ALL, title: "Flowcharts, explained with the shapes", vid: "odplRrFQVgE", mins: 8,
          chapters: [{ t: 0, label: "Intro" }, { t: 180, label: "The shapes" }, { t: 360, label: "Wrap-up" }],
          alt: "A flowchart draws a process: an <b>oval</b> starts and ends it, a <b>rectangle</b> is a step, a <b>diamond</b> is a decision (yes/no), and <b>arrows</b> show which way the flow goes. Anyone can read it — no code required." },
        { id: "ex1", role: "example", tiers: [0, 1], text: "A signup flow: Start → enter email → (diamond) email valid? → No: show an error and loop back → Yes: create the account → End. A whole feature, readable at a glance." },
        { id: "p1", role: "practice", tiers: ALL, q: "In a flowchart, a diamond means…", opts: ["A start point", "A decision", "A database", "A finished step"], a: 1, hint: "It’s where the path splits — usually yes/no." },
        { id: "t1", role: "transfer", tiers: [1, 3], task: "Sketch the flow for one feature in your product — one start, at least one decision diamond, one end. Five boxes is plenty." },
        { id: "dd1", role: "deepdive", tiers: ALL, title: "Beyond flowcharts: user flows, swimlanes & sequence diagrams", text: "User flows map the screens a person moves through; swimlanes show who does what (customer vs system); sequence diagrams show messages between systems over time. Same idea — a shared picture that removes ambiguity." },
        { id: "r1", role: "resource", tiers: ALL, label: "Creately — flowchart symbols & meanings", url: "https://creately.com/guides/flowchart-symbols/" }
      ]
    },
    wireframes: {
      id: "wireframes", title: "Wireframes & prototypes", area: "Design & UX",
      blocks: [
        { id: "d1", role: "define", tiers: ALL, term: "Wireframe", def: "A rough, greyscale sketch of a screen — boxes and labels, no colour or real content — to agree the layout before anyone builds it." },
        { id: "d2", role: "define", tiers: [0, 2], term: "Fidelity", def: "How ‘finished’ a design looks. Low-fi = quick sketches/wireframes; high-fi = pixel-accurate mockups. Start low — it’s cheap to change." },
        { id: "v1", role: "video", kind: "primary", tiers: ALL, title: "Low-fidelity wireframes & prototypes (Google UX)", vid: "I5u2QOH18W8", mins: 9,
          chapters: [{ t: 0, label: "Intro" }, { t: 200, label: "Paper first" }, { t: 400, label: "Wrap-up" }],
          alt: "A wireframe is a rough, greyscale layout — boxes and labels only. <b>Low fidelity</b> means fast and cheap to change; you sketch, test it on paper, move things around, and only then open a design tool." },
        { id: "ex1", role: "example", tiers: [0, 1], text: "Before building a booking screen you sketch three boxes — a date, a time, a ‘Confirm’ button — on paper, test it with a colleague, move the button, and only then does anyone open a design tool." },
        { id: "p1", role: "practice", tiers: ALL, q: "Why start with a low-fidelity wireframe?", opts: ["It’s the final design", "It’s quick and cheap to change", "It replaces testing", "It’s only for engineers"], a: 1, hint: "The whole point is speed — change it before it’s expensive." },
        { id: "t1", role: "transfer", tiers: [1, 3], task: "Wireframe one screen of your product on paper — boxes and labels only. Then write the one user story it serves (‘As a … I want … so that …’)." },
        { id: "dd1", role: "deepdive", tiers: ALL, title: "Wireframe → prototype → storyboard", text: "A prototype links wireframes so people can click through a flow. A storyboard tells the user’s story frame by frame — the situation, what they do, the outcome — so the team feels the problem, not just the screens." },
        { id: "r1", role: "resource", tiers: ALL, label: "Skillshare — a guide to low-fidelity wireframes", url: "https://www.skillshare.com/en/blog/low-fidelity-wireframes-a-guide-for-ux-designers/" }
      ]
    },
    stories: {
      id: "stories", title: "User stories & acceptance criteria", area: "Requirements",
      blocks: [
        { id: "d1", role: "define", tiers: ALL, term: "User story", def: "A need in the user’s words: “As a [user], I want [action] so that [benefit].” It captures the why, not the how." },
        { id: "d2", role: "define", tiers: [0, 2], term: "Acceptance criteria", def: "The pass/fail checklist that says when a story is truly done — often written “Given / When / Then.”" },
        { id: "v1", role: "video", kind: "primary", tiers: ALL, title: "Stories vs user stories (Atlassian)", vid: "urZLGNWizpc", mins: 6,
          chapters: [{ t: 0, label: "Intro" }, { t: 120, label: "The format" }, { t: 240, label: "Wrap-up" }],
          alt: "A user story frames a need — “As a shopper, I want to save items so I can buy them later.” <b>Acceptance criteria</b> are the pass/fail conditions for ‘done’, often written Given / When / Then, so nobody has to guess." },
        { id: "ex1", role: "example", tiers: [0, 1], text: "Story: “As a shopper, I want to save items so I can buy them later.” Criteria: Given I’m logged in, When I tap the heart, Then the item appears in Saved and stays after I close the app." },
        { id: "p1", role: "practice", tiers: ALL, q: "What do acceptance criteria define?", opts: ["The visual design", "The pass/fail conditions for ‘done’", "Which server to use", "The sprint length"], a: 1, hint: "They remove ambiguity about what ‘done’ means." },
        { id: "t1", role: "transfer", tiers: [1, 3], task: "Write one user story for your product in the ‘As a / I want / so that’ format, then add two acceptance criteria in ‘Given / When / Then.’" },
        { id: "dd1", role: "deepdive", tiers: ALL, title: "INVEST, and why vague criteria cost you", text: "Good stories are INVEST — Independent, Negotiable, Valuable, Estimable, Small, Testable. Vague acceptance criteria are the number-one cause of rework and scope creep: developers end up guessing product decisions." },
        { id: "r1", role: "resource", tiers: ALL, label: "Atlassian — user stories with examples", url: "https://www.atlassian.com/agile/project-management/user-stories" }
      ]
    },
    agile: {
      id: "agile", title: "Agile & Scrum", area: "Ways of working",
      blocks: [
        { id: "d1", role: "define", tiers: ALL, term: "Agile", def: "Build in small slices, show real work often, and adjust — instead of one giant plan delivered at the very end." },
        { id: "d2", role: "define", tiers: [0, 2], term: "Scrum words", def: "Sprint = a short fixed work period · Backlog = the ordered to-do list · Standup = a quick daily sync · Retro = what to improve next time." },
        { id: "v1", role: "video", kind: "primary", tiers: ALL, title: "Scrum in under 10 minutes", vid: "XU0llRltyFM", mins: 9,
          chapters: [{ t: 0, label: "Intro" }, { t: 200, label: "The sprint" }, { t: 420, label: "Wrap-up" }],
          alt: "<b>Agile</b> means building in small slices and adjusting as you go. In <b>Scrum</b>: work happens in short <b>sprints</b>, the <b>backlog</b> is the ordered to-do list, a daily <b>standup</b> keeps everyone in sync, and a <b>retro</b> improves the next round." },
        { id: "ex1", role: "example", tiers: [0, 1], text: "A team works in two-week sprints. Monday they pull the top items off the backlog; each morning they sync for five minutes; Friday they demo what’s done and decide what’s next. Small, visible, repeatable." },
        { id: "p1", role: "practice", tiers: ALL, q: "In Scrum, a “sprint” is…", opts: ["A bug", "A short, fixed period of work", "A meeting room", "A type of server"], a: 1, hint: "It’s a fixed block of time, usually 1–2 weeks." },
        { id: "t1", role: "transfer", tiers: [1, 3], task: "Write your product’s next sprint goal in one sentence, and list the three backlog items you’d pull in to hit it." },
        { id: "dd1", role: "deepdive", tiers: ALL, title: "Roles, ceremonies & why WIP limits matter", text: "A Product Owner orders the backlog; a Scrum Master unblocks the team. ‘Ceremonies’ are just the planning / standup / review / retro rhythm. Limiting work-in-progress (WIP) gets things finished instead of everything half-done." },
        { id: "r1", role: "resource", tiers: ALL, label: "Atlassian — the Agile & Scrum guide", url: "https://www.atlassian.com/agile/scrum" }
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
    ],
    diagrams: [
      { q: "What does an oval mean in a flowchart?", a: "The start or the end of the process." },
      { q: "What does a diamond mean?", a: "A decision — the path splits, usually yes/no." },
      { q: "What does a rectangle mean?", a: "A single step or action in the process." },
      { q: "What does an arrow show?", a: "The direction the flow moves." },
      { q: "What’s a swimlane diagram for?", a: "Showing who does what — each lane is a person or system." },
      { q: "Why draw a flow before building?", a: "It creates a shared, unambiguous picture anyone can read." }
    ],
    wireframes: [
      { q: "What is a wireframe?", a: "A rough, greyscale layout of a screen — boxes and labels, no colour or real content." },
      { q: "Low vs high fidelity?", a: "Low = quick sketches, cheap to change; high = pixel-accurate mockups." },
      { q: "Why start low-fidelity?", a: "It’s fast and cheap to change before building gets expensive." },
      { q: "What is a prototype?", a: "Linked wireframes people can click through to test a flow." },
      { q: "What is a storyboard?", a: "The user’s story told frame by frame — situation, action, outcome." },
      { q: "What comes before opening a design tool?", a: "Sketching and testing the layout on paper." }
    ],
    stories: [
      { q: "What’s the user-story format?", a: "As a [user], I want [action] so that [benefit]." },
      { q: "What are acceptance criteria?", a: "The pass/fail conditions that define ‘done’." },
      { q: "What’s ‘Given / When / Then’ for?", a: "Writing clear, testable acceptance criteria." },
      { q: "Story vs acceptance criteria?", a: "The story is the why; the criteria are the what and the ‘done’." },
      { q: "What does INVEST stand for?", a: "Independent, Negotiable, Valuable, Estimable, Small, Testable." },
      { q: "The cost of vague criteria?", a: "Rework and scope creep — developers end up guessing product decisions." }
    ],
    agile: [
      { q: "What is Agile, in one line?", a: "Build in small slices, show work often, and adjust." },
      { q: "What is a sprint?", a: "A short, fixed period of work — usually 1–2 weeks." },
      { q: "What is the backlog?", a: "The ordered list of things still to do." },
      { q: "What is a standup?", a: "A quick daily sync on progress and blockers." },
      { q: "What does a Product Owner do?", a: "Orders the backlog — decides what matters most." },
      { q: "Why limit work-in-progress?", a: "To finish things instead of leaving everything half-done." }
    ]
  };

  global.PXContent = { CONCEPTS: CONCEPTS, plan: plan, ORDER: ORDER, SCAFFOLD: SCAFFOLD, FLASHCARDS: FLASHCARDS };
})(window);
