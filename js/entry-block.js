(()=>{'use strict';
 const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const en=document.documentElement?.lang==='en';
 const intros=[];const duration=360;
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
 function intro(root){
  const core=root.querySelector('[data-entry-core]'),extra=root.querySelector('[data-entry-extra]');
  const learn=root.querySelector('[data-intro-expand]'),top=root.querySelector('[data-intro-minimize]'),bottom=root.querySelector('[data-intro-base]'),status=root.querySelector('[data-intro-status]');
  if(!core||!extra||!learn||!top||!bottom)return;
  let state=Number(root.dataset.introState)||2;const animation=animator(root);
  function apply(next,announce=true){
   state=next;root.dataset.introState=String(next);core.hidden=next===1;core.inert=next===1;extra.hidden=next!==3;extra.inert=next!==3;
   core.setAttribute('aria-hidden',String(next===1));extra.setAttribute('aria-hidden',String(next!==3));
   learn.hidden=false;top.hidden=next===1;bottom.hidden=false;
   learn.setAttribute('aria-expanded',String(next>=2));learn.setAttribute('aria-disabled',String(next===3));
   learn.setAttribute('aria-label',en?['','Learn more: show introduction','Learn more: expand materials','Introduction fully expanded'][next]:next===1?'Узнать о нас больше: показать вводные тексты':next===2?'Узнать о нас больше: раскрыть материалы':'Вводка полностью раскрыта');
   top.setAttribute('aria-expanded',String(next>=2));bottom.setAttribute('aria-expanded',String(next===3));
   if(announce&&status)status.textContent=en?['','Introduction collapsed','Introduction: intermediate state','Introduction fully expanded'][next]:['','Вводка свёрнута','Вводка: базовое состояние','Вводка полностью раскрыта'][next];
  }
  function setState(next){
   if(![1,2,3].includes(next))throw new RangeError('Intro state must be 1, 2 or 3');
   if(next===state)return;
   if(next<3&&(extra.contains(document.activeElement)||document.activeElement===top))learn.focus();
   animation.change(()=>apply(next));
  }
  learn.addEventListener('click',()=>{if(state<3)setState(state+1)});
  top.addEventListener('click',()=>setState(1));bottom.addEventListener('click',()=>setState(2));apply(state,false);
  const controller={element:root,setState,get state(){return state},settle:animation.stop};intros.push(controller);return controller;
 }
 document.querySelectorAll('[data-entry-block]').forEach(intro);
 if(typeof addEventListener==='function')addEventListener('resize',()=>intros.forEach(c=>c.settle()),{passive:true});
 function revealLinkedFragment(){
  if(!location.hash)return;
  let id;
  try{id=decodeURIComponent(location.hash.slice(1))}catch{return}
  const target=document.getElementById(id);
  if(!target?.closest('[data-entry-extra]'))return;
  const controller=intros.find(item=>item.element.contains(target));
  if(!controller)return;
  controller.setState(3);
  controller.settle();
  target.scrollIntoView({block:'start'});
 }
 if(typeof location!=='undefined'){
  revealLinkedFragment();
  addEventListener('hashchange',revealLinkedFragment);
 }
 globalThis.USAEntryBlocks={controllers:intros};
})();
