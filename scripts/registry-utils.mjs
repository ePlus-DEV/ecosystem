export const ALLOWED_CATEGORIES = new Set(['developer','learning','media','utilities','content','finance']);
export const ALLOWED_ICONS = new Set(['cloud','radio','camera','sparkles','book','github','globe','wallet','calendar']);
export function isEplusUrl(value) {
  try {const url=new URL(value);return url.protocol==='https:'&&!!url.hostname&&(url.hostname==='eplus.dev'||url.hostname.endsWith('.eplus.dev'))&&url.username===''&&url.password==='';}
  catch{return false;}
}
export function validateRegistry(data) {
  const errors=[];
  if(!data||data.version!==1||!Array.isArray(data.categories)||!Array.isArray(data.sites))return ['Expected registry version 1 with categories and sites arrays'];
  const categoryIds=new Set();
  for(const c of data.categories){if(!c||!ALLOWED_CATEGORIES.has(c.id)||typeof c.name!=='string'||!c.name.trim())errors.push(`Invalid category: ${JSON.stringify(c)}`);else if(categoryIds.has(c.id))errors.push(`Duplicate category: ${c.id}`);else categoryIds.add(c.id);}
  const siteIds=new Set();const urls=new Set();
  for(const site of data.sites){
    if(!site||typeof site!=='object'){errors.push('Invalid site object');continue;}
    const id=site.id;
    if(typeof id!=='string'||!/^[a-z][a-z0-9-]*$/.test(id)){errors.push(`Invalid id: ${id}`);continue;}
    if(siteIds.has(id))errors.push(`Duplicate id: ${id}`);else siteIds.add(id);
    if(typeof site.name!=='string'||!site.name.trim())errors.push(`${id}: name is required`);
    if(typeof site.description!=='string'||!site.description.trim())errors.push(`${id}: description is required`);
    if(!isEplusUrl(site.url))errors.push(`${id}: URL must be https://*.eplus.dev or https://eplus.dev`);
    else {const url=new URL(site.url).href;if(urls.has(url))errors.push(`${id}: duplicate URL ${url}`);urls.add(url);}
    if(!categoryIds.has(site.category))errors.push(`${id}: unknown category ${site.category}`);
    if(!ALLOWED_ICONS.has(site.icon))errors.push(`${id}: invalid icon ${site.icon}`);
    if(typeof site.featured!=='boolean')errors.push(`${id}: featured must be boolean`);
    if(!Array.isArray(site.tags)||site.tags.length===0||site.tags.some(tag=>typeof tag!=='string'||!tag.trim()))errors.push(`${id}: tags must be non-empty strings`);
    if(!Array.isArray(site.related)||site.related.some(other=>typeof other!=='string'))errors.push(`${id}: related must be an array of ids`);
    if(site.nameVi !== undefined && (typeof site.nameVi !== 'string' || !site.nameVi.trim())) errors.push(`${id}: invalid Vietnamese name`);
    if(site.descriptionVi !== undefined && (typeof site.descriptionVi !== 'string' || !site.descriptionVi.trim())) errors.push(`${id}: invalid Vietnamese description`);
    if(site.ecosystemGroup !== undefined && !['media','tools','traffic','finance','utility','content'].includes(site.ecosystemGroup)) errors.push(`${id}: invalid ecosystem group`);
    if(site.repository!==undefined&&!/^ePlus-DEV\/[a-zA-Z0-9._-]+$/.test(site.repository))errors.push(`${id}: invalid GitHub repository`);
  }
  for(const site of data.sites){if(!site||!Array.isArray(site.related))continue;for(const related of site.related){if(related===site.id)errors.push(`${site.id}: cannot relate to itself`);else if(!siteIds.has(related))errors.push(`${site.id}: unknown relation ${related}`);}}
  return errors;
}
export function candidateFromRepo(repo,domain,existingHostnames){
  if(!repo||repo.archived||repo.disabled||repo.private||typeof domain!=='string')return null;
  const url=domain.startsWith('https://')?domain:`https://${domain}`;
  if(!isEplusUrl(url))return null;
  const hostname=new URL(url).hostname;
  if(existingHostnames.has(hostname))return null;
  return {repository:repo.full_name,domain:hostname,url:new URL(url).origin+'/',description:repo.description||'',source:repo.homepage && isEplusUrl(repo.homepage)?'homepage':'CNAME'};
}
