/** Discovery is proposal-only: it NEVER modifies registry/sites.json. */
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {isEplusUrl,candidateFromRepo} from './registry-utils.mjs';
const token=process.env.GITHUB_TOKEN||'';
const header={Accept:'application/vnd.github+json','User-Agent':'eplus-ecosystem-discovery','X-GitHub-Api-Version':'2022-11-28'};
if(token)header.Authorization=`Bearer ${token}`;
const base='https://api.github.com';
const registryPath=fileURLToPath(new URL('../registry/sites.json',import.meta.url));
const candidatePath=fileURLToPath(new URL('../registry/candidates.json',import.meta.url));
const registry=JSON.parse(await readFile(registryPath,'utf8'));
const existing=new Set(registry.sites.map(site=>new URL(site.url).hostname));
async function api(url){
  const response=await fetch(url,{headers:header,signal:AbortSignal.timeout(14000)});
  if(!response.ok)throw new Error(`GitHub API ${response.status}: ${url}`);
  return response.json();
}
async function getRepos(){
  const result=[];
  for(let page=1;page<=5;page++){
    const chunk=await api(`${base}/orgs/ePlus-DEV/repos?type=public&per_page=100&page=${page}`);
    result.push(...chunk);
    if(chunk.length<100)break;
  }
  return result;
}
async function getCname(repo){
  const url=`${base}/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/contents/CNAME`;
  try{
    const response=await fetch(url,{headers:header,signal:AbortSignal.timeout(10000)});
    if(response.status===404)return null;
    if(!response.ok)return null;
    const data=await response.json();
    if(data.encoding!=='base64'||typeof data.content!=='string')return null;
    // CNAME is ASCII by specification; Buffer is available in Node.
    const domain=Buffer.from(data.content.replace(/\s/g,''),'base64').toString('utf8').trim().split(/\r?\n/)[0].trim();
    return domain&&!domain.includes('/')?domain:null;
  }catch{return null;}
}
async function probe(url){
  try{
    const response=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(7000),headers:{'User-Agent':'ePlus-Ecosystem-Discovery/1.0'}});
    if(response.ok)return true;
    if(response.status!==403&&response.status!==405)return false;
    const fallback=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(7000)});
    await fallback.body?.cancel();return fallback.ok;
  }catch{return false;}
}
const repos=await getRepos();const output=[];const seen=new Set();
for(const repo of repos){
  if(repo.archived||repo.disabled||repo.private||repo.fork)continue;
  const sources=[];
  if(isEplusUrl(repo.homepage))sources.push(repo.homepage);
  const cname=await getCname(repo);
  if(cname&&isEplusUrl(`https://${cname}`))sources.push(cname);
  for(const domain of sources){
    const candidate=candidateFromRepo(repo,domain,existing);
    if(!candidate||seen.has(candidate.domain))continue;
    seen.add(candidate.domain);
    if(await probe(candidate.url))output.push(candidate);
  }
}
output.sort((a,b)=>a.domain.localeCompare(b.domain));
const result={generatedAt:null,candidates:output};
await writeFile(candidatePath,JSON.stringify(result,null,2)+'\n');
console.log(`Scanned ${repos.length} repositories; ${output.length} proposed website(s). Discovery never publishes sites directly.`);
