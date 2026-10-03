import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const version='4.9.3-beta.5.2', cache='zad-al-muslim-v4-9-3-beta-5-2-ui3';
const must=async(f)=>readFile(resolve(root,f),'utf8');
const failures=[]; const ok=(c,m)=>{if(!c)failures.push(m)};
const [pkg,lock,config,html,manifest,sw,audio,shell,quran,video,prayer,app,androidManifest,gradle,mediaPlugin,prepare,homeUi]=await Promise.all([
  'package.json','package-lock.json','config.js','index.html','manifest.webmanifest','sw.js','quran-audio.js','app-shell.js','quran.js','quran-video.js','prayer.js','app.js','android/app/src/main/AndroidManifest.xml','android/app/build.gradle','android/app/src/main/java/ly/zadalmuslim/app/AndroidMediaPlugin.java','scripts/prepare-capacitor.mjs','home-refresh.js'
].map(must));
const lockJson=JSON.parse(lock);
ok(JSON.parse(pkg).version===version,'package.json version mismatch');
ok(lockJson.version===version&&lockJson.packages?.['']?.version===version,'package-lock version mismatch');
ok(JSON.parse(pkg).dependencies?.['@capacitor/geolocation'],'official Capacitor Geolocation dependency missing');
ok(config.includes(`version: '${version}'`),'config version mismatch');
ok(html.includes('v4.9.3 Beta 5.2'),'HTML title version mismatch');
ok(JSON.parse(manifest).name.includes('Beta 5.2'),'PWA manifest version mismatch');
ok(sw.includes(`CACHE_NAME = '${cache}'`)&&sw.includes(`version:'${version}'`)&&sw.includes("'./ui2-polish.css'")&&sw.includes("'./ui3-enhance.css'")&&sw.includes("'./ui3-enhance.js'"),'service-worker version/cache/UI2+UI3 asset mismatch');
ok(gradle.includes(`versionName "${version}"`)&&/versionCode\s+493052/.test(gradle),'Android versionName/versionCode mismatch');
for(const tab of ['home','quran','adhkar','audio-quran','more']) ok(html.includes(`data-tab="${tab}"`),`missing bottom tab ${tab}`);
ok(shell.includes('.bottom-nav .nav-item')&&shell.includes('window.loadTab?.(tab)'),'bottom navigation integration missing');
ok(audio.includes("filter === 'young' && item.group === 'young'")&&audio.includes('value="young">القراء الشباب'),'young readers filter missing');
ok(quran.includes("document.addEventListener('click', handleVerseClick)")&&!quran.includes('onclick="event.stopPropagation();copyAyah'),'verse actions are not delegated');
ok(quran.includes('data-ayah-action="image"')&&quran.includes('جاري إنشاء الصورة'),'lazy ayah image action/progress missing');
ok(quran.includes('const marked = new Set('),'bookmark lookup is not precomputed for the surah render');
ok(video.includes('beginVideoSave')&&video.includes('finishVideoSave')&&video.includes('beginVideoShare'),'native video save/share bridge missing');
ok(video.includes('canvas.captureStream(15)'),'reduced canvas capture rate missing');
ok(prayer.includes('Geolocation')&&prayer.includes('checkLocationServices')&&prayer.includes('timeout: 15000'),'native location permission/service/timeout flow missing');
ok(!/if\s*\(!loc\)\s*loc\s*=\s*await\s+gpsLocation/.test(prayer),'location permission may be requested implicitly');
ok(!app.includes('navigator.geolocation')&&!app.includes('ipapi.co'),'legacy automatic GPS/IP location path remains');
ok(html.includes('id="manual-city-options"')&&html.includes('data-lat="24.7136"')&&app.includes("cityInput.addEventListener('change'"),'manual city chooser does not populate coordinates');
ok(html.includes('home-refresh.css?v=4.9.3-beta.5.2-ui1')&&html.includes('home-refresh.js?v=4.9.3-beta.5.2-ui1'),'simplified home assets are not linked');
ok(prepare.includes("'home-refresh.css'")&&prepare.includes("'home-refresh.js'")&&prepare.includes("'ui3-enhance.css'")&&prepare.includes("'ui3-enhance.js'")&&sw.includes("'./home-refresh.css'")&&sw.includes("'./home-refresh.js'"),'simplified home or UI3 assets are missing from prepare:web or offline cache');
ok(homeUi.includes('zad_quran_last_read')&&homeUi.includes("typeof PrayerTimes !== 'undefined'")&&homeUi.includes("typeof AppState !== 'undefined'"),'simplified home does not use current Quran/prayer state');
ok(prayer.includes('function renderHomeView()')&&prayer.includes('renderer !== renderHomeV42'),'prayer refresh does not preserve the selected home renderer');
ok(mediaPlugin.includes('MediaStore.Video.Media.RELATIVE_PATH')&&mediaPlugin.includes('Environment.DIRECTORY_MOVIES')&&mediaPlugin.includes('Intent.ACTION_SEND'),'Android MediaStore/chooser implementation missing');
ok(androidManifest.includes('android.permission.ACCESS_COARSE_LOCATION')&&androidManifest.includes('android.permission.ACCESS_FINE_LOCATION'),'location permissions missing from AndroidManifest');
ok(!/READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE/.test(androidManifest),'unnecessary legacy storage permission present');
const refs=[...html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)].map(x=>x[1]).filter(x=>!x.startsWith('http')&&!x.startsWith('#'));
for(const ref of refs){try{await stat(resolve(root,ref))}catch{failures.push(`missing referenced asset ${ref}`)}}
const js=(await readdir(root)).filter(f=>f.endsWith('.js'));
for(const f of js){const t=await must(f);ok(!t.includes("'4.9.3-beta.4'")&&!t.includes("'4.9.3-beta.5'"),`stale fallback version in ${f}`)}
if(failures.length){console.error('AUDIT FAIL\n- '+failures.join('\n- '));process.exit(1)}
  console.log(`AUDIT PASS — ${version}; ${refs.length} local HTML references; ${js.length} root JS files; simplified home integration; delegated verse actions; Android MediaStore/video share; on-demand native location; permissions verified.`);
