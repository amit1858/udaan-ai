(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll
  var els = document.querySelectorAll('.sec > *');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Loop
  var steps = [
    ['Discover', 'Udaan surfaces one idea that fits his shop, budget and weekday lull: a ₹99 breakfast combo.'],
    ['Explore', 'Ravi asks in Hinglish. Udaan explains why it fits, using his own menu and order patterns, and asks a follow-up.'],
    ['Evaluate', 'A deterministic finance engine shows test cost, making cost and potential contribution. The AI explains, it does not calculate.'],
    ['Try', 'Ravi approves a small, time-boxed experiment with a clear target. Nothing starts without his confirmation.'],
    ['Measure', 'He records what actually happened: 70 combos, or 130. Stored as an outcome, never as AI opinion.'],
    ['Learn', 'Udaan interprets the stored result and links it to a different next possibility. Then the loop begins again.']
  ];
  var ring = document.getElementById('loopRing');
  var prog = document.getElementById('ringProg');
  var nN = document.getElementById('stepN'), nT = document.getElementById('stepT'), nD = document.getElementById('stepD');
  var C = 942.5, cur = 0, timer = null, btns = [];
  steps.forEach(function (s, i) {
    var a = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
    var b = document.createElement('button');
    b.className = 'lnode'; b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = s[0];
    b.style.left = (50 + 37.5 * Math.cos(a)) + '%';
    b.style.top = (50 + 37.5 * Math.sin(a)) + '%';
    b.addEventListener('click', function () { stop(); set(i); });
    ring.appendChild(b); btns.push(b);
  });
  function set(i) {
    cur = i;
    btns.forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    nN.textContent = '0' + (i + 1); nT.textContent = steps[i][0]; nD.textContent = steps[i][1];
    prog.style.strokeDashoffset = C - C * ((i + 1) / steps.length);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  set(0);
  if (!reduce) timer = setInterval(function () { set((cur + 1) % steps.length); }, 3200);

  // Languages
  var langs = {
    en: ['"Weekday customers are down. Let\'s try a ₹99 breakfast combo."', 'assets/home-en-390.png', 'English', 'en'],
    hinglish: ['"Ravi, weekdays par customers kam aa rahe hain. Chalo ₹99 ka breakfast combo try karte hain."', 'assets/home-hinglish-390.png', 'Hinglish', 'hi-Latn'],
    hi: ['"रवि, weekdays पर customers कम आ रहे हैं। चलिए ₹99 का breakfast combo try करते हैं।"', 'assets/home-hi-390.png', 'Hindi', 'hi'],
    kn: ['"ರವಿ, weekdays ನಲ್ಲಿ customers ಕಡಿಮೆ ಬರುತ್ತಿದ್ದಾರೆ. ₹99 breakfast combo try ಮಾಡೋಣ."', 'assets/home-kn-390.png', 'Kannada', 'kn']
  };
  var q = document.getElementById('langQuote'), shot = document.getElementById('langShot');
  document.querySelectorAll('.lang-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      var L = langs[b.dataset.lang];
      document.querySelectorAll('.lang-tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      q.style.opacity = 0; shot.style.opacity = 0;
      setTimeout(function () {
        q.textContent = L[0]; q.lang = L[3];
        shot.src = L[1]; shot.alt = 'Actual Udaan home screen in ' + L[2];
        q.style.opacity = 1; shot.style.opacity = 1;
      }, reduce ? 0 : 220);
    });
  });

  // Architecture
  var arch = {
    mobile: ['Interface', 'Mobile experience', 'React + Tailwind mobile-first app at 390×844, four primary destinations: Home, Discover, Ask Udaan, My Plans. Dark mode, 44px touch targets, reduced-motion support.', ['conv', 'voice']],
    conv: ['Conversation', 'Multilingual AI conversation', 'One conversation service for English, Hinglish, Hindi and Kannada. Stable intent IDs and shared locale dictionaries; no per-language business logic.', ['mobile', 'openai', 'anthropic', 'demo', 'memory']],
    openai: ['Provider · verified', 'OpenAI', 'Official SDK, server-side keys only. gpt-5-mini verified live: contextual Hinglish reasoning and interpretation of the 70 and 130 outcomes stored in SQLite.', ['conv', 'memory', 'learning']],
    anthropic: ['Provider · implemented', 'Anthropic', 'Adapter implemented against the same provider contract. Not live-verified: no credentials configured. Labelled honestly in the app.', ['conv']],
    demo: ['Provider · fallback', 'Demo Engine', 'Credential-free deterministic engine covering six representative intents in all four languages. Always labelled Demo Mode, never presented as live AI.', ['conv']],
    memory: ['Data', 'Business memory', 'SQLite via Prisma: shop profile, menu economics, 90 days of clearly labelled synthetic sales, experiments and learning history. Memory is retained context, not fine-tuning.', ['conv', 'finance', 'learning']],
    finance: ['Deterministic', 'Financial engine', 'Authoritative calculations: cost, contribution and targets. Weekly baseline ₹87,600 revenue, 1,095 orders, ₹80 AOV, ₹49,275 contribution. AI explains these numbers but never produces them.', ['memory', 'lifecycle']],
    lifecycle: ['State machine', 'Experiment lifecycle', 'Proposed, approved, running, measured, learned. Every transition needs explicit owner confirmation; the model cannot change state.', ['finance', 'learning']],
    learning: ['Feedback', 'Learning engine', 'Compares recorded outcomes with targets and feeds the result into the next recommendation. Different outcomes produce different next steps.', ['lifecycle', 'memory', 'openai']],
    voice: ['Optional', 'Optional voice', 'Browser speech synthesis for read-aloud with play, stop and replay. Speech locale configured separately from display language.', ['mobile']]
  };
  var nodes = document.querySelectorAll('.node');
  var aK = document.getElementById('archK'), aT = document.getElementById('archT'), aD = document.getElementById('archD');
  function pick(id) {
    var d = arch[id];
    nodes.forEach(function (n) {
      n.classList.toggle('active', n.dataset.node === id);
      n.classList.toggle('linked', d[3].indexOf(n.dataset.node) > -1);
      n.setAttribute('aria-pressed', n.dataset.node === id ? 'true' : 'false');
    });
    aK.textContent = d[0]; aT.textContent = d[1]; aD.textContent = d[2];
  }
  nodes.forEach(function (n) {
    n.addEventListener('click', function () { pick(n.dataset.node); });
    n.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) pick(n.dataset.node); });
  });
  pick('mobile');

  // App CTA: only link inside Replit preview
  var h = location.hostname;
  var isPreview = /replit|repl\.co|localhost|127\.0\.0\.1/.test(h) && location.pathname.indexOf('/thesis') === 0;
  if (isPreview) {
    var link = document.getElementById('appLink');
    link.hidden = false;
    document.getElementById('appStatus').textContent = 'Replit preview detected';
    document.getElementById('appNote').textContent = 'You are viewing this inside the Replit preview, so the working app is one click away.';
  } else {
    document.getElementById('appNote').textContent = 'The working app runs in the Replit preview for reviewers. It is not publicly deployed, so there is no public link yet.';
  }
})();
