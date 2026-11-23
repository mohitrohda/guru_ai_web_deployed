// Manual browser test (needs playwright + a running 'wrangler pages dev' with mock AI bindings on :8821; see docs/TEST-REPORT.md).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs');
const axeSrc = fs.readFileSync('/home/claude/work/testenv/node_modules/axe-core/axe.min.js', 'utf8');
const pages = ['/', '/about', '/services/', '/services/ai-websites', '/services/billing-software/', '/services/ai-engineering/generative-ai-applications', '/industries/', '/industries/healthcare', '/case-studies/', '/services/more_services/', '/services/more_services/cloud-operations/cloud-cost-optimization', '/legal/privacy', '/nonexistent-page'];
const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
(async () => { try {
  const b = await chromium.launch(); const blockExt = async c => c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const overflow = [], axeRes = {};
  for (const w of [375]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, bypassCSP: true });
    await blockExt(ctx); const p = await ctx.newPage();
    for (const u of pages) {
      await p.goto('http://localhost:8821' + u, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(250);
      const o = await p.evaluate(() => {
        const d = document.documentElement; const bad = [];
        if (d.scrollWidth > d.clientWidth + 1) {
          for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.right > d.clientWidth + 1 && r.width > 0 && getComputedStyle(e).position !== 'fixed') { bad.push(e.tagName + '.' + (e.className || '').toString().slice(0, 30)); if (bad.length > 2) break; } }
        }
        return { sw: d.scrollWidth, cw: d.clientWidth, bad };
      });
      if (o.sw > o.cw + 1) overflow.push(`${w}px ${u}: scrollW ${o.sw} > ${o.cw} ${o.bad.join(',')}`);
    }
    await ctx.close();
  }
  console.log('OVERFLOW FINDINGS:', overflow.length); overflow.slice(0, 25).forEach(x => console.log('  ', x));
  // axe at 390 + 1280, chat opened
  for (const [w, label] of [[390, 'mobile'], [1280, 'desktop']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, bypassCSP: true }); await blockExt(ctx); const p = await ctx.newPage();
    for (const u of pages) {
      await p.goto('http://localhost:8821' + u, { waitUntil: 'domcontentloaded' });
      await p.waitForSelector('.gc-launcher', { timeout: 8000 }).catch(() => {});
      await p.addScriptTag({ content: axeSrc });
      const r = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map(v => ({ id: v.id, n: v.nodes.length, sample: v.nodes[0].target.join(' ').slice(0, 70) })));
      for (const v of r) { const k = `${label} ${v.id}`; (axeRes[k] = axeRes[k] || []).push(`${u} (${v.n}) ${v.sample}`); }
    }
    // chat open
    await p.goto('http://localhost:8821/', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.gc-launcher'); await p.click('.gc-launcher'); await p.waitForSelector('.gc-msg--bot');
    await p.addScriptTag({ content: axeSrc });
    const rc = await p.evaluate(async () => (await axe.run(document.querySelector('.gc-window'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map(v => ({ id: v.id, n: v.nodes.length, sample: v.nodes[0].target.join(' ').slice(0, 70), html: v.nodes[0].html.slice(0, 100) })));
    console.log(label, 'CHAT WINDOW axe violations:', JSON.stringify(rc));
    await ctx.close();
  }
  console.log('AXE (page-level, grouped):'); for (const [k, v] of Object.entries(axeRes)) console.log(' ', k, v.length, 'pages e.g.', v[0]);
  await b.close();
} catch(e){ console.log("ERR", String(e.message||e).slice(0,400)); } })();
