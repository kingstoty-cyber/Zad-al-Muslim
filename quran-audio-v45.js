/* زاد المسلم v4.5.0 — تلاوة آية بآية مع الحفظ دون اتصال
 * مصدر الملفات: EveryAyah.com. لا تُضمَّن ملفات صوتية داخل التطبيق.
 */
(function () {
    'use strict';

    const AUDIO_ROOT = 'https://everyayah.com/data/';
    const CACHE_NAME = 'zad-quran-audio-v45';
    const KEYS = {
        settings: 'zad_audio_settings',
        last: 'zad_audio_last',
        downloads: 'zad_audio_downloads'
    };
    const RECITERS = [
        {id: 'Alafasy_64kbps', name: 'مشاري راشد العفاسي', quality: '64 kbps'},
        {id: 'Husary_64kbps', name: 'محمود خليل الحصري', quality: '64 kbps'},
        {id: 'Abdul_Basit_Murattal_64kbps', name: 'عبد الباسط عبد الصمد — مرتل', quality: '64 kbps'},
        {id: 'Abdurrahmaan_As-Sudais_64kbps', name: 'عبد الرحمن السديس', quality: '64 kbps'},
        {id: 'Minshawy_Murattal_128kbps', name: 'محمد صديق المنشاوي — مرتل', quality: '128 kbps'}
    ];
    const DEFAULTS = {reciter: RECITERS[0].id, repeat: 1, speed: 1};
    let settings = readJson(KEYS.settings, DEFAULTS);
    let context = null;
    let audio = null;
    let state = {surah: 0, ayah: 0, playingSurah: false, repetitions: 0};
    let saveTimer = 0;
    let downloadCancelled = false;

    function readJson(key, fallback) {
        try { return {...fallback, ...(JSON.parse(localStorage.getItem(key)) || {})}; }
        catch (_) { return {...fallback}; }
    }

    function writeJson(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
    }

    function pad(value) { return String(value).padStart(3, '0'); }
    function audioUrl(surah, ayah, reciter = settings.reciter) {
        return `${AUDIO_ROOT}${encodeURIComponent(reciter)}/${pad(surah)}${pad(ayah)}.mp3`;
    }

    function getAudio() {
        if (audio) return audio;
        audio = new Audio();
        audio.preload = 'metadata';
        audio.addEventListener('play', updateControls);
        audio.addEventListener('pause', updateControls);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', updateProgress);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onAudioError);
        return audio;
    }

    function injectPlayer(payload) {
        context = payload;
        const ornament = document.querySelector('.surah-ornament');
        if (!ornament) return;
        const initialAyah = clamp(payload.ayahNumber, 1, payload.verses.length);
        state.surah = payload.surahId;
        state.ayah = initialAyah;
        state.playingSurah = false;
        state.repetitions = 0;
        const panel = document.createElement('section');
        panel.id = 'quran-audio-player';
        panel.className = 'quran-audio-player';
        panel.innerHTML = `
            <div class="audio-title"><i class="fas fa-headphones"></i><span><strong>التلاوة الصوتية</strong><small id="audio-now">جاهز للاستماع — الآية ${initialAyah}</small></span><span id="audio-offline-badge" class="audio-badge" hidden>محفوظة</span></div>
            <label class="audio-field"><span>القارئ</span><select id="audio-reciter">${RECITERS.map(r => `<option value="${r.id}" ${r.id === settings.reciter ? 'selected' : ''}>${r.name} (${r.quality})</option>`).join('')}</select></label>
            <div class="audio-controls">
                <button type="button" onclick="quranAudioPrevious()" aria-label="الآية السابقة"><i class="fas fa-backward-step"></i></button>
                <button type="button" id="audio-play" class="audio-play" onclick="toggleQuranAudio()" aria-label="تشغيل"><i class="fas fa-play"></i></button>
                <button type="button" onclick="quranAudioNext()" aria-label="الآية التالية"><i class="fas fa-forward-step"></i></button>
                <button type="button" id="audio-surah-play" onclick="playQuranSurah()"><i class="fas fa-list-ol"></i><span>السورة</span></button>
            </div>
            <div class="audio-progress"><input id="audio-seek" type="range" min="0" max="1000" value="0" aria-label="موضع التلاوة"><output id="audio-time">00:00 / 00:00</output></div>
            <div class="audio-options">
                <label>تكرار الآية<select id="audio-repeat"><option value="1">مرة</option><option value="2">مرتان</option><option value="3">3 مرات</option><option value="5">5 مرات</option><option value="-1">مستمر</option></select></label>
                <label>السرعة<select id="audio-speed"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label>
            </div>
            <div class="audio-downloads">
                <button type="button" id="audio-download" onclick="downloadQuranSurah()"><i class="fas fa-download"></i> تنزيل السورة</button>
                <button type="button" id="audio-delete" onclick="deleteQuranSurahAudio()" hidden><i class="fas fa-trash"></i> حذف التنزيل</button>
                <small id="audio-download-status">التشغيل يحتاج الإنترنت ما لم تُنزّل السورة.</small>
            </div>`;
        ornament.insertAdjacentElement('afterend', panel);
        bindPlayerInputs();
        updateDownloadState();
        updateAyahHighlight();
    }

    function bindPlayerInputs() {
        const repeat = document.getElementById('audio-repeat');
        const speed = document.getElementById('audio-speed');
        repeat.value = String(settings.repeat);
        speed.value = String(settings.speed);
        document.getElementById('audio-reciter').addEventListener('change', event => {
            stopAudio(); settings.reciter = event.target.value; persistSettings(); updateDownloadState();
        });
        repeat.addEventListener('change', event => { settings.repeat = Number(event.target.value); persistSettings(); });
        speed.addEventListener('change', event => {
            settings.speed = Number(event.target.value); getAudio().playbackRate = settings.speed; persistSettings();
        });
        document.getElementById('audio-seek').addEventListener('input', event => {
            const player = getAudio();
            if (Number.isFinite(player.duration)) player.currentTime = player.duration * Number(event.target.value) / 1000;
        });
    }

    function persistSettings() { writeJson(KEYS.settings, settings); }
    function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || min)); }

    async function playAyah(surah, ayah, asSurah = false, restoreSeconds = 0) {
        if (!context || context.surahId !== surah) {
            window.openSurah(surah, ayah);
            setTimeout(() => playAyah(surah, ayah, asSurah, restoreSeconds), 50);
            return;
        }
        const player = getAudio();
        const nextUrl = audioUrl(surah, ayah);
        state = {surah, ayah, playingSurah: asSurah, repetitions: 0};
        if (player.src !== nextUrl) player.src = nextUrl;
        player.playbackRate = settings.speed;
        if (restoreSeconds > 0) player.addEventListener('loadedmetadata', () => { player.currentTime = Math.min(restoreSeconds, Math.max(0, player.duration - 1)); }, {once: true});
        updateAyahHighlight(); updateNow(); updateDownloadState();
        try {
            await player.play();
            setMediaSession();
        } catch (error) {
            showStatus(navigator.onLine ? 'تعذر تشغيل الملف. جرّب قارئًا آخر.' : 'هذه الآية غير محفوظة، اتصل بالإنترنت أولًا.', true);
        }
    }

    function toggleAudio() {
        const player = getAudio();
        if (player.src && !player.paused) return player.pause();
        if (player.src && state.surah === context?.surahId) return player.play().catch(onAudioError);
        const last = readJson(KEYS.last, {});
        const seconds = last.surah === context?.surahId && last.ayah === state.ayah && last.reciter === settings.reciter ? Number(last.seconds) || 0 : 0;
        playAyah(context.surahId, state.ayah, false, seconds);
    }

    function playSurah() { playAyah(context.surahId, state.ayah || 1, true); }
    function previous() { playAyah(state.surah, clamp(state.ayah - 1, 1, context.verses.length), state.playingSurah); }
    function next() { playAyah(state.surah, clamp(state.ayah + 1, 1, context.verses.length), state.playingSurah); }

    function onEnded() {
        if (settings.repeat === -1 || state.repetitions + 1 < settings.repeat) {
            state.repetitions += 1; getAudio().currentTime = 0; getAudio().play().catch(onAudioError); return;
        }
        state.repetitions = 0;
        if (state.playingSurah && state.ayah < context.verses.length) playAyah(state.surah, state.ayah + 1, true);
        else { state.playingSurah = false; updateControls(); showStatus('اكتملت التلاوة'); }
    }

    function onTimeUpdate() {
        updateProgress();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => writeJson(KEYS.last, {surah: state.surah, ayah: state.ayah, seconds: getAudio().currentTime, reciter: settings.reciter, updatedAt: Date.now()}), 500);
    }

    function updateProgress() {
        const player = getAudio();
        const seek = document.getElementById('audio-seek');
        const time = document.getElementById('audio-time');
        if (seek) seek.value = Number.isFinite(player.duration) && player.duration ? Math.round(player.currentTime / player.duration * 1000) : 0;
        if (time) time.textContent = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`;
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '00:00';
        const value = Math.max(0, Math.floor(seconds));
        return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
    }

    function updateControls() {
        const playing = audio && !audio.paused;
        const button = document.getElementById('audio-play');
        if (button) { button.innerHTML = `<i class="fas fa-${playing ? 'pause' : 'play'}"></i>`; button.setAttribute('aria-label', playing ? 'إيقاف مؤقت' : 'تشغيل'); }
        document.getElementById('audio-surah-play')?.classList.toggle('active', Boolean(state.playingSurah));
    }

    function updateNow() {
        const now = document.getElementById('audio-now');
        if (now) now.textContent = `سورة ${context.chapter.name} — الآية ${state.ayah}${state.playingSurah ? ' • تشغيل متتابع' : ''}`;
    }

    function updateAyahHighlight() {
        document.querySelectorAll('.ayah.audio-current').forEach(node => node.classList.remove('audio-current'));
        const target = document.getElementById(`ayah-${state.surah}-${state.ayah}`);
        target?.classList.add('audio-current');
        if (audio && !audio.paused) target?.scrollIntoView({block: 'center', behavior: 'smooth'});
        window.saveReadingPosition?.(state.surah, state.ayah);
    }

    function stopAudio() {
        if (!audio) return;
        audio.pause(); audio.removeAttribute('src'); audio.load(); state.playingSurah = false; updateControls();
    }

    async function isCached(url) {
        if (!('caches' in window)) return false;
        return Boolean(await caches.match(url));
    }

    function downloads() { return readJson(KEYS.downloads, {items: {}}); }
    function downloadKey(surah = context.surahId) { return `${settings.reciter}:${surah}`; }

    async function updateDownloadState() {
        if (!context) return;
        const data = downloads();
        let saved = data.items[downloadKey()];
        if (saved && (!await isCached(audioUrl(context.surahId, 1)) || !await isCached(audioUrl(context.surahId, context.verses.length)))) {
            delete data.items[downloadKey()]; writeJson(KEYS.downloads, data); saved = null;
        }
        const badge = document.getElementById('audio-offline-badge');
        const remove = document.getElementById('audio-delete');
        if (badge) badge.hidden = !saved;
        if (remove) remove.hidden = !saved;
        const currentCached = await isCached(audioUrl(context.surahId, state.ayah));
        document.getElementById(`ayah-${context.surahId}-${state.ayah}`)?.classList.toggle('audio-cached', currentCached);
        updateStorageEstimate();
    }

    async function downloadSurah() {
        if (!context || !('caches' in window)) return showStatus('التنزيل غير مدعوم في هذا المتصفح.', true);
        if (!navigator.onLine) return showStatus('اتصل بالإنترنت لتنزيل السورة.', true);
        const button = document.getElementById('audio-download');
        button.disabled = true; downloadCancelled = false;
        const cache = await caches.open(CACHE_NAME);
        const total = context.verses.length;
        let completed = 0;
        try {
            for (let start = 1; start <= total; start += 3) {
                if (downloadCancelled) throw new Error('cancelled');
                const batch = [];
                for (let ayah = start; ayah < Math.min(start + 3, total + 1); ayah += 1) {
                    batch.push(cacheOne(cache, audioUrl(context.surahId, ayah)).then(() => { completed += 1; showStatus(`جاري التنزيل: ${completed} من ${total}`); }));
                }
                await Promise.all(batch);
            }
            const data = downloads();
            data.items[downloadKey()] = {surah: context.surahId, reciter: settings.reciter, ayahs: total, savedAt: Date.now()};
            writeJson(KEYS.downloads, data);
            showStatus(`تم تنزيل السورة كاملة (${total} آية).`); await updateDownloadState();
        } catch (error) {
            showStatus(error.message === 'cancelled' ? 'أُلغي التنزيل.' : `توقف التنزيل عند ${completed} من ${total}. يمكنك المحاولة مجددًا.`, true);
        } finally { button.disabled = false; }
    }

    async function cacheOne(cache, url) {
        if (await cache.match(url)) return;
        const response = await fetch(url, {mode: 'cors'});
        if (!response.ok || !String(response.headers.get('content-type') || '').includes('audio')) throw new Error('download failed');
        await cache.put(url, response);
    }

    async function deleteSurahAudio() {
        if (!context || !('caches' in window)) return;
        if (!confirm('حذف تلاوة هذه السورة لهذا القارئ من الجهاز؟')) return;
        const cache = await caches.open(CACHE_NAME);
        await Promise.all(context.verses.map(verse => cache.delete(audioUrl(context.surahId, verse.verse))));
        const data = downloads(); delete data.items[downloadKey()]; writeJson(KEYS.downloads, data);
        showStatus('تم حذف التلاوة المحفوظة.'); await updateDownloadState();
    }

    async function clearAllAudioDownloads() {
        const count = Object.keys(downloads().items).length;
        if (!count) return alert('لا توجد سور صوتية منزلة.');
        if (!confirm(`حذف جميع تنزيلات التلاوة (${count}) من هذا الجهاز؟`)) return;
        if ('caches' in window) await caches.delete(CACHE_NAME);
        writeJson(KEYS.downloads, {items: {}});
        alert('تم حذف جميع تنزيلات التلاوة دون المساس بمواضع القراءة أو النص القرآني.');
        renderAudioSettingsCard();
    }

    function audioSettingsMarkup() {
        const items = Object.values(downloads().items);
        const reciterCount = new Set(items.map(item => item.reciter)).size;
        return `<div id="audio-settings-card" class="card audio-settings-card"><div class="card-title"><i class="fas fa-headphones"></i> التلاوات المحفوظة</div><p>السور المنزلة: <strong>${items.length}</strong> • القراء: <strong>${reciterCount}</strong></p><small>ملفات الصوت تبقى على هذا الجهاز ولا تدخل في ملف النسخة الاحتياطية بسبب حجمها.</small><button class="btn-primary danger-btn" onclick="clearAllQuranAudio()" ${items.length ? '' : 'disabled'}><i class="fas fa-trash"></i> حذف جميع التلاوات المنزلة</button></div>`;
    }

    function renderAudioSettingsCard() {
        document.getElementById('audio-settings-card')?.remove();
        document.getElementById('page-content')?.insertAdjacentHTML('beforeend', audioSettingsMarkup());
    }

    async function updateStorageEstimate() {
        const status = document.getElementById('audio-download-status');
        if (!status || !navigator.storage?.estimate) return;
        try {
            const {usage, quota} = await navigator.storage.estimate();
            status.textContent = `مساحة التطبيق: ${formatBytes(usage)} من ${formatBytes(quota)} — التنزيل خاص بالقارئ المحدد.`;
        } catch (_) {}
    }

    function formatBytes(bytes) {
        if (!Number.isFinite(bytes)) return 'غير معروفة';
        if (bytes < 1048576) return `${Math.round(bytes / 1024)} ك.ب`;
        return `${(bytes / 1048576).toFixed(1)} م.ب`;
    }

    function showStatus(message, error = false) {
        const node = document.getElementById('audio-download-status');
        if (node) { node.textContent = message; node.classList.toggle('error', error); }
    }

    function onAudioError() { showStatus(navigator.onLine ? 'تعذر تحميل التلاوة من المصدر.' : 'لا يوجد اتصال وهذه الآية غير محفوظة.', true); updateControls(); }

    function setMediaSession() {
        if (!('mediaSession' in navigator) || !context) return;
        try {
            const reciter = RECITERS.find(item => item.id === settings.reciter);
            navigator.mediaSession.metadata = new MediaMetadata({title: `سورة ${context.chapter.name} — الآية ${state.ayah}`, artist: reciter?.name || 'القرآن الكريم', album: 'زاد المسلم'});
            navigator.mediaSession.setActionHandler('play', () => getAudio().play());
            navigator.mediaSession.setActionHandler('pause', () => getAudio().pause());
            navigator.mediaSession.setActionHandler('previoustrack', previous);
            navigator.mediaSession.setActionHandler('nexttrack', next);
        } catch (_) {}
    }

    const previousHook = window.onQuranSurahOpened;
    const baseSettings = window.renderSettings;
    window.onQuranSurahOpened = payload => { stopAudio(); previousHook?.(payload); injectPlayer(payload); };
    window.playQuranAyah = (surah, ayah) => playAyah(Number(surah), Number(ayah), false);
    window.toggleQuranAudio = toggleAudio;
    window.playQuranSurah = playSurah;
    window.quranAudioPrevious = previous;
    window.quranAudioNext = next;
    window.downloadQuranSurah = downloadSurah;
    window.deleteQuranSurahAudio = deleteSurahAudio;
    window.clearAllQuranAudio = clearAllAudioDownloads;
    if (typeof baseSettings === 'function') {
        window.renderSettings = function () { baseSettings(); renderAudioSettingsCard(); };
    }
})();
