/* ============================================================
   Catalyst International — AI chat widget ("Aria")
   Self-contained: builds its own UI, talks to /chat (Workers AI).
   ============================================================ */
(function () {
  "use strict";
  if (window.__ccChat) return; window.__ccChat = true;

  var STORE = "cc-chat-v1";
  var history = [];
  try { var s = localStorage.getItem(STORE); if (s) history = JSON.parse(s) || []; } catch (e) {}

  var GREETING = "Hi, I'm Aria from Catalyst International 👋 How can I help — are you looking to attend an event, organise one, or explore sponsorship?";
  var CHIPS = [
    "Upcoming events",
    "Organise an event",
    "Sponsorship options",
    "Talk to the team"
  ];

  // ---- Build DOM ----
  var launcher = document.createElement("button");
  launcher.type = "button"; launcher.className = "cc-launcher"; launcher.setAttribute("aria-label", "Chat with us");
  launcher.innerHTML =
    '<span class="cc-badge">1</span>' +
    '<svg class="cc-chat-ic" width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.4 8.4 0 01-3.8-.9L3 21l2-5.2A8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.5 11h7M8.5 14h4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '<svg class="cc-close-ic" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  var panel = document.createElement("div");
  panel.className = "cc-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Chat with Aria");
  panel.innerHTML =
    '<div class="cc-head"><div class="cc-av">A</div><div><b>Aria</b><span>Catalyst International · online</span></div></div>' +
    '<div class="cc-body" id="ccBody"></div>' +
    '<div class="cc-chips" id="ccChips"></div>' +
    '<div class="cc-foot"><textarea id="ccInput" rows="1" placeholder="Type your message…" aria-label="Message"></textarea>' +
    '<button type="button" class="cc-send" id="ccSend" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 16-2.5-6L4 12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button></div>' +
    '<div class="cc-note">Aria is a virtual assistant · replies may occasionally be imperfect</div>';

  function mount() {
    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    wire();
    render();
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  var body, input, sendBtn, chipsEl, busy = false, opened = false;

  function wire() {
    body = panel.querySelector("#ccBody");
    input = panel.querySelector("#ccInput");
    sendBtn = panel.querySelector("#ccSend");
    chipsEl = panel.querySelector("#ccChips");

    launcher.addEventListener("click", toggle);
    sendBtn.addEventListener("click", function () { send(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input.value); }
    });
    input.addEventListener("input", function () { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 96) + "px"; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && opened) toggle(); });
  }

  function toggle() {
    opened = !opened;
    document.body.classList.toggle("cc-open", opened);
    var badge = launcher.querySelector(".cc-badge"); if (badge) badge.style.display = "none";
    if (opened) {
      if (!history.length) { pushBot(GREETING); }
      renderChips();
      setTimeout(function () { input && input.focus(); scrollDown(); }, 260);
    }
  }

  function save() { try { localStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch (e) {} }
  function pushBot(t) { history.push({ role: "assistant", content: t }); save(); render(); renderChips(); }
  function pushUser(t) { history.push({ role: "user", content: t }); save(); render(); }

  function render() {
    if (!body) return;
    body.innerHTML = history.map(function (m) {
      return '<div class="cc-msg ' + (m.role === "user" ? "user" : "bot") + '"></div>';
    }).join("");
    var nodes = body.querySelectorAll(".cc-msg");
    history.forEach(function (m, i) { if (nodes[i]) nodes[i].textContent = m.content; });
    scrollDown();
  }

  function renderChips() {
    if (!chipsEl) return;
    // Suggestions shown with every message (persistent) — hidden only while sending.
    chipsEl.innerHTML = "";
    if (busy) return;
    CHIPS.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = c;
      b.addEventListener("click", function () { send(c); });
      chipsEl.appendChild(b);
    });
  }

  function scrollDown() { if (body) body.scrollTop = body.scrollHeight + 200; }

  function showTyping() {
    var t = document.createElement("div"); t.className = "cc-typing"; t.id = "ccTyping";
    t.innerHTML = "<i></i><i></i><i></i>"; body.appendChild(t); scrollDown();
  }
  function hideTyping() { var t = body.querySelector("#ccTyping"); if (t) t.remove(); }

  function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    input.value = ""; input.style.height = "auto";
    pushUser(text);
    renderChips();
    busy = true; sendBtn.disabled = true; showTyping();

    fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-12) })
    })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (d) {
      hideTyping();
      pushBot((d && d.reply) ? d.reply : "Sorry, could you rephrase that?");
    })
    .catch(function () {
      hideTyping();
      pushBot("I'm having a brief connection issue. Please try again in a moment, or email hello@catalystintlcorp.com and our team will help you right away.");
    })
    .then(function () { busy = false; sendBtn.disabled = false; renderChips(); input.focus(); });
  }
})();
