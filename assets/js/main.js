(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

  /* ---------- nav: progress, scrollspy, mobile menu ---------- */
  const nav = $('#nav'), prog = $('#progress');
  const sections = $$('#navlinks a').map(a => ({ a, el: $(a.getAttribute('href')) })).filter(x => x.el);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (scrollY / max * 100) + '%';
    nav.classList.toggle('scrolled', scrollY > 10);
    let cur = null;
    sections.forEach(s => { if (s.el.getBoundingClientRect().top < 140) cur = s; });
    sections.forEach(s => s.a.classList.toggle('on', s === cur));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#menuBtn').addEventListener('click', () => $('#navlinks').classList.toggle('open'));
  $$('#navlinks a').forEach(a => a.addEventListener('click', () => $('#navlinks').classList.remove('open')));

  /* ---------- reveal + counters ---------- */
  $$('.section > h2, .cards3, .stats, .results, .disc, .pains, .framing, .compare, .pos, .stepper, .admin, .concept, .auto, .impact, .cols3').forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((ents) => ents.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.classList.contains('stats') || e.target.classList.contains('results')) countUp(e.target);
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));
  function countUp(root) {
    $$('[data-count]', root).forEach(b => {
      const end = +b.dataset.count, pre = b.dataset.prefix || '', suf = b.dataset.suffix || '';
      const t0 = performance.now(), dur = 1100;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        b.textContent = pre + v.toLocaleString('en-IN') + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- discovery toggle ---------- */
  const disc = [
    ['Brand managers', 'Memory, emails and calls to other teams to know what\'s live', 'See current and upcoming offers by brand and SKU, straight from the system'],
    ['Store associates', 'Scan a SKU at the terminal or call the BM mid-sale', 'Offer and stock status at a glance, before the customer asks'],
    ['Cart rule team', 'A separate G-Sheet, reconciled by hand with Magento and NRM', 'One source of truth, with no copy to drift out of sync'],
    ['Ops & BMs', 'Find out after a customer complains', 'Be told when a rule is enabled, disabled or price parity changes'],
    ['Store staff (exchange)', 'Process a full return, then ring up a new sale', 'One exchange flow that respects store stock, lots and MRP'],
  ];
  const discEl = $('#disc');
  const renderDisc = (mode) => {
    discEl.classList.toggle('need', mode === 'need');
    discEl.innerHTML = disc.map(([t, w, n]) => `<div class="disc-row"><b>${t}</b><p>${mode === 'need' ? n : w}</p></div>`).join('');
  };
  segment('#discSeg', 'mode', renderDisc); renderDisc('work');

  function segment(sel, key, cb) {
    const root = $(sel);
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', root).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      cb(b.dataset[key]);
    });
  }

  /* ---------- pain points with filter ---------- */
  const pains = [
    ['Brand managers', 'BMs can\'t see what\'s actually live', 'They can\'t view current or upcoming offers by brand or SKU as configured in Magento, NRM or catalog.'],
    ['Store staff', 'Associates work blind at checkout', 'They can\'t see active discounts without scanning a SKU or calling a BM, which slows down every sale.'],
    ['Customers', 'The experience breaks at the counter', 'The customer expects an offer that isn\'t configured: disputes, an unhappy queue, bad reviews.'],
    ['Cart rule team', 'The G-Sheet doesn\'t match the system', 'What BMs add to the sheet often differs from what\'s live, and nothing catches the gap.'],
    ['All teams', 'Many sheets, many versions of the truth', 'Conflicting spreadsheets mean decisions get made on stale data, followed by more back-and-forth.'],
    ['Ops & BMs', 'Nobody hears when offers change', 'Go-lives, disables and price-parity toggles go unannounced, so teams react to surprises.'],
  ];
  $('#pains').innerHTML = pains.map(([w, t, d], i) => `<article class="pain" data-who="${w}"><div class="top"><span class="n">P${i + 1}</span><small>${w}</small></div><h3>${t}</h3><p>${d}</p></article>`).join('');
  const who = ['All', ...new Set(pains.map(p => p[0]))];
  const pf = $('#painFilter');
  pf.innerHTML = who.map((w, i) => `<button class="${i ? '' : 'on'}" data-w="${w}">${w}</button>`).join('');
  pf.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', pf).forEach(x => x.classList.toggle('on', x === b));
    $$('.pain').forEach(p => p.classList.toggle('dim', b.dataset.w !== 'All' && p.dataset.who !== b.dataset.w));
  });

  /* ---------- principles accordion ---------- */
  const pr = [
    ['Truth comes from the system, not sheets', 'Every row is read from Magento, NRM or catalog, with the source shown on the row.'],
    ['Glanceable at the counter', 'Status first, details on demand. Readable in about 3 seconds while a customer waits.'],
    ['Stock sits next to every decision', 'An offer that can\'t be fulfilled isn\'t really an offer.'],
    ['Push changes, don\'t make people pull', 'Teams are told when rules go live, are disabled or change parity.'],
    ['One flow per customer intent', 'An exchange is one flow, not a return plus a new sale.'],
  ];
  const acc = $('#principles');
  acc.innerHTML = pr.map(([t, d], i) => `<div class="acc-item${i ? '' : ' open'}"><button aria-expanded="${!i}"><i>0${i + 1}</i>${t}</button><div class="body">${d}</div></div>`).join('');
  acc.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const it = b.parentElement, open = !it.classList.contains('open');
    $$('.acc-item', acc).forEach(x => { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); });
    if (open) { it.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
  });

  /* ---------- compare slider ---------- */
  const cmp = $('#compare'), top = $('#compareTop'), hd = $('#compareHandle');
  const setCmp = (pct) => {
    pct = Math.max(2, Math.min(98, pct));
    top.style.width = pct + '%'; hd.style.left = pct + '%'; hd.setAttribute('aria-valuenow', Math.round(pct));
  };
  const sizeTop = () => { $('img', top).style.width = cmp.clientWidth + 'px'; };
  addEventListener('resize', sizeTop); $('img', cmp).addEventListener('load', sizeTop); sizeTop();
  let drag = false;
  const move = (x) => { const r = cmp.getBoundingClientRect(); setCmp((x - r.left) / r.width * 100); };
  cmp.addEventListener('pointerdown', (e) => { drag = true; cmp.setPointerCapture(e.pointerId); move(e.clientX); });
  cmp.addEventListener('pointermove', (e) => drag && move(e.clientX));
  cmp.addEventListener('pointerup', () => drag = false);
  hd.addEventListener('keydown', (e) => {
    const v = +hd.getAttribute('aria-valuenow');
    if (e.key === 'ArrowLeft') setCmp(v - 5); if (e.key === 'ArrowRight') setCmp(v + 5);
  });
  setCmp(50);

  if ($('#board')) {
  /* ---------- interactive offers board ---------- */
  const offers = [
    { s: 'active', u: 'ends', brand: 'Nykaa', name: 'Buy 2 Get 1 on lip kits', sold: '5.2k sold', dur: '01 Nov – 15 Nov', type: 'BOGO', src: 'Magento', stock: ['ok', '132 units'] },
    { s: 'active', u: 'soon', brand: 'Etude House', name: 'Flat 20% on skincare', sold: '2k sold', dur: '05 Nov – 17 Nov', type: 'By %', src: 'NRM', stock: ['out', 'Out of stock'] },
    { s: 'active', brand: 'Estee Lauder', name: 'Free travel kit above ₹4,000', dur: '01 Nov – 30 Nov', type: 'Free Gift', src: 'Magento', stock: ['low', 'Low: 13 left'] },
    { s: 'active', brand: 'Clinique', name: '15% off Moisture Surge', sold: '1.3k sold', dur: '10 Nov – 20 Nov', type: 'By %', src: 'Catalog', stock: ['ok', '345 units'] },
    { s: 'active', brand: 'Maybelline New York', name: 'Free sample with Fit Me', isNew: 1, dur: '12 Nov – 25 Nov', type: 'Free Sample', src: 'Magento', stock: ['ok', '3,212 units'] },
    { s: 'active', brand: 'Charlotte Tilbury', name: 'Upto ₹500 off on lipsticks', sold: '1.3k sold', dur: '08 Nov – 22 Nov', type: 'Upto ₹500 Off', src: 'Catalog', stock: ['ok', '139 units'] },
    { s: 'active', brand: 'Kay Beauty', name: 'Buy 1 Get 1 on kajal', dur: '11 Nov – 18 Nov', type: 'BOGO', src: 'NRM', stock: ['ok', '982 units'] },
    { s: 'up', brand: 'Clinique', name: '15% off skincare (festive)', dur: 'Starts 16 Nov', type: 'By %', src: 'Magento', stock: ['low', 'Low: 8 left'] },
    { s: 'up', brand: 'MAC', name: 'Free gift above ₹3,500', dur: 'Starts 18 Nov', type: 'Free Gift', src: 'Catalog', stock: ['ok', '410 units'] },
    { s: 'up', brand: 'Lakmé', name: 'Buy 2 Get 1 on nail colour', dur: 'Starts 20 Nov', type: 'BOGO', src: 'NRM', stock: ['ok', '1,104 units'] },
    { s: 'exp', brand: 'Huda Beauty', name: 'Flat 25% on palettes', dur: 'Ended 10 Nov', type: 'By %', src: 'Magento', stock: ['ok', '88 units'] },
    { s: 'exp', brand: 'Nykaa', name: 'Upto ₹500 off on nail kits', dur: 'Ended 09 Nov', type: 'Upto ₹500 Off', src: 'Catalog', stock: ['ok', '230 units'] },
    { s: 'off', brand: 'Estee Lauder', name: 'Price parity (paused by BM)', dur: 'Deactivated 11 Nov', type: 'By %', src: 'NRM', stock: ['ok', '64 units'] },
  ];
  const statuses = [['active', 'Active', '#1E9E5A'], ['up', 'Upcoming', '#E0B80F'], ['exp', 'Expired', '#878E93'], ['off', 'Deactivated', '#A3A8AD']];
  const quicks = ['BOGO', 'Free Sample', 'By %', 'Upto ₹500 Off', 'Free Gift'];
  const state = { s: 'active', q: null, text: '' };
  const tabs = $('#statusTabs');
  tabs.innerHTML = statuses.map(([k, l, c]) => `<button data-s="${k}" style="--c:${c}">${l} (${offers.filter(o => o.s === k).length})</button>`).join('');
  $('#quick').innerHTML = quicks.map(q => `<button data-q="${q}">${q}</button>`).join('');
  const pillFor = (o) => {
    if (o.s === 'active') return o.u === 'ends' ? '<span class="st ends">◷ Ends today</span>' : o.u === 'soon' ? '<span class="st soon">◷ Ends in 2d</span>' : '<span class="st active">● Active</span>';
    return { up: '<span class="st up">● Upcoming</span>', exp: '<span class="st exp">● Expired</span>', off: '<span class="st off">● Deactivated</span>' }[o.s];
  };
  const icon = { ok: '✓', low: '⚠', out: '✕' };
  const renderBoard = () => {
    $$('button', tabs).forEach(b => b.classList.toggle('on', b.dataset.s === state.s));
    $$('#quick button').forEach(b => b.classList.toggle('on', b.dataset.q === state.q));
    const t = state.text.toLowerCase();
    const list = offers.filter(o => o.s === state.s && (!state.q || o.type === state.q) && (!t || (o.brand + ' ' + o.name).toLowerCase().includes(t)));
    $('#rows').innerHTML = list.map((o, i) => `<tr style="animation-delay:${i * 30}ms"><td>${pillFor(o)}</td><td>${o.brand}</td><td>${o.name}${o.sold ? `<span class="sold">${o.sold}</span>` : ''}${o.isNew ? '<span class="sold" style="background:#ECF9EE;color:#1E9E5A">New</span>' : ''}</td><td>${o.dur}</td><td><span class="type">${o.type}</span></td><td><span class="src ${o.src}">${o.src}</span></td><td><span class="stock ${o.stock[0]}">${icon[o.stock[0]]} ${o.stock[1]}</span></td><td class="dots">⋮</td></tr>`).join('');
    $('#empty').hidden = list.length > 0;
  };
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.s = b.dataset.s; renderBoard(); } });
  $('#quick').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.q = state.q === b.dataset.q ? null : b.dataset.q; renderBoard(); } });
  $('#search').addEventListener('input', (e) => { state.text = e.target.value; renderBoard(); });
  $('#notesOn').addEventListener('change', (e) => $('#board').classList.toggle('notes', e.target.checked));
  renderBoard();
  }

  /* ---------- exchange stepper ---------- */
  const steps = [
    ['1', 'Find Exchange', 'Exchange now sits right next to Return, so staff find it in the same place.', ['getOrderById'], 'ex-1'],
    ['2', 'Pick the item', 'Staff pick the item and say why it\'s coming back. Items that can\'t be swapped are marked right away.', ['getOrderById'], 'ex-2'],
    ['3', 'Choose the new one', 'The screen shows other sizes or shades of the same product, but only the ones this store actually has.', ['discovery API'], 'ex-3'],
    ['3b', 'If nothing is in stock', 'If nothing is in stock, staff aren\'t stuck. They can switch to a refund without starting over.', ['discovery API'], 'ex-3b'],
    ['4', 'Check batch & price', 'Staff confirm the exact batch and price. If the new item costs a lot more or less, the swap isn\'t allowed.', ['Gludo API', 'OMS'], 'ex-4'],
    ['5', 'Swap done', 'The swap is done, and a reference number keeps the record clean for the store and the stock count.', ['OMS'], 'ex-5'],
  ];
  let cur = 0;
  const sp = $('#stepper');
  sp.innerHTML = steps.map(([n, t], i) => `<button data-i="${i}"><i>${n}</i><span>${t}</span></button>`).join('');
  const showStep = (i) => {
    cur = (i + steps.length) % steps.length;
    const [n, t, d, apis, img] = steps[cur];
    $$('button', sp).forEach((b, j) => { b.classList.toggle('on', j === cur); b.classList.toggle('done', j < cur); });
    const im = $('#stepImg'); im.style.opacity = 0;
    setTimeout(() => { im.src = `assets/img/${img}.webp`; im.alt = t; im.style.opacity = 1; }, 150);
    $('#stepTag').textContent = 'Step ' + n; $('#stepTitle').textContent = t; $('#stepBody').textContent = d;
    $('#stepApi').innerHTML = '';
  };
  sp.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showStep(+b.dataset.i); });
  $('#prev').addEventListener('click', () => showStep(cur - 1));
  $('#next').addEventListener('click', () => showStep(cur + 1));
  addEventListener('keydown', (e) => {
    const r = $('#exchange').getBoundingClientRect();
    if (r.top < innerHeight * .6 && r.bottom > innerHeight * .4 && !e.target.closest('input')) {
      if (e.key === 'ArrowRight') showStep(cur + 1); if (e.key === 'ArrowLeft') showStep(cur - 1);
    }
  });
  showStep(0);

  /* ---------- ARS upload simulator ---------- */
  let outcome = 'ok', sim = { step: 0, type: '' };
  const body = $('#simBody'), stepsEl = $$('#simSteps li');
  const setSteps = (k, err) => stepsEl.forEach((li, i) => { li.className = i < k ? 'done' : i === k ? (err ? 'err cur' : 'cur') : ''; });
  const renderSim = () => {
    if (sim.step === 0) {
      setSteps(0);
      body.innerHTML = `<div class="field"><label for="ftype">Choose File Type</label><select id="ftype"><option value="">None</option><option>Master File</option><option>Store Prioritization</option></select></div><button class="pbtn" id="init" disabled>Initiate New Upload</button>`;
      $('#ftype').value = sim.type;
      $('#init').disabled = !sim.type;
      $('#ftype').addEventListener('change', (e) => { sim.type = e.target.value; $('#init').disabled = !sim.type; });
      $('#init').addEventListener('click', () => { sim.step = 1; renderSim(); });
    } else if (sim.step === 1) {
      setSteps(1);
      body.innerHTML = `<div class="field"><label>Upload ${sim.type}</label><button class="obtn" id="pick">⇪ Choose CSV</button></div><p style="color:var(--p-mute);margin:0">Simulated: picks <code>retail_POS_Admin_18-Sheet.csv</code></p>`;
      $('#pick').addEventListener('click', () => { sim.step = 2; renderSim(); });
    } else if (sim.step === 2) {
      setSteps(1);
      body.innerHTML = `<div class="file"><span>📄</span><b>retail_POS_Admin_18-Sheet.csv</b><span style="color:var(--p-mute)">2,431 rows</span></div><div class="bar"><i id="barI"></i></div><button class="pbtn" id="proc">Process</button>`;
      $('#proc').addEventListener('click', () => {
        $('#proc').disabled = true; $('#proc').textContent = 'Processing…';
        requestAnimationFrame(() => $('#barI').style.width = '100%');
        setTimeout(() => { sim.step = 3; renderSim(); }, 1300);
      });
    } else {
      if (outcome === 'ok') {
        setSteps(3);
        body.innerHTML = `<div class="msg ok">✓ File uploaded successfully. ${sim.type} is live for the next replenishment run.</div><div class="file"><span>📄</span><b>retail_POS_Admin_18-Sheet.csv</b><span style="color:var(--green)">Processed</span></div><button class="pbtn" id="again">Upload New File</button>`;
      } else {
        setSteps(2, true);
        body.innerHTML = `<div class="msg err">✕ File uploaded is in incorrect format. Check the column headers against the ${sim.type} template.</div><div class="file"><span>📄</span><b>retail_POS_Admin_18-Sheet.csv</b><span style="color:var(--red)">Rejected</span></div><button class="pbtn" id="again">Re-Upload</button>`;
      }
      $('#again').addEventListener('click', () => { sim.step = outcome === 'ok' ? 0 : 1; if (outcome === 'ok') sim.type = ''; renderSim(); });
    }
  };
  segment('#outcomeSeg', 'o', (o) => { outcome = o; if (sim.step === 3) renderSim(); });
  renderSim();
  const arsShots = [['ars-1', 'Choose file type'], ['ars-2', 'Upload & process'], ['ars-3', 'Processed'], ['ars-4', 'Format error → re-upload'], ['ars-5', 'Download by location']];
  $('#arsGallery').innerHTML = arsShots.map(([f, c]) => `<figure><img class="zoomable" loading="lazy" src="assets/img/${f}.webp" alt="ARS: ${c}"><figcaption>${c}</figcaption></figure>`).join('');

  /* ---------- concepts ---------- */
  const concepts = {
    floor: { phones: [['phone-scan', 'A · Scan → truth', 'One scan shows live offers, upcoming offers and stock here and nearby.'], ['phone-exchange', 'B · Exchange assistant', 'AI ranks replacements by size fit, in-store stock and price difference.'], ['phone-updates', 'C · Changes come to you', 'Go-lives, endings and sheet-vs-system mismatches, pushed as tasks.']] },
    rep: { phones: [['phone-tasks', 'A · Prioritized inbox', 'Ordered by what\'s about to sell: offers going live, empty facings.'], ['phone-pick', 'B · Guided pick & place', 'The backroom bay and the shelf are both confirmed by scan.'], ['phone-count', 'C · Exceptions fix the data', 'A count mismatch corrects inventory and the pending ARS transfer.']] },
    console: { laptop: 1, img: 'concept-console', alt: 'Replenishment console concept in Nykaa Admin style', notes: [['Same Admin shell as ARS Master', 'Rail, tabs, teal actions and grey inputs, with a new "Replenish" item.'], ['Exceptions, not spreadsheets', 'Only stores and SKUs at risk, ranked by revenue at stake.'], ['Explainable AI', 'Every suggested quantity says why: forecast, an offer, footfall.'], ['Trade-off', 'Auto-approve speeds things up but hides decisions, so the guardrails are visible and every approval is logged.', 1]] },
    tablet: { img: 'concept-tablet', alt: 'Store manager tablet concept in Nykaa POS style', notes: [['Built into POS, not a new app', 'Overview becomes the first rail item. The Sales and Return flows stay unchanged.'], ['Numbers that need action', 'Every KPI links to the list behind it.'], ['One-tap delegation', 'Each item becomes an associate task with its context attached.'], ['Trade-off', 'A ranked list hides lower items, so "See all" stays one tap away.', 1]] },
  };
  const renderConcept = (k) => {
    const c = concepts[k], el = $('#concept');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    el.innerHTML = c.phones
      ? `<div class="phones">${c.phones.map(([f, t, d]) => `<figure><div class="phone"><div class="phone-screen"><img class="zoomable" loading="lazy" src="assets/img/${f.replace('phone-', 'screen-')}.webp" width="360" height="780" alt="${t}"></div></div><figcaption><b>${t}</b><span>${d}</span></figcaption></figure>`).join('')}</div>`
      : `<div class="wide">${c.laptop ? `<div class="laptop"><div class="laptop-screen"><span class="cam"></span><img class="zoomable" loading="lazy" src="assets/img/${c.img}.webp" alt="${c.alt}"></div><div class="laptop-base"><span></span></div></div>` : `<img class="zoomable bare" loading="lazy" src="assets/img/${c.img}.webp" alt="${c.alt}">`}<ul>${c.notes.map(([t, d, tr]) => `<li class="${tr ? 'trade' : ''}"><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>`;
  };
  segment('#conceptSeg', 'c', renderConcept); renderConcept('floor');

  /* ---------- automation pipeline ---------- */
  const flows = [
    ['Offer go-live readiness', 'Offer scheduled in Magento / NRM, 24 hours out', 'Checks eligible SKU stock per store against forecast uplift, then creates replenishment + shelf tasks', 'Store manager approves transfers above the guardrail', 'Shelves stocked before the first customer asks'],
    ['Low-stock auto replenishment', 'On-hand drops below the ARS minimum', 'Sizes the order and picks the source using store prioritization; auto-approves within limits', 'Planner reviews only out-of-guardrail transfers', 'Fewer stock-outs; planners manage exceptions'],
    ['Exchange without stock', 'Customer wants a swap, but the store has 0 units', 'Finds the variant in nearby stores or a warehouse; offers ship-to-home or hold-for-pickup', 'Associate confirms the option with the customer', 'Sale kept instead of refunded'],
    ['Offer mismatch watchdog', 'BM brief or sheet differs from the live cart rule', 'AI diffs intent against the live rule and flags store and SKU impact', 'BM fixes in one tap or dismisses', 'No surprise disputes at the counter'],
    ['Master-file guardrail', 'New ARS master or prioritization file uploaded', 'Validates rows and diffs against the last version, e.g. "3 stores lose priority"', 'Planner confirms the diff', 'Bad rules stopped before they move stock; full audit log'],
  ];
  const al = $('#autoList'), nodes = $$('#autoPipe .node');
  al.innerHTML = flows.map((f, i) => `<button data-i="${i}"><i>0${i + 1}</i>${f[0]}</button>`).join('');
  let timers = [];
  const selectFlow = (i, animate) => {
    $$('button', al).forEach((b, j) => b.classList.toggle('on', j === i));
    const f = flows[i];
    nodes.forEach((n, j) => { $('p', n).textContent = f[j + 1]; n.classList.toggle('lit', !animate); });
    timers.forEach(clearTimeout); timers = [];
    if (animate) nodes.forEach((n, j) => timers.push(setTimeout(() => n.classList.add('lit'), 250 + j * 550)));
  };
  al.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) selectFlow(+b.dataset.i, true); });
  $('#play').addEventListener('click', () => selectFlow(+($('button.on', al)?.dataset.i || 0), true));
  selectFlow(0, false);

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('img', lb);
  document.addEventListener('click', (e) => {
    const img = e.target.closest('img.zoomable');
    if (img) { lbImg.src = img.src; lbImg.alt = img.alt; lb.hidden = false; return; }
    if (e.target.closest('#lightbox')) lb.hidden = true;
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.hidden = true; });
})();
