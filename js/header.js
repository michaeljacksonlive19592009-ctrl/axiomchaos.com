(()=>{'use strict';
const header=document.querySelector('.owner-header'),core=globalThis.USASite;
if(!header||!core)return;
let previous=0;
function alignIndicators(){
 for(const row of document.querySelectorAll('.usa-header-shell,.usa-footer-navigation-row')){
  const language=row.querySelector('.usa-languages [aria-current="true"]'),sections=[...row.querySelectorAll('.usa-section')];
  if(!language||!sections.length)continue;
  const lang=language.getBoundingClientRect(),first=sections[0].getBoundingClientRect();
  const sharedRow=Math.abs(lang.top-first.top)<=Math.max(lang.height,first.height);
  if(!sharedRow){for(const item of [language,...sections])item.style.removeProperty('--usa-indicator-top');continue;}
  const gap=parseFloat(getComputedStyle(sections[0]).fontSize)*.6;
  const top=Math.min(lang.top,first.top)-gap;
  for(const item of [language,...sections])item.style.setProperty('--usa-indicator-top',(top-item.getBoundingClientRect().top)+'px');
 }
}
function update(){const height=Math.ceil(header.getBoundingClientRect().height);if(height!==previous){document.documentElement.style.setProperty('--site-header-height',height+'px');previous=height;}alignIndicators();}
update();if(typeof ResizeObserver!=='undefined')new ResizeObserver(update).observe(header);
if(document.fonts)document.fonts.ready.then(()=>{update();positionOpen();});
const menus=[...document.querySelectorAll('details[data-menu]')];
let frame=0;
function position(menu){
 if(!menu.open)return;
 const panel=menu.querySelector('.usa-dropdown'),summary=menu.querySelector('summary');if(!panel||!summary)return;
 const anchor=(menu.closest('.usa-section')||summary).getBoundingClientRect();
 const vw=Math.min(document.documentElement.clientWidth,window.visualViewport?.width||Infinity);
 const vh=Math.min(innerHeight,window.visualViewport?.height||Infinity);
 if(anchor.bottom<0||anchor.top>vh){menu.open=false;return;}
 panel.style.removeProperty('--usa-popup-width');
 const width=panel.getBoundingClientRect().width;
 const height=panel.scrollHeight+2;
 const footer=Boolean(menu.closest('.usa-footer'));
 const right=['scientists','architect'].includes(menu.dataset.section);
 const p=core.menuPlacement(anchor,width,height,vw,vh,footer,right);
 for(const [key,value] of Object.entries({left:p.left,top:p.top,width:p.width,'max-height':p.maxHeight}))panel.style.setProperty('--usa-popup-'+key,value+'px');
}
function positionOpen(){for(const menu of menus)if(menu.open)position(menu);}
function requestPosition(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;positionOpen();});}
function open(menu){core.openMenu(menu,menus);position(menu);}
for(const menu of menus){
 const summary=menu.querySelector('summary');
 summary?.addEventListener('click',event=>{
  if(event.target.closest('a[href]'))return;
  event.preventDefault();
  if(menu.open)core.closeMenus(menus);else open(menu);
 });
 menu.addEventListener('toggle',()=>{if(menu.open)open(menu);});
}
window.addEventListener('resize',()=>{update();requestPosition();},{passive:true});
window.addEventListener('scroll',requestPosition,{passive:true});
window.visualViewport?.addEventListener('resize',requestPosition,{passive:true});
})();
