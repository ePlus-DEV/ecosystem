const $ = (selector) => document.querySelector(selector);

const state = {
  sites: [], group: 'all', query: '', showAll: false,
  favorites: new Set()
};
const GROUPS = [
  { id:'all', label:'Tất cả', icon:'grid' },
  { id:'media', label:'Đa phương tiện', icon:'play' },
  { id:'tools', label:'Công cụ', icon:'layers' },
  { id:'traffic', label:'Giao thông', icon:'camera' },
  { id:'finance', label:'Tài chính', icon:'wallet' },
  { id:'utility', label:'Tiện ích', icon:'calendar' },
  { id:'content', label:'Nội dung', icon:'book' }
];
const ICONS = new Set(['cloud','radio','camera','wallet','calendar','book','github','spark','grid','layers','play','star','arrow','external']);
const FEATURED_IDS = ['onair','free-tier','camera','bank','calendar'];
const GROUP_FALLBACK = {
  media:'media', developer:'tools', learning:'tools',
  utilities:'utility', finance:'finance', content:'content'
};
const iconSvg = (name, className='svg-icon') => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class',className);
  svg.setAttribute('aria-hidden','true');
  const use = document.createElementNS('http://www.w3.org/2000/svg','use');
  use.setAttribute('href',`#i-${ICONS.has(name) ? name : 'grid'}`);
  svg.append(use);
  return svg;
};
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
const groupFor = site => site.ecosystemGroup || GROUP_FALLBACK[site.category] || 'tools';
const groupName = site => GROUPS.find(group => group.id === groupFor(site))?.label || 'Ứng dụng';

function approvedArtworkUrl(site) {
  for (const candidate of [site.logoUrl, site.faviconUrl]) {
    if (typeof candidate !== 'string') continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:' && !url.username && !url.password &&
          (url.hostname === 'eplus.dev' || url.hostname.endsWith('.eplus.dev'))) return url.href;
    } catch {}
  }
  return null;
}
function googleFaviconUrl(site) {
  return 'https://www.google.com/s2/favicons?domain=' +
    encodeURIComponent(new URL(site.url).hostname) + '&sz=128';
}
function siteArtwork(site) {
  const box = el('div','card-icon');
  const fallback = iconSvg(site.icon === 'sparkles' ? 'spark' : site.icon);
  fallback.hidden = true;
  const img = el('img','site-favicon');
  img.alt = '';
  img.width = 36;
  img.height = 36;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer';
  const preferred = approvedArtworkUrl(site);
  const cached = googleFaviconUrl(site);
  let usingGoogle = !preferred;
  img.addEventListener('error',() => {
    if (!usingGoogle) { usingGoogle = true; img.src = cached; }
    else { img.remove(); fallback.hidden = false; }
  });
  img.src = preferred || cached;
  box.append(img,fallback);
  return box;
}

function saveFavorites(){
  try { localStorage.setItem('eplus-ecosystem-favorites',JSON.stringify([...state.favorites])); } catch {}
}
function loadFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem('eplus-ecosystem-favorites') || '[]');
    if(Array.isArray(value)) state.favorites = new Set(value.filter(item=>typeof item==='string'));
  } catch {}
}
function renderFilters() {
  const list = $('#category-list');
  list.replaceChildren();
  for(const group of GROUPS) {
    const count = group.id === 'all' ? state.sites.length : state.sites.filter(site => groupFor(site) === group.id).length;
    if(!count) continue;
    const button = el('button',`category-button${state.group===group.id ? ' active' : ''}`);
    button.type = 'button';
    button.setAttribute('aria-pressed',String(state.group === group.id));
    button.append(iconSvg(group.icon),document.createTextNode(group.label));
    button.append(el('span','count',`(${count})`));
    button.addEventListener('click',() => {
      state.group = group.id;
      state.showAll = group.id !== 'all';
      renderFilters();
      renderSites();
    });
    list.append(button);
  }
}
function filteredSites() {
  const needle = state.query.trim().toLocaleLowerCase('vi');
  return state.sites.filter(site => {
    const groupMatch = state.group === 'all' || groupFor(site) === state.group;
    const q = [
      site.name, site.nameVi, site.description, site.descriptionVi, site.url,
      ...(Array.isArray(site.tags) ? site.tags : [])
    ].filter(Boolean).join(' ').toLocaleLowerCase('vi');
    return groupMatch && (!needle || q.includes(needle));
  });
}
function createCard(site) {
  const card = el('article','app-card');
  card.dataset.icon = ICONS.has(site.icon) ? site.icon : 'grid';
  const main = el('div','card-main');
  const glyph = siteArtwork(site);
  const copy = el('div','card-copy');
  const h3 = el('h3');
  const link = el('a','card-name',site.nameVi || site.name);
  link.href = site.url; link.target='_blank'; link.rel='noopener noreferrer';
  link.setAttribute('aria-label',`${site.nameVi || site.name} - mở website trong tab mới`);
  h3.append(link);
  const desc = el('p',null,site.descriptionVi || site.description);
  copy.append(h3,desc); main.append(glyph,copy);
  const favorite = el('button','favorite-button');
  favorite.type='button';
  favorite.setAttribute('aria-pressed',String(state.favorites.has(site.id)));
  favorite.setAttribute('aria-label',`${state.favorites.has(site.id)?'Bỏ yêu thích':'Yêu thích'} ${site.nameVi || site.name}`);
  favorite.title='Lưu ứng dụng yêu thích';
  favorite.append(iconSvg('star')); // allowlisted symbol, not URL input
  favorite.addEventListener('click',() => {
    if(state.favorites.has(site.id)) state.favorites.delete(site.id);
    else state.favorites.add(site.id);
    saveFavorites();
    favorite.setAttribute('aria-pressed',String(state.favorites.has(site.id)));
    favorite.setAttribute('aria-label',`${state.favorites.has(site.id)?'Bỏ yêu thích':'Yêu thích'} ${site.nameVi || site.name}`);
  });
  const footer = el('div','card-footer');
  const pill = el('span','card-pill',groupName(site));
  pill.dataset.tone = site.category;
  footer.append(pill,iconSvg('external','svg-icon card-outlink'));
  card.append(main,favorite,footer);
  return card;
}
function moreCard() {
  const card = el('article','app-card more-card');
  card.dataset.icon='grid';
  const main=el('div','card-main');
  const glyph=el('div','card-icon');glyph.append(iconSvg('grid'));
  const copy=el('div','card-copy');
  const h3=el('h3');
  const link=el('a','card-name','Khám phá thêm');
  link.href='#projects';
  link.setAttribute('aria-label','Xem toàn bộ ứng dụng ePlus');
  link.addEventListener('click',event=>{event.preventDefault();state.showAll=true;renderSites();});
  h3.append(link);
  copy.append(h3,el('p',null,'Xem tất cả ứng dụng khác trong hệ sinh thái ePlus.'));
  main.append(glyph,copy);
  const footer=el('div','card-footer');
  footer.append(el('span','card-pill','Khác'),iconSvg('arrow','svg-icon card-outlink'));
  card.append(main,footer);
  return card;
}
function renderSites() {
  const grid=$('#site-grid');
  const sites=filteredSites();
  const isDefault=state.group==='all' && !state.query.trim();
  const recommended=isDefault && !state.showAll;
  const data = recommended ?
    FEATURED_IDS.map(id=>sites.find(site=>site.id===id)).filter(Boolean) :
    sites;
  const title=$('#featured-title');
  title.replaceChildren(iconSvg('star','svg-icon heading-star'),document.createTextNode(recommended ? 'Ứng dụng nổi bật' : 'Khám phá ứng dụng'));
  const toggle=$('#show-all');
  toggle.hidden=!isDefault;
  if(isDefault) {
    toggle.replaceChildren(document.createTextNode(state.showAll?'Thu gọn':'Xem tất cả'),iconSvg('arrow'));
  }
  const cards=data.map(createCard);
  if(recommended && sites.length>data.length) cards.push(moreCard());
  grid.replaceChildren(...cards);
  $('#empty-state').hidden=sites.length!==0;
}
function setupTheme() {
  let stored='';
  try {stored=localStorage.getItem('eplus-ecosystem-theme')||'';}catch{}
  let theme=stored==='dark'?'dark':'light';
  const paint=()=>{
    document.documentElement.dataset.theme=theme;
    const use=$('#theme-use');
    use?.setAttribute('href',theme==='dark'?'#i-moon':'#i-sun');
    $('#theme-toggle').setAttribute('aria-label',theme==='dark'?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối');
  };
  paint();
  $('#theme-toggle').addEventListener('click',()=>{
    theme=theme==='light'?'dark':'light';
    try{localStorage.setItem('eplus-ecosystem-theme',theme);}catch{}
    paint();
  });
}
function setupNavigation(){
  $('#header-search').addEventListener('click',()=>$('#search').focus());
  const menu=$('#menu-toggle'), nav=$('#mobile-nav');
  const close=()=>{nav.hidden=true;menu.setAttribute('aria-expanded','false');};
  menu.addEventListener('click',()=>{
    const open=nav.hidden;
    nav.hidden=!open;
    menu.setAttribute('aria-expanded',String(open));
  });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
  document.addEventListener('keydown',event=>{
    const tag=document.activeElement?.tagName;
    if(event.key==='Escape') {close(); if(document.activeElement===$('#search'))$('#search').blur();return;}
    const searchKeys=(event.key.toLowerCase()==='k' && (event.metaKey||event.ctrlKey)) ||
      (event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey);
    if(searchKeys && !['INPUT','TEXTAREA'].includes(tag)){
      event.preventDefault();$('#search').focus();
    }
  });
}
async function init() {
  loadFavorites();
  setupTheme();setupNavigation();
  $('#year').textContent=String(new Date().getFullYear());
  $('#show-all').addEventListener('click',()=>{
    state.showAll=!state.showAll;
    renderSites();
  });
  $('#search').addEventListener('input',event=>{state.query=event.target.value;renderSites();});
  $('#clear-filters').addEventListener('click',()=>{
    state.group='all';state.query='';state.showAll=false;
    $('#search').value='';renderFilters();renderSites();$('#search').focus();
  });
  try{
    const response=await fetch(new URL('./registry/sites.json',import.meta.url),{cache:'no-cache'});
    if(!response.ok)throw Error(`HTTP ${response.status}`);
    const data=await response.json();
    if(!Array.isArray(data.sites))throw Error('Invalid Registry');
    state.sites=data.sites;
    renderFilters();renderSites();
  }catch(error){
    console.error('Unable to load ePlus Ecosystem Registry',error);
    $('#site-grid').replaceChildren(el('p','loading-state','Không thể tải danh sách ứng dụng. Vui lòng thử lại sau.'));
  }
}
init();
