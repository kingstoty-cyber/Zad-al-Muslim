/* Zad Al-Muslim v4.9.3-beta.5.2 — إنشاء فيديو قرآن وحفظه ومشاركته أصليًا على Android. */
(function () {
  'use strict';

  const ROOT = 'https://everyayah.com/data/';
  const SOURCE = 'EveryAyah.com';
  const WEB_MAX_SECONDS = 180;
  const NATIVE_MAX_SECONDS = 300;
  let context = null;
  let dialog = null;
  let recording = false;
  let cancelled = false;
  let resultUrl = '';
  let activeStream = null;
  let activeContext = null;
  let activeTimer = 0;

  const isNative = () => Boolean(window.Capacitor?.isNativePlatform?.());
  const maxSeconds = () => isNative() ? NATIVE_MAX_SECONDS : WEB_MAX_SECONDS;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = value => String(value).padStart(3, '0');
  const reciterId = () => document.getElementById('audio-reciter')?.value || JSON.parse(localStorage.getItem('zad_audio_settings') || '{}').reciter || 'Alafasy_64kbps';
  const reciterName = () => document.getElementById('audio-reciter')?.selectedOptions?.[0]?.textContent?.replace(/\s+—\s+(حفص|ورش).*$/, '') || reciterId();
  const audioUrl = (surah, ayah, id) => `${ROOT}${String(id).split('/').map(encodeURIComponent).join('/')}/${pad(surah)}${pad(ayah)}.mp3`;

  function inject(payload) {
    context = payload;
    const range = document.querySelector('.audio-range');
    if (!range || document.getElementById('quran-video-open')) return;
    range.insertAdjacentHTML('afterend', '<button id="quran-video-open" class="app-button quran-video-open" onclick="openQuranVideoMaker()"><i class="fas fa-video"></i> مشاركة مقطع قرآني</button>');
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('div');
    dialog.className = 'quran-video-dialog';
    dialog.hidden = true;
    dialog.innerHTML = `<section class="quran-video-sheet" role="dialog" aria-modal="true" aria-labelledby="quran-video-title">
      <button class="dialog-close" onclick="closeQuranVideoMaker()" aria-label="إغلاق"><i class="fas fa-xmark"></i></button>
      <h3 id="quran-video-title"><i class="fas fa-video"></i> إنشاء مقطع قرآن</h3>
      <p class="accuracy-note">الفيديو نفسه بلا إطار تطبيق أو أزرار. الحد الأقصى ${maxSeconds()} ثانية، ويُستخدم MP4 عند دعم المتصفح وإلا WebM.</p>
      <div class="quran-video-fields">
        <label>من الآية<input id="video-start" type="number" min="1"></label><label>إلى الآية<input id="video-end" type="number" min="1"></label>
        <label>المدة القصوى<select id="video-duration"><option value="30">30 ثانية</option><option value="60" selected>60 ثانية</option><option value="120">120 ثانية</option><option value="180">180 ثانية</option>${isNative() ? '<option value="300">5 دقائق</option>' : ''}</select></label>
        <label>الخلفية<select id="video-background" onchange="previewQuranVideo()"><option value="black">أسود خالص</option><option value="green">أخضر داكن</option><option value="navy">كحلي داكن</option><option value="blue-gradient">تدرج أزرق</option><option value="green-gradient">تدرج أخضر</option><option value="night">سماء ليلية</option><option value="islamic">زخرفة إسلامية</option><option value="paper">ورق مصحف هادئ</option></select></label>
        <label>المقاس<select id="video-size" onchange="previewQuranVideo()"><option value="story">عمودي — 1080×1920</option><option value="square">مربع — 1080×1080</option><option value="landscape">أفقي — 1920×1080</option></select></label>
        <label>جودة التصدير<select id="video-quality"><option value="compatible">متوافقة</option><option value="high">عالية</option><option value="small">حجم أصغر</option></select></label>
      </div>
      <canvas id="quran-video-canvas" width="540" height="960" aria-label="معاينة المقطع"></canvas>
      <div id="video-progress" class="video-render-progress" hidden><span></span><small>جاري تجهيز الصوت…</small></div>
      <div class="quran-video-actions"><button id="video-create" class="app-button" onclick="createQuranVideo()"><i class="fas fa-film"></i> إنشاء الفيديو</button><button id="video-image" class="app-button" onclick="saveQuranVideoFrame()"><i class="fas fa-image"></i> حفظ صورة</button><button id="video-cancel" class="app-button danger" onclick="cancelQuranVideo()" hidden><i class="fas fa-stop"></i> إلغاء</button></div>
      <div id="video-result" class="quran-video-result"></div>
      <small class="video-compatibility">في Android يتم الحفظ عبر MediaStore والمشاركة عبر Android Sharesheet؛ في الويب يستخدم التنزيل ومشاركة الملفات عند دعمها.</small>
    </section>`;
    dialog.addEventListener('click', event => { if (event.target === dialog && !recording) close(); });
    document.body.appendChild(dialog);
    return dialog;
  }

  function open() {
    if (!context) return alert('افتح سورة أولًا.');
    ensureDialog();
    const max = context.verses.length;
    const start = Math.max(1, Number(document.getElementById('audio-range-start')?.value) || context.ayahNumber || 1);
    const end = Math.min(max, Number(document.getElementById('audio-range-end')?.value) || start);
    for (const [id, value] of [['video-start', start], ['video-end', Math.min(end, start + 2)]]) {
      const input = document.getElementById(id); input.max = max; input.value = value; input.oninput = preview;
    }
    dialog.hidden = false;
    document.body.classList.add('dialog-open');
    preview();
  }

  function stopPreview() {
    const video = document.querySelector('#video-result video');
    if (video) { video.pause(); video.currentTime = 0; video.removeAttribute('src'); video.load(); }
    if (activeTimer) { clearInterval(activeTimer); activeTimer = 0; }
    activeStream?.getTracks().forEach(track => track.stop()); activeStream = null;
    activeContext?.close().catch(() => {}); activeContext = null;
  }

  function close() {
    if (recording) { cancel(); return; }
    stopPreview();
    if (resultUrl) { URL.revokeObjectURL(resultUrl); resultUrl = ''; }
    if (dialog) dialog.hidden = true;
    document.body.classList.remove('dialog-open');
  }

  function selection() {
    const start = Math.max(1, Number(document.getElementById('video-start').value) || 1);
    const end = Math.min(context.verses.length, Number(document.getElementById('video-end').value) || start);
    if (end < start) throw Error('رقم آية النهاية يجب أن يكون بعد البداية.');
    if (end - start + 1 > 30) throw Error('الحد الحالي ثلاثون آية للمقطع الواحد.');
    return {start, end};
  }

  function colors(kind) {
    if (kind === 'green') return ['#061f16','#0d5137','#d9b85b'];
    if (kind === 'navy') return ['#050b1c','#122d59','#d7bd72'];
    if (kind === 'blue-gradient') return ['#020b24','#063b75','#e2c775'];
    if (kind === 'green-gradient') return ['#02150f','#16734d','#e2c775'];
    if (kind === 'night') return ['#01030d','#142957','#e5cc7a'];
    if (kind === 'islamic') return ['#071713','#214f3e','#e7ca78'];
    if (kind === 'paper') return ['#2e251a','#776345','#f0d996'];
    return ['#000','#090909','#d7bd72'];
  }

  function wrap(ctx, text, width) {
    const lines = []; let line = '';
    for (const word of text.split(/\s+/)) {
      const next = `${line} ${word}`.trim();
      if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  function draw(ayah) {
    const canvas = document.getElementById('quran-video-canvas');
    const size = document.getElementById('video-size')?.value || 'story';
    const width = size === 'landscape' ? 1920 : 1080;
    const height = size === 'square' ? 1080 : size === 'landscape' ? 1080 : 1920;
    // تغيير الأبعاد يعيد تخصيص الـbitmap ويمسح الرسم؛ لا يحدث إلا عند تبديل المقاس.
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext('2d');
    const [top, bottom, gold] = colors(document.getElementById('video-background')?.value);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, top); gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ctx.fillStyle = gold; ctx.font = '700 44px Tajawal, sans-serif';
    ctx.fillText(`سورة ${context.chapter.name}`, canvas.width / 2, 128);
    const verse = context.verses[ayah - 1], label = `${verse?.text || ''} ﴿${ayah}﴾`;
    ctx.fillStyle = '#fff'; ctx.font = `${size === 'square' ? '56px' : '62px'} Amiri, serif`;
    const lines = wrap(ctx, label, canvas.width - 192), lineHeight = size === 'square' ? 94 : 108;
    const center = canvas.height / 2 - lines.length * lineHeight / 2 + 20;
    lines.forEach((line, index) => ctx.fillText(line, canvas.width / 2, center + index * lineHeight));
    ctx.fillStyle = 'rgba(255,255,255,.86)'; ctx.font = '600 32px Tajawal, sans-serif';
    ctx.fillText(`الآية ${ayah} • ${reciterName()}`, canvas.width / 2, canvas.height - 124);
  }

  function preview() {
    if (!context) return;
    try { draw(selection().start); } catch (_) { draw(1); }
  }

  async function fetchBuffers(audioContext, start, end, id) {
    const rows = [];
    for (let ayah = start; ayah <= end; ayah++) {
      status(`تحميل الآية ${ayah}…`, (ayah - start) / (end - start + 1) * 30);
      const response = await fetch(audioUrl(context.surahId, ayah, id));
      if (!response.ok) throw Error(`تعذر تحميل صوت الآية ${ayah}`);
      const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
      rows.push({ayah, buffer});
      if (cancelled) throw Error('cancelled');
    }
    return rows;
  }

  function recorderOptions() {
    const quality = document.getElementById('video-quality')?.value || 'compatible';
    const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm;codecs=vp9,opus','video/webm'];
    const mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';
    return {mimeType, videoBitsPerSecond: quality === 'high' ? 3500000 : quality === 'small' ? 1200000 : 2200000};
  }

  async function create() {
    if (recording) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return fail('هذا المتصفح لا يدعم إنشاء الفيديو. استخدم «حفظ صورة» أو جرّب Chrome حديثًا.');
    let range;
    try { range = selection(); } catch (error) { return fail(error.message); }
    recording = true; cancelled = false; toggleBusy(true);
    window.stopQuranAyahAudio?.(); window.stopSurahAudio?.();
    let audioContext = null, recorder = null;
    try {
      await document.fonts?.ready;
      audioContext = new (window.AudioContext || window.webkitAudioContext)(); activeContext = audioContext;
      await audioContext.resume();
      const rows = await fetchBuffers(audioContext, range.start, range.end, reciterId());
      const duration = rows.reduce((sum, row) => sum + row.buffer.duration, 0);
      const requestedLimit = Math.min(maxSeconds(), Number(document.getElementById('video-duration')?.value) || 60);
      if (duration > requestedLimit) throw Error(`مدة المقطع ${Math.ceil(duration)} ثانية وتتجاوز الحد المختار ${requestedLimit} ثانية. اختر آيات أقل.`);
      const canvas = document.getElementById('quran-video-canvas');
      const videoStream = canvas.captureStream(15);
      const destination = audioContext.createMediaStreamDestination();
      const stream = new MediaStream([...videoStream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
      activeStream = stream;
      const options = recorderOptions(), chunks = [];
      recorder = new MediaRecorder(stream, options.mimeType ? options : undefined);
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      const stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = () => reject(Error('تعذر ترميز الفيديو'));
      });
      recorder.start(500);
      let elapsed = 0;
      for (const row of rows) {
        if (cancelled) break;
        const source = audioContext.createBufferSource(); source.buffer = row.buffer; source.connect(destination);
        const started = audioContext.currentTime;
        const timer = setInterval(() => {
          const local = Math.min(row.buffer.duration, audioContext.currentTime - started);
          draw(row.ayah);
          status(`إنشاء الفيديو — الآية ${row.ayah}…`, 30 + (elapsed + local) / duration * 65);
        }, 220);
        source.start();
        await new Promise(resolve => { source.onended = resolve; });
        clearInterval(timer); elapsed += row.buffer.duration;
      }
      if (recorder.state !== 'inactive') recorder.stop();
      await stopped;
      stream.getTracks().forEach(track => track.stop()); activeStream = null;
      if (cancelled) { fail('تم إلغاء إنشاء المقطع.'); return; }
      const mimeType = recorder.mimeType || options.mimeType || 'video/webm';
      const blob = new Blob(chunks, {type: mimeType});
      const extension = blob.type.toLowerCase().includes('mp4') ? 'mp4' : 'webm';
      showResult(blob, range, extension);
      status(`اكتمل إنشاء ${extension.toUpperCase()}.`, 100);
    } catch (error) {
      if (error.message !== 'cancelled') fail(error.message.includes('Failed to fetch') ? 'تعذر جلب التلاوة. تحقق من الاتصال أو قيود المصدر.' : error.message);
      else fail('تم إلغاء إنشاء المقطع.');
    } finally {
      if (recorder && recorder.state !== 'inactive') { try { recorder.stop(); } catch (_) {} }
      activeStream?.getTracks().forEach(track => track.stop()); activeStream = null;
      recording = false; toggleBusy(false);
      audioContext?.close().catch(() => {}); activeContext = null;
    }
  }

  function status(message, percent) {
    const box = document.getElementById('video-progress');
    if (!box) return;
    box.hidden = false; box.querySelector('small').textContent = message;
    box.querySelector('span').style.width = `${percent}%`;
  }

  function fail(message) {
    const result = document.getElementById('video-result');
    if (!result) return;
    result.querySelector('.video-share-error')?.remove();
    result.insertAdjacentHTML('afterbegin', `<p class="error video-share-error"><i class="fas fa-triangle-exclamation"></i> ${esc(message)}</p>`);
  }

  function toggleBusy(busy) {
    document.getElementById('video-create').disabled = busy;
    document.getElementById('video-image').disabled = busy;
    document.getElementById('video-cancel').hidden = !busy;
  }

  function showResult(blob, range, extension) {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(blob);
    const result = document.getElementById('video-result');
    const name = `zad-quran-${context.surahId}-${range.start}-${range.end}.${extension}`;
    result.innerHTML = `<video src="${resultUrl}" controls playsinline></video><div class="video-share-grid"><button class="app-button" onclick="saveCreatedQuranVideo('${name}')"><i class="fas fa-download"></i> حفظ الفيديو</button><button class="app-button" onclick="shareCreatedQuranVideo('${name}')"><i class="fas fa-share-nodes"></i> مشاركة الفيديو</button><button class="app-button" onclick="shareQuranVideoImage()"><i class="fas fa-image"></i> مشاركة صورة</button><button class="app-button" onclick="copyQuranVideoText()"><i class="fas fa-copy"></i> نسخ نص الآيات</button></div><p class="video-share-note">${extension === 'mp4' ? 'ملف MP4 متوافق مع تطبيقات المشاركة.' : 'المتصفح لم يدعم MP4؛ تم إنشاء WebM مع نوع MIME مطابق.'}</p>`;
    result.dataset.name = name; result.dataset.start = range.start; result.dataset.end = range.end; result._blob = blob;
  }

  function downloadResult(name, blob) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function blobBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function writeNativeVideo(blob, name, mode) {
    const plugin = window.Capacitor?.Plugins?.AndroidMedia;
    if (!plugin) throw Error('ميزة حفظ الفيديو الأصلية غير متاحة. أعد بناء التطبيق بعد مزامنة Capacitor.');
    const mimeType = blob.type.toLowerCase().split(';')[0] || (/\.webm$/i.test(name) ? 'video/webm' : 'video/mp4');
    const shareMode = mode === 'share';
    const started = await plugin[shareMode ? 'beginVideoShare' : 'beginVideoSave']({fileName: name, mimeType});
    const sessionId = started.sessionId, chunkSize = 256 * 1024;
    try {
      for (let offset = 0; offset < blob.size; offset += chunkSize) {
        const bytes = new Uint8Array(await blob.slice(offset, offset + chunkSize).arrayBuffer());
        await plugin.appendVideoChunk({sessionId, base64: blobBase64(bytes)});
        status(shareMode ? 'جاري تجهيز المشاركة…' : 'جاري حفظ الفيديو…', Math.min(99, Math.round((offset + bytes.length) / blob.size * 100)));
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      return await plugin[shareMode ? 'finishVideoShare' : 'finishVideoSave']({sessionId});
    } catch (error) {
      await plugin.cancelVideoExport({sessionId}).catch(() => {});
      throw error;
    }
  }

  async function save(name) {
    const result = document.getElementById('video-result'), blob = result?._blob;
    if (!blob || !name) return;
    const button = document.querySelector('#video-result button[onclick^="saveCreatedQuranVideo"]');
    if (button) button.disabled = true;
    try {
      if (isNative()) {
        const saved = await writeNativeVideo(blob, name, 'save');
        if (!saved?.bytes) throw Error('لم يؤكد النظام كتابة الملف.');
        const note = result.querySelector('.video-share-note');
        if (note) note.textContent = 'تم حفظ الفيديو بنجاح في Movies/ZadAlMuslim.';
        alert('تم حفظ الفيديو بنجاح');
      } else {
        downloadResult(name, blob);
        const note = result.querySelector('.video-share-note');
        if (note) note.textContent = 'بدأ تنزيل الفيديو إلى مجلد التنزيلات.';
      }
    } catch (error) { fail(`تعذر حفظ الفيديو: ${error.message}`); }
    finally { if (button) button.disabled = false; }
  }

  async function share(name) {
    const result = document.getElementById('video-result'), blob = result?._blob;
    if (!blob) return;
    try {
      if (isNative()) {
        const sent = await writeNativeVideo(blob, name, 'share');
        if (!sent?.shared) throw Error('لم يتم فتح مشاركة الفيديو.');
        return;
      }
      const mimeType = blob.type || (/\.webm$/i.test(name) ? 'video/webm' : 'video/mp4');
      const file = new File([blob], name, {type: mimeType});
      if (navigator.canShare?.({files: [file]}) && navigator.share) {
        await navigator.share({files: [file], title: 'زاد المسلم'}); return;
      }
      downloadResult(name, blob);
      const note = result.querySelector('.video-share-note');
      if (note) note.textContent = 'لا يدعم هذا المتصفح مشاركة الملفات؛ بدأ تنزيل الفيديو.';
    } catch (error) { if (error.name !== 'AbortError') fail(`تعذرت مشاركة الفيديو: ${error.message}`); }
  }

  function selectedText() {
    const result = document.getElementById('video-result');
    const range = result?.dataset.start ? {start: Number(result.dataset.start), end: Number(result.dataset.end)} : selection();
    const verses = [];
    for (let ayah = range.start; ayah <= range.end; ayah++) verses.push(`${context.verses[ayah - 1]?.text || ''} ﴿${ayah}﴾`);
    return `${verses.join('\n')}\nسورة ${context.chapter.name}\nتلاوة: ${reciterName()} — المصدر: ${SOURCE}`;
  }

  async function shareImage() {
    const result = document.getElementById('video-result');
    const ayah = Number(result?.dataset.start) || selection().start;
    draw(ayah);
    const blob = await new Promise(resolve => document.getElementById('quran-video-canvas').toBlob(resolve, 'image/png'));
    if (!blob) return;
    const name = `zad-quran-${context.surahId}-${ayah}.png`;
    if (window.nativeShareBlob && await window.nativeShareBlob(blob, name)) return;
    const file = new File([blob], name, {type: 'image/png'});
    if (navigator.canShare?.({files: [file]}) && navigator.share) {
      try { await navigator.share({files: [file], text: selectedText()}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = file.name; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function copyText() {
    const text = selectedText();
    try { await navigator.clipboard.writeText(text); alert('تم نسخ نص الآيات وبيانات القارئ.'); }
    catch (_) {
      const area = document.createElement('textarea'); area.value = text; document.body.appendChild(area); area.select();
      document.execCommand('copy'); area.remove(); alert('تم نسخ النص.');
    }
  }

  function saveFrame() {
    try {
      const {start} = selection(); draw(start);
      document.getElementById('quran-video-canvas').toBlob(blob => {
        if (!blob) return;
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
        link.download = `zad-quran-${context.surahId}-${start}.png`; link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }, 'image/png');
    } catch (error) { fail(error.message); }
  }

  function cancel() { cancelled = true; }
  const oldHook = window.onQuranSurahOpened;
  window.onQuranSurahOpened = async payload => { await oldHook?.(payload); inject(payload); };
  window.openQuranVideoMaker = open;
  window.closeQuranVideoMaker = close;
  window.stopQuranVideoPreview = stopPreview;
  window.previewQuranVideo = preview;
  window.createQuranVideo = create;
  window.cancelQuranVideo = cancel;
  window.saveQuranVideoFrame = saveFrame;
  window.saveCreatedQuranVideo = save;
  window.shareCreatedQuranVideo = share;
  window.shareQuranVideoImage = shareImage;
  window.copyQuranVideoText = copyText;
})();
