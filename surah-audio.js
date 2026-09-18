/* زاد المسلم — مكتبة المصاحف الصوتية الكاملة، مستقلة عن المصحف المكتوب. */
(function () {
  'use strict';
  const DATA='quran-data/surah-reciters.json',CHAPTERS='quran-data/chapters.json',CACHE='zad-quran-surah-audio-v461';
  const KEYS={selected:'zad_surah_reciter_selected',downloads:'zad_surah_audio_downloads',last:'zad_surah_audio_last',settings:'zad_surah_audio_settings',favorites:'zad_surah_reciter_favorites',recent:'zad_surah_reciter_recent'};
  const DEFAULTS={repeat:1,speed:1,sleep:0,autoNext:true};
  let catalog=[],chapters=[],audio=null,currentSurah=1,repetitions=0,sleepTimer=0;
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(_){}};
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pad=number=>String(number).padStart(3,'0');

  async function load(){
    if(catalog.length&&chapters.length)return;
    const[recitersResponse,chaptersResponse]=await Promise.all([fetch(DATA),fetch(CHAPTERS)]);
    if(!recitersResponse.ok||!chaptersResponse.ok)throw Error('تعذر تحميل فهرس المصاحف الصوتية');
    catalog=(await recitersResponse.json()).reciters||[];
    chapters=(await chaptersResponse.json()).chapters||[];
    if(!catalog.length||chapters.length!==114)throw Error('بيانات المكتبة غير مكتملة');
  }
  function selected(){const id=localStorage.getItem(KEYS.selected);return catalog.find(item=>item.id===id)||catalog[0]}
  function settings(){return{...DEFAULTS,...read(KEYS.settings,{})}}
  function favorites(){return read(KEYS.favorites,[])}
  function audioUrl(reciter,surah){return `${reciter.server}${pad(surah)}.mp3`}
  function getPlayer(){
    if(audio)return audio;
    audio=new Audio();audio.preload='metadata';
    audio.addEventListener('timeupdate',updatePlayerUI);
    audio.addEventListener('play',()=>{window.stopQuranAyahAudio?.();updatePlayerUI()});
    audio.addEventListener('pause',updatePlayerUI);
    audio.addEventListener('ended',()=>{const s=settings();if(s.repeat===-1||repetitions+1<s.repeat){repetitions+=1;audio.currentTime=0;audio.play().catch(()=>setStatus('تعذر تكرار السورة.',true));return}repetitions=0;if(s.autoNext&&currentSurah<114)playSurah(currentSurah+1);else setStatus('اكتملت السورة.')});
    audio.addEventListener('error',()=>setStatus(navigator.onLine?'تعذر تشغيل ملف السورة من المصدر.':'السورة غير محفوظة على هذا الجهاز.',true));
    return audio;
  }
  function reciterCards(list){const fav=favorites();return list.map(reciter=>`<article class="audio-reciter-card"><button class="full-reciter-favorite" onclick="toggleFullReciterFavorite('${reciter.id}')" aria-label="إضافة القارئ للمفضلة"><i class="${fav.includes(reciter.id)?'fas':'far'} fa-star"></i></button><div><strong>${esc(reciter.name)}</strong><small>${esc(reciter.riwaya)} • ${esc(reciter.style)} • 114 سورة</small><em>${esc(reciter.country)} • ${esc(reciter.source)}</em></div><button class="app-button" onclick="openAudioReciter('${reciter.id}')"><i class="fas fa-list"></i> اختيار السور</button></article>`).join('')}
  async function renderAudioHome(){
    const content=document.getElementById('page-content');content.className='fade-in audio-quran-page';
    content.innerHTML='<div class="quran-loading"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل المصاحف الصوتية…</p></div>';
    try{
      await load();
      content.innerHTML=`<section class="audio-quran-hero"><i class="fas fa-headphones"></i><div><h2>القرآن الكريم المسموع</h2><p>اختر القارئ أولًا، ثم اختر السورة من قائمته المستقلة.</p></div></section><div class="audio-home-actions"><button class="app-button" onclick="renderAudioDownloads()"><i class="fas fa-download"></i> إدارة التنزيلات</button><button class="app-button" onclick="filterFullReciters('', 'favorite')"><i class="fas fa-star"></i> المفضلة</button><button class="app-button" onclick="filterFullReciters('', 'recent')"><i class="fas fa-clock-rotate-left"></i> الأخيرة</button></div><div class="qalun-official-card"><strong>مصحف قالون الرسمي المعتمد في ليبيا</strong><p>نسخة الأوقاف الليبية الإلكترونية برواية قالون عن نافع ورسم الإمام الداني.</p><a href="https://mushaf.awqaf.gov.ly/" target="_blank" rel="noopener"><i class="fas fa-book-quran"></i> فتح مصحف قالون الرسمي</a></div><div class="surah-audio-warning"><i class="fas fa-circle-info"></i><span>المصاحف هنا ملفات صوتية للسورة كاملة ولا تستخدم تتبع الآيات. تتبع الآية متاح في القرآن المكتوب مع مشغل الآيات.</span></div><label class="audio-surah-search"><i class="fas fa-search"></i><input id="full-reciter-search" type="search" placeholder="ابحث باسم القارئ أو الدولة أو الرواية" oninput="filterFullReciters(this.value,'all')"></label><h3 id="full-reciter-heading" class="audio-library-title">جميع القراء</h3><div id="full-reciter-list" class="audio-reciter-grid">${reciterCards(catalog)}</div>`;
    }catch(error){content.innerHTML=`<div class="quran-error"><i class="fas fa-triangle-exclamation"></i><p>${esc(error.message)}</p><button class="app-button" onclick="renderAudioQuran()">إعادة المحاولة</button></div>`}
  }
  function warning(reciter){return reciter.riwaya.startsWith('حفص')?'التلاوة برواية حفص، لكنها ملف سورة كامل وغير متزامن آيةً بآية.':`التلاوة برواية ${esc(reciter.riwaya)}. هي منفصلة عن نص حفص ولا تتم مزامنتها معه آيةً بآية.`}
  function playerMarkup(reciter){const chapter=chapters[currentSurah-1],s=settings();return `<section id="surah-audio-player" class="surah-audio-player standalone-player"><div class="surah-audio-head"><i class="fas fa-headphones"></i><span><strong>${esc(reciter.name)}</strong><small>${esc(reciter.riwaya)}</small></span></div><div class="surah-audio-warning"><i class="fas fa-circle-info"></i><span>${warning(reciter)}</span></div><div class="surah-audio-controls"><button onclick="surahAudioPrevious()" aria-label="السورة السابقة"><i class="fas fa-backward-step"></i></button><button id="surah-audio-play" class="main" onclick="toggleSurahAudio()" aria-label="تشغيل أو إيقاف"><i class="fas fa-play"></i></button><button onclick="surahAudioNext()" aria-label="السورة التالية"><i class="fas fa-forward-step"></i></button><span id="surah-audio-title">سورة ${esc(chapter?.name||'')}</span></div><div class="audio-progress"><input id="surah-audio-seek" type="range" min="0" max="1000" value="0" aria-label="موضع التشغيل"><output id="surah-audio-time">00:00 / 00:00</output></div><div class="full-audio-options"><label>التكرار<select id="full-audio-repeat"><option value="1">مرة</option><option value="2">مرتان</option><option value="3">3 مرات</option><option value="5">5 مرات</option><option value="10">10 مرات</option><option value="-1">مستمر</option></select></label><label>السرعة<select id="full-audio-speed"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><label>مؤقت النوم<select id="full-audio-sleep"><option value="0">بدون مؤقت</option><option value="10">10 دقائق</option><option value="30">30 دقيقة</option><option value="60">60 دقيقة</option></select></label><label class="full-auto-next"><input id="full-audio-next" type="checkbox" ${s.autoNext?'checked':''}> تشغيل السورة التالية</label></div><div class="surah-audio-actions"><button id="surah-audio-download" onclick="downloadCurrentSurahAudio()"><i class="fas fa-download"></i> تنزيل السورة</button></div><small id="surah-audio-status">المصدر: ${esc(reciter.source)} • اختر سورة من القائمة</small></section>`}
  function surahRows(query=''){const normalized=query.trim();return chapters.filter(chapter=>!normalized||chapter.name.includes(normalized)||String(chapter.id)===normalized).map(chapter=>`<button class="audio-surah-row ${chapter.id===currentSurah?'active':''}" data-surah="${chapter.id}" onclick="playAudioLibrarySurah(${chapter.id})"><span class="surah-number">${chapter.id}</span><span><strong>سورة ${esc(chapter.name)}</strong><small>${chapter.type==='meccan'?'مكية':'مدنية'} • ${chapter.total_verses} آية</small></span><i class="fas fa-play"></i></button>`).join('')||'<div class="quran-empty">لم يُعثر على سورة مطابقة.</div>'}
  async function openReciter(id){
    await load();const previous=selected(),reciter=catalog.find(item=>item.id===id);if(!reciter)return renderAudioHome();
    clearTimeout(sleepTimer);if(previous?.id!==id&&audio){audio.pause();audio.removeAttribute('src');audio.load()}
    localStorage.setItem(KEYS.selected,id);const last=read(KEYS.last,{});currentSurah=last.id===id?Math.max(1,Math.min(114,Number(last.surah)||1)):1;
    const content=document.getElementById('page-content');content.className='fade-in audio-quran-page';
    content.innerHTML=`<div class="reader-toolbar"><button onclick="renderAudioQuran()"><i class="fas fa-arrow-right"></i><span>القراء</span></button><div><strong>${esc(reciter.name)}</strong><small>اختر سورة للتشغيل</small></div><span></span></div>${playerMarkup(reciter)}<label class="audio-surah-search"><i class="fas fa-search"></i><input type="search" placeholder="ابحث باسم السورة أو رقمها" oninput="filterAudioSurahs(this.value)"></label><div id="audio-surah-list" class="audio-surah-list">${surahRows()}</div>`;
    document.getElementById('surah-audio-seek')?.addEventListener('input',event=>{const player=getPlayer();if(Number.isFinite(player.duration))player.currentTime=player.duration*Number(event.target.value)/1000});
    bindFullOptions();
    updatePlayerUI();updateCachedState();
  }
  function bindFullOptions(){const s=settings(),repeat=document.getElementById('full-audio-repeat'),speed=document.getElementById('full-audio-speed'),sleep=document.getElementById('full-audio-sleep'),next=document.getElementById('full-audio-next');if(!repeat)return;repeat.value=String(s.repeat);speed.value=String(s.speed);sleep.value='0';repeat.onchange=()=>saveFullSetting('repeat',Number(repeat.value));speed.onchange=()=>{saveFullSetting('speed',Number(speed.value));getPlayer().playbackRate=Number(speed.value)};sleep.onchange=()=>setFullSleep(Number(sleep.value));next.onchange=()=>saveFullSetting('autoNext',next.checked)}
  function saveFullSetting(key,value){write(KEYS.settings,{...settings(),[key]:value})}
  function setFullSleep(minutes){clearTimeout(sleepTimer);if(!minutes)return setStatus('تم إلغاء مؤقت النوم.');sleepTimer=setTimeout(()=>{getPlayer().pause();setStatus(`توقف التشغيل بعد ${minutes} دقيقة.`)},minutes*60000);setStatus(`سيتم إيقاف التشغيل بعد ${minutes} دقيقة.`)}
  function filterSurahs(query){const list=document.getElementById('audio-surah-list');if(list)list.innerHTML=surahRows(query)}
  async function playSurah(surah=currentSurah,resume=false){
    await load();const reciter=selected(),player=getPlayer();window.stopQuranAyahAudio?.();currentSurah=Math.max(1,Math.min(114,Number(surah)||1));repetitions=0;player.playbackRate=settings().speed;
    const nextUrl=audioUrl(reciter,currentSurah),last=read(KEYS.last,{});if(player.src!==nextUrl)player.src=nextUrl;
    player.addEventListener('loadedmetadata',()=>{if(resume&&last.id===reciter.id&&last.surah===currentSurah)player.currentTime=Math.min(Number(last.seconds)||0,Math.max(0,player.duration-1))},{once:true});
    try{await player.play();setMediaSession(reciter);updatePlayerUI();updateSurahSelection();updateCachedState()}catch(_){setStatus('تعذر بدء التشغيل. تحقق من الاتصال ثم أعد المحاولة.',true)}
  }
  function toggle(){const player=getPlayer();if(player.src&&!player.paused)player.pause();else if(player.src)player.play().catch(()=>setStatus('تعذر استئناف التشغيل.',true));else playSurah(currentSurah,true)}
  function updateSurahSelection(){document.querySelectorAll('.audio-surah-row').forEach(row=>row.classList.toggle('active',Number(row.dataset.surah)===currentSurah));document.querySelector(`.audio-surah-row[data-surah="${currentSurah}"]`)?.scrollIntoView({block:'nearest'})}
  function updatePlayerUI(){
    const player=getPlayer(),range=document.getElementById('surah-audio-seek'),time=document.getElementById('surah-audio-time'),button=document.getElementById('surah-audio-play'),title=document.getElementById('surah-audio-title');
    if(range)range.value=Number.isFinite(player.duration)&&player.duration?Math.round(player.currentTime/player.duration*1000):0;
    if(time)time.textContent=`${formatDuration(player.currentTime)} / ${formatDuration(player.duration)}`;
    if(button)button.innerHTML=`<i class="fas fa-${player.paused?'play':'pause'}"></i>`;
    if(title)title.textContent=`سورة ${chapters[currentSurah-1]?.name||currentSurah}`;
    if(player.src)write(KEYS.last,{id:selected()?.id,surah:currentSurah,seconds:player.currentTime,updatedAt:Date.now()});
    window.dispatchEvent(new CustomEvent('zad:audio-state',{detail:{kind:'full',playing:!player.paused,currentTime:player.currentTime||0,duration:Number.isFinite(player.duration)?player.duration:0,title:`سورة ${chapters[currentSurah-1]?.name||currentSurah}`,subtitle:selected()?.name||'المصحف الكامل'}}));
  }
  function formatDuration(seconds){if(!Number.isFinite(seconds))return'00:00';const value=Math.max(0,Math.floor(seconds));return`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`}
  function setStatus(text,error=false){const node=document.getElementById('surah-audio-status');if(node){node.textContent=text;node.classList.toggle('error',error)}}
  function validatePlayable(url){return new Promise((resolve,reject)=>{const probe=new Audio();let settled=false;const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);probe.onloadedmetadata=null;probe.onerror=null;probe.removeAttribute('src');ok?resolve():reject(Error('invalid audio'))},timer=setTimeout(()=>done(false),15000);probe.preload='metadata';probe.onloadedmetadata=()=>done(true);probe.onerror=()=>done(false);probe.src=url;probe.load()})}
  async function download(){
    if(!('caches'in window))return setStatus('التنزيل غير مدعوم في هذا المتصفح.',true);const reciter=selected(),url=audioUrl(reciter,currentSurah),button=document.getElementById('surah-audio-download');let cache=null;if(button)button.disabled=true;setStatus('جاري التحقق وتنزيل السورة…');
    try{const mode=reciter.source==='Qaloun.app'?'no-cors':'cors',response=await fetch(url,{mode});if(!response.ok&&response.type!=='opaque')throw Error('network');if(response.type==='opaque')await validatePlayable(url);cache=await caches.open(CACHE);await cache.put(url,response);const downloads=read(KEYS.downloads,{});downloads[`${reciter.id}:${currentSurah}`]={id:reciter.id,surah:currentSurah,savedAt:Date.now()};write(KEYS.downloads,downloads);setStatus('تم تنزيل السورة والتحقق من صلاحية ملف الصوت.');updateCachedState()}catch(_){if(cache)await cache.delete(url).catch(()=>{});const downloads=read(KEYS.downloads,{});delete downloads[`${reciter.id}:${currentSurah}`];write(KEYS.downloads,downloads);setStatus('لم يكتمل تنزيل ملف صوت صالح. تحقق من الاتصال أو جرّب لاحقًا.',true)}finally{if(button)button.disabled=false}
  }
  async function updateCachedState(){if(!('caches'in window)||!catalog.length)return;const cached=await caches.match(audioUrl(selected(),currentSurah)),button=document.getElementById('surah-audio-download');if(button)button.innerHTML=cached?'<i class="fas fa-circle-check"></i> السورة محفوظة':'<i class="fas fa-download"></i> تنزيل السورة'}
  function setMediaSession(reciter){if(!('mediaSession'in navigator))return;try{navigator.mediaSession.metadata=new MediaMetadata({title:`سورة ${chapters[currentSurah-1]?.name||currentSurah}`,artist:reciter.name,album:reciter.riwaya});navigator.mediaSession.setActionHandler('play',()=>getPlayer().play());navigator.mediaSession.setActionHandler('pause',()=>getPlayer().pause());navigator.mediaSession.setActionHandler('previoustrack',()=>playSurah(currentSurah-1));navigator.mediaSession.setActionHandler('nexttrack',()=>playSurah(currentSurah+1))}catch(_){}}
  function filterReciters(query='',filter='all'){const normalized=query.trim().toLowerCase(),fav=favorites(),recent=read(KEYS.recent,[]);let list=catalog.filter(item=>!normalized||`${item.name} ${item.country} ${item.riwaya} ${item.style}`.toLowerCase().includes(normalized));if(filter==='favorite')list=list.filter(item=>fav.includes(item.id));if(filter==='recent')list=list.filter(item=>recent.includes(item.id));const box=document.getElementById('full-reciter-list'),heading=document.getElementById('full-reciter-heading');if(box)box.innerHTML=reciterCards(list)||'<div class="quran-empty">لا توجد نتائج.</div>';if(heading)heading.textContent=filter==='favorite'?'القراء المفضلون':filter==='recent'?'المستخدمون مؤخرًا':'جميع القراء'}
  function toggleFavorite(id){const items=favorites(),index=items.indexOf(id);if(index>=0)items.splice(index,1);else items.unshift(id);write(KEYS.favorites,items);filterReciters(document.getElementById('full-reciter-search')?.value||'')}
  function remember(id){const items=read(KEYS.recent,[]).filter(item=>item!==id);items.unshift(id);write(KEYS.recent,items.slice(0,8))}
  window.renderAudioQuran=renderAudioHome;window.openAudioReciter=id=>{remember(id);return openReciter(id)};window.filterFullReciters=filterReciters;window.toggleFullReciterFavorite=toggleFavorite;window.filterAudioSurahs=filterSurahs;window.playAudioLibrarySurah=surah=>playSurah(Number(surah));window.toggleSurahAudio=toggle;window.surahAudioPrevious=()=>playSurah(currentSurah-1);window.surahAudioNext=()=>playSurah(currentSurah+1);window.downloadCurrentSurahAudio=download;window.stopSurahAudio=()=>{clearTimeout(sleepTimer);if(audio)audio.pause()};
})();
