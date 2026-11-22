(()=>{'use strict';
const button=document.querySelector('[data-feed-more]'),feed=document.querySelector('[data-xp-feed]');
if(!button||!feed)return;
const cards=[...feed.children];let visible=0;
function reveal(){
 const minimum=Math.min(cards.length,visible+12);let columns=0,end=cards.length;
 for(let i=0;i<cards.length;i++){
  const span=Math.max(1,Math.min(4,Number(cards[i].dataset?.span)||1));
  if(columns+span>4)columns=0;
  columns=(columns+span)%4;
  if(i+1>=minimum&&columns===0){end=i+1;break;}
 }
 visible=end;cards.forEach((card,i)=>card.hidden=i>=visible);button.hidden=visible>=cards.length;
}
button.addEventListener('click',reveal);reveal();
})();