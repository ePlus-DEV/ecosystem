import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const text = path => readFile(new URL(`../${path}`,import.meta.url),'utf8');
const [html,css,script,widget,registry] = await Promise.all([
  text('index.html'),text('styles.css'),text('app.js'),text('widget.js'),text('registry/sites.json')
]);
const sites = JSON.parse(registry).sites;
test('redesign preserves existing SEO metadata',()=>{
  const expected=[
    '<title>ePlus Ecosystem — Discover everything ePlus.DEV</title>',
    '<meta name="description" content="Discover the ePlus.DEV ecosystem: developer tools, cloud learning, live radio, traffic utilities and technical resources in one place.">',
    '<meta property="og:title" content="ePlus Ecosystem — One network. More possibilities.">',
    '<meta property="og:description" content="One place to discover the websites and tools built by ePlus.DEV.">',
    '<meta property="og:url" content="https://eplus-dev.github.io/ecosystem/">',
    '<link rel="canonical" href="https://eplus-dev.github.io/ecosystem/">'
  ];
  for(const fragment of expected)assert.ok(html.includes(fragment),`Missing SEO guard: ${fragment}`);
});
test('responsive portal keeps core accessible entrypoints',()=>{
  for(const id of ['theme-toggle','menu-toggle','search','category-list','site-grid','show-all','clear-filters'])
    assert.ok(html.includes(`id="${id}"`),`Missing ${id}`);
  assert.match(html,/<html lang="vi">/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/\.category-scroll\s*\{[^}]*overflow-x:auto/s);
  assert.doesNotMatch(css,/body\s*\{[^}]*overflow-x:hidden/s);
  assert.match(script,/localStorage\.setItem\('eplus-ecosystem-favorites'/);
});
test('published site registry supports approved design icons and labels',()=>{
  const ids=new Set(sites.map(site=>site.id));
  for(const id of ['onair','free-tier','camera','bank','calendar'])
    assert.ok(ids.has(id),`Missing approved featured app: ${id}`);
  for(const site of sites){
    assert.ok(site.descriptionVi?.trim(),`${site.id} missing Vietnamese card description`);
    assert.ok(site.ecosystemGroup,`${site.id} missing group`);
  }
});
test('embed widget remains isolated and validates linked websites',()=>{
  assert.ok(widget.includes("this.attachShadow({mode:'open'})"));
  assert.ok(widget.includes("safeSite(site)"));
  assert.ok(widget.includes("mode=\"related\""));
});
