(()=>{'use strict';
 const motion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=500;const controllers=[];
 function mount(el){
  const inner=el.querySelector('.rubric-inner'),button=el.querySelector('[data-rubric-toggle]'),more=el.querySelector('.rubric-more'),label=el.querySelector('[data-rubric-label]');
  if(!inner||!button||!more)return;let open=false,serial=0,animations=[],cleanup=null;
  button.hidden=false;button.setAttribute('aria-expanded','false');more.hidden=true;more.inert=true;
  const nodes=()=>[...el.querySelectorAll('[data-rubric-morph]')];
  function stop(){animations.forEach(a=>a.cancel());animations=[];if(cleanup){clearTimeout(cleanup);cleanup=null}}
  function resetMore(){for(const key of ['position','left','top','width','height'])more.style[key]=''}
  function finish(token){if(token!==serial)return;el.style.height='';resetMore();more.hidden=!open;more.inert=!open;more.setAttribute('aria-hidden',String(!open));cleanup=null}
  function set(next){
   if(next===open)return;const token=++serial;const fromHeight=el.getBoundingClientRect().height;
   const before=new Map(nodes().map(n=>[n,{rect:n.getBoundingClientRect(),font:parseFloat(getComputedStyle(n).fontSize)*(n.offsetHeight?n.getBoundingClientRect().height/n.offsetHeight:1),color:getComputedStyle(n).color}]));
   const oldBackground=getComputedStyle(inner).backgroundColor,oldColor=getComputedStyle(inner).color;
   const moreRect=more.getBoundingClientRect(),innerRect=inner.getBoundingClientRect();
   stop();resetMore();open=next;
   if(!open&&more.contains(document.activeElement))button.focus();
   if(!open&&!more.hidden){more.style.position='absolute';more.style.left=(moreRect.left-innerRect.left)+'px';more.style.top=(moreRect.top-innerRect.top)+'px';more.style.width=moreRect.width+'px';more.style.height=moreRect.height+'px'}
   more.hidden=false;more.inert=!open;more.setAttribute('aria-hidden',String(!open));
   el.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));label.textContent=open?'Свернуть':'Развернуть';
   const targetHeight=inner.getBoundingClientRect().height;el.style.height=targetHeight+'px';
   if(motion()||typeof el.animate!=='function'){finish(token);return}
   const opts={duration,easing:'cubic-bezier(.2,.7,.2,1)'};
   animations.push(el.animate([{height:fromHeight+'px'},{height:targetHeight+'px'}],opts));
   animations.push(inner.animate([{backgroundColor:oldBackground,color:oldColor},{backgroundColor:getComputedStyle(inner).backgroundColor,color:getComputedStyle(inner).color}],opts));
   for(const [n,old] of before){const to=n.getBoundingClientRect(),style=getComputedStyle(n);if(!to.width||!to.height)continue;const ratio=old.font&&parseFloat(style.fontSize)?old.font/parseFloat(style.fontSize):1;
    animations.push(n.animate([{transform:`translate(${old.rect.left-to.left}px,${old.rect.top-to.top}px) scale(${ratio})`,color:old.color},{transform:'none',color:style.color}],opts))}
   animations.push(more.animate(open?[{opacity:0},{opacity:1}]:[{opacity:1},{opacity:0}],{duration:open?350:220,delay:open?100:0,easing:'ease',fill:'both'}));
   cleanup=setTimeout(()=>finish(token),duration+30);
  }
  button.addEventListener('click',()=>set(!open));
  const controller={element:el,set,get expanded(){return open},settle(){++serial;stop();finish(serial)}};controllers.push(controller);return controller;
 }
 document.querySelectorAll('[data-rubric]').forEach(mount);
 // Only inserted/replaced feed nodes animate. Server-rendered content starts visible.
 function reveal(items){if(motion())return;items.forEach((item,i)=>{if(typeof item.animate==='function')item.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:260,delay:Math.min(i,5)*35,easing:'ease-out'})})}
 if(typeof MutationObserver!=='undefined')document.querySelectorAll('[data-home-feed]').forEach(feed=>new MutationObserver(records=>{const items=[];for(const record of records)for(const n of record.addedNodes){if(n.nodeType!==1)continue;if(n.matches?.('[data-feed-item]'))items.push(n);items.push(...n.querySelectorAll?.('[data-feed-item]')||[])}reveal([...new Set(items)])}).observe(feed,{childList:true,subtree:true}));
 if(typeof addEventListener==='function')addEventListener('resize',()=>controllers.forEach(c=>c.settle()),{passive:true});
 document.querySelectorAll('[data-four-dots]').forEach(link=>{link.addEventListener('pointerdown',()=>link.classList.add('is-pressed'));for(const event of ['pointerup','pointercancel','blur'])link.addEventListener(event,()=>link.classList.remove('is-pressed'))});
 globalThis.USARubrics={controllers,reveal};
})();
