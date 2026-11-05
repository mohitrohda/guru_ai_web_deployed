(() => {
  'use strict';
  document.querySelectorAll('[data-ax-cases]').forEach(group => {
    const list=group.querySelector('[data-ax-tablist]');
    const tabs=[...list.querySelectorAll('button')];
    const panels=[...group.querySelectorAll('[data-ax-panel]')];
    list.hidden=false; list.setAttribute('role','tablist');
    const select=index => {
      tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;panels[i].classList.toggle('ax-case-arrive',i===index);});
    };
    tabs.forEach((tab,i)=>{
      tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panels[i].id);
      panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',tab.id);
      tab.addEventListener('click',()=>select(i));
      tab.addEventListener('keydown',event=>{
        let next=i;
        if(event.key==='ArrowRight')next=(i+1)%tabs.length;
        else if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
        else if(event.key==='Home')next=0;
        else if(event.key==='End')next=tabs.length-1;
        else return;
        event.preventDefault();select(next);tabs[next].focus();
      });
    });select(0);
  });
  const controls=document.querySelector('[data-ax-directory-controls]');
  if(controls){
    controls.hidden=false;
    const search=controls.querySelector('input');
    const buttons=[...controls.querySelectorAll('[data-ax-filter]')];
    const cards=[...document.querySelectorAll('[data-ax-service]')];
    const status=document.querySelector('[data-ax-directory-status]');
    const empty=document.querySelector('[data-ax-no-results]');
    let category='all';
    const filter=()=>{
      const query=search.value.trim().toLocaleLowerCase();let count=0;
      cards.forEach(card=>{const show=(category==='all'||card.dataset.category===category)&&card.textContent.toLocaleLowerCase().includes(query);card.hidden=!show;if(show)count++;});
      document.querySelectorAll('[data-ax-directory-group]').forEach(group=>{group.hidden=![...group.querySelectorAll('[data-ax-service]')].some(card=>!card.hidden);});
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axFilter===category)));
      status.textContent=`${count} of ${cards.length} services shown`;
      empty.hidden=count>0;
    };
    buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.axFilter;filter();}));
    search.addEventListener('input',filter);filter();
  }
  const jump=document.querySelector('.ax-jump');
  if(jump){
    const links=[...jump.querySelectorAll('a[href^="#"]')];
    const sections=links.map(link=>document.getElementById(link.hash.slice(1)));
    let queued=false;
    const update=()=>{
      queued=false;
      const navHeight=document.querySelector('header.nav')?.getBoundingClientRect().height||72;
      const threshold=navHeight+jump.offsetHeight+60;
      let current=0;
      sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<=threshold)current=i;});
      links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
      const total=document.documentElement.scrollHeight-innerHeight;
      jump.style.setProperty('--ax-progress',`${Math.min(100,Math.max(0,total>0?scrollY/total*100:0))}%`);
    };
    const queue=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
    addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);update();
  }
})();
