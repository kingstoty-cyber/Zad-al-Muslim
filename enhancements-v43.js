// Zad Al-Muslim v4.3 — PWA, safe backup, home dashboard and prayer alerts
(function(){
  'use strict';
  const APP_KEY=/^(zad_|quran_|prayer_|adhkar_|tasbeeh_|current_dhikr_|theme_|auto_theme|manual_location|user_location|cached_prayer_times)/;
  const ALERT_KEY='zad_prayer_alert_settings';
  let installPrompt=null;

  function read(key,fallback=null){try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}}
  function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function appData(){const data={};Object.keys(localStorage).filter(k=>APP_KEY.test(k)&&k!=='zad_audio_downloads').sort().forEach(k=>data[k]=localStorage.getItem(k));return data}

  function exportData(){
    const payload={app:'زاد المسلم',version:'4.5.0',exportedAt:new Date().toISOString(),data:appData()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=`zad-al-muslim-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function chooseImport(){document.getElementById('zad-import-file')?.click()}
  async function importData(input){
    const file=input.files?.[0];if(!file)return;
    try{const payload=JSON.parse(await file.text());if(payload.app!=='زاد المسلم'||!payload.data||typeof payload.data!=='object')throw new Error('هذا ليس ملف نسخة احتياطية صالحًا');
      const entries=Object.entries(payload.data).filter(([k,v])=>APP_KEY.test(k)&&typeof v==='string');if(!entries.length)throw new Error('لا توجد بيانات قابلة للاستعادة');
      if(!confirm(`سيتم استعادة ${entries.length} عنصرًا مع الاحتفاظ ببيانات زاد المسلم غير الموجودة في الملف. هل تتابع؟`))return;
      entries.forEach(([k,v])=>localStorage.setItem(k,v));alert('تمت استعادة البيانات بنجاح. سيُعاد تحميل التطبيق.');location.reload();
    }catch(e){alert(`تعذرت الاستعادة: ${e.message}`)}finally{input.value=''}
  }

  function hijriDate(){try{return new Intl.DateTimeFormat('ar-LY-u-ca-islamic',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}catch(_){return 'التاريخ الهجري غير متاح'}}
  function gregorianDate(){return new Intl.DateTimeFormat('ar-LY',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}
  function adhkarPercent(){
    const progress=read('adhkar_progress',{});const db=typeof AdhkarDB!=='undefined'?AdhkarDB:{};const morning=db.morning||[];const evening=db.evening||[];const all=[...morning,...evening];
    return all.length?Math.round(all.filter(x=>progress[x.id]?.completed).length/all.length*100):0;
  }
  function dashboardMarkup(){
    const last=read('zad_quran_last_read');const quranAction=last?`openSurah(${Number(last.surah)||1},${Number(last.ayah)||1})`:`loadTab('quran')`;
    const lastText=last?`سورة ${Number(last.surah)}، الآية ${Number(last.ayah)||1}`:'ابدأ وردك من المصحف';
    return `<section class="home-dashboard card"><div class="date-grid"><div><i class="fas fa-calendar-days"></i><small>الميلادي</small><strong>${esc(gregorianDate())}</strong></div><div><i class="fas fa-moon"></i><small>الهجري</small><strong>${esc(hijriDate())}</strong></div></div>
      <div class="home-progress"><button onclick="${quranAction}"><i class="fas fa-book-open"></i><span><small>آخر قراءة</small><strong>${esc(lastText)}</strong></span></button><button onclick="loadTab('adhkar')"><i class="fas fa-hands-praying"></i><span><small>أذكار اليوم</small><strong>${adhkarPercent()}% مكتمل</strong></span></button></div>
      <div class="quick-actions"><button onclick="loadTab('quran')"><i class="fas fa-book-quran"></i>القرآن</button><button onclick="loadTab('adhkar')"><i class="fas fa-hands-praying"></i>الأذكار</button><button onclick="loadTab('tasbeeh')"><i class="fas fa-circle-notch"></i>المسبحة</button><button onclick="renderQibla()"><i class="fas fa-compass"></i>القبلة</button></div></section>`;
  }

  const baseHome=window.renderHome;
  function renderHomeV43(){baseHome();const content=document.getElementById('page-content');const first=content?.querySelector('.card');if(first)first.insertAdjacentHTML('afterend',dashboardMarkup());}

  function alertSettings(){return {...{enabled:false,minutes:10},...(read(ALERT_KEY,{})||{})}}
  async function enablePrayerAlerts(){
    if(!('Notification'in window))return alert('هذا المتصفح لا يدعم إشعارات الويب.');
    const permission=await Notification.requestPermission();if(permission!=='granted')return alert('لم يُمنح إذن الإشعارات. يمكنك تفعيله من إعدادات Chrome للموقع.');
    const s=alertSettings();s.enabled=true;s.minutes=Math.max(1,Math.min(60,Number(document.getElementById('alert-minutes')?.value)||10));localStorage.setItem(ALERT_KEY,JSON.stringify(s));alert('تم تشغيل التنبيه. يعمل أثناء فتح التطبيق أو بقائه نشطًا، أما الأذان في الخلفية المغلقة فيحتاج تطبيق Android مستقلًا.');renderSettingsV43();
  }
  function disablePrayerAlerts(){const s=alertSettings();s.enabled=false;localStorage.setItem(ALERT_KEY,JSON.stringify(s));renderSettingsV43()}
  function checkPrayerAlert(){
    const s=alertSettings();if(!s.enabled||!('Notification'in window)||Notification.permission!=='granted')return;const now=new Date();
    (typeof PrayerTimes!=='undefined'?PrayerTimes:[]).filter(p=>p.name!=='الشروق'&&/^\d\d:\d\d$/.test(p.time)).forEach(p=>{const[h,m]=p.time.split(':').map(Number);const at=new Date();at.setHours(h,m,0,0);const diff=Math.floor((at-now)/60000);const key=`zad_alert_${at.toDateString()}_${p.name}_${s.minutes}`;
      if(diff>=0&&diff<=s.minutes&&!sessionStorage.getItem(key)){const remaining=diff<1?'أقل من دقيقة':`${diff} ${diff===1?'دقيقة':'دقائق'}`;new Notification(`اقتربت صلاة ${p.name}`,{body:`باقي نحو ${remaining} — زاد المسلم`,icon:'icons/icon-192.png',tag:key});sessionStorage.setItem(key,'1')}});
  }

  function vibrationEnabled(){return read('zad_vibration_enabled',true)!==false}
  function vibrate(){if(vibrationEnabled()&&navigator.vibrate)navigator.vibrate(28)}
  function toggleVibration(input){localStorage.setItem('zad_vibration_enabled',JSON.stringify(input.checked));if(input.checked)vibrate()}
  const baseDhikrCount=window.updateDhikrCount;
  function updateDhikrCountV43(id,change){if(change>0)vibrate();baseDhikrCount(id,change)}
  const baseIncrement=window.incrementTasbeeh;
  function incrementTasbeehV43(){
    const history=read('zad_tasbeeh_daily',{});const day=localDay();history[day]=(history[day]||0)+1;
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-90);Object.keys(history).forEach(k=>{if(new Date(k)<cutoff)delete history[k]});localStorage.setItem('zad_tasbeeh_daily',JSON.stringify(history));vibrate();baseIncrement();
  }
  const baseTasbeeh=window.renderTasbeeh;
  function renderTasbeehV43(){baseTasbeeh();const history=read('zad_tasbeeh_daily',{}),now=new Date();let week=0;for(let i=0;i<7;i++){const d=new Date(now);d.setDate(now.getDate()-i);week+=history[localDay(d)]||0}const today=history[localDay(now)]||0;document.getElementById('page-content')?.insertAdjacentHTML('beforeend',`<div class="card tasbeeh-stats"><div class="card-title"><i class="fas fa-chart-simple"></i> إحصائيات المسبحة</div><div><span><strong>${today}</strong><small>اليوم</small></span><span><strong>${week}</strong><small>آخر 7 أيام</small></span></div></div>`)}

  function pwaCard(){const s=alertSettings();return `<div class="card"><div class="card-title"><i class="fas fa-mobile-screen"></i> التطبيق والتنبيهات والبيانات</div>
    <div class="settings-actions"><button id="install-app-btn" class="btn-primary" onclick="installZadApp()" ${installPrompt?'':'disabled'}><i class="fas fa-download"></i> ${installPrompt?'تثبيت التطبيق':'التطبيق مثبت أو التثبيت غير متاح'}</button>
    ${s.enabled?'<button class="btn-primary danger-btn" onclick="disablePrayerAlerts()"><i class="fas fa-bell-slash"></i> إيقاف تنبيه الصلاة</button>':`<label class="alert-row">التنبيه قبل الصلاة <input id="alert-minutes" type="number" min="1" max="60" value="${s.minutes}"> دقيقة</label><button class="btn-primary" onclick="enablePrayerAlerts()"><i class="fas fa-bell"></i> تشغيل التنبيهات</button>`}
    <label class="alert-row">اهتزاز عدّاد الأذكار والمسبحة <input type="checkbox" ${vibrationEnabled()?'checked':''} onchange="toggleZadVibration(this)"></label>
    <button class="btn-primary backup-btn" onclick="exportZadData()"><i class="fas fa-file-export"></i> تصدير نسخة احتياطية</button><button class="btn-primary backup-btn" onclick="chooseZadImport()"><i class="fas fa-file-import"></i> استعادة نسخة احتياطية</button><input id="zad-import-file" type="file" accept="application/json,.json" hidden onchange="importZadData(this)"></div>
    <p class="accuracy-note">النسخة الاحتياطية تشمل الورد والعلامات والأذكار والمسبحة وإعدادات الصلاة. لا تُرسل إلى أي خادم.</p></div>`}
  const baseSettings=window.renderSettings;
  function renderSettingsV43(){baseSettings();const content=document.getElementById('page-content');if(content)content.insertAdjacentHTML('beforeend',pwaCard())}

  async function installApp(){if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;if(AppState.currentTab==='settings')renderSettingsV43()}
  function showBanner(text,kind='info',action=''){let b=document.getElementById('app-status-banner');if(!b){b=document.createElement('div');b.id='app-status-banner';document.body.prepend(b)}b.className=`app-status-banner ${kind}`;b.innerHTML=`<span>${text}</span>${action}`;}
  function hideBanner(){document.getElementById('app-status-banner')?.remove()}
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(AppState.currentTab==='settings')renderSettingsV43()});
  window.addEventListener('offline',()=>showBanner('أنت الآن دون اتصال — القرآن والأذكار والبيانات المحفوظة ما زالت متاحة.','warning'));
  window.addEventListener('online',()=>{showBanner('عاد الاتصال بالإنترنت.','success');setTimeout(hideBanner,2500)});
  if(!navigator.onLine)showBanner('أنت الآن دون اتصال — يتم استخدام المحتوى والمواقيت المحفوظة.','warning');

  if('serviceWorker'in navigator){navigator.serviceWorker.ready.then(reg=>{if(reg.waiting)showBanner('يتوفر تحديث جديد للتطبيق.','info','<button onclick="applyZadUpdate()">تحديث الآن</button>');reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showBanner('يتوفر تحديث جديد للتطبيق.','info','<button onclick="applyZadUpdate()">تحديث الآن</button>')})})});let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshing){refreshing=true;location.reload()}})}
  function applyUpdate(){navigator.serviceWorker.ready.then(reg=>reg.waiting?.postMessage({type:'SKIP_WAITING'}))}

  window.renderHome=renderHomeV43;window.renderSettings=renderSettingsV43;window.renderTasbeeh=renderTasbeehV43;window.incrementTasbeeh=incrementTasbeehV43;window.updateDhikrCount=updateDhikrCountV43;window.toggleZadVibration=toggleVibration;window.exportZadData=exportData;window.chooseZadImport=chooseImport;window.importZadData=importData;
  window.enablePrayerAlerts=enablePrayerAlerts;window.disablePrayerAlerts=disablePrayerAlerts;window.installZadApp=installApp;window.applyZadUpdate=applyUpdate;
  setInterval(checkPrayerAlert,30000);setTimeout(checkPrayerAlert,3000);
})();
