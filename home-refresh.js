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

    window.renderHome = function renderHomeSimplified() {
        const content = document.getElementById('page-content');
        if (!content) return;
        content.className = 'fade-in';

        const state = appState();
        const today = new Date().toDateString();
        if (state && (!state.prayerLog || state.prayerLog.date !== today)) {
            state.prayerLog = { date: today, list: Array(5).fill(false) };
            try { if (typeof Storage !== 'undefined') Storage.save('prayer_v3', state.prayerLog); }
            catch (_) {}
        }

        const times = prayerTimes();
        const hasTimes = times.some(prayer => /^\d{2}:\d{2}$/.test(String(prayer.time || '')));
        let currentName = '';
        try {
            if (hasTimes && typeof getCurrentPrayer === 'function') currentName = getCurrentPrayer() || '';
        } catch (_) {}
        const current = times.find(prayer => prayer.name === currentName && /^\d{2}:\d{2}$/.test(String(prayer.time || '')));
        const ayah = window.getRandomAyah?.() || {};
        const reminder = window.getRandomReminder?.() || '';
        const location = savedLocation();
        let locationText = 'اضغط أيقونة الموقع لاختيار مدينتك';
        if (location?.city) locationText = location.city;
        else if (Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lon))) {
            locationText = `${Number(location.lat).toFixed(3)}، ${Number(location.lon).toFixed(3)}`;
        }

        const savedLog = Array.isArray(state?.prayerLog?.list) ? state.prayerLog.list : [];
        const done = savedLog.filter(Boolean).length;
        const savedPosition = lastRead();
        const lastText = savedPosition
            ? `سورة ${esc(savedPosition.surah || savedPosition.surahNumber || savedPosition.surahId || '')} • آية ${esc(savedPosition.ayah || savedPosition.ayahNumber || 1)}`
            : 'ابدأ القراءة وسيُحفظ موضعك';
        const prayerCards = times.filter(prayer => prayer.name !== 'الشروق').slice(0, 5);

        content.innerHTML = `<div class="home-v2">
            <section class="home-hero" aria-label="الصلاة والمواقيت">
                <div class="home-eyebrow">الصلاة الحالية</div>
                <div class="home-prayer-line"><strong>${esc(current?.name || 'حدد موقعك')}</strong><span>${esc(current?.time || '--:--')}</span></div>
                <div class="home-location"><i class="fas fa-location-dot" aria-hidden="true"></i> ${esc(locationText)}</div>
                <div class="home-prayers-mini">${prayerCards.map(prayer => `<div class="${prayer.name === currentName ? 'current' : ''}"><b>${esc(prayer.name)}</b><span>${esc(prayer.time || '--:--')}</span></div>`).join('')}</div>
            </section>
            <section class="home-actions" aria-label="اختصارات">
                <button class="home-action" onclick="loadTab('quran')"><i class="fas fa-book-quran" aria-hidden="true"></i><span>القرآن</span></button>
                <button class="home-action" onclick="loadTab('adhkar')"><i class="fas fa-hands-praying" aria-hidden="true"></i><span>الأذكار</span></button>
                <button class="home-action" onclick="loadTab('audio-quran')"><i class="fas fa-headphones" aria-hidden="true"></i><span>استماع</span></button>
                <button class="home-action" onclick="loadTab('more')"><i class="fas fa-ellipsis" aria-hidden="true"></i><span>المزيد</span></button>
            </section>
            <section class="home-section">
                <div class="home-section-head"><strong>آخر قراءة</strong><button class="home-link" onclick="loadTab('quran')">المصحف</button></div>
                <button class="home-continue" onclick="openHomeLastRead()"><i class="fas fa-bookmark" aria-hidden="true"></i><div><strong>متابعة القراءة</strong><small>${lastText}</small></div><i class="fas fa-chevron-left" aria-hidden="true"></i></button>
            </section>
            <section class="home-section">
                <div class="home-section-head"><strong>ورد الصلاة اليومي</strong><button class="home-link" onclick="loadTab('more')">التفاصيل</button></div>
                <div class="home-progress-row"><div class="progress-bar"><div class="progress-fill" style="width:${Math.round(done / 5 * 100)}%"></div></div><small>${done} من 5</small></div>
            </section>
            ${ayah.text ? `<section class="home-ayah"><p>${esc(ayah.text)}</p><small>${esc(ayah.reference || '')}</small></section>` : ''}
            ${reminder ? `<div class="home-reminder"><i class="fas fa-lightbulb" aria-hidden="true"></i> ${esc(reminder)}</div>` : ''}
        </div>`;
    };

    document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
        const state = appState();
        if (!state?.currentTab || state.currentTab === 'home') window.renderHome?.();
    }, 0));
})();
