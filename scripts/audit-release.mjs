import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const version='4.9.3-beta.5.1', cache='zad-al-muslim-v4-9-3-beta-5-1';
const must=async(f)=>readFile(resolve(root,f),'utf8');
const fail=[]; const ok=(c,m)=>{if(!c)fail.push(m)};
const [pkg,lock,config,html,manifest,sw,audio,shell]=await Promise.all(['package.json','package-lock.json','config.js','index.html','manifest.webmanifest','sw.js','quran-audio.js','app-shell.js'].map(must));
ok(JSON.parse(pkg).version===version,'package.json version mismatch');
ok(JSON.parse(lock).version===version && JSON.parse(lock).packages?.['']?.version===version,'package-lock version mismatch');
ok(config.includes(`version: '${version}'`),'config version mismatch');
ok(html.includes(`v4.9.3 Beta 5.1`),'HTML title version mismatch');
ok(JSON.parse(manifest).name.includes('Beta 5.1'),'manifest version mismatch');
ok(sw.includes(`CACHE_NAME = '${cache}'`)&&sw.includes(`version:'${version}'`),'service worker version/cache mismatch');
for(const tab of ['home','quran','adhkar','audio-quran','more']) ok(html.includes(`data-tab="${tab}"`),`missing bottom tab ${tab}`);
ok(shell.includes(".bottom-nav .nav-item")&&shell.includes('window.loadTab?.(tab)'),'delegated bottom navigation missing');
ok(audio.includes("filter === 'young' && item.group === 'young'")&&audio.includes('value="young">القراء الشباب'),'young readers filter missing');
const refs=[...html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)].map(x=>x[1]).filter(x=>!x.startsWith('http')&&!x.startsWith('#'));
for(const ref of refs){try{await stat(resolve(root,ref))}catch{fail.push(`missing referenced asset ${ref}`)}}
const js=(await readdir(root)).filter(f=>f.endsWith('.js'));
for(const f of js){const t=await must(f); ok(!t.includes("'4.9.3-beta.4'")&&!t.includes("'4.9.3-beta.5'"),`stale fallback version in ${f}`)}
if(fail.length){console.error('AUDIT FAIL\n- '+fail.join('\n- '));process.exit(1)}
console.log(`AUDIT PASS — ${version}; ${refs.length} local HTML references; ${js.length} root JS files; bottom navigation + young filter verified.`);
