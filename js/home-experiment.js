(()=>{'use strict';
 const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const en=document.documentElement?.lang==='en';
 const intros=globalThis.USAEntryBlocks?.controllers||[],photos=[];const duration=360;
 function animator(root){
  let animations=[],sequence=0;
  function stop(){++sequence;animations.forEach(a=>a.cancel());animations=[];root.style.height=''}
  function change(mutate,caption=null,visual=null){
   const height=root.getBoundingClientRect().height;
   const before=caption?.getBoundingClientRect();
   const opacity=visual?getComputedStyle(visual).opacity:null;
   stop();mutate();const target=root.getBoundingClientRect().height;
   if(reduced()||typeof root.animate!=='function')return;
   const token=sequence;const options={duration,easing:'cubic-bezier(.2,.7,.2,1)'};
   root.style.height=target+'px';
   const main=root.animate([{height:height+'px'},{height:target+'px'}],options);animations.push(main);
   if(caption&&before){const after=caption.getBoundingClientRect();animations.push(caption.animate([{transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`},{transform:'none'}],options))}
   if(visual)animations.push(visual.animate([{opacity},{opacity:getComputedStyle(visual).opacity}],options));
   main.finished.then(()=>{if(sequence===token){root.style.height='';animations=[]}}).catch(()=>{});
  }
  return {change,stop};
 }
 function photo(root){
  const button=root.querySelector('[data-photo-toggle]'),caption=root.querySelector('[data-photo-caption]'),visual=root.querySelector('.xp-photo-visual');
  const label=root.querySelector('[data-photo-label]'),icon=root.querySelector('[data-photo-icon]');
  if(!button||!caption||!visual||!label||!icon)return;
  let expanded=root.dataset.photoState!=='collapsed';const animation=animator(root),title=caption.querySelector('h3')?.textContent||(en?'material':'материал');
  function apply(next){expanded=next;root.dataset.photoState=next?'expanded':'collapsed';visual.setAttribute('aria-hidden',String(!next));button.hidden=false;button.setAttribute('aria-expanded',String(next));label.textContent=en?(next?'Collapse':'Expand'):(next?'Свернуть':'Развернуть');if(next){icon.textContent='×'}else{icon.replaceChildren(root.querySelector('[data-photo-chevron]').content.cloneNode(true))};button.setAttribute('aria-label',`${label.textContent} ${en?"photo:":"фотографию:"} ${title}`)}
  function setExpanded(next){next=Boolean(next);if(next===expanded)return;animation.change(()=>apply(next),caption,visual);if(!next&&root.closest('.xp-home-page')){const top=Math.max(0,root.getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height')||0)-16);scrollTo({top,behavior:'instant'});}}
  button.addEventListener('click',()=>setExpanded(!expanded));apply(expanded);
  const controller={element:root,setExpanded,get expanded(){return expanded},settle:animation.stop};photos.push(controller);return controller;
 }
 function fitExcerpt(slot){
  const output=slot.querySelector('[data-excerpt-text]');
  const words=slot.querySelector('[data-excerpt-source]').content.textContent.trim().split(/\s+/u);
  const continued=slot.hasAttribute('data-excerpt-continued');
  function fit(){
   const limit=slot.getBoundingClientRect().height;
   output.style.maxHeight='none';
   function render(count){
    output.textContent=count ? words.slice(0,count).join(' ')+(count<words.length||continued?'…':'') : '';
    return output.getBoundingClientRect().height<=limit+.5;
   }
   if(!limit){
    output.textContent='';
   }else if(!render(words.length)){
    let low=0,high=words.length;
    while(high-low>1){
     const mid=Math.floor((low+high)/2);
     if(render(mid))low=mid;
     else high=mid;
    }
    render(low);
   }
   output.style.maxHeight='';
  }
  return fit;
 }
 const excerpts=new Map(Array.from(document.querySelectorAll('[data-fit-excerpt]'),slot=>[slot,fitExcerpt(slot)]));
 if(excerpts.size){
  excerpts.forEach(fit=>fit());
  if(typeof ResizeObserver==='function'){
   const observer=new ResizeObserver(entries=>entries.forEach(({target})=>excerpts.get(target)()));
   excerpts.forEach((_,slot)=>observer.observe(slot));
  }else{
   addEventListener('resize',()=>excerpts.forEach(fit=>fit()),{passive:true});
  }
  document.fonts?.ready.then(()=>excerpts.forEach(fit=>fit()));
 }
 document.querySelectorAll('[data-xp-photo]').forEach(photo);
 if(typeof addEventListener==='function')addEventListener('resize',()=>photos.forEach(c=>c.settle()),{passive:true});
 globalThis.USAHomeExperiment={intros,photos};
})();
