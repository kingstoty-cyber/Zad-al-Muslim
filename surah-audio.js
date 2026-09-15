/* زاد المسلم — مكتبة المصاحف الصوتية الكاملة، مستقلة عن المصحف المكتوب. */
(function () {
  'use strict';
  const DATA='quran-data/surah-reciters.json',CHAPTERS='quran-data/chapters.json',CACHE='zad-quran-surah-audio-v461';
  const KEYS={selected:'zad_surah_reciter_selected',downloads:'zad_surah_audio_downloads',last:'zad_surah_audio_last'};
  let catalog=[],chapters=[],audio=null,currentSurah=1;
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
  function audioUrl(reciter,surah){return `${reciter.server}${pad(surah)}.mp3`}
  function getPlayer(){
    if(audio)return audio;
    audio=new Audio();audio.preload='metadata';
    audio.addEventListener('timeupdate',updatePlayerUI);
    audio.addEventListener('play',()=>{window.stopQuranAyahAudio?.();updatePlayerUI()});
    audio.addEventListener('pause',updatePlayerUI);
    audio.addEventListener('ended',()=>currentSurah<114?playSurah(currentSurah+1):setStatus('اكتمل المصحف الصوتي.'));
    audio.addEventListener('error',()=>setStatus(navigator.onLine?'تعذر تشغيل ملف السورة من المصدر.':'السورة غير محفوظة على هذا الجهاز.',true));
    return audio;
  }
  function reciterCards(list){return list.map(reciter=>`<article class="audio-reciter-card"><div class="audio-reciter-avatar"><i class="fas fa-microphone-lines"></i></div><div><strong>${esc(reciter.name)}</strong><small>${esc(reciter.riwaya)} • ${esc(reciter.style)} • 114 سورة</small><em>${esc(reciter.country)} • ${esc(reciter.source)}</em></div><button class="app-button" onclick="openAudioReciter('${reciter.id}')"><i class="fas fa-list"></i> اختيار السور</button></article>`).join('')}
  async function renderAudioHome(){
    const content=document.getElementById('page-content');content.className='fade-in audio-quran-page';
    content.innerHTML='<div class="quran-loading"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل المصاحف الصوتية…</p></div>';
    try{
      await load();const libyans=catalog.filter(item=>item.group==='libya'),requested=catalog.filter(item=>item.group==='requested');
      content.innerHTML=`<section class="audio-quran-hero"><i class="fas fa-headphones"></i><div><h2>القرآن الكريم المسموع</h2><p>اختر القارئ أولًا، ثم اختر السورة من قائمته المستقلة.</p></div></section><div class="qalun-official-card"><strong>مصحف قالون الرسمي المعتمد في ليبيا</strong><p>نسخة الأوقاف الليبية الإلكترونية برواية قالون عن نافع ورسم الإمام الداني.</p><a href="https://mushaf.awqaf.gov.ly/" target="_blank" rel="noopener"><i class="fas fa-book-quran"></i> فتح مصحف قالون الرسمي</a></div><div class="surah-audio-warning"><i class="fas fa-circle-info"></i><span>المصاحف هنا ملفات صوتية للسورة كاملة ولا تستخدم تتبع الآيات. تتبع الآية متاح في القرآن المكتوب مع مشغل الآيات.</span></div><h3 class="audio-library-title">القراء الليبيون</h3><div class="audio-reciter-grid">${reciterCards(libyans)}</div><h3 class="audio-library-title">قراء إضافيون</h3><div class="audio-reciter-grid">${reciterCards(requested)}</div>`;
    }catch(error){content.innerHTML=`<div class="quran-error"><i class="fas fa-triangle-exclamation"></i><p>${esc(error.message)}</p><button class="app-button" onclick="renderAudioQuran()">إعادة المحاولة</button></div>`}
  }
  function warning(reciter){return reciter.riwaya.startsWith('حفص')?'التلاوة برواية حفص، لكنها ملف سورة كامل وغير متزامن آيةً بآية.':`التلاوة برواية ${esc(reciter.riwaya)}. هي منفصلة عن نص حفص ولا تتم مزامنتها معه آيةً بآية.`}
  function playerMarkup(reciter){const chapter=chapters[currentSurah-1];return `<section id="surah-audio-player" class="surah-audio-player standalone-player"><div class="surah-audio-head"><i class="fas fa-headphones"></i><span><strong>${esc(reciter.name)}</strong><small>${esc(reciter.riwaya)}</small></span></div><div class="surah-audio-warning"><i class="fas fa-circle-info"></i><span>${warning(reciter)}</span></div><div class="surah-audio-controls"><button onclick="surahAudioPrevious()" aria-label="السورة السابقة"><i class="fas fa-backward-step"></i></button><button id="surah-audio-play" class="main" onclick="toggleSurahAudio()" aria-label="تشغيل أو إيقاف"><i class="fas fa-play"></i></button><button onclick="surahAudioNext()" aria-label="السورة التالية"><i class="fas fa-forward-step"></i></button><span id="surah-audio-title">سورة ${esc(chapter?.name||'')}</span></div><div class="audio-progress"><input id="surah-audio-seek" type="range" min="0" max="1000" value="0" aria-label="موضع التشغيل"><output id="surah-audio-time">00:00 / 00:00</output></div><div class="surah-audio-actions"><button id="surah-audio-download" onclick="downloadCurrentSurahAudio()"><i class="fas fa-download"></i> تنزيل السورة</button></div><small id="surah-audio-status">المصدر: ${esc(reciter.source)} • اختر سورة من القائمة</small></section>`}
  function surahRows(query=''){const normalized=query.trim();return chapters.filter(chapter=>!normalized||chapter.name.includes(normalized)||String(chapter.id)===normalized).map(chapter=>`<button class="audio-surah-row ${chapter.id===currentSurah?'active':''}" data-surah="${chapter.id}" onclick="playAudioLibrarySurah(${chapter.id})"><span class="surah-number">${chapter.id}</span><span><strong>سورة ${esc(chapter.name)}</strong><small>${chapter.type==='meccan'?'مكية':'مدنية'} • ${chapter.total_verses} آية</small></span><i class="fas fa-play"></i></button>`).join('')||'<div class="quran-empty">لم يُعثر على سورة مطابقة.</div>'}
  async function openReciter(id){
    await load();const previous=selected(),reciter=catalog.find(item=>item.id===id);if(!reciter)return renderAudioHome();
    if(previous?.id!==id&&audio){audio.pause();audio.removeAttribute('src');audio.load()}
    localStorage.setItem(KEYS.selected,id);const last=read(KEYS.last,{});currentSurah=last.id===id?Math.max(1,Math.min(114,Number(last.surah)||1)):1;
    const content=document.getElementById('page-content');content.className='fade-in audio-quran-page';
    content.innerHTML=`<div class="reader-toolbar"><button onclick="renderAudioQuran()"><i class="fas fa-arrow-right"></i><span>القراء</span></button><div><strong>${esc(reciter.name)}</strong><small>اختر سورة للتشغيل</small></div><span></span></div>${playerMarkup(reciter)}<label class="audio-surah-search"><i class="fas fa-search"></i><input type="search" placeholder="ابحث باسم السورة أو رقمها" oninput="filterAudioSurahs(this.value)"></label><div id="audio-surah-list" class="audio-surah-list">${surahRows()}</div>`;
    document.getElementById('surah-audio-seek')?.addEventListener('input',event=>{const player=getPlayer();if(Number.isFinite(player.duration))player.currentTime=player.duration*Number(event.target.value)/1000});
    updatePlayerUI();updateCachedState();
  }
  function filterSurahs(query){const list=document.getElementById('audio-surah-list');if(list)list.innerHTML=surahRows(query)}
  async function playSurah(surah=currentSurah,resume=false){
    await load();const reciter=selected(),player=getPlayer();window.stopQuranAyahAudio?.();currentSurah=Math.max(1,Math.min(114,Number(surah)||1));
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
  window.renderAudioQuran=renderAudioHome;window.openAudioReciter=openReciter;window.filterAudioSurahs=filterSurahs;window.playAudioLibrarySurah=surah=>playSurah(Number(surah));window.toggleSurahAudio=toggle;window.surahAudioPrevious=()=>playSurah(currentSurah-1);window.surahAudioNext=()=>playSurah(currentSurah+1);window.downloadCurrentSurahAudio=download;window.stopSurahAudio=()=>{if(audio)audio.pause()};
})();
