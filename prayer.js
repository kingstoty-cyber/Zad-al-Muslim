// Zad Al-Muslim v4.2 — verified prayer times and Qibla
(function () {
    'use strict';

    const API = 'https://api.aladhan.com/v1/timings';
    const KAABA = { lat: 21.422487, lon: 39.826206 };
    const CACHE_KEY = 'zad_prayer_v42_cache';
    const SETTINGS_KEY = 'zad_prayer_v42_settings';
    const METHODS = {
        3: 'رابطة العالم الإسلامي', 5: 'الهيئة المصرية العامة للمساحة',
        4: 'جامعة أم القرى – مكة', 18: 'تونس', 19: 'الجزائر', 21: 'المغرب'
    };
    const DEFAULTS = { method: 3, school: 0, timeFormat: '24', offsets: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 } };
    const prayerMap = [
        ['الفجر', 'fajr'], ['الشروق', 'sunrise'], ['الظهر', 'dhuhr'],
        ['العصر', 'asr'], ['المغرب', 'maghrib'], ['العشاء', 'isha']
    ];
    let countdownTimer = null;
    let compassHandler = null;
    let compassTimeout = null;

    function safeJSON(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } }
    function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
    function settings() {
        const saved = safeJSON(SETTINGS_KEY) || {};
        return { ...DEFAULTS, ...saved, offsets: { ...DEFAULTS.offsets, ...(saved.offsets || {}) } };
    }
    function saveSettings(next) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); }
    function cleanTime(value) { return String(value || '').match(/\d{1,2}:\d{2}/)?.[0]?.padStart(5, '0') || '--:--'; }
    function displayTime(value) {
        const raw = cleanTime(value);
        if (raw === '--:--' || settings().timeFormat !== '12') return raw;
        const [hour, minute] = raw.split(':').map(Number);
        return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'ص' : 'م'}`;
    }
    function todayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    function validLocation(loc) {
        return loc && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lon)) &&
            Number(loc.lat) >= -90 && Number(loc.lat) <= 90 && Number(loc.lon) >= -180 && Number(loc.lon) <= 180;
    }
    function locationLabel(loc) {
        if (!loc) return 'الموقع غير محدد';
        const name = loc.city ? `${escapeHTML(loc.city)}${loc.country ? '، ' + escapeHTML(loc.country) : ''}` : `${Number(loc.lat).toFixed(4)}، ${Number(loc.lon).toFixed(4)}`;
        const source = loc.source === 'manual' ? 'يدوي' : loc.source === 'gps' ? 'GPS' : 'تقريبي عبر الشبكة';
        return `${name} — ${source}`;
    }
    function currentLocation() {
        const manual = typeof getManualLocation === 'function' ? getManualLocation() : safeJSON('manual_location');
        if (validLocation(manual)) return manual;
        const saved = safeJSON('user_location');
        return validLocation(saved) ? saved : null;
    }
    function gpsLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error('الموقع غير مدعوم'));
            navigator.geolocation.getCurrentPosition(p => {
                const loc = { lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy, source: 'gps', timestamp: Date.now() };
                localStorage.setItem('user_location', JSON.stringify(loc)); resolve(loc);
            }, () => reject(new Error('تعذر تحديد الموقع. أدخله يدوياً أو اسمح بخدمة الموقع.')),
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 30 * 60 * 1000 });
        });
    }
    function cacheMatches(c, loc, s) {
        return c && c.date === todayKey() && Math.abs(c.lat - loc.lat) < .002 && Math.abs(c.lon - loc.lon) < .002 &&
            c.method === Number(s.method) && c.school === Number(s.school) && JSON.stringify(c.offsets) === JSON.stringify(s.offsets);
    }
    function applyTimes(times) {
        PrayerTimes = prayerMap.map(([name, key]) => ({ name, time: cleanTime(times[key]) }));
    }
    async function fetchTimes(loc, force) {
        const s = settings(); const cached = safeJSON(CACHE_KEY);
        if (!force && cacheMatches(cached, loc, s)) { applyTimes(cached.times); return cached; }
        const tune = [0, s.offsets.fajr, s.offsets.sunrise, s.offsets.dhuhr, s.offsets.asr, s.offsets.maghrib, 0, s.offsets.isha, 0].join(',');
        const params = new URLSearchParams({ latitude: loc.lat, longitude: loc.lon, method: s.method, school: s.school, tune });
        const response = await fetch(`${API}/${Math.floor(Date.now() / 1000)}?${params}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('تعذر الاتصال بمصدر المواقيت');
        const json = await response.json();
        if (json.code !== 200 || !json.data?.timings) throw new Error('استجابة غير صالحة من مصدر المواقيت');
        const t = json.data.timings;
        const times = { fajr: cleanTime(t.Fajr), sunrise: cleanTime(t.Sunrise), dhuhr: cleanTime(t.Dhuhr), asr: cleanTime(t.Asr), maghrib: cleanTime(t.Maghrib), isha: cleanTime(t.Isha) };
        const entry = { date: todayKey(), lat: Number(loc.lat), lon: Number(loc.lon), location: loc, method: Number(s.method), school: Number(s.school), offsets: s.offsets, times, timezone: json.data.meta?.timezone || '', fetchedAt: Date.now(), stale: false };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
        localStorage.setItem('cached_prayer_times', JSON.stringify({ date: new Date().toDateString(), location: loc, times, source: 'api', timestamp: Date.now() }));
        applyTimes(times); return entry;
    }
    async function updatePrayerTimesV42(force = false) {
        let loc = currentLocation();
        try {
            if (!loc) loc = await gpsLocation();
            await fetchTimes(loc, force); if (AppState.currentTab === 'home') renderHomeV42(); return true;
        }
        catch (error) {
            const cached = safeJSON(CACHE_KEY);
            const samePlace = !loc || (Math.abs(Number(cached?.lat) - Number(loc.lat)) < .02 && Math.abs(Number(cached?.lon) - Number(loc.lon)) < .02);
            if (cached?.times && samePlace) { cached.stale = true; applyTimes(cached.times); if (AppState.currentTab === 'home') renderHomeV42(); }
            else if (loc) PrayerTimes = prayerMap.map(([name]) => ({ name, time: '--:--' }));
            throw error;
        }
    }
    async function updateWithFeedback() {
        const btn = document.getElementById('prayer-refresh'); if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ التحديث'; }
        try { await updatePrayerTimesV42(true); alert('تم تحديث المواقيت من المصدر بنجاح.'); }
        catch (e) { alert(`${e.message}\nسيستمر عرض آخر مواقيت موثوقة إن كانت محفوظة.`); }
        finally { if (AppState.currentTab === 'home') renderHomeV42(); }
    }
    function prayerStatus() {
        const cache = safeJSON(CACHE_KEY);
        if (!cache) return { text: 'لم تُحمّل مواقيت موثوقة بعد', cls: 'warning' };
        const loc = currentLocation();
        if (loc && (Math.abs(Number(cache.lat) - Number(loc.lat)) >= .02 || Math.abs(Number(cache.lon) - Number(loc.lon)) >= .02)) {
            return { text: 'المواقيت المحفوظة تخص موقعًا آخر — يلزم تحديث ناجح', cls: 'warning' };
        }
        const stale = cache.date !== todayKey() || cache.stale;
        return { text: stale ? `آخر مواقيت محفوظة — ${new Date(cache.fetchedAt).toLocaleString('ar')}` : `محدّثة اليوم عبر AlAdhan${cache.timezone ? ' — ' + cache.timezone : ''}`, cls: stale ? 'warning' : 'ok' };
    }
    function nextPrayer() {
        const now = new Date(); const list = PrayerTimes.filter(p => p.name !== 'الشروق' && /^\d\d:\d\d$/.test(p.time));
        for (const p of list) { const [h, m] = p.time.split(':').map(Number); const at = new Date(now); at.setHours(h, m, 0, 0); if (at > now) return { ...p, at }; }
        const fajr = list[0]; if (!fajr) return null; const [h, m] = fajr.time.split(':').map(Number); const at = new Date(now); at.setDate(at.getDate() + 1); at.setHours(h, m, 0, 0); return { ...fajr, at };
    }
    function updateCountdown() {
        const el = document.getElementById('next-prayer-countdown'); const name = document.getElementById('next-prayer-name'); const next = nextPrayer();
        if (!el || !next) return; const diff = Math.max(0, next.at - new Date()); const sec = Math.floor(diff / 1000);
        el.textContent = `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor(sec % 3600 / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
        if (name) name.textContent = `${next.name} — ${displayTime(next.time)}`;
    }
    function renderHomeV42() {
        if (countdownTimer) clearInterval(countdownTimer);
        const content = document.getElementById('page-content'); if (!content) return; content.className = 'fade-in';
        const day = new Date().toDateString(); if (AppState.prayerLog.date !== day) { AppState.prayerLog = { date: day, list: Array(5).fill(false) }; Storage.save('prayer_v3', AppState.prayerLog); }
        const loc = currentLocation(); const status = prayerStatus(); const next = nextPrayer(); const ayah = getRandomAyah(); const reminder = getRandomReminder();
        content.innerHTML = `
          <div class="card next-prayer-card"><div class="card-title"><i class="fas fa-hourglass-half"></i> الصلاة القادمة</div>
            <div id="next-prayer-name" class="next-prayer-name">${next ? `${next.name} — ${displayTime(next.time)}` : 'حدد موقعك لتحميل المواقيت'}</div>
            <div id="next-prayer-countdown" class="countdown">--:--:--</div></div>
          <div class="card"><div class="card-title"><i class="fas fa-mosque"></i> مواقيت الصلاة الدقيقة</div>
            <div class="prayer-times">${PrayerTimes.map(p => `<div class="prayer-time ${p.name === 'الشروق' ? 'sunrise' : ''}"><div class="name">${p.name}</div><div class="time">${displayTime(p.time)}</div></div>`).join('')}</div>
            <div class="prayer-meta"><div><i class="fas fa-location-dot"></i> ${locationLabel(loc)}</div><div class="source-status ${status.cls}"><i class="fas fa-circle-check"></i> ${status.text}</div></div>
            <div class="prayer-actions"><button id="prayer-refresh" class="btn-primary" onclick="updatePrayerTimesWithFeedback()"><i class="fas fa-rotate"></i> تحديث دقيق</button><button class="btn-primary qibla-button" onclick="renderQibla()"><i class="fas fa-compass"></i> اتجاه القبلة</button></div>
            <p class="accuracy-note">قد تختلف المواقيت دقائق قليلة حسب اعتماد مسجدك المحلي؛ اختر طريقة الحساب المناسبة واضبط الفروق من الإعدادات.</p>
          </div>
          <div class="card"><div class="card-title"><i class="fas fa-calendar-check"></i> متابعة الصلوات</div>
            ${['الفجر','الظهر','العصر','المغرب','العشاء'].map((p,i)=>`<div class="list-item"><span>${p}</span><input type="checkbox" ${AppState.prayerLog.list[i]?'checked':''} onchange="togglePrayer(${i})"></div>`).join('')}
            <div class="progress-bar"><div class="progress-fill" style="width:${AppState.prayerLog.list.filter(Boolean).length*20}%"></div></div><div class="progress-caption">${AppState.prayerLog.list.filter(Boolean).length} من 5 صلوات</div></div>
          <div class="card smart-reminder"><div class="card-title"><i class="fas fa-lightbulb"></i> تذكير اليوم</div><p class="center-text">${reminder}</p></div>
          <div class="ayah-of-day"><p class="ayah-text">${ayah.text}</p><p class="ayah-reference">${ayah.reference}</p></div>`;
        updateCountdown(); countdownTimer = setInterval(updateCountdown, 1000);
    }
    function bearing(lat, lon) {
        const r = Math.PI / 180, p1 = lat*r, p2 = KAABA.lat*r, dl = (KAABA.lon-lon)*r;
        return (Math.atan2(Math.sin(dl), Math.cos(p1)*Math.tan(p2)-Math.sin(p1)*Math.cos(dl))/r+360)%360;
    }
    function directionName(d) { return ['الشمال','الشمال الشرقي','الشرق','الجنوب الشرقي','الجنوب','الجنوب الغربي','الغرب','الشمال الغربي'][Math.round(d/45)%8]; }
    function renderQibla() {
        if (countdownTimer) clearInterval(countdownTimer); const content = document.getElementById('page-content'); const loc = currentLocation();
        if (!loc) { content.innerHTML = `<div class="card"><div class="card-title"><i class="fas fa-compass"></i> القبلة</div><p>يلزم تحديد موقعك أولاً لحساب اتجاه القبلة.</p><button class="btn-primary" onclick="document.getElementById('manual-toggle').click()">تحديد الموقع</button><button class="btn-secondary" onclick="renderHome()">عودة</button></div>`; return; }
        const q = bearing(Number(loc.lat), Number(loc.lon));
        content.innerHTML = `<div class="card qibla-card"><div class="card-title"><i class="fas fa-kaaba"></i> اتجاه القبلة</div><p>${locationLabel(loc)}</p>
          <div class="compass"><div class="compass-mark north">ش</div><div class="compass-mark east">ق</div><div class="compass-mark south">ج</div><div class="compass-mark west">غ</div><div id="qibla-needle" class="qibla-needle" style="transform:rotate(${q}deg)"><i class="fas fa-location-arrow"></i></div></div>
          <div class="qibla-degree"><strong>${q.toFixed(1)}°</strong> من الشمال — ${directionName(q)}</div><div id="compass-status" class="accuracy-note" role="status">السهم ثابت بالنسبة للشمال. اضغط تشغيل البوصلة ثم حرّك الهاتف.</div>
          <div class="prayer-actions"><button id="compass-start" class="btn-primary" onclick="startQiblaCompass()"><i class="fas fa-compass"></i> تشغيل البوصلة</button><button class="btn-primary qibla-button" onclick="renderHome()">عودة للرئيسية</button></div>
          <p class="accuracy-note">ضع الهاتف أفقياً، وابتعد عن المعادن والمغناطيس. البوصلة وسيلة مساعدة وقد تحتاج إلى معايرة بحركة الرقم 8.</p></div>`;
        window.__qiblaBearing = q;
    }
    async function startCompass() {
        if (typeof DeviceOrientationEvent === 'undefined') return alert('مستشعر البوصلة غير متاح في هذا الجهاز أو المتصفح. استخدم الدرجة المعروضة مع بوصلة خارجية.');
        try {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                const result = await DeviceOrientationEvent.requestPermission();
                if (result !== 'granted') return alert('لم يتم منح إذن البوصلة. فعّل إذن الحركة والاتجاه للموقع من إعدادات المتصفح.');
            }
        } catch (_) { return alert('تعذر طلب إذن البوصلة. افتح الموقع عبر HTTPS واسمح بالحركة والاتجاه.'); }
        if (compassHandler) {
            window.removeEventListener('deviceorientationabsolute', compassHandler, true);
            window.removeEventListener('deviceorientation', compassHandler, true);
        }
        let readings = 0;
        const status = document.getElementById('compass-status');
        const button = document.getElementById('compass-start');
        if (status) status.textContent = 'جارٍ انتظار مستشعر الاتجاه… حرّك الهاتف بحركة الرقم 8.';
        if (button) button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> البوصلة تعمل';
        compassHandler = e => {
            let heading = null;
            if (Number.isFinite(e.webkitCompassHeading)) heading = e.webkitCompassHeading;
            else if (Number.isFinite(e.alpha)) {
                const screenAngle = Number(screen.orientation?.angle ?? window.orientation ?? 0) || 0;
                heading = (360 - e.alpha + screenAngle + 360) % 360;
            }
            if (heading === null) return;
            readings += 1;
            const needle = document.getElementById('qibla-needle');
            if (needle) needle.style.transform = `rotate(${window.__qiblaBearing - heading}deg)`;
            const s = document.getElementById('compass-status');
            if (s) s.textContent = `البوصلة نشطة — اتجاه الهاتف ${heading.toFixed(0)}°. اجعل السهم متجهًا إلى أعلى الشاشة.`;
            if (readings === 1 && compassTimeout) clearTimeout(compassTimeout);
        };
        window.addEventListener('deviceorientationabsolute', compassHandler, true);
        window.addEventListener('deviceorientation', compassHandler, true);
        compassTimeout = setTimeout(() => {
            if (readings) return;
            const s = document.getElementById('compass-status');
            if (s) s.textContent = 'لم يرسل الهاتف بيانات البوصلة. فعّل إذن الحركة/المستشعرات في Chrome، وأوقف توفير الطاقة، ثم أعد المحاولة.';
            if (button) button.innerHTML = '<i class="fas fa-rotate"></i> إعادة المحاولة';
        }, 7000);
    }
    const oldSettings = window.renderSettings || renderSettings;
    function renderSettingsV42() {
        oldSettings(); const content=document.getElementById('page-content'); const first=content.querySelector('.card'); const s=settings();
        const title=document.createElement('h3');title.className='settings-group-title';title.textContent='الصلاة والمواقيت';
        const card=document.createElement('div'); card.className='card prayer-settings settings-card'; card.innerHTML=`<div class="card-title"><i class="fas fa-sliders"></i> إعدادات الصلاة الدقيقة</div>
          <label>طريقة الحساب<select id="calc-method">${Object.entries(METHODS).map(([id,n])=>`<option value="${id}" ${Number(s.method)===Number(id)?'selected':''}>${n}</option>`).join('')}</select></label>
          <label>مذهب العصر<select id="asr-school"><option value="0" ${Number(s.school)===0?'selected':''}>الشافعي / المالكي / الحنبلي</option><option value="1" ${Number(s.school)===1?'selected':''}>الحنفي</option></select></label>
          <label>تنسيق الوقت<select id="prayer-time-format"><option value="24" ${s.timeFormat==='24'?'selected':''}>24 ساعة — 17:30</option><option value="12" ${s.timeFormat==='12'?'selected':''}>12 ساعة — 5:30 م</option></select></label>
          <div class="offset-grid">${prayerMap.map(([n,k])=>`<label>${n}<input type="number" id="offset-${k}" min="-30" max="30" value="${s.offsets[k]||0}"><small>دقيقة</small></label>`).join('')}</div>
          <button class="btn-primary" onclick="savePrayerSettings()"><i class="fas fa-floppy-disk"></i> حفظ وتحديث المواقيت</button><p class="accuracy-note">اضبط الفروق فقط بعد مقارنة مواقيت التطبيق بجدول المسجد أو الجهة المعتمدة في مدينتك.</p>`;
        const anchor=first?.nextSibling||first;content.insertBefore(title,anchor);content.insertBefore(card,anchor);
        content.querySelectorAll('p').forEach(p=>{if(p.textContent.includes('الإصدار 4.1'))p.innerHTML=p.innerHTML.replace('الإصدار 4.1','الإصدار 4.2');});
    }
    async function savePrayerSettingsUI() {
        const old=settings(), next={method:Number(document.getElementById('calc-method').value),school:Number(document.getElementById('asr-school').value),timeFormat:document.getElementById('prayer-time-format')?.value==='12'?'12':'24',offsets:{}};
        prayerMap.forEach(([,k])=>next.offsets[k]=Math.max(-30,Math.min(30,Number(document.getElementById(`offset-${k}`).value)||0)));
        saveSettings(next); try { await updatePrayerTimesV42(true); alert('تم حفظ الإعدادات وتحديث المواقيت.'); } catch(e) { saveSettings(old); alert(`تعذر التحديث: ${e.message}\nأعيدت الإعدادات السابقة.`); } renderSettingsV42();
    }
    window.renderHome = renderHomeV42; window.renderSettings = renderSettingsV42; window.updatePrayerTimes = updatePrayerTimesV42;
    window.updatePrayerTimesWithFeedback = updateWithFeedback; window.renderQibla = renderQibla; window.startQiblaCompass = startCompass; window.savePrayerSettings = savePrayerSettingsUI;
    const initialCache = safeJSON(CACHE_KEY);
    const initialLocation = currentLocation();
    const initialMatches = !initialLocation || (Math.abs(Number(initialCache?.lat) - Number(initialLocation.lat)) < .02 && Math.abs(Number(initialCache?.lon) - Number(initialLocation.lon)) < .02);
    if (initialCache?.times && initialMatches) applyTimes(initialCache.times);
    else {
        localStorage.removeItem('cached_prayer_times');
        PrayerTimes = prayerMap.map(([name]) => ({ name, time: '--:--' }));
    }
})();
