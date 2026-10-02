/* Beta 5.2 simplified home — UI only */
(function () {
    'use strict';

    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));

    function loadStored(key) {
        try {
            if (typeof Storage !== 'undefined' && typeof Storage.load === 'function') {
                const value = Storage.load(key);
                if (value !== null && value !== undefined) return value;
            }
        } catch (_) {}
        try { return JSON.parse(localStorage.getItem(key) || 'null'); }
        catch (_) { return null; }
    }

    function lastRead() {
        for (const key of ['zad_quran_last_read', 'quran_last_read', 'last_read', 'quran_last_position']) {
            const value = loadStored(key);
            if (value && typeof value === 'object') return value;
        }
        return null;
    }

    function prayerTimes() {
        try { return typeof PrayerTimes !== 'undefined' && Array.isArray(PrayerTimes) ? PrayerTimes : []; }
        catch (_) { return []; }
    }

    function appState() {
        try { return typeof AppState !== 'undefined' && AppState ? AppState : null; }
        catch (_) { return null; }
    }

    function savedLocation() {
        try {
            if (typeof window.getManualLocation === 'function') {
                const manual = window.getManualLocation();
                if (manual) return manual;
            }
        } catch (_) {}
        try { return JSON.parse(localStorage.getItem('user_location') || 'null'); }
        catch (_) { return null; }
    }

    window.openHomeLastRead = async function () {
        const position = lastRead();
        if (!position) { window.loadTab?.('quran'); return; }
        const surah = Number(position.surah || position.surahNumber || position.surahId || 1);
        const ayah = Number(position.ayah || position.ayahNumber || 1);
        if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) {
            window.loadTab?.('quran'); return;
        }
        window.loadTab?.('quran');
        const started = Date.now();
        while (document.querySelector('#page-content .quran-loading') && Date.now() - started < 15000) {
            await new Promise(resolve => setTimeout(resolve, 40));
        }
        if (!document.querySelector('#page-content .quran-error')) window.openSurah?.(surah, ayah);
    };

    function toDateToday(time, dayOffset = 0) {
        if (!/^\d{2}:\d{2}$/.test(String(time || ''))) return null;
        const [h, m] = time.split(':').map(Number);
        const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d;
    }

    function prayerWindow(times) {
        const now = new Date();
        const list = times.filter(p => p.name !== 'الشروق' && /^\d{2}:\d{2}$/.test(String(p.time || '')));
        if (!list.length) return {};
        let nextIndex = list.findIndex(p => toDateToday(p.time) > now);
        if (nextIndex < 0) nextIndex = 0;
        const next = {...list[nextIndex], at: toDateToday(list[nextIndex].time, nextIndex === 0 && toDateToday(list[0].time) <= now ? 1 : 0)};
        let currentIndex = nextIndex - 1;
        if (currentIndex < 0) currentIndex = list.length - 1;
        const current = list[currentIndex];
        const currentAt = toDateToday(current.time, (nextIndex === 0 && next.at.getDate() !== now.getDate()) ? 0 : (nextIndex === 0 ? -1 : 0));
        return {current, currentAt, next};
    }

    function durationText(ms) {
        const sec = Math.max(0, Math.floor(ms / 1000));
        return `${String(Math.floor(sec/3600)).padStart(2,'0')}:${String(Math.floor(sec%3600/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    }

    function refreshHomePrayerClock() {
        const times = prayerTimes(); const win = prayerWindow(times); const now = new Date();
        const currentCount = document.getElementById('home-current-countdown');
        const nextCount = document.getElementById('home-next-countdown');
        const currentLabel = document.getElementById('home-current-label');
        const nextLabel = document.getElementById('home-next-label');
        if (currentLabel) currentLabel.textContent = win.current?.name || 'حدد موقعك';
        if (nextLabel) nextLabel.textContent = win.next?.name || '--';
        if (currentCount) currentCount.textContent = win.next ? durationText(win.next.at - now) : '--:--:--';
        if (nextCount) nextCount.textContent = win.next ? durationText(win.next.at - now) : '--:--:--';
    }

    window.renderHome = function renderHomeSimplified() {
        const content = document.getElementById('page-content'); if (!content) return; content.className = 'fade-in';
        const times = prayerTimes(); const win = prayerWindow(times); const ayah = window.getRandomAyah?.() || {};
        const location = savedLocation();
        let locationText = 'حدد الموقع من الإعدادات';
        if (location?.city) locationText = location.city;
        else if (Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lon))) locationText = `${Number(location.lat).toFixed(3)}، ${Number(location.lon).toFixed(3)}`;
        const cache = loadStored('zad_prayer_v42_cache');
        const updatedText = cache?.fetchedAt ? new Date(cache.fetchedAt).toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'}) : '--:--';
        const savedPosition = lastRead();
        const lastText = savedPosition ? `سورة ${esc(savedPosition.surah || savedPosition.surahNumber || savedPosition.surahId || '')} • آية ${esc(savedPosition.ayah || savedPosition.ayahNumber || 1)}` : 'ابدأ القراءة وسيُحفظ موضعك';
        const prayerCards = times.filter(p => p.name !== 'الشروق').slice(0,5);
        content.innerHTML = `<div class="home-v2">
          <section class="home-hero prayer-dashboard" aria-label="الصلاة والمواقيت">
            <div class="prayer-hero-main">
              <div class="prayer-current"><small>الصلاة الحالية</small><strong id="home-current-label">${esc(win.current?.name || 'حدد موقعك')}</strong><span>تنتهي بعد</span><b id="home-current-countdown">--:--:--</b></div>
              <div class="prayer-next"><small>الصلاة القادمة</small><strong id="home-next-label">${esc(win.next?.name || '--')}</strong><span>بعد</span><b id="home-next-countdown">--:--:--</b></div>
            </div>
            <div class="prayer-progress"><span></span></div>
            <div class="home-location"><i class="fas fa-circle-check"></i> تم التحديث: ${esc(updatedText)} <i class="fas fa-location-dot"></i> ${esc(locationText)}</div>
            <div class="home-prayers-mini">${prayerCards.map(p=>`<div class="${p.name===win.current?.name?'current':''}"><b>${esc(p.name)}</b><span>${esc(p.time||'--:--')}</span></div>`).join('')}</div>
          </section>
          <section class="home-actions" aria-label="اختصارات">
            <button class="home-action" onclick="loadTab('quran')"><i class="fas fa-book-quran"></i><span>القرآن</span></button>
            <button class="home-action" onclick="loadTab('adhkar')"><i class="fas fa-hands-praying"></i><span>الأذكار</span></button>
            <button class="home-action" onclick="loadTab('audio-quran')"><i class="fas fa-headphones"></i><span>استماع</span></button>
          </section>
          <section class="home-section"><div class="home-section-head"><strong>آخر قراءة</strong><button class="home-link" onclick="loadTab('quran')">المصحف</button></div><button class="home-continue" onclick="openHomeLastRead()"><i class="fas fa-bookmark"></i><div><strong>متابعة القراءة</strong><small>${lastText}</small></div><i class="fas fa-chevron-left"></i></button></section>
          ${ayah.text?`<section class="home-ayah"><p>${esc(ayah.text)}</p><small>${esc(ayah.reference||'')}</small></section>`:''}
        </div>`;
        refreshHomePrayerClock(); clearInterval(window.__homePrayerClock); window.__homePrayerClock=setInterval(refreshHomePrayerClock,1000);
    };

    document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
        const state = appState();
        if (!state?.currentTab || state.currentTab === 'home') window.renderHome?.();
    }, 0));
})();
