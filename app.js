const $ = (selector) => document.querySelector(selector);
const state = { sites: [], categories: [], category: 'all', query: '', sort: 'recommended' };
const iconPaths = {
  cloud: '<path d="M20 16.5A4.5 4.5 0 0 0 17.5 8a6 6 0 0 0-11.4 1.9A4 4 0 0 0 6 18h13a3 3 0 0 0 1-5.8"/>',
  radio: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="m5 8 12-5M7 13h.01M11 13h7M11 17h7"/>',
  camera: '<path d="M14 4H9l-2 3H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-3-3Z"/><circle cx="12" cy="13.5" r="3"/>',
  sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM5 17l.7 1.3L7 19l-1.3.7L5 21l-.7-1.3L3 19l1.3-.7L5 17ZM19 15l.7 1.3L21 17l-1.3.7L19 19l-.7-1.3L17 17l1.3-.7L19 15Z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  github: '<path d="M9 19c-4 1.4-4-2.5-6-3m12 6v-3.2a2.8 2.8 0 0 0-.8-2.2c3-.3 6.2-1.5 6.2-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6S17.8 2.4 15 4a13 13 0 0 0-6 0C6.2 2.4 5.1 2.7 5.1 2.7A4.8 4.8 0 0 0 5 6.3a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7A2.8 2.8 0 0 0 9 18.8V22"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  laptop: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M2 21h20"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18-3-3-3-15 0-18Z"/>'
};
const categoryIcons = { all:'grid',developer:'laptop',learning:'compass',media:'music',utilities:'globe',content:'book' };
function icon(name) { return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.globe}</svg>`; }
function createEl(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
function renderCategories() {
  const target = $('#category-list'); target.replaceChildren();
  const filters = [{id:'all',name:'All projects'},...state.categories];
  for (const category of filters) {
    const count = category.id === 'all' ? state.sites.length : state.sites.filter(s => s.category === category.id).length;
    if (!count) continue;
    const button = createEl('button',`category-button${state.category === category.id ? ' active':''}`);
    button.type='button';button.setAttribute('aria-pressed',String(state.category === category.id));
    const label = createEl('span','cat-label');const symbol = createEl('span','cat-icon');symbol.innerHTML = icon(categoryIcons[category.id] || 'grid'); label.append(symbol,document.createTextNode(category.name));
    button.append(label,createEl('span','cat-count',String(count)));
    button.addEventListener('click',()=>{state.category=category.id;renderCategories();renderSites();});target.append(button);
  }
}
function sortedVisibleSites() {
  const q = state.query.toLocaleLowerCase().trim();
  const sites = state.sites.filter(site => (state.category === 'all' || site.category === state.category) && (!q || [site.name,site.description,site.url,...site.tags].join(' ').toLocaleLowerCase().includes(q)));
  sites.sort((a,b)=> state.sort === 'name' ? a.name.localeCompare(b.name) : state.sort === 'category' ? (a.category.localeCompare(b.category)||a.name.localeCompare(b.name)) : (Number(b.featured)-Number(a.featured)||a.name.localeCompare(b.name)));
  return sites;
}
function renderSites() {
  const target = $('#site-grid');target.replaceChildren();const sites=sortedVisibleSites();
  const categoryNames = new Map(state.categories.map(c=>[c.id,c.name]));
  for(const site of sites){
    const card=createEl('article','site-card');const header=createEl('div','site-card-header');const iconBox=createEl('div',`site-card-icon ${site.category}`);iconBox.innerHTML=icon(site.icon);const arrow=createEl('span','card-arrow','↗');arrow.setAttribute('aria-hidden','true');header.append(iconBox,arrow);
    const title=createEl('h3');const link=createEl('a',null,site.name);link.href=site.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`${site.name} (opens in a new tab)`);
    title.append(link);const description=createEl('p','site-card-description',site.description);const footer=createEl('div','site-card-footer');footer.append(createEl('span','card-tag',categoryNames.get(site.category)||site.category),createEl('span','card-host',new URL(site.url).hostname));card.append(header,title,description,footer);target.append(card);
  }
  $('#directory-count').textContent=`${sites.length} of ${state.sites.length} projects`;
  $('#empty-state').hidden=sites.length!==0;
}
function setupTheme(){
  let preferred='';try{preferred=localStorage.getItem('eplus-ecosystem-theme')||'';}catch{}
  const media=window.matchMedia?.('(prefers-color-scheme: light)').matches?'light':'dark';
  let theme=preferred==='light'||preferred==='dark'?preferred:media;
  const paint=()=>{document.documentElement.dataset.theme=theme;$('#theme-icon').textContent=theme==='light'?'☀':'☾';$('#theme-toggle').setAttribute('aria-label',`Switch to ${theme==='light'?'dark':'light'} theme`);};paint();
  $('#theme-toggle').addEventListener('click',()=>{theme=theme==='light'?'dark':'light';try{localStorage.setItem('eplus-ecosystem-theme',theme);}catch{}paint();});
}
async function init(){
  setupTheme();$('#year').textContent=String(new Date().getFullYear());
  $('#search').addEventListener('input',event=>{state.query=event.target.value;renderSites();});
  $('#sort').addEventListener('change',event=>{state.sort=event.target.value;renderSites();});
  $('#clear-filters').addEventListener('click',()=>{state.category='all';state.query='';$('#search').value='';renderCategories();renderSites();$('#search').focus();});
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){event.preventDefault();$('#search').focus();}});
  try{
    const response=await fetch(new URL('./registry/sites.json',import.meta.url),{cache:'no-cache'});if(!response.ok)throw Error(`HTTP ${response.status}`);
    const data=await response.json();if(!Array.isArray(data.sites)||!Array.isArray(data.categories))throw Error('Invalid registry');
    state.sites=data.sites;state.categories=data.categories;$('#total-stat').textContent=String(state.sites.length).padStart(2,'0');$('#category-stat').textContent=String(state.categories.length).padStart(2,'0');renderCategories();renderSites();
  }catch(error){console.error('Failed to load ePlus Ecosystem registry',error);$('#site-grid').replaceChildren(createEl('div','loading-state','The directory is temporarily unavailable. Please try again later.'));$('#directory-count').textContent='Unavailable';}
}
init();
