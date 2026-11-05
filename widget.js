/* ePlus Ecosystem: self-contained Web Component; does not touch host SEO, analytics or navigation. */
(() => {
  'use strict';
  if (!('customElements' in window) || customElements.get('eplus-ecosystem')) return;
  const script=document.currentScript;
  const base=script?.src ? new URL('.',script.src) : new URL('./',document.baseURI);
  const registryUrl=new URL('registry/sites.json',base).href;
  const portalUrl=base.href;
  const brandLogoUrl=new URL('assets/brand/logo.svg',base).href;
  const requests=new Map();
  let instance=0;
  const GLYPHS={
    radio:['#7a53e6','#efe9ff','M3 8h18v13H3z M5 8 18 3 M7 14h.01 M11 14h7 M11 18h7'],
    cloud:['#1689f5','#e4f2ff','M20 17a5 5 0 0 0-3-9 7 7 0 0 0-13 3 4 4 0 0 0 1 8h14'],
    camera:['#00ac7d','#ddfff4','M5 7h3l2-3h4l2 3h3a2 2 0 0 1 2 2v10H3V9a2 2 0 0 1 2-2z M12 10a3 3 0 1 1 0 6 3 3 0 0 1 0-6'],
    wallet:['#efa600','#fff2d7','M3 6h18v15H3z M3 10h18 M16 13h6v5h-6a2.5 2.5 0 0 1 0-5'],
    calendar:['#ec5d67','#ffe6eb','M3 5h18v16H3z M3 10h18 M7 3v5 M17 3v5'],
    book:['#216fe0','#e6efff','M5 4h15v16H7a3 3 0 0 0-3 2V6a2 2 0 0 1 1-2z'],
    github:['#4e658a','#ebf0f9','M8 19c-4 1-4-2-6-3m13 6v-3c0-1 0-2 1-3 4 0 6-2 6-6 0-2-.5-3.5-2-5 0-1 0-2-1-3-2 0-3 1-4 2a15 15 0 0 0-5 0C9 3 8 2 6 2 5 3 5 4 5 5c-1.5 1.5-2 3-2 5 0 4 2 6 6 6.5 1 .5 1 2 1 3v3'],
    sparkles:['#7961d8','#f2eaff','m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z'],
    globe:['#426dbc','#e8f2ff','M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z']
  };
  const sheet=`
    :host{--ee-text:#13244a;--ee-muted:#566b8d;--ee-bg:#fff;--ee-soft:#f5f8ff;--ee-border:#dce6f6;--ee-blue:#145fe1;
      display:inline-block;position:relative;isolation:isolate;color:var(--ee-text);font:500 13px/1.4 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    :host([theme="dark"]){--ee-text:#f3f6ff;--ee-muted:#b1c2de;--ee-bg:#1b2a44;--ee-soft:#223653;--ee-border:#3a5375;--ee-blue:#8abaff}
    @media(prefers-color-scheme:dark){:host(:not([theme])),:host([theme="auto"]){--ee-text:#f3f6ff;--ee-muted:#b1c2de;--ee-bg:#1b2a44;--ee-soft:#223653;--ee-border:#3a5375;--ee-blue:#8abaff}}
    *,*::before,*::after{box-sizing:border-box}a,button{font:inherit}button{cursor:pointer}a{color:inherit;text-decoration:none}
    a:focus-visible,button:focus-visible{outline:2px solid var(--ee-blue);outline-offset:3px}
    .trigger{display:inline-flex;align-items:center;gap:10px;padding:9px 13px;background:var(--ee-bg);border:1px solid var(--ee-border);
      border-radius:12px;color:var(--ee-text);font-weight:750;white-space:nowrap;box-shadow:0 3px 11px rgba(40,75,120,.06)}
    .trigger:hover{border-color:var(--ee-blue);background:var(--ee-soft)}
    .trigger .grid{width:20px;height:20px;display:grid;grid-template-columns:repeat(2,7px);gap:3px}
    .trigger .grid i{border:1.7px solid var(--ee-blue);border-radius:2px}
    .trigger .chevron{font-size:16px;margin-left:2px;color:var(--ee-muted)}
    .panel{position:absolute;top:calc(100% + 9px);left:0;right:auto;width:min(390px,calc(100vw - 24px));z-index:2147483000;
      padding:18px;border:1px solid var(--ee-border);border-radius:18px;background:var(--ee-bg);box-shadow:0 19px 58px rgba(17,42,85,.2);
      max-height:min(570px,75vh);overflow:auto}
    .panel[hidden]{display:none}
    .head{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:13px}
    .head-brand-logo{display:block;width:30px;height:30px;flex:0 0 30px;object-fit:contain}
    .head-copy{flex:1;min-width:0}
    .head-title{font-size:15px;font-weight:850;line-height:1.3}
    .head-sub{display:block;color:var(--ee-muted);font-size:11px;margin-top:4px}
    .close{display:grid;place-items:center;border:1px solid var(--ee-border);width:30px;height:30px;border-radius:9px;background:var(--ee-soft);color:var(--ee-text)}
    .section-label{font-size:10px;color:var(--ee-muted);font-weight:800;letter-spacing:.9px;text-transform:uppercase;margin-bottom:9px}
    .apps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .item{min-width:0;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;border:1px solid transparent;border-radius:12px;padding:11px 5px}
    .item:hover{background:var(--ee-soft);border-color:var(--ee-border)}
    .glyph{width:47px;height:47px;border-radius:13px;display:grid;place-items:center;flex-shrink:0}
    .glyph svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .item-title{display:block;max-width:100%;font-size:11px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .view-all{display:flex;align-items:center;justify-content:center;color:var(--ee-blue);font-size:12px;font-weight:800;gap:7px;
      border-top:1px solid var(--ee-border);padding:14px 0 0;margin-top:10px}
    .loading{padding:20px 10px;text-align:center;color:var(--ee-muted);font-size:12px}
    :host([mode="related"]){display:block;width:100%}
    .related{background:var(--ee-bg);border:1px solid var(--ee-border);border-radius:15px;padding:16px}
    .related-title{font-size:14px;font-weight:800;margin:0 0 5px}
    .related-sub{font-size:12px;color:var(--ee-muted);margin:0 0 14px}
    .related .apps{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
    @media(max-width:350px){.panel{right:-8px;padding:12px}.apps{gap:3px}.item{padding:8px 3px}}
  `;
  function safeSite(site) {
    try {
      const u=new URL(site.url);
      return u.protocol==='https:' && (u.hostname==='eplus.dev' || u.hostname.endsWith('.eplus.dev')) && !u.username && !u.password;
    } catch {return false;}
  }
  function getRegistry(url) {
    if(!requests.has(url)){
      const promise=fetch(url,{credentials:'omit',cache:'no-cache',mode:'cors'})
        .then(r=>{if(!r.ok)throw new Error(`Registry HTTP ${r.status}`);return r.json();})
        .then(data=>{if(!Array.isArray(data.sites))throw new Error('Invalid registry');return data.sites.filter(s=>s&&typeof s.name==='string'&&safeSite(s));})
        .catch(error=>{requests.delete(url);throw error;});
      requests.set(url,promise);
    }
    return requests.get(url);
  }
  const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  function icon(site){
    const [color,bg,path]=GLYPHS[site.icon] || GLYPHS.globe;
    const container=node('span','glyph');container.style.color=color;container.style.background=bg;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',path);svg.append(p);container.append(svg);
    return container;
  }
  class EPlusEcosystem extends HTMLElement {
    static get observedAttributes(){return ['mode','site','endpoint','portal'];}
    constructor(){
      super();this.attachShadow({mode:'open'});this._id=`ee-panel-${++instance}`;this._open=false;
      this._outside=e=>{if(this._open&&!e.composedPath().includes(this))this.toggle(false);};
      this._escape=e=>{if(e.key==='Escape'&&this._open){this.toggle(false);this.shadowRoot.querySelector('.trigger')?.focus();}};
      this._resize=()=>{if(this._open)this.positionPanel();};
    }
    connectedCallback(){this.render();document.addEventListener('pointerdown',this._outside);document.addEventListener('keydown',this._escape);window.addEventListener('resize',this._resize);}
    disconnectedCallback(){document.removeEventListener('pointerdown',this._outside);document.removeEventListener('keydown',this._escape);window.removeEventListener('resize',this._resize);}
    attributeChangedCallback(){if(this.isConnected)this.render();}
    get endpoint(){return this.validUrl('endpoint',registryUrl);}
    get portal(){return this.validUrl('portal',portalUrl);}
    validUrl(attr,fallback){
      const value=this.getAttribute(attr);if(!value)return fallback;
      try {const u=new URL(value,document.baseURI);return u.protocol==='https:'||u.origin===location.origin?u.href:fallback;}catch{return fallback;}
    }
    positionPanel(){
      const panel=this.shadowRoot.querySelector('.panel');
      if(!panel)return;
      const host=this.getBoundingClientRect();
      const width=Math.min(390,Math.max(0,window.innerWidth-24));
      const x=Math.max(12,Math.min(host.right-width,window.innerWidth-width-12));
      panel.style.left=`${x-host.left}px`;
    }
    toggle(open){
      this._open=open;
      const panel=this.shadowRoot.querySelector('.panel'),trigger=this.shadowRoot.querySelector('.trigger');
      if(panel){panel.hidden=!open;if(open)this.positionPanel();}
      if(trigger)trigger.setAttribute('aria-expanded',String(open));
    }
    makeItem(site) {
      const link=node('a','item');link.href=site.url;link.target='_blank';link.rel='noopener noreferrer';link.title=site.nameVi||site.name;
      link.append(icon(site),node('span','item-title',site.nameVi||site.name));
      link.addEventListener('click',()=>this.toggle(false));
      return link;
    }
    makeViewAll(){
      const link=node('a','view-all','Xem tất cả ứng dụng →');
      link.href=this.portal;link.target='_blank';link.rel='noopener noreferrer';return link;
    }
    render(){
      this._open=false;
      const shadow=this.shadowRoot;shadow.replaceChildren();
      const style=node('style');style.textContent=sheet;shadow.append(style);
      const related=this.getAttribute('mode')==='related';
      const wrapper=node('div',related?'related':'widget');
      if(related){
        wrapper.append(node('h3','related-title','Khám phá thêm từ ePlus'),node('p','related-sub','Những ứng dụng liên quan có thể hữu ích cho bạn.'));
      } else {
        const trigger=node('button','trigger');trigger.type='button';
        trigger.setAttribute('aria-haspopup','true');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',this._id);
        const grid=node('span','grid');grid.setAttribute('aria-hidden','true');for(let i=0;i<4;i++)grid.append(node('i'));
        trigger.append(grid,document.createTextNode('Ứng dụng ePlus'),node('span','chevron','⌄'));
        trigger.addEventListener('click',()=>this.toggle(!this._open));wrapper.append(trigger);
      }
      const panel=node('div',related?'related-body':'panel');
      panel.id=this._id;if(!related)panel.hidden=true;
      if(!related){
        const head=node('div','head');
        const brandIcon=node('img','head-brand-logo');brandIcon.src=brandLogoUrl;brandIcon.alt='';brandIcon.width=30;brandIcon.height=30;brandIcon.decoding='async';
        const copy=node('div','head-copy');copy.append(node('div','head-title','Khám phá hệ sinh thái ePlus'),node('span','head-sub','Các ứng dụng liên kết với nhau'));
        const close=node('button','close','×');close.type='button';close.setAttribute('aria-label','Đóng menu');close.addEventListener('click',()=>this.toggle(false));
        head.append(brandIcon,copy,close);panel.append(head);
      }
      const loading=node('div','loading','Đang tải ứng dụng…');panel.append(loading);wrapper.append(panel);shadow.append(wrapper);
      getRegistry(this.endpoint).then(sites=>{
        if(!this.isConnected||!shadow.contains(panel))return;
        loading.remove();
        const current=sites.find(site=>site.id===this.getAttribute('site'));
        const recommendations=(current?.related||[]).map(id=>sites.find(site=>site.id===id)).filter(Boolean);
        const others=sites.filter(site=>site.id!==current?.id&&!recommendations.includes(site));
        const selected=related?recommendations.slice(0,3):[...recommendations,...others];
        if(selected.length){
          if(!related)panel.append(node('div','section-label',recommendations.length?'Dành cho bạn':'Ứng dụng ePlus'));
          const list=node('div','apps');
          selected.forEach(site=>list.append(this.makeItem(site)));
          panel.append(list);
        } else panel.append(node('div','loading','Khám phá các ứng dụng khác của ePlus.'));
        panel.append(this.makeViewAll());
      }).catch(()=>{
        loading.textContent='Tạm thời chưa tải được ứng dụng.';
        panel.append(this.makeViewAll());
      });
    }
  }
  customElements.define('eplus-ecosystem',EPlusEcosystem);
})();
