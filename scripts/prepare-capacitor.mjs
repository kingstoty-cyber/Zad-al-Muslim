import {cp, mkdir, rm, stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),output=resolve(root,process.env.ZAD_WEB_DIR||'www');
if(output===root||!output.startsWith(`${root}/`))throw Error('مسار الإخراج غير آمن');
const files=['index.html','offline.html','styles.css','config.js','data.js','app.js','quran.js','prayer.js','enhancements.js','quran-features.js','quran-audio.js','surah-audio.js','quran-library.js','audio-downloads.js','quran-v48.js','app-shell.js','sw.js','manifest.webmanifest','QURAN_DATA_LICENSE.txt','THIRD_PARTY_ASSETS.txt'];
const directories=['assets','icons','quran-data'];
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const name of files){await stat(resolve(root,name));await cp(resolve(root,name),resolve(output,name))}
for(const name of directories){await stat(resolve(root,name));await cp(resolve(root,name),resolve(output,name),{recursive:true})}
console.log(`Prepared ${files.length} files and ${directories.length} directories in ${output}`);
