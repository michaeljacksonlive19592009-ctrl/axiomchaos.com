/* Shared interaction logic, also exercised in Node without a browser. */
(function(root){'use strict';
function pageState(total,size,page){size=Number(size);if(![12,24,48].includes(size))size=12;total=Math.max(0,Math.floor(Number(total)||0));const pages=Math.max(1,Math.ceil(total/size));page=Math.floor(Number(page)||1);page=Math.min(pages,Math.max(1,page));return {size,page,pages,start:(page-1)*size,end:Math.min(total,page*size),total};}
function menuFocus(target){
 if(!target)return;target.focus({preventScroll:true});
 const panel=target.closest?.('.usa-dropdown');
 if(panel?.getBoundingClientRect&&target.getBoundingClientRect){
  const p=panel.getBoundingClientRect(),r=target.getBoundingClientRect();
  if(r.top<p.top+2)panel.scrollTop-=p.top+2-r.top;
  else if(r.bottom>p.bottom-2)panel.scrollTop+=r.bottom-p.bottom+2;
 }
}
function closeMenus(menus,returnFocus=false){let last=null;for(const menu of menus){if(menu.open)last=menu;menu.open=false;}if(returnFocus&&last)menuFocus(last.querySelector('summary'));}
function openMenu(menu,menus){for(const other of menus)if(other!==menu)other.open=false;menu.open=true;}
function menuKey(event,menus){
 const menu=event.target.closest?.('details[data-menu]');
 if(event.key==='Escape'){
  if(menu?.open){event.preventDefault();closeMenus(menus);menuFocus(menu.querySelector('summary'));return true;}
  if(menus.some(m=>m.open)){event.preventDefault();closeMenus(menus,true);return true;}return false;
 }
 if(!menu)return false;
 const summary=menu.querySelector('summary'),links=[...menu.querySelectorAll('nav a[href]')];
 if((event.target===summary||summary.contains?.(event.target))&&['ArrowDown','ArrowUp'].includes(event.key)){
  event.preventDefault();openMenu(menu,menus);menuFocus(event.key==='ArrowDown'?links[0]:links.at(-1));return true;
 }
 if(menu.open&&links.includes(event.target)){
  let index=links.indexOf(event.target);
  if(event.key==='ArrowDown')index=(index+1)%links.length;
  else if(event.key==='ArrowUp')index=(index-1+links.length)%links.length;
  else if(event.key==='Home')index=0;
  else if(event.key==='End')index=links.length-1;
  else return false;
  event.preventDefault();menuFocus(links[index]);return true;
 }
 return false;
}
function outsideMenus(target,menus){if(!target.closest?.('details[data-menu]'))closeMenus(menus);}
// Viewport-only geometry. No page scrolling, body dimensions or article styles are modified.
function menuPlacement(anchor,width,height,viewWidth,viewHeight,preferUp=false,alignRight=false){
 const margin=Math.min(16,viewWidth/4,viewHeight/4),gap=16;
 width=Math.max(1,Math.min(width,viewWidth-2*margin));
 const down=Math.max(0,viewHeight-margin-anchor.bottom-gap),up=Math.max(0,anchor.top-gap-margin);
 let above=preferUp;
 if((above?up:down)<Math.min(height,120)&&(above?down:up)>(above?up:down))above=!above;
 const maxHeight=Math.max(1,Math.min(viewHeight*.68,above?up:down));
 height=Math.min(height,maxHeight);
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const left=clamp(alignRight?anchor.right-width:anchor.left,margin,viewWidth-margin-width);
 const top=clamp(above?anchor.top-gap-height:anchor.bottom+gap,margin,viewHeight-margin-height);
 const bridgeTop=clamp(above?top+height-1:anchor.bottom-1,0,viewHeight);
 const bridgeBottom=clamp(above?anchor.top+1:top+1,0,viewHeight);
 const bridgeLeft=clamp(Math.min(left,anchor.left),0,viewWidth);
 const bridgeRight=clamp(Math.max(left+width,anchor.right),0,viewWidth);
 return {left,top,width,maxHeight,above,bridge:{left:bridgeLeft,top:bridgeTop,width:bridgeRight-bridgeLeft,height:Math.max(0,bridgeBottom-bridgeTop)}};
}
const api={pageState,menuFocus,closeMenus,openMenu,menuKey,outsideMenus,menuPlacement};
root.USASite=api;if(typeof module==='object')module.exports=api;
})(globalThis);
