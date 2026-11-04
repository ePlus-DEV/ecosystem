/* ePlus Ecosystem — framework-agnostic Web Component (classic script, no dependencies). */
(() => {
  'use strict';
  if (!('customElements' in window) || customElements.get('eplus-ecosystem')) return;
  const currentScript = document.currentScript;
  const assetBase = currentScript?.src ? new URL('.', currentScript.src) : new URL('./', document.baseURI);
  const defaultRegistry = new URL('registry/sites.json', assetBase).href;
  const defaultPortal = assetBase.href;
  const requests = new Map();
  const signs = { cloud:'☁', radio:'♫', camera:'◉', sparkles:'✦', book:'▤', github:'⌘', globe:'◎' };
  let instance = 0;

  const sheet = `
    :host{--ee-text:#ecf4f7;--ee-bg:#141b2b;--ee-border:#39445a;--ee-muted:#a5b0c1;--ee-accent:#b1f5cb;display:inline-block;color:var(--ee-text);font:500 13px/1.4 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative;isolation:isolate}
    :host([theme="light"]){--ee-text:#152335;--ee-bg:#fff;--ee-border:#dce4ed;--ee-muted:#617187;--ee-accent:#087b52}
    @media(prefers-color-scheme:light){:host(:not([theme])),:host([theme="auto"]){--ee-text:#152335;--ee-bg:#fff;--ee-border:#dce4ed;--ee-muted:#617187;--ee-accent:#087b52}}
    *,*::before,*::after{box-sizing:border-box}button,a{font:inherit}a{color:inherit;text-decoration:none}button{cursor:pointer}button:focus-visible,a:focus-visible{outline:2px solid var(--ee-accent);outline-offset:3px}
    .trigger{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;color:var(--ee-text);background:var(--ee-bg);border:1px solid var(--ee-border);border-radius:10px;white-space:nowrap;box-shadow:0 6px 22px #00000014}
    .trigger:hover{border-color:var(--ee-accent)}.trigger .grid{font-size:16px;letter-spacing:-2px;line-height:1;color:var(--ee-accent)}.trigger .chevron{font-size:11px;color:var(--ee-muted)}
    .panel{position:absolute;top:calc(100% + 9px);right:0;width:min(340px,calc(100vw - 32px));z-index:2147483000;background:var(--ee-bg);border:1px solid var(--ee-border);border-radius:15px;box-shadow:0 16px 54px #0005;padding:14px;max-height:min(560px,78vh);overflow:auto}.panel[hidden]{display:none}.panel-header{display:flex;gap:11px;justify-content:space-between;align-items:start;padding:5px 4px 13px;border-bottom:1px solid var(--ee-border)}.panel-title{font-weight:800;font-size:14px}.panel-subtitle{display:block;font-size:11px;color:var(--ee-muted);margin-top:3px}.close{border:0;background:none;color:var(--ee-muted);font-size:20px;padding:0 4px}
    .section-label{margin:15px 5px 7px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--ee-muted)}.list{display:grid;gap:3px}.item{display:flex;align-items:center;gap:11px;padding:10px 8px;border-radius:9px;min-width:0}.item:hover{background:color-mix(in srgb,var(--ee-accent) 9%,transparent)}.glyph{width:34px;height:34px;display:grid;place-items:center;flex-shrink:0;border:1px solid var(--ee-border);border-radius:9px;color:var(--ee-accent);font-size:19px}.item-label{min-width:0;display:block}.item-title{display:block;font-size:12px;font-weight:750}.item-domain{display:block;color:var(--ee-muted);font-size:10px;margin-top:2px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.item-arrow{margin-left:auto;color:var(--ee-muted)}.view-all{display:block;padding:13px 8px 2px;text-align:center;border-top:1px solid var(--ee-border);margin-top:11px;font-size:11px;font-weight:800;color:var(--ee-accent)}.loading{padding:24px 8px;text-align:center;color:var(--ee-muted);font-size:12px}
    :host([mode="related"]){display:block}.related{border:1px solid var(--ee-border);border-radius:14px;padding:16px;background:var(--ee-bg)}.related .heading{font-size:12px;font-weight:800;margin:0 0 8px}.related .copy{font-size:11px;color:var(--ee-muted);margin:0 0 10px}.related .item{padding:9px 3px}.related .glyph{width:30px;height:30px}.related .view-all{margin-top:8px}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
  `;

  function getRegistry(url) {
    if (!requests.has(url)) {
      requests.set(url, fetch(url, { credentials:'omit', cache:'no-cache', mode:'cors' })
        .then(response => { if (!response.ok) throw new Error(`Registry HTTP ${response.status}`); return response.json(); })
        .then(data => { if (!Array.isArray(data.sites)) throw new Error('Invalid registry'); return data.sites.filter(site => site && typeof site.url === 'string' && /^https:\/\//.test(site.url)); })
        .catch(error => { requests.delete(url); throw error; }));
    }
    return requests.get(url);
  }

  class EPlusEcosystem extends HTMLElement {
    static get observedAttributes() { return ['mode','site','endpoint','portal']; }
    constructor() { super(); this.attachShadow({mode:'open'}); this._id = `eplus-ecosystem-menu-${++instance}`; this._open=false; this._onOutside=(event)=>{ if(this._open&&!event.composedPath().includes(this)) this.toggle(false); }; this._onEscape=(event)=>{if(event.key==='Escape'&&this._open){this.toggle(false);this.shadowRoot.querySelector('.trigger')?.focus();}}; }
    connectedCallback(){this.render();document.addEventListener('pointerdown',this._onOutside);document.addEventListener('keydown',this._onEscape);}
    disconnectedCallback(){document.removeEventListener('pointerdown',this._onOutside);document.removeEventListener('keydown',this._onEscape);}
    attributeChangedCallback(){if(this.isConnected)this.render();}
    toggle(open){this._open=open;const panel=this.shadowRoot.querySelector('.panel');const button=this.shadowRoot.querySelector('.trigger');if(panel)panel.hidden=!open;if(button)button.setAttribute('aria-expanded',String(open));}
    get url(){const value=this.getAttribute('endpoint');if(!value)return defaultRegistry;try{const url=new URL(value,document.baseURI);return url.protocol==='https:'||url.origin===location.origin?url.href:defaultRegistry;}catch{return defaultRegistry;}}
    get portal(){const value=this.getAttribute('portal');if(!value)return defaultPortal;try{const url=new URL(value,document.baseURI);return url.protocol==='https:'||url.origin===location.origin?url.href:defaultPortal;}catch{return defaultPortal;}}
    makeItem(site){const link=document.createElement('a');link.className='item';link.href=site.url;link.target='_blank';link.rel='noopener noreferrer';const glyph=document.createElement('span');glyph.className='glyph';glyph.setAttribute('aria-hidden','true');glyph.textContent=signs[site.icon]||'✦';const label=document.createElement('span');label.className='item-label';const title=document.createElement('span');title.className='item-title';title.textContent=site.name;const domain=document.createElement('span');domain.className='item-domain';domain.textContent=new URL(site.url).hostname;label.append(title,domain);const arrow=document.createElement('span');arrow.className='item-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';link.append(glyph,label,arrow);link.addEventListener('click',()=>this.toggle(false));return link;}
    makeViewAll(){const link=document.createElement('a');link.className='view-all';link.href=this.portal;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Explore all ePlus projects ↗';return link;}
    render(){this._open=false;const shadow=this.shadowRoot;shadow.replaceChildren();const style=document.createElement('style');style.textContent=sheet;shadow.append(style);const related=this.getAttribute('mode')==='related';const container=document.createElement('div');
      if(related){container.className='related';const heading=document.createElement('h3');heading.className='heading';heading.textContent='Discover more from ePlus';const copy=document.createElement('p');copy.className='copy';copy.textContent='More tools connected to what you are exploring.';container.append(heading,copy);}else{const trigger=document.createElement('button');trigger.className='trigger';trigger.type='button';trigger.setAttribute('aria-haspopup','true');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',this._id);const symbol=document.createElement('span');symbol.className='grid';symbol.textContent='▦';const label=document.createElement('span');label.textContent='ePlus Apps';const chevron=document.createElement('span');chevron.className='chevron';chevron.textContent='⌄';trigger.append(symbol,label,chevron);trigger.addEventListener('click',()=>this.toggle(!this._open));container.append(trigger);}
      const panel=document.createElement('div');panel.className=related?'related-body':'panel';panel.id=this._id;if(!related)panel.hidden=true;if(!related){const head=document.createElement('div');head.className='panel-header';const copy=document.createElement('div');const title=document.createElement('div');title.className='panel-title';title.textContent='ePlus Ecosystem';const subtitle=document.createElement('span');subtitle.className='panel-subtitle';subtitle.textContent='Independently built. Connected together.';copy.append(title,subtitle);const close=document.createElement('button');close.className='close';close.type='button';close.setAttribute('aria-label','Close menu');close.textContent='×';close.addEventListener('click',()=>this.toggle(false));head.append(copy,close);panel.append(head);}
      const loading=document.createElement('div');loading.className='loading';loading.textContent='Loading apps…';panel.append(loading);container.append(panel);shadow.append(container);
      getRegistry(this.url).then(sites=>{if(!this.isConnected||!shadow.contains(panel))return;loading.remove();const current=sites.find(site=>site.id===this.getAttribute('site'));const recommended=(current?.related||[]).map(id=>sites.find(site=>site.id===id)).filter(Boolean);const others=sites.filter(site=>site.id!==current?.id&&!recommended.includes(site));const selected=related?recommended.slice(0,3):[...recommended,...others];if(selected.length){const label=document.createElement('div');label.className='section-label';label.textContent=related?'Related apps':recommended.length?'Recommended for you':'All apps';panel.append(label);const list=document.createElement('div');list.className='list';selected.forEach(site=>list.append(this.makeItem(site)));panel.append(list);}else{const empty=document.createElement('div');empty.className='loading';empty.textContent='Explore the rest of ePlus.DEV.';panel.append(empty);}panel.append(this.makeViewAll());}).catch(()=>{loading.textContent='Could not load apps right now.';panel.append(this.makeViewAll());});
    }
  }
  customElements.define('eplus-ecosystem',EPlusEcosystem);
})();
