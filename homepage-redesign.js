(()=>{'use strict';
const root=document.body, reduced=matchMedia('(prefers-reduced-motion: reduce)'), flow=document.querySelector('#workflow'), steps=[...document.querySelectorAll('[data-nx-step]')], play=document.querySelector('#nx-play');
if(!flow||!play)return;
root.classList.add('nx-motion-on');
let step=0,paused=reduced.matches,visible=false,timer=null;
const captions=['01 / A message starts the journey.','02 / Helpful answers, using your information.','03 / A time is chosen and confirmed.','04 / The right details reach your team.'];
function paint(){steps.forEach((b,i)=>{b.classList.toggle('is-active',i===step);b.setAttribute('aria-pressed',String(i===step));});document.querySelectorAll('[data-flow-visible]').forEach(e=>e.classList.toggle('is-shown',Number(e.dataset.flowVisible)<=step));document.querySelector('#nx-flow-caption').textContent=captions[step];play.textContent=paused?'Play animation ▷':'Pause animation Ⅱ';play.setAttribute('aria-pressed',String(paused));root.classList.toggle('nx-paused',paused);const motion=document.querySelector('#nx-motion-toggle');if(motion){motion.textContent=paused?'Play motion ▷':'Pause motion Ⅱ';motion.setAttribute('aria-pressed',String(paused));}}
function schedule(){clearTimeout(timer);if(!paused&&visible&&!document.hidden)timer=setTimeout(()=>{step=(step+1)%4;paint();schedule();},2900);}
steps.forEach((button,i)=>button.addEventListener('click',()=>{step=i;paused=true;paint();schedule();}));
play.addEventListener('click',()=>{paused=!paused;paint();schedule();});document.querySelector('#nx-motion-toggle')?.addEventListener('click',()=>{paused=!paused;paint();schedule();});
document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;paint();schedule();});
if('IntersectionObserver'in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(flow);const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('nx-entered');observer.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.section__head,.hp-section-top,.hp-project,.nx-engineering').forEach(e=>observer.observe(e));}else{visible=true;schedule();}paint();
})();
