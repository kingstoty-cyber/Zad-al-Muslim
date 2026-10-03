(function () {
  'use strict';

  const DEVICE_KEY = 'zad_community_device_id_v1';
  const COUNT_CACHE_KEY = 'zad_community_count_cache_v1';
  const REQUEST_TIMEOUT_MS = 8000;

  function isConfigured() {
    const config = window.ZAD_APP?.supabase;
    return Boolean(config?.url && config?.anonKey && /^https:\/\//.test(config.url));
  }

  function makeDeviceId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
      const random = Math.random() * 16 | 0;
      const value = character === 'x' ? random : (random & 0x3 | 0x8);
      return value.toString(16);
    });
  }

  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = makeDeviceId();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  function formatCount(count) {
    return new Intl.NumberFormat('ar-LY').format(Number(count) || 0);
  }

  function setUI(count, state) {
    const number = document.getElementById('community-counter-number');
    const message = document.getElementById('community-counter-message');
    if (!number || !message) return;

    if (Number.isFinite(Number(count))) number.textContent = formatCount(count);
    if (state === 'ready') message.textContent = 'مستخدمو زاد المسلم حتى الآن';
    if (state === 'offline') message.textContent = 'آخر عدد محفوظ — سيتحدث عند عودة الاتصال';
    if (state === 'unavailable') message.textContent = 'سيظهر عدد المستخدمين بعد إكمال ربط Supabase';
  }

  async function fetchCount() {
    if (!isConfigured()) {
      setUI(null, 'unavailable');
      return null;
    }

    const config = window.ZAD_APP.supabase;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/rpc/register_zad_device`, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_device_id: getDeviceId() }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`Supabase counter failed: ${response.status}`);
      const count = Number(await response.json());
      if (!Number.isFinite(count)) throw new Error('Supabase counter returned an invalid value');

      localStorage.setItem(COUNT_CACHE_KEY, String(count));
      setUI(count, 'ready');
      return count;
    } catch (error) {
      const cached = Number(localStorage.getItem(COUNT_CACHE_KEY));
      setUI(Number.isFinite(cached) ? cached : null, 'offline');
      console.warn('تعذر تحديث عداد مجتمع زاد المسلم', error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  window.ZadCommunityCounter = Object.freeze({ mount: fetchCount });
})();
