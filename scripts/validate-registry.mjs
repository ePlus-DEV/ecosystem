import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateRegistry } from './registry-utils.mjs';
const path=fileURLToPath(new URL('../registry/sites.json',import.meta.url));
const data=JSON.parse(await readFile(path,'utf8'));
const errors=validateRegistry(data);
if(errors.length){console.error(`Registry validation failed (${errors.length}):\n${errors.map(error=>' - '+error).join('\n')}`);process.exitCode=1;}
else console.log(`Registry valid: ${data.sites.length} websites, ${data.categories.length} categories.`);
