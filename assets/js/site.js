/* ============================================================
   Catalyst Corp — Shared site script
   Guarded so each block only runs when its markup exists.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme ---------- */
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("cc-theme", t); } catch (e) {}
  }
  $$(".theme-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      setTheme((root.getAttribute("data-theme") === "dark") ? "light" : "dark");
    });
  });

  /* ---------- Nav scroll shadow ---------- */
  var nav = $("header.nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 16); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile drawer ---------- */
  var hamb = $(".hamb"), drawer = $(".drawer"), scrim = $(".drawer-scrim");
  function openMenu() { document.body.classList.add("menu-open"); if (hamb) hamb.setAttribute("aria-expanded", "true"); }
  function closeMenu() { document.body.classList.remove("menu-open"); if (hamb) hamb.setAttribute("aria-expanded", "false"); }
  if (hamb) hamb.addEventListener("click", function () { document.body.classList.contains("menu-open") ? closeMenu() : openMenu(); });
  if (scrim) scrim.addEventListener("click", closeMenu);
  var dclose = $(".dclose");
  if (dclose) dclose.addEventListener("click", closeMenu);
  if (drawer) $$("a", drawer).forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Footer year ---------- */
  $$(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Custom circle cursor ---------- */
  (function () {
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var root = document.documentElement;
    var dot = document.createElement("div"); dot.className = "cursor-dot cursor-hidden";
    var ring = document.createElement("div"); ring.className = "cursor-ring cursor-hidden";
    document.body.appendChild(dot); document.body.appendChild(ring);
    root.classList.add("has-cursor");

    var mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      if (!shown) { shown = true; dot.classList.remove("cursor-hidden"); ring.classList.remove("cursor-hidden"); }
    }, { passive: true });

    (function raf() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    })();

    // Grow over interactive elements
    var HOT = "a,button,input,select,textarea,summary,label,.spk,.ev,.fcard,.topic,.pcard,.stack-card,[role=button],.play,.daytab,.chip";
    document.addEventListener("mouseover", function (e) { if (e.target.closest(HOT)) root.classList.add("cursor-hot"); });
    document.addEventListener("mouseout", function (e) { if (e.target.closest(HOT) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOT))) root.classList.remove("cursor-hot"); });
    document.addEventListener("mousedown", function () { root.classList.add("cursor-down"); });
    document.addEventListener("mouseup", function () { root.classList.remove("cursor-down"); });
    document.addEventListener("mouseleave", function () { dot.classList.add("cursor-hidden"); ring.classList.add("cursor-hidden"); });
    document.addEventListener("mouseenter", function () { dot.classList.remove("cursor-hidden"); ring.classList.remove("cursor-hidden"); });
  })();

  /* ---------- Back to top ---------- */
  (function () {
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "to-top"; btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(btn);
    var onScroll = function () { btn.classList.toggle("show", window.scrollY > 500); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  })();

  /* ---------- Reveal on scroll ----------
     Handled by assets/js/anim.js (GSAP). This is only a safety net for when
     anim.js / GSAP never run: show everything and drop the pre-paint hide. */
  (function () {
    var els = $$(".reveal");
    if (!els.length) return;
    // If GSAP-driven reveals are (or will be) active, let anim.js own it.
    if (document.documentElement.classList.contains("anim-init") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    els.forEach(function (el) { el.classList.add("in"); });
  })();

  /* ---------- Animated counters ---------- */
  (function () {
    var nums = $$("[data-count]");
    if (!nums.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var dec = (target % 1 !== 0) ? 1 : 0;
      if (reduce) { el.textContent = target.toFixed(dec) + suffix; return; }
      var start = null, dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec) + suffix;
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Deadline banner dismiss ---------- */
  var banner = $(".topbar");
  if (banner) {
    try { if (localStorage.getItem("cc-banner") === "closed") banner.style.display = "none"; } catch (e) {}
    var bx = $(".topbar-x", banner);
    if (bx) bx.addEventListener("click", function () {
      banner.style.display = "none";
      try { localStorage.setItem("cc-banner", "closed"); } catch (e) {}
    });
  }

  /* ---------- Generic form fake-submit ---------- */
  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._to); t._to = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }
  window.ccToast = toast;
  $$("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      // A sibling .form-success (not inside the form) means show the success panel.
      var sib = form.parentNode ? $(".form-success", form.parentNode) : null;
      if (sib && !form.contains(sib)) {
        form.style.display = "none";
        sib.classList.add("show");
        sib.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast(form.getAttribute("data-msg") || "Thank you — we'll be in touch shortly.");
        form.reset();
      }
    });
  });

  /* ============================================================
     SHARED DATA
     ============================================================ */
  var FMT_COLOR = { "In-Person": "var(--fmt-inperson)", "Virtual": "var(--fmt-virtual)", "Hybrid": "var(--fmt-hybrid)" };
  var CAT_COLOR = { "Oncology": "#B4568F", "Clinical Trials": "#86286F", "Drug Discovery": "#6D3AA8", "Regulatory": "#8A4CB0", "Digital Health": "#C77D14" };
  var REG_COLOR = { "UK": "var(--uk)", "US": "var(--us)", "Global": "#C0328F" };

  var SPEAKERS = [
    { id: "elena-marsh", img: "1494790108377-be9c29b29330", n: "Dr. Elena Marsh", r: "Chief Scientific Officer", o: "Cortex Pharma", c: "linear-gradient(135deg,#4E1A44,#C0328F)", topic: "Drug Discovery", bio: "Elena leads discovery strategy at Cortex Pharma, with 20+ years advancing small-molecule and biologics programmes from target validation to Phase III. She chairs our flagship discovery track." },
    { id: "raj-patel", img: "1500648767791-00dcc994a43e", n: "Prof. Raj Patel", r: "Discovery Lab Director", o: "Genalyx", c: "linear-gradient(135deg,#4A2170,#6D3AA8)", topic: "Drug Discovery", bio: "Raj runs Genalyx's AI-driven target identification lab and holds a chair in medicinal chemistry. His work on machine-learning-guided screening has reshaped early discovery pipelines." },
    { id: "anna-sanders", img: "1507003211169-0a1dd7228f2d", n: "Anna Sanders", r: "VP Clinical Operations", o: "Halcyon CRO", c: "linear-gradient(135deg,#7A3E6A,#B4568F)", topic: "Clinical Trials", bio: "Anna has delivered 60+ global trials, specialising in decentralised and hybrid designs. She advises sponsors on site activation, patient retention and operational compliance." },
    { id: "brian-long", img: "1519085360753-af0119f7cbe7", n: "Dr. Brian Long", r: "Principal Scientist", o: "Aria Therapeutics", c: "linear-gradient(135deg,#5B2A7A,#B92D82)", topic: "Drug Discovery", bio: "Brian's team pioneers structure-based drug design for rare disease targets. He is a frequent voice on translational medicine and bench-to-bedside acceleration." },
    { id: "sofia-alvarez", img: "1580489944761-15a19d654956", n: "Dr. Sofia Alvarez", r: "Head of Patient Engagement", o: "NovaBio", c: "linear-gradient(135deg,#4E1A44,#8A4CB0)", topic: "Clinical Trials", bio: "Sofia designs patient-centric trial frameworks and diversity-in-research programmes adopted across NovaBio's global portfolio." },
    { id: "john-lewis", img: "1568602471122-7832951cc4c5", n: "John Lewis", r: "Regulatory Affairs Director", o: "BioAscent", c: "linear-gradient(135deg,#5B2A7A,#6D3AA8)", topic: "Regulatory", bio: "John steers FDA and EMA submissions for complex biologics and has led 30+ successful marketing authorisation applications." },
    { id: "rosalia-bell", img: "1573497019940-1c28c88b4f3e", n: "Rosalia Bell", r: "Real-World Evidence Lead", o: "Verdant Labs", c: "linear-gradient(135deg,#7A3E6A,#C0328F)", topic: "Digital Health", bio: "Rosalia builds RWE and health-data strategies that bridge clinical development and market access, with a focus on rare and orphan indications." },
    { id: "lisa-parker", img: "1607990281513-2c110a25bd8c", n: "Lisa Parker", r: "Clinical Programme Lead", o: "Meridian Rx", c: "linear-gradient(135deg,#4A2170,#B4568F)", topic: "Clinical Trials", bio: "Lisa specialises in investigator engagement and protocol training, running high-retention site networks across the UK and US." }
  ];

  // Upcoming events. Rich detail on flagships; graceful fallbacks for the rest.
  var EVENTS = [
    { id: "immuno-oncology-forum", d: "05", m: "Aug", year: "2026", title: "European Immuno-Oncology Forum", cat: "Oncology", fmt: "In-Person", region: "UK", city: "London, UK", venue: "The QEII Centre, Westminster, London", price: "£495", earlybird: "Early-bird ends 20 Jul", scar: "Early-bird ends 20 Jul", cpd: true, deadline: "2026-08-05T09:00:00",
      blurb: "Two days on the frontier of immuno-oncology — from novel checkpoint targets to next-generation cell therapies and combination trial design.",
      speakers: ["elena-marsh", "brian-long", "sofia-alvarez"], related: ["global-clinical-trials-congress", "precision-medicine-symposium"] },
    { id: "ai-drug-discovery-webinar", d: "12", m: "Aug", year: "2026", title: "AI in Drug Discovery Webinar Series", cat: "Drug Discovery", fmt: "Virtual", region: "Global", city: "Online · Live", venue: "Online · Catalyst Live platform", price: "Free", earlybird: "", scar: "", cpd: false, deadline: "2026-08-12T14:00:00",
      blurb: "A free four-part series on machine learning across the discovery pipeline: target ID, generative chemistry, screening and translational readouts.",
      speakers: ["raj-patel", "brian-long"], related: ["nextgen-discovery-congress"] },
    { id: "decentralized-trials-summit", d: "19", m: "Aug", year: "2026", title: "Decentralized Clinical Trials Summit", cat: "Clinical Trials", fmt: "Hybrid", region: "US", city: "Boston, USA", venue: "Hynes Convention Center, Boston", price: "$690", earlybird: "", scar: "Near capacity", cpd: true, deadline: "2026-08-19T09:00:00",
      blurb: "How leading sponsors and CROs are scaling decentralised and hybrid trials — technology, patient experience, data integrity and regulatory alignment.",
      speakers: ["anna-sanders", "sofia-alvarez", "rosalia-bell"], related: ["global-clinical-trials-congress"] },
    { id: "rare-disease-forum", d: "27", m: "Aug", year: "2026", title: "Rare Disease Patient Forum", cat: "Clinical Trials", fmt: "In-Person", region: "UK", city: "Cambridge, UK", venue: "Wellcome Genome Campus, Cambridge", price: "£350", earlybird: "", scar: "", cpd: false, deadline: "2026-08-27T09:30:00",
      blurb: "Bringing patient advocates, investigators and sponsors together to co-design rare and orphan disease research.",
      speakers: ["rosalia-bell", "sofia-alvarez"], related: [] },
    { id: "global-clinical-trials-congress", d: "10", m: "Sep", year: "2026", title: "Global Clinical Trials Congress 2026", cat: "Clinical Trials", fmt: "Hybrid", region: "US", city: "New York, USA", venue: "Javits Center, New York City", price: "$890", earlybird: "Early-bird ends 15 Aug · save $300", scar: "Early-bird ends 15 Aug · Near capacity", cpd: true, flagship: true, deadline: "2026-09-10T09:00:00",
      blurb: "Our flagship congress — three days across the entire clinical development lifecycle, from first-in-human through to Phase IV and real-world evidence, with 80+ speakers and 40+ exhibitors.",
      speakers: ["elena-marsh", "anna-sanders", "john-lewis", "sofia-alvarez", "lisa-parker"], related: ["decentralized-trials-summit", "immuno-oncology-forum", "precision-medicine-symposium"] },
    { id: "regulatory-affairs-summit", d: "17", m: "Sep", year: "2026", title: "Pharma Regulatory Affairs Summit", cat: "Regulatory", fmt: "Hybrid", region: "UK", city: "Manchester, UK", venue: "Manchester Central Convention Complex", price: "£575", earlybird: "", scar: "", cpd: true, deadline: "2026-09-17T09:00:00",
      blurb: "Navigating FDA, EMA and MHRA pathways — submissions, inspections, and the evolving global regulatory landscape.",
      speakers: ["john-lewis"], related: ["global-clinical-trials-congress"] },
    { id: "digital-health-expo", d: "24", m: "Sep", year: "2026", title: "Digital Health & Wearables Expo", cat: "Digital Health", fmt: "In-Person", region: "US", city: "San Francisco, USA", venue: "Moscone West, San Francisco", price: "$540", earlybird: "", scar: "", cpd: false, deadline: "2026-09-24T09:00:00",
      blurb: "Where connected devices, digital biomarkers and decentralised data meet clinical development.",
      speakers: ["rosalia-bell"], related: ["decentralized-trials-summit"] },
    { id: "oncology-investigator-meeting", d: "02", m: "Oct", year: "2026", title: "Oncology Investigator Meeting", cat: "Oncology", fmt: "Virtual", region: "Global", city: "Online · Live", venue: "Online · Catalyst Live platform", price: "Invite", earlybird: "", scar: "", cpd: true, deadline: "2026-10-02T13:00:00",
      blurb: "A protocol-focused investigator meeting activating sites for a global Phase III oncology programme.",
      speakers: ["elena-marsh", "lisa-parker"], related: ["immuno-oncology-forum"] },
    { id: "vaccines-immunotherapy-congress", d: "09", m: "Oct", year: "2026", title: "Vaccines & Immunotherapy Congress", cat: "Clinical Trials", fmt: "In-Person", region: "UK", city: "London, UK", venue: "ExCeL London", price: "£620", earlybird: "", scar: "New", cpd: true, deadline: "2026-10-09T09:00:00",
      blurb: "From mRNA platforms to next-generation adjuvants — the science and operations behind modern immunotherapy trials.",
      speakers: ["brian-long", "sofia-alvarez"], related: ["global-clinical-trials-congress"] },
    { id: "fda-ema-masterclass", d: "21", m: "Oct", year: "2026", title: "FDA & EMA Submission Masterclass", cat: "Regulatory", fmt: "Virtual", region: "Global", city: "Online · Live", venue: "Online · Catalyst Live platform", price: "$290", earlybird: "", scar: "", cpd: true, deadline: "2026-10-21T14:00:00",
      blurb: "A practical, workshop-style masterclass on assembling and defending regulatory submissions on both sides of the Atlantic.",
      speakers: ["john-lewis"], related: ["regulatory-affairs-summit"] },
    { id: "precision-medicine-symposium", d: "04", m: "Nov", year: "2026", title: "Precision Medicine Symposium", cat: "Oncology", fmt: "Hybrid", region: "US", city: "San Diego, USA", venue: "San Diego Convention Center", price: "$740", earlybird: "", scar: "", cpd: true, deadline: "2026-11-04T09:00:00",
      blurb: "Biomarker-driven trial design, companion diagnostics and the operational realities of precision oncology.",
      speakers: ["elena-marsh", "rosalia-bell"], related: ["immuno-oncology-forum", "global-clinical-trials-congress"] },
    { id: "medical-affairs-forum", d: "18", m: "Nov", year: "2026", title: "Medical Affairs Leaders Forum", cat: "Regulatory", fmt: "In-Person", region: "UK", city: "Edinburgh, UK", venue: "EICC, Edinburgh", price: "£465", earlybird: "", scar: "", cpd: false, deadline: "2026-11-18T09:00:00",
      blurb: "The strategic role of medical affairs across the product lifecycle — evidence, engagement and cross-functional leadership.",
      speakers: ["john-lewis", "rosalia-bell"], related: [] },
    { id: "rwe-data-summit", d: "03", m: "Dec", year: "2026", title: "Real-World Evidence & Data Summit", cat: "Digital Health", fmt: "Hybrid", region: "US", city: "Chicago, USA", venue: "McCormick Place, Chicago", price: "$650", earlybird: "", scar: "", cpd: true, deadline: "2026-12-03T09:00:00",
      blurb: "Turning real-world data into regulatory-grade evidence for development, safety and market access.",
      speakers: ["rosalia-bell", "anna-sanders"], related: ["digital-health-expo"] },
    { id: "year-end-oncology-roundtable", d: "11", m: "Dec", year: "2026", title: "Year-End Oncology Roundtable", cat: "Oncology", fmt: "Virtual", region: "Global", city: "Online · Live", venue: "Online · Catalyst Live platform", price: "Invite", earlybird: "", scar: "", cpd: false, deadline: "2026-12-11T14:00:00",
      blurb: "An invitation-only KOL roundtable reviewing the year in oncology development.",
      speakers: ["elena-marsh"], related: ["precision-medicine-symposium"] },
    { id: "clinical-ops-kickoff", d: "15", m: "Jan", year: "2027", title: "Clinical Operations Kickoff 2027", cat: "Clinical Trials", fmt: "In-Person", region: "US", city: "Boston, USA", venue: "Boston Convention & Exhibition Center", price: "$820", earlybird: "New for 2027", scar: "New", cpd: true, deadline: "2027-01-15T09:00:00",
      blurb: "Set the operational agenda for the year ahead — resourcing, technology, vendor strategy and site relationships.",
      speakers: ["anna-sanders", "lisa-parker"], related: ["global-clinical-trials-congress"] }
  ];

  var SPONSORS = {
    Diamond: ["Cortex Pharma", "NovaBio"],
    Platinum: ["Halcyon CRO", "Genalyx", "Aria Therapeutics"],
    Gold: ["Meridian Rx", "Verdant Labs", "BioAscent", "Helix Diagnostics"]
  };

  window.CATALYST = { EVENTS: EVENTS, SPEAKERS: SPEAKERS, SPONSORS: SPONSORS, CAT_COLOR: CAT_COLOR, FMT_COLOR: FMT_COLOR, REG_COLOR: REG_COLOR };

  function speakerById(id) { for (var i = 0; i < SPEAKERS.length; i++) if (SPEAKERS[i].id === id) return SPEAKERS[i]; return null; }
  function eventById(id) { for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].id === id) return EVENTS[i]; return null; }
  function initials(n) { return n.replace(/^(Dr\.|Prof\.)\s*/, "").split(" ").map(function (p) { return p[0]; }).slice(0, 2).join(""); }
  function phHtml(s) {
    if (s.img) return '<div class="ph" style="background-color:#4E1A44;background-image:url(\'https://images.unsplash.com/photo-' + s.img + '?auto=format&fit=crop&w=600&q=72\');background-size:cover;background-position:center top;"></div>';
    return '<div class="ph" style="background:' + s.c + '"><div class="ini">' + initials(s.n) + '</div></div>';
  }
  function pin() { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-5-7-11a7 7 0 0114 0c0 6-7 11-7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="2"/></svg>'; }

  function eventCard(e) {
    var regLabel = e.region === "Global" ? "ONLINE" : e.region;
    return '<a class="ev" href="event?id=' + e.id + '" aria-label="' + e.title + '">' +
      '<div class="top" style="background:' + (CAT_COLOR[e.cat] || "#86286F") + '"></div>' +
      '<div class="pad">' +
        '<div class="row1">' +
          '<div class="dblock"><div class="d">' + e.d + '</div><div class="m">' + e.m + '</div></div>' +
          '<span class="fmt" style="background:' + FMT_COLOR[e.fmt] + '">' + e.fmt + '</span>' +
        '</div>' +
        '<div class="cat">' + e.cat + '</div>' +
        '<h3>' + e.title + '</h3>' +
        '<div class="loc">' + pin() + '<span>' + e.city + '</span><span class="rflag" style="background:' + REG_COLOR[e.region] + '">' + regLabel + '</span></div>' +
        (e.scar ? '<div class="scar">' + e.scar + '</div>' : '') +
        '<div class="foot"><div class="price">from <b>' + e.price + '</b></div>' +
          '<span class="btn btn-primary btn-sm">View event</span></div>' +
      '</div></a>';
  }
  window.ccEventCard = eventCard;

  /* ============================================================
     EVENTS LISTING PAGE  (#grid)
     ============================================================ */
  (function () {
    var grid = $("#grid");
    if (!grid) return;
    var MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
    var MONTH_FULL = { Aug: "August 2026", Sep: "September 2026", Oct: "October 2026", Nov: "November 2026", Dec: "December 2026", Jan: "January 2027" };
    var countEl = $("#count");
    var state = { search: "", format: "all", region: "all", cat: "all" };

    // Preselect from ?cat=
    var params = new URLSearchParams(location.search);
    if (params.get("cat")) state.cat = params.get("cat");
    if (params.get("format")) state.format = params.get("format");
    if (params.get("region")) state.region = params.get("region");

    function render() {
      var q = state.search.toLowerCase();
      var filtered = EVENTS.filter(function (e) {
        if (state.format !== "all" && e.fmt !== state.format) return false;
        if (state.region !== "all" && e.region !== state.region) return false;
        if (state.cat !== "all" && e.cat !== state.cat) return false;
        if (q) { var hay = (e.title + " " + e.cat + " " + e.city + " " + e.fmt).toLowerCase(); if (hay.indexOf(q) === -1) return false; }
        return true;
      });
      if (countEl) countEl.innerHTML = "Showing <b>" + filtered.length + "</b> of " + EVENTS.length + " events";
      if (!filtered.length) {
        grid.innerHTML = '<div class="empty"><svg width="46" height="46" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '<h3>No events match your filters</h3><p>Try removing a filter to see more of the calendar.</p>' +
          '<button class="btn btn-primary" id="clearAll" type="button">Clear all filters</button></div>';
        $("#clearAll").addEventListener("click", reset);
        return;
      }
      var html = "";
      MONTHS.forEach(function (mo) {
        var group = filtered.filter(function (e) { return e.m === mo; });
        if (!group.length) return;
        html += '<div class="month-label"><h3>' + MONTH_FULL[mo] + '</h3><span class="rule"></span><span class="mc">' + group.length + " event" + (group.length > 1 ? "s" : "") + '</span></div>';
        html += group.map(eventCard).join("");
      });
      grid.innerHTML = html;
    }
    function syncChips() {
      $$("#filters .chip").forEach(function (c) {
        if (c.dataset.format !== undefined) c.classList.toggle("active", c.dataset.format === state.format);
        if (c.dataset.region !== undefined) c.classList.toggle("active", c.dataset.region === state.region);
      });
      var sel = $("#s-topic"); if (sel) sel.value = state.cat;
    }
    function reset() {
      state = { search: "", format: "all", region: "all", cat: "all" };
      var s = $("#search"); if (s) s.value = "";
      var st = $("#s-topic"); if (st) st.value = "all";
      syncChips(); render();
    }
    window.ccResetEvents = reset;
    var filters = $("#filters");
    if (filters) filters.addEventListener("click", function (ev) {
      var chip = ev.target.closest(".chip"); if (!chip) return;
      if (chip.dataset.format !== undefined) state.format = chip.dataset.format;
      if (chip.dataset.region !== undefined) state.region = chip.dataset.region;
      syncChips(); render();
    });
    var search = $("#search");
    if (search) search.addEventListener("input", function (e) { state.search = e.target.value; render(); });
    var topic = $("#s-topic");
    if (topic) topic.addEventListener("change", function (e) { state.cat = e.target.value; render(); });

    syncChips(); render();
  })();

  /* ============================================================
     TOPIC TILES  (#topicTiles)
     ============================================================ */
  (function () {
    var wrap = $("#topicTiles");
    if (!wrap) return;
    var topics = [
      { name: "Oncology", ic: "M12 3l2.5 5 5.5.8-4 4 1 5.5L12 20l-5 2.3 1-5.5-4-4 5.5-.8L12 3z", color: "#B4568F" },
      { name: "Clinical Trials", ic: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", color: "#86286F" },
      { name: "Drug Discovery", ic: "M10 2v6.5L4.5 18a2 2 0 001.8 3h11.4a2 2 0 001.8-3L14 8.5V2M8 2h8M9 14h6", color: "#6D3AA8" },
      { name: "Regulatory", ic: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z", color: "#8A4CB0" },
      { name: "Digital Health", ic: "M22 12h-4l-3 8-4-16-3 8H2", color: "#C77D14" }
    ];
    var counts = {};
    EVENTS.forEach(function (e) { counts[e.cat] = (counts[e.cat] || 0) + 1; });
    wrap.innerHTML = topics.map(function (t) {
      var n = counts[t.name] || 0;
      return '<a class="topic" href="events?cat=' + encodeURIComponent(t.name) + '">' +
        '<span class="tic" style="background:' + t.color + '1F;color:' + t.color + '">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="' + t.ic + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        '<div><h4>' + t.name + '</h4><div class="tc">' + n + " upcoming event" + (n !== 1 ? "s" : "") + '</div></div>' +
        '<span class="arr" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '</a>';
    }).join("");
  })();

  /* ============================================================
     FEATURED / HOME EVENTS  (#featuredGrid)
     ============================================================ */
  (function () {
    var wrap = $("#featuredGrid");
    if (!wrap) return;
    var picks = ["global-clinical-trials-congress", "immuno-oncology-forum", "decentralized-trials-summit"];
    wrap.innerHTML = picks.map(function (id) { var e = eventById(id); return e ? eventCard(e) : ""; }).join("");
  })();

  /* ============================================================
     HOME CALENDAR / UPCOMING FORUMS  (#daypanels)
     ============================================================ */
  (function () {
    var panels = $("#daypanels");
    if (!panels) return;
    var DAYS = {
      1: [
        ["09:00", "09:45", "Opening Keynote: The Next Decade of Drug Discovery", "Dr. Elena Marsh", "Cortex Pharma", "New York", "Main Stage"],
        ["10:15", "11:15", "AI & Machine Learning in Target Identification", "Prof. Raj Patel", "Genalyx", "New York", "Discovery Track"],
        ["13:30", "14:45", "Panel: Designing Patient-Centric Clinical Trials", "Dr. Sofia Alvarez", "NovaBio", "New York", "Clinical Ops"],
        ["15:00", "16:00", "Regulatory Strategy & Global Submissions", "John Lewis", "BioAscent", "New York", "Regulatory"]
      ],
      2: [
        ["09:00", "09:50", "Decentralized Trials at Scale", "Anna Sanders", "Halcyon CRO", "New York", "Main Stage"],
        ["10:30", "11:30", "Medicinal Chemistry Breakthroughs", "Dr. Brian Long", "Aria Therapeutics", "New York", "Discovery Track"],
        ["14:00", "15:30", "Investigator Meeting Best Practices", "Lisa Parker", "Meridian Rx", "New York", "Clinical Ops"],
        ["16:00", "17:00", "Real-World Evidence & Data", "Rosalia Bell", "Verdant Labs", "New York", "Digital Health"]
      ],
      3: [
        ["09:30", "10:15", "Rare & Orphan Drug Development Roundtable", "Rosalia Bell", "Verdant Labs", "New York", "Clinical Ops"],
        ["11:00", "12:00", "FDA & EMA Submission Masterclass", "John Lewis", "BioAscent", "New York", "Regulatory"],
        ["13:30", "14:30", "Closing Keynote: From Bench to Bedside", "Dr. Elena Marsh", "Cortex Pharma", "New York", "Main Stage"]
      ]
    };
    var arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    Object.keys(DAYS).forEach(function (d) {
      var rows = DAYS[d].map(function (s) {
        return '<a class="slot" href="event?id=global-clinical-trials-congress">' +
          '<div class="time">' + s[0] + '<span>to ' + s[1] + '</span></div>' +
          '<div class="ti">' + s[2] + '</div>' +
          '<div class="sp"><b>' + s[3] + '</b><span>' + s[4] + '</span></div>' +
          '<div class="lo"><b>' + s[5] + '</b><span>' + s[6] + '</span></div>' +
          '<div class="go">' + arrow + '</div>' +
        '</a>';
      }).join("");
      var div = document.createElement("div");
      div.className = "daypanel" + (d === "1" ? " active" : "");
      div.setAttribute("data-day", d);
      div.innerHTML = rows;
      panels.appendChild(div);
    });
    $$(".daytab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        $$(".daytab").forEach(function (t) { t.setAttribute("aria-selected", "false"); });
        tab.setAttribute("aria-selected", "true");
        var d = tab.getAttribute("data-day");
        $$(".daypanel").forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-day") === d); });
      });
    });
  })();


  /* ============================================================
     HOME SPEAKERS  (#homeSpeakers) — static, first 4
     ============================================================ */
  (function () {
    var wrap = $("#homeSpeakers");
    if (!wrap) return;
    wrap.innerHTML = SPEAKERS.slice(0, 4).map(function (s) {
      return '<div class="spk">' + phHtml(s) +
        '<h4>' + s.n + '</h4><div class="role">' + s.r + '</div><div class="org">' + s.o + '</div></div>';
    }).join("");
  })();

  /* ============================================================
     SPEAKERS GRID  (#spkGrid)  + optional profile modal
     ============================================================ */
  (function () {
    var wrap = $("#spkGrid");
    if (!wrap) return;
    var withModal = wrap.hasAttribute("data-modal");
    wrap.innerHTML = SPEAKERS.map(function (s) {
      var inner = phHtml(s) +
        '<h4>' + s.n + '</h4><div class="role">' + s.r + '</div><div class="org">' + s.o + '</div>';
      return withModal
        ? '<button class="spk" data-spk="' + s.id + '" style="background:none;border:none;cursor:pointer;font:inherit;">' + inner + '</button>'
        : '<div class="spk">' + inner + '</div>';
    }).join("");
    if (!withModal) return;
    var modal = $("#spkModal");
    if (!modal) return;
    function open(id) {
      var s = speakerById(id); if (!s) return;
      $("#spkModalBody").innerHTML =
        (s.img
          ? '<div class="ph" style="width:96px;height:96px;border-radius:18px;flex:none;background-color:#4E1A44;background-image:url(\'https://images.unsplash.com/photo-' + s.img + '?auto=format&fit=crop&w=300&q=72\');background-size:cover;background-position:center top;"></div>'
          : '<div class="ph" style="background:' + s.c + ';width:96px;height:96px;border-radius:18px;position:relative;flex:none;"><div class="ini" style="position:absolute;inset:0;display:grid;place-items:center;font-family:var(--serif);font-size:34px;color:#fff;">' + initials(s.n) + '</div></div>') +
        '<div><h3 style="font-size:24px;">' + s.n + '</h3>' +
        '<div style="font-family:var(--sans);color:var(--plum);font-weight:600;font-size:14px;margin:4px 0;">' + s.r + " · " + s.o + '</div>' +
        '<p style="font-family:var(--sans);color:var(--muted);font-size:15px;margin-top:12px;">' + s.bio + '</p></div>';
      modal.classList.add("show"); document.body.style.overflow = "hidden";
    }
    function close() { modal.classList.remove("show"); document.body.style.overflow = ""; }
    wrap.addEventListener("click", function (e) { var b = e.target.closest("[data-spk]"); if (b) open(b.getAttribute("data-spk")); });
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  })();

  /* ============================================================
     SPONSOR WALL  (#sponsorWall)
     ============================================================ */
  (function () {
    var wrap = $("#sponsorWall");
    if (!wrap) return;
    var html = "";
    ["Diamond", "Platinum", "Gold"].forEach(function (tier) {
      html += '<div class="sp-tier"><div class="sp-tier-label">' + tier + '</div><div class="sp-row">' +
        SPONSORS[tier].map(function (name) { return '<div class="sp-logo">' + name + '</div>'; }).join("") +
        '</div></div>';
    });
    wrap.innerHTML = html;
  })();

  /* ============================================================
     EVENT DETAIL PAGE  (#eventDetail)
     ============================================================ */
  (function () {
    var host = $("#eventDetail");
    if (!host) return;
    var id = new URLSearchParams(location.search).get("id");
    var e = id ? eventById(id) : null;
    if (!e) e = eventById("global-clinical-trials-congress");

    document.title = e.title + " — Catalyst Corp";
    var regLabel = e.region === "Global" ? "Online" : e.region;

    // Agenda: reuse a representative programme for every event (kept generic but realistic)
    var AGENDA = [
      { label: "Day 1 · Discovery & Science", rows: [
        { t: "09:00", title: "Registration & networking breakfast", who: "" },
        { t: "09:45", title: "Opening keynote: the next decade of " + e.cat.toLowerCase(), who: "Dr. Elena Marsh · Cortex Pharma" },
        { t: "10:45", title: "AI & data-driven approaches in modern research", who: "Prof. Raj Patel · Genalyx" },
        { t: "13:00", title: "Panel: designing for patients and sites", who: "Dr. Sofia Alvarez · NovaBio" },
        { t: "15:30", title: "Interactive workshop & roundtables", who: "" }
      ]},
      { label: "Day 2 · Operations & Delivery", rows: [
        { t: "09:15", title: "Scaling delivery across the UK & US", who: "Anna Sanders · Halcyon CRO" },
        { t: "10:30", title: "Regulatory strategy & global submissions", who: "John Lewis · BioAscent" },
        { t: "13:30", title: "Real-world evidence & long-term data", who: "Rosalia Bell · Verdant Labs" },
        { t: "16:00", title: "Closing keynote & networking reception", who: "" }
      ]}
    ];

    var speakersHtml = (e.speakers || []).map(function (sid) {
      var s = speakerById(sid); if (!s) return "";
      return '<div class="spk">' + phHtml(s) +
        '<h4>' + s.n + '</h4><div class="role">' + s.r + '</div><div class="org">' + s.o + '</div></div>';
    }).join("");

    var agendaHtml = AGENDA.map(function (day) {
      return '<div class="agenda-day"><h3>' + day.label + '</h3>' +
        day.rows.map(function (r) {
          return '<div class="agenda-row"><div class="at">' + r.t + '</div><div class="ai"><b>' + r.title + '</b>' + (r.who ? '<span>' + r.who + '</span>' : '') + '</div></div>';
        }).join("") + '</div>';
    }).join("");

    var sponsorsHtml = ["Diamond", "Platinum", "Gold"].map(function (tier) {
      return '<div class="sp-tier"><div class="sp-tier-label">' + tier + '</div><div class="sp-row">' +
        SPONSORS[tier].map(function (n) { return '<div class="sp-logo">' + n + '</div>'; }).join("") + '</div></div>';
    }).join("");

    var relatedHtml = (e.related || []).slice(0, 3).map(function (rid) { var r = eventById(rid); return r ? eventCard(r) : ""; }).join("");

    host.innerHTML =
      '<section class="ed-hero"><div class="wrap inner">' +
        '<div class="breadcrumb" style="color:rgba(255,255,255,0.7);"><a href="./">Home</a><span class="sep">/</span><a href="events">Events</a><span class="sep">/</span><span>' + e.title + '</span></div>' +
        '<div class="tags"><span class="tag">' + e.cat + '</span><span class="tag">' + e.fmt + '</span><span class="tag">' + regLabel + '</span>' + (e.cpd ? '<span class="tag">CPD / CME accredited</span>' : '') + '</div>' +
        '<h1>' + e.title + '</h1>' +
        '<div class="ed-meta">' +
          '<div class="m">' + calIcon() + e.d + ' ' + e.m + ' ' + e.year + '</div>' +
          '<div class="m">' + pin() + e.venue + '</div>' +
          '<div class="m">' + tagIcon() + 'from ' + e.price + '</div>' +
        '</div>' +
      '</div></section>' +

      '<div class="wrap" style="padding:56px 26px 96px;"><div class="ed-layout">' +
        '<div class="ed-main">' +
          (e.scar ? '<div class="scar" style="font-family:var(--sans);font-size:13px;font-weight:600;color:var(--coral);margin-bottom:20px;display:inline-flex;align-items:center;gap:7px;">⚠ ' + e.scar + '</div>' : '') +
          '<h2 style="font-size:28px;margin-bottom:14px;">About this event</h2>' +
          '<p style="font-family:var(--sans);color:var(--muted);font-size:16.5px;margin-bottom:16px;">' + e.blurb + '</p>' +
          '<p style="font-family:var(--sans);color:var(--muted);font-size:16.5px;margin-bottom:40px;">Delivered by Catalyst Corp with full scientific-committee oversight, compliant registration and CPD/CME accreditation where applicable. Attend in the format that suits you — on-site, online or hybrid.</p>' +

          '<h2 style="font-size:28px;margin:0 0 20px;">Programme</h2>' + agendaHtml +

          '<h2 style="font-size:28px;margin:40px 0 20px;">Featured speakers</h2>' +
          '<div class="spk-grid">' + (speakersHtml || '<p style="font-family:var(--sans);color:var(--muted);">Faculty to be announced.</p>') + '</div>' +

          '<h2 style="font-size:28px;margin:44px 0 20px;">Sponsors & exhibitors</h2>' +
          '<div class="sponsor-wall">' + sponsorsHtml + '</div>' +
          '<a class="btn btn-ghost" href="sponsors" style="margin-top:22px;">Become a sponsor →</a>' +

          '<h2 style="font-size:28px;margin:44px 0 16px;">Venue & travel</h2>' +
          '<div class="venue-card"><div class="vi">' + pin() + '</div><div><b>' + e.venue + '</b><p>' + e.city + '. Full travel, accommodation and accessibility details are sent to all registered delegates. Online attendees receive Catalyst Live platform access.</p></div></div>' +
        '</div>' +

        '<aside><div class="ed-card">' +
          '<div class="price">' + (e.price === "Free" || e.price === "Invite" ? e.price : "from " + e.price) + '</div>' +
          (e.earlybird ? '<div style="font-family:var(--sans);font-size:13px;color:var(--coral);font-weight:600;margin-top:6px;">' + e.earlybird + '</div>' : '') +
          '<div class="cd" id="countdown" data-deadline="' + e.deadline + '"></div>' +
          '<a class="btn btn-primary btn-block btn-lg" href="contact?intent=register&event=' + encodeURIComponent(e.title) + '">Register now</a>' +
          '<a class="btn btn-ghost btn-block" href="contact?intent=brochure&event=' + encodeURIComponent(e.title) + '" style="margin-top:10px;">Download brochure</a>' +
          '<ul class="inc">' +
            '<li>' + tk() + 'Full access to all sessions & tracks</li>' +
            '<li>' + tk() + '90-day on-demand replays</li>' +
            '<li>' + tk() + 'Delegate directory & networking</li>' +
            (e.cpd ? '<li>' + tk() + 'CPD / CME accreditation certificate</li>' : '') +
          '</ul>' +
        '</div></aside>' +
      '</div>' +

      (relatedHtml ? '<div style="margin-top:80px;"><h2 style="font-size:28px;margin-bottom:24px;">Related events</h2><div class="events-grid">' + relatedHtml + '</div></div>' : '') +
      '</div>';

    // Mobile sticky register bar
    var mcta = $("#mcta");
    if (mcta) {
      document.body.classList.add("has-mcta");
      mcta.innerHTML = '<div class="mp">from<b>' + e.price + '</b></div>' +
        '<a class="btn btn-primary" href="contact?intent=register&event=' + encodeURIComponent(e.title) + '">Register now</a>';
    }

    // Countdown
    var cd = $("#countdown");
    if (cd) {
      var deadline = new Date(cd.getAttribute("data-deadline")).getTime();
      function paint() {
        var diff = deadline - Date.now();
        if (isNaN(deadline) || diff <= 0) { cd.innerHTML = '<div class="u" style="flex:1;">Event has started or completed</div>'; return true; }
        var days = Math.floor(diff / 864e5), hrs = Math.floor(diff % 864e5 / 36e5), mins = Math.floor(diff % 36e5 / 6e4);
        cd.innerHTML =
          '<div class="u"><b>' + days + '</b><span>Days</span></div>' +
          '<div class="u"><b>' + hrs + '</b><span>Hrs</span></div>' +
          '<div class="u"><b>' + mins + '</b><span>Min</span></div>';
        return false;
      }
      if (!paint()) { var iv = setInterval(function () { if (paint()) clearInterval(iv); }, 60000); }
    }

    function calIcon() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
    function tagIcon() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-7-7A2 2 0 013 12.2V5a2 2 0 012-2h7.2a2 2 0 011.4.6l7 7a2 2 0 010 2.8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>'; }
    function tk() { return '<span class="tk"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'; }
  })();

  /* ---------- Prefill contact form from ?intent / ?event ---------- */
  (function () {
    var form = $("#contactForm");
    if (!form) return;
    var params = new URLSearchParams(location.search);
    var intent = params.get("intent"), event = params.get("event");
    var subject = $("#c-subject"), msg = $("#c-message"), heading = $("#contactHeading");
    if (intent && subject) {
      var map = { register: "Event registration", brochure: "Request event brochure", proposal: "Book a consultation", sponsor: "Sponsorship enquiry", speak: "Apply to speak" };
      if (map[intent]) { for (var i = 0; i < subject.options.length; i++) if (subject.options[i].value === map[intent]) subject.selectedIndex = i; }
    }
    if (event && msg) msg.value = "Regarding: " + event + "\n\n";
    if (intent && heading) {
      var h = { register: "Register your interest", brochure: "Get the event brochure", proposal: "Book a consultation", sponsor: "Enquire about sponsorship" };
      if (h[intent]) heading.textContent = h[intent];
    }
  })();

})();
