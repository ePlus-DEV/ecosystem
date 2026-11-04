import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {isEplusUrl,validateRegistry,candidateFromRepo} from '../scripts/registry-utils.mjs';
const sample=JSON.parse(await readFile(new URL('../registry/sites.json',import.meta.url),'utf8'));
test('seed registry is valid with working references',()=>{assert.deepEqual(validateRegistry(sample),[]);assert.ok(sample.sites.length>=5);});
test('rejects malicious and external URLs',()=>{for(const url of ['javascript:alert(1)','http://eplus.dev','https://eplus.dev.evil.com','https://evil.com','https://user:pass@eplus.dev'])assert.equal(isEplusUrl(url),false);assert.equal(isEplusUrl('https://radio.eplus.dev/'),true);});
test('rejects duplicates and broken relationships',()=>{const invalid=structuredClone(sample);invalid.sites.push({...invalid.sites[0],related:['missing-site']});const errors=validateRegistry(invalid);assert.ok(errors.some(e=>e.startsWith('Duplicate id')));assert.ok(errors.some(e=>e.startsWith('Duplicate URL')||e.includes('duplicate URL')));assert.ok(errors.some(e=>e.includes('unknown relation')));});
test('discovery does not republish an existing website or arbitrary domains',()=>{const repo={full_name:'ePlus-DEV/tool',homepage:'https://tool.eplus.dev',description:'Tool',archived:false,disabled:false,private:false};assert.equal(candidateFromRepo(repo,'https://example.com',new Set()),null);assert.equal(candidateFromRepo(repo,'https://tool.eplus.dev',new Set(['tool.eplus.dev'])),null);assert.equal(candidateFromRepo(repo,'https://tool.eplus.dev',new Set()).domain,'tool.eplus.dev');});
