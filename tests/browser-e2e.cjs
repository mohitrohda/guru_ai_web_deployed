// Manual browser test (needs playwright + a running 'wrangler pages dev' with mock AI bindings on :8821; see docs/TEST-REPORT.md).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const U='http://localhost:8821/'; const res=[]; const ok=(n,c,x='')=>{res.push([c?'PASS':'FAIL',n,x]);};
const say=async(p,t)=>{await p.fill('#gc-input',t);await p.press('#gc-input','Enter');await p.waitForTimeout(350)};
const lastBot=p=>p.$$eval('.gc-msg--bot',a=>a.at(-1)?.innerText||'');
const open=async(b,opts={})=>{const c=await b.newContext({viewport:{width:390,height:800},extraHTTPHeaders:{'CF-Connecting-IP':'10.9.'+Math.floor(Math.random()*250)+'.'+Math.floor(Math.random()*250)},...opts});await c.route(/^https?:\/\/(?!localhost)/,r=>r.abort());const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(U,{waitUntil:'domcontentloaded'});await p.waitForSelector('.gc-launcher');await p.click('.gc-launcher');await p.waitForSelector('.gc-msg--bot');return p;};
(async()=>{const b=await chromium.launch();
// 1 EN full flow + submit + duplicate
let p=await open(b);
await say(p,'I want a website for my clinic');
await p.waitForSelector("text=What's your name?");
for(const t of ['Dr Meera Joshi','skip','meera.e2e@clinic.example','skip','Online booking for patients']) await say(p,t);
for(let i=0;i<2;i++){await p.click('.gc-chip:has-text("Skip")').catch(()=>{});await p.waitForTimeout(250)}
ok('EN summary shown',/Dr Meera Joshi/.test(await p.$$eval('.gc-msg--summary',a=>a.at(-1)?.innerText||'')));
// edit: change name via text
const chips=await p.$$eval('.gc-chip',a=>a.map(x=>x.innerText)); ok('summary has edit/consent chips',chips.length>=2,chips.join('|'));
await p.click('.gc-chip--primary'); await p.waitForTimeout(1500);
const done=await lastBot(p); ok('EN submit confirmed only after API ok',/reference|ref|received|submitted/i.test(done),done.slice(0,100));
// duplicate in new session same data
let p2=await open(b);
await say(p2,'I want a website for my clinic'); await p2.waitForSelector("text=What's your name?");
for(const t of ['Dr Meera Joshi','skip','meera.e2e@clinic.example','skip','Online booking for patients']) await say(p2,t);
for(let i=0;i<2;i++){await p2.click('.gc-chip:has-text("Skip")').catch(()=>{});await p2.waitForTimeout(250)}
await p2.click('.gc-chip--primary'); await p2.waitForTimeout(1500);
ok('duplicate submit handled',/already|reference|received/i.test(await lastBot(p2)),(await lastBot(p2)).slice(0,100));
// 2 Hinglish
let h=await open(b); await say(h,'Mujhe apne business ke liye website banwani hai');
await h.waitForTimeout(800); const hb=await lastBot(h); ok('Hinglish lead intent starts flow',/naam|name/i.test(hb),hb.slice(0,90));
// 3 Marathi
let m=await open(b); await say(m,'mala majhya dukanasathi website pahije'); await m.waitForTimeout(800); const mb=await lastBot(m); ok('Roman Marathi reply non-empty',mb.length>10,mb.slice(0,90));
// 4 cancel/back
let c=await open(b); await say(c,'I want a website'); await c.waitForSelector("text=What's your name?"); await say(c,'Ravi'); await say(c,'cancel'); const cb=await lastBot(c); ok('cancel exits flow',/cancel|no problem|stopped|anytime/i.test(cb),cb.slice(0,90));
// 5 AI down fallback
const ctx=await b.newContext({viewport:{width:390,height:800},extraHTTPHeaders:{'CF-Connecting-IP':'10.8.1.1'}});await ctx.route(/^https?:\/\/(?!localhost)/,r=>r.abort());await ctx.route('**/api/chat',r=>r.fulfill({status:500,body:'x'}));
let f=await ctx.newPage();await f.goto(U,{waitUntil:'domcontentloaded'});await f.waitForSelector('.gc-launcher');await f.click('.gc-launcher');await f.waitForSelector('.gc-msg--bot');
await say(f,'What services do you offer?'); await f.waitForTimeout(1200); const fb=await lastBot(f); ok('AI 500 → rule-based fallback answer',fb.length>20&&!/error|undefined/i.test(fb),fb.slice(0,100));
// 6 keyboard
const k=await open(b,{viewport:{width:1280,height:800}}); await k.keyboard.press('Escape'); await k.waitForTimeout(300);
ok('Escape closes chat',!(await k.isVisible('.gc-window')).valueOf());
await k.focus('.gc-launcher'); await k.keyboard.press('Enter'); await k.waitForTimeout(400);
ok('Enter on launcher opens chat + focuses input',await k.evaluate(()=>document.activeElement?.id==='gc-input'),await k.evaluate(()=>document.activeElement?.tagName+'#'+document.activeElement?.id));
// 7 xss
await say(k,'<img src=x onerror=window.__x=1> <script>window.__x=2</script>'); await k.waitForTimeout(800);
ok('XSS payload not executed',!(await k.evaluate(()=>window.__x)));
// 8 pages errors
ok('no page errors',[p,p2,h,m,c,k].every(x=>x.errs.length===0),[p,p2,h,m,c,k].flatMap(x=>x.errs).join(';'));
res.forEach(r=>console.log(r.join(' | ')));
await b.close();})().catch(e=>{console.log('ERR',e.message.slice(0,300));res.forEach(r=>console.log(r.join(' | ')))});
