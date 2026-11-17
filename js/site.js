(()=>{'use strict';
const en=document.documentElement.lang==='en';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],core=globalThis.USASite;
// One active disclosure across header, footer and USA; pointer placement is shared in header.js.
const menus=$$('details[data-menu]');menus.forEach(m=>{const s=$('summary',m);s.setAttribute('aria-expanded',String(m.open));m.addEventListener('toggle',()=>s.setAttribute('aria-expanded',String(m.open)))});
document.addEventListener('keydown',e=>core.menuKey(e,menus));document.addEventListener('click',e=>{if(e.target.closest('details[data-menu] a[href]'))core.closeMenus(menus);else core.outsideMenus(e.target,menus)});
// Corpus search: no AI query is implied and no external requests are sent.
const dialog=$('.search-dialog'),input=$('#search-input'),results=$('.search-results'),count=$('.search-count');let opener=null,docs=[];
try{docs=JSON.parse($('#search-data').textContent)}catch(e){console.error('Local search data unavailable',e)}
const normalize=s=>s.toLocaleLowerCase(en?'en':'ru').normalize('NFKC').replaceAll('ё','е');
function renderSearch(){const terms=normalize(input.value.trim()).split(/\s+/).filter(Boolean);const found=docs.filter(d=>terms.every(t=>normalize([d.title,d.description,d.topics.join(' '),d.text].join(' ')).includes(t)));results.replaceChildren();count.textContent=terms.length?(en?'Found: ':'Найдено: ')+found.length:(en?'Documents in the local corpus: ':'Документов в локальном корпусе: ')+found.length;
for(const d of found){const a=document.createElement('a');a.className='search-result';a.href=new URL(d.url.replace(/^\/+/,''),new URL('.',document.querySelector('#site-root').href)).href;const visual=document.createElement('div');visual.className='publication-image';visual.setAttribute('aria-hidden','true');if(d.image){const img=document.createElement('img');img.src=new URL(d.image.replace(/^\/+/,''),new URL('.',document.querySelector('#site-root').href)).href;img.alt=d.image_alt||d.title;visual.append(img)}else{visual.classList.add('image-placeholder')}const content=document.createElement('div');if(d.demo){const tag=document.createElement('small');tag.textContent=en?'TEST DOCUMENT':'ТЕСТОВЫЙ ДОКУМЕНТ';content.append(tag)}const h=document.createElement('h3');h.textContent=d.title+' ↗';const p=document.createElement('p');p.textContent=d.description||d.topics.join(' · ');content.append(h,p);a.append(visual,content);results.append(a)}if(!found.length){const p=document.createElement('p');p.textContent=en?'No results. Try “physics” or “rotation”.':'Ничего не найдено. Попробуйте «SPARC», «физика» или «Архитектор».';results.append(p)}}
function openSearch(q='',origin=null){opener=origin;input.value=q;core.closeMenus(menus);dialog.showModal();renderSearch();input.focus()}
$$('[data-inline-search]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();openSearch($('input',form).value,$('input',form))}));
$('[data-search-close]')?.addEventListener('click',()=>dialog.close());input?.addEventListener('input',renderSearch);dialog?.addEventListener('close',()=>opener?.focus());
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('dialog[open]')&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)&&!e.target.isContentEditable){e.preventDefault();openSearch('',e.target)}});
// Graph is attached to document metadata, never a third permanent column.
let graphOpener=null;$$('[data-open-graph]').forEach(b=>b.addEventListener('click',()=>{const d=document.getElementById(b.dataset.openGraph);if(d){graphOpener=b;d.showModal()}}));$$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));$$('.graph-dialog').forEach(d=>d.addEventListener('close',()=>graphOpener?.focus()));
function openHashGraph(){if(location.hash==='#document-graph'){const b=$('#document-graph [data-open-graph]');const d=b&&document.getElementById(b.dataset.openGraph);if(d&&!d.open){graphOpener=b;d.showModal()}}}addEventListener('hashchange',openHashGraph);openHashGraph();
// Follow the reading line and scroll only the list when its active link approaches an edge.
function initArticleToc() {
  const toc = $('.owner-toc');
  const list = $('#TableOfContents');
  const article = $('#article-text');
  if (!toc || !list || !article) return;

  const mobile = matchMedia('(max-width:680px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('.owner-header');
  const links = new Map();
  for (const link of $$('a[href^="#"]', list)) {
    try {
      const id = decodeURIComponent(link.hash.slice(1));
      if (!links.has(id)) links.set(id, link);
    } catch {
      // A malformed fragment should not prevent the other links from working.
    }
    link.addEventListener('click', () => {
      if (mobile.matches) toc.open = false;
    });
  }

  const sections = $$('h2[id],h3[id],h4[id]', article)
    .filter(heading => links.has(heading.id));
  if (!sections.length) return;
  toc.open = !mobile.matches;

  let active = null;
  let frame = 0;
  let checkVisibility = false;

  function reveal(link) {
    if (!toc.open || list.scrollHeight <= list.clientHeight) return;
    const bounds = list.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    const top = bounds.top + list.clientTop + 8;
    const bottom = bounds.top + list.clientTop + list.clientHeight - 8;
    let delta = 0;
    if (item.top < top || item.height > bottom - top) delta = item.top - top;
    else if (item.bottom > bottom) delta = item.bottom - bottom;
    const target = Math.max(0, Math.min(list.scrollHeight - list.clientHeight, list.scrollTop + delta));
    if (Math.abs(target - list.scrollTop) < 1) return;
    if (reducedMotion.matches) list.scrollTop = target;
    else list.scrollTo({ top: target, behavior: 'smooth' });
  }

  function update() {
    frame = 0;
    const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
    const readingLine = headerBottom + 37;
    const atDocumentEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const boundary = atDocumentEnd ? window.innerHeight : readingLine;
    let current = sections[0];
    for (const heading of sections) {
      if (heading.getBoundingClientRect().top > boundary) break;
      current = heading;
    }
    const next = links.get(current.id);
    const changed = next !== active;
    if (changed) {
      active?.classList.remove('active');
      active?.removeAttribute('aria-current');
      next.classList.add('active');
      next.setAttribute('aria-current', 'location');
      active = next;
    }
    if (changed || checkVisibility) reveal(next);
    checkVisibility = false;
  }

  function schedule(forceVisibility = false) {
    checkVisibility ||= forceVisibility;
    if (!frame) frame = requestAnimationFrame(update);
  }

  mobile.addEventListener('change', () => {
    toc.open = !mobile.matches;
    schedule(true);
  });
  toc.addEventListener('toggle', () => schedule(true));
  addEventListener('scroll', () => schedule(), { passive: true });
  for (const event of ['resize', 'hashchange', 'pageshow', 'load']) {
    addEventListener(event, () => schedule(true));
  }
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(() => schedule(true));
    if (header) observer.observe(header);
    observer.observe(article);
  }
  document.fonts?.ready.then(() => schedule(true));
  schedule(true);
}
initArticleToc();
// Card pagination works on the same Hugo-generated collection, including file://.
const collection=$('[data-collection]'),pager=$('[data-pagination]');if(collection&&pager){const cards=$$('[data-publication-card]',collection),size=$('[data-page-size]',pager),numbers=$('[data-page-numbers]',pager),prev=$('[data-page-prev]',pager),next=$('[data-page-next]',pager),status=$('[data-page-state]',pager);const params=new URLSearchParams(location.search);let state=core.pageState(cards.length,params.get('perPage')||12,params.get('page')||1);size.value=String(state.size);
function renderPage(save=false){state=core.pageState(cards.length,size.value,state.page);cards.forEach((c,i)=>c.hidden=i<state.start||i>=state.end);prev.disabled=state.page===1;next.disabled=state.page===state.pages;status.textContent=en?`Page ${state.page} of ${state.pages} · ${state.total} documents`:'Страница '+state.page+' из '+state.pages+' · '+state.total+' документов';numbers.replaceChildren();const visible=[...new Set([1,state.pages,...Array.from({length:5},(_,i)=>state.page-2+i).filter(n=>n>0&&n<=state.pages)])].sort((a,b)=>a-b);let last=0;for(const p of visible){if(last&&p-last>1){const dots=document.createElement('span');dots.textContent='…';numbers.append(dots)}const b=document.createElement('button');b.type='button';b.textContent=p;b.setAttribute('aria-label',(en?'Page ':'Страница ')+p);if(p===state.page)b.setAttribute('aria-current','page');b.addEventListener('click',()=>{state.page=p;renderPage(true);$('[aria-current=page]',numbers)?.focus()});numbers.append(b);last=p;}if(save){const url=new URL(location.href);url.searchParams.set('page',state.page);url.searchParams.set('perPage',state.size);try{history.replaceState(null,'',url)}catch{}}}
size.addEventListener('change',()=>{state.page=1;renderPage(true)});prev.addEventListener('click',()=>{state.page--;renderPage(true)});next.addEventListener('click',()=>{state.page++;renderPage(true)});addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);state=core.pageState(cards.length,p.get('perPage')||12,p.get('page')||1);size.value=String(state.size);renderPage()});renderPage();}
const top=$('.to-top');function updateTop(){top?.classList.toggle('visible',scrollY>700)}addEventListener('scroll',updateTop,{passive:true});updateTop();top?.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
})();
