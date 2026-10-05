
// ========== المتغيرات العامة ==========

// مواقيت الصلاة (سيتم تحديثها تلقائياً)
let PrayerTimes = [...Prayers];

// ==================== إضافة: موقع يدوي وادوات الكاش اليومي ====================

// حفظ موقع يدوي (الاستخدام: saveManualLocation(24.7136, 46.6753, "الرياض"))
function saveManualLocation(lat, lon, city) {
    const manual = {
        lat: Number(lat),
        lon: Number(lon),
        city: city || null,
        source: 'manual',
        timestamp: Date.now()
    };
    localStorage.setItem('manual_location', JSON.stringify(manual));
    console.log('تم حفظ الموقع اليدوي:', manual);
    return manual;
}

function getManualLocation() {
    try {
        const raw = localStorage.getItem('manual_location');
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (obj && typeof obj.lat === 'number' && typeof obj.lon === 'number') return obj;
    } catch (e) {
        console.warn('خطأ قراءة الموقع اليدوي:', e);
    }
    return null;
}

function clearManualLocation() {
    localStorage.removeItem('manual_location');
    localStorage.removeItem('cached_prayer_times');
    localStorage.removeItem('zad_prayer_v42_cache');
    try {
        const saved = JSON.parse(localStorage.getItem('user_location') || 'null');
        if (saved?.source === 'manual') localStorage.removeItem('user_location');
    } catch (_) {
        localStorage.removeItem('user_location');
    }
    console.log('تم إزالة الموقع اليدوي');
}

function setupManualLocationPanel() {
    const toggleBtn = document.getElementById('manual-toggle');
    const panel = document.getElementById('manual-location-panel');
    const closeBtn = document.getElementById('manual-close');
    const saveBtn = document.getElementById('save-manual-btn');
    const clearBtn = document.getElementById('clear-manual-btn');
    const latInput = document.getElementById('manual-lat');
    const lonInput = document.getElementById('manual-lon');
    const cityInput = document.getElementById('manual-city');
    if (!toggleBtn || !panel || !saveBtn || !clearBtn || !latInput || !lonInput || !cityInput) return;

    cityInput.addEventListener('change', () => {
        const city = [...document.querySelectorAll('#manual-city-options option')].find(option => option.value === cityInput.value);
        if (!city) return;
        latInput.value = city.dataset.lat || '';
        lonInput.value = city.dataset.lon || '';
    });

    const closePanel = () => { panel.style.display = 'none'; };
    toggleBtn.addEventListener('click', () => {
        const saved = getManualLocation();
        latInput.value = saved?.lat ?? '';
        lonInput.value = saved?.lon ?? '';
        cityInput.value = saved?.city ?? '';
        panel.style.display = 'block';
    });
    closeBtn?.addEventListener('click', closePanel);
    saveBtn.addEventListener('click', async () => {
        const lat = Number.parseFloat(latInput.value);
        const lon = Number.parseFloat(lonInput.value);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            alert('أدخل خط عرض بين -90 و90، وخط طول بين -180 و180.');
            return;
        }
        saveManualLocation(lat, lon, cityInput.value.trim());
        try {
            if (typeof window.updatePrayerTimesWithFeedback === 'function') await window.updatePrayerTimesWithFeedback();
            else if (typeof window.updatePrayerTimes === 'function') await window.updatePrayerTimes();
        } finally {
            closePanel();
            window.renderHome?.();
        }
    });
    clearBtn.addEventListener('click', () => {
        if (!confirm('هل تريد إزالة الموقع اليدوي؟')) return;
        clearManualLocation();
        alert('تمت إزالة الموقع اليدوي. يمكنك اختيار مدينة أخرى أو استخدام موقعي من صفحة الصلاة.');
        closePanel();
        window.renderHome?.();
    });
    window.addEventListener('click', event => {
        if (panel.style.display === 'block' && !panel.contains(event.target) && !toggleBtn.contains(event.target)) closePanel();
    });
}

// تحميل الكاش اليومي
function loadCachedTimes() {
    try {
        const c = JSON.parse(localStorage.getItem('cached_prayer_times') || 'null');
        return (c && c.date === new Date().toDateString()) ? c : null;
    } catch (e) {
        return null;
    }
}

// تحقق ما إذا كنا بحاجة لتحديث (مثلاً عند تغيير الموقع اليدوي)
function needsUpdateForManualLocation() {
    const cached = loadCachedTimes();
    let saved = null;
    try { saved = getManualLocation() || JSON.parse(localStorage.getItem('user_location') || 'null'); } catch (_) {}
    if (!saved) return false;
    if (!cached) return true;
    if (cached.date !== new Date().toDateString()) return true;
    const cachedLoc = cached.location || {};
    return Math.abs((cachedLoc.lat || 0) - Number(saved.lat)) > 0.01 ||
        Math.abs((cachedLoc.lon || 0) - Number(saved.lon)) > 0.01;
}

// ========== الدوال الأساسية ==========

function getRandomReminder() {
    if (!SmartReminders || SmartReminders.length === 0) return "اذكر الله";
    const randomIndex = Math.floor(Math.random() * SmartReminders.length);
    return SmartReminders[randomIndex];
}

function getArabicDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return now.toLocaleDateString('ar-SA', options);
}

function getRandomAyah() {
    return QuranAyahs[Math.floor(Math.random() * QuranAyahs.length)];
}

// نسخة محسنة وبسيطة لتحديد الصلاة الحالية باستخدام الكاش المحلي
function getCurrentPrayer() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // إنشاء مصفوفة للصلوات فقط (باستثناء الشروق)
    const prayersOnly = PrayerTimes.filter(prayer => prayer.name !== "الشروق");

    // تحويل الأوقات إلى دقائق (مع فحص بسيط للسلامة)
    const prayerTimesInMinutes = prayersOnly.map(prayer => {
        const [hours = 0, minutes = 0] = (prayer.time || "00:00").split(':').map(Number);
        return {
            name: prayer.name,
            minutes: hours * 60 + minutes
        };
    }).sort((a, b) => a.minutes - b.minutes);

    if (prayerTimesInMinutes.length === 0) return "الفجر";

    // قبل أول صلاة => العشاء (من اليوم السابق)
    if (currentTime < prayerTimesInMinutes[0].minutes) {
        return prayerTimesInMinutes[prayerTimesInMinutes.length - 1].name;
    }

    // بين صلاة وصلاة تالية
    for (let i = 0; i < prayerTimesInMinutes.length - 1; i++) {
        if (currentTime >= prayerTimesInMinutes[i].minutes && currentTime < prayerTimesInMinutes[i + 1].minutes) {
            return prayerTimesInMinutes[i].name;
        }
    }

    // بعد آخر صلاة => آخر صلاة
    return prayerTimesInMinutes[prayerTimesInMinutes.length - 1].name;
}

// ========== نظام مواقيت الصلاة الجغرافي ==========

class PrayerTimesCalculator {
    constructor() {
        this.latitude = 24.7136; // الرياض افتراضياً
        this.longitude = 46.6753;
        this.timezone = 3;
        this.method = 'UmmAlQura';
        this.calculationMethod = this.getCalculationMethod();
    }

    getCalculationMethod() {
        const methods = {
            'UmmAlQura': { fajr: 18.5, isha: 90 },
            'Egyptian': { fajr: 19.5, isha: 17.5 },
            'Karachi': { fajr: 18, isha: 18 },
            'MuslimWorldLeague': { fajr: 18, isha: 17 }
        };
        return methods[this.method] || methods['UmmAlQura'];
    }

    // تعديل: استخدام الموقع اليدوي أولاً لتقليل التعقيد والمشكلات
    async getLocation() {
        const saved = getManualLocation() || (() => {
            try { return JSON.parse(localStorage.getItem('user_location') || 'null'); }
            catch (_) { return null; }
        })();
        if (!saved || !Number.isFinite(Number(saved.lat)) || !Number.isFinite(Number(saved.lon))) return false;
        this.latitude = Number(saved.lat);
        this.longitude = Number(saved.lon);
        return true;
    }

    // دالة لجلب مواقيت الصلاة من API
    async fetchPrayerTimesFromAPI(lat, lng) {
        try {
            console.log(`جلب المواقيت من API للإحداثيات: ${lat}, ${lng}`);
            
            const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`);
            
            if (!response.ok) {
                throw new Error(`خطأ في الاستجابة: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("البيانات المستلمة من API:", data.data.timings);
            return data.data.timings;
        } catch (error) {
            console.error('خطأ في جلب مواقيت الصلاة:', error);
            
            // محاولة API بديل
            try {
                console.log("جرب API بديل...");
                const altResponse = await fetch(`https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=4&month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
                const altData = await altResponse.json();
                const today = new Date().getDate();
                const todayData = altData.data[today - 1];
                console.log("البيانات من API البديل:", todayData.timings);
                return todayData.timings;
            } catch (altError) {
                console.error('فشل API البديل أيضاً:', altError);
                return null;
            }
        }
    }

    // حساب مبسط لمواقيت الصلاة (يستخدم عندما تفشل API)
    computePrayerTimes(date = new Date()) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // أوقات افتراضية مع تعديلات موسمية بسيطة
        let fajrHour = 4;
        let sunriseHour = 5;
        let dhuhrHour = 12;
        let asrHour = 15;
        let maghribHour = 18;
        let ishaHour = 19;
        
        // تعديلات موسمية (شتاء/صيف)
        if (month >= 4 && month <= 9) { // الصيف
            fajrHour = 3;
            sunriseHour = 5;
            maghribHour = 19;
            ishaHour = 20;
        }
        
        // إضافة دقائق عشوائية للتبسيط
        const fajrMin = 30 + (day % 30);
        const sunriseMin = 45 + (day % 15);
        const dhuhrMin = 15 + (day % 15);
        const asrMin = 45 + (day % 15);
        const maghribMin = 30 + (day % 15);
        const ishaMin = 45 + (day % 15);
        
        return {
            fajr: `${fajrHour.toString().padStart(2, '0')}:${fajrMin.toString().padStart(2, '0')}`,
            sunrise: `${sunriseHour.toString().padStart(2, '0')}:${sunriseMin.toString().padStart(2, '0')}`,
            dhuhr: `${dhuhrHour.toString().padStart(2, '0')}:${dhuhrMin.toString().padStart(2, '0')}`,
            asr: `${asrHour.toString().padStart(2, '0')}:${asrMin.toString().padStart(2, '0')}`,
            maghrib: `${maghribHour.toString().padStart(2, '0')}:${maghribMin.toString().padStart(2, '0')}`,
            isha: `${ishaHour.toString().padStart(2, '0')}:${ishaMin.toString().padStart(2, '0')}`
        };
    }

    // تعديل: استخدام الكاش اليومي واعتبار الموقع اليدوي كمصدر أول
    async getPrayerTimes() {
        const today = new Date().toDateString();
        const cached = loadCachedTimes();
        const manual = getManualLocation();

        // إذا كان هناك كاش صالح ولديه نفس الموقع (أو لا يوجد موقع يدوي) استخدمه
        if (cached && (!manual || (cached.location && Math.abs((cached.location.lat || 0) - manual.lat) < 0.01 && Math.abs((cached.location.lon || 0) - manual.lon) < 0.01))) {
            console.log("استخدام البيانات المخزنة مسبقاً");
            return cached.times;
        }

        // تحديد الموقع (سيستخدم الموقع اليدوي إذا وُجد)
        const locationSuccess = await this.getLocation();
        let times;

        if (locationSuccess) {
            console.log("جاري جلب مواقيت الصلاة...");
            const apiTimings = await this.fetchPrayerTimesFromAPI(this.latitude, this.longitude);

            if (apiTimings) {
                times = {
                    fajr: apiTimings.Fajr,
                    sunrise: apiTimings.Sunrise,
                    dhuhr: apiTimings.Dhuhr,
                    asr: apiTimings.Asr,
                    maghrib: apiTimings.Maghrib,
                    isha: apiTimings.Isha
                };
                console.log("تم جلب المواقيت بنجاح من API");
            } else {
                console.log("استخدام الأوقات المحسوبة محلياً");
                times = this.computePrayerTimes();
            }
        } else {
            throw new Error("حدد موقعك من واجهة الصلاة قبل تحديث المواقيت.");
        }

        const cacheData = {
            date: today,
            location: { lat: this.latitude, lon: this.longitude },
            times: times,
            source: locationSuccess ? 'api' : 'local',
            timestamp: Date.now()
        };
        localStorage.setItem('cached_prayer_times', JSON.stringify(cacheData));
        
        return times;
    }
}

// تهيئة حاسبة الصلاة
const prayerCalculator = new PrayerTimesCalculator();

// تحديث مواقيت الصلاة
async function updatePrayerTimes() {
    try {
        console.log("بدء عملية تحديث مواقيت الصلاة...");
        const times = await prayerCalculator.getPrayerTimes();
        
        if (!times) {
            throw new Error("فشل جلب مواقيت الصلاة");
        }
        
        // تحديث المصفوفة العالمية
        PrayerTimes = [
            { name: "الفجر", time: times.fajr },
            { name: "الشروق", time: times.sunrise },
            { name: "الظهر", time: times.dhuhr },
            { name: "العصر", time: times.asr },
            { name: "المغرب", time: times.maghrib },
            { name: "العشاء", time: times.isha }
        ];
        
        console.log("تم تحديث مواقيت الصلاة:", PrayerTimes);
        
        if (AppState.currentTab === 'home') {
            renderHome();
        }
        
        return true;
    } catch (error) {
        console.log("استخدام الأوقات الافتراضية:", error);
        return false;
    }
}

// دالة مع ردود فعل للتحديث (تم تعديلها لاستخدام الموقع اليدوي إن وُجد)
async function updatePrayerTimesWithFeedback() {
    const content = document.getElementById('page-content');
    const prayerCard = content ? content.querySelector('.card:nth-child(2)') || content.querySelector('.card') : null;
    const updateBtn = prayerCard ? prayerCard.querySelector('button') : null;
    const locationInfo = prayerCard ? prayerCard.querySelector('.location-info') : null;
    
    const originalText = updateBtn ? updateBtn.innerHTML : 'تحديث';
    if (updateBtn) {
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
        updateBtn.disabled = true;
    }
    
    try {
        console.log("بدء تحديث المواقيت...");
        const success = await updatePrayerTimes();
        
        if (success) {
            if (updateBtn) updateBtn.innerHTML = '<i class="fas fa-check"></i> تم التحديث';
            
            // تحديث معلومات الموقع: استخدم الموقع اليدوي إن وجد وإلا استخدم user_location
            const manual = getManualLocation();
            const savedLocation = manual || JSON.parse(localStorage.getItem('user_location') || 'null');
            if (savedLocation && locationInfo) {
                const locationText = savedLocation.city 
                    ? `${savedLocation.city}${savedLocation.country ? ', ' + savedLocation.country : ''}`
                    : `الإحداثيات: ${savedLocation.lat.toFixed(4)}, ${savedLocation.lon.toFixed(4)}`;
                
                const srcLabel = savedLocation.source === 'manual' ? 'يدوي' : (savedLocation.source === 'gps' ? 'GPS' : 'IP');
                locationInfo.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${locationText} (${srcLabel})`;
            }
            
            setTimeout(() => {
                if (updateBtn) {
                    updateBtn.innerHTML = originalText;
                    updateBtn.disabled = false;
                }
            }, 2000);
        } else {
            throw new Error("فشل التحديث");
        }
    } catch (error) {
        console.error("فشل تحديث المواقيت:", error);
        if (updateBtn) updateBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> فشل التحديث';
        
        // عرض رسالة مساعدة داخل الكرت
        if (prayerCard && !prayerCard.querySelector('.location-help')) {
            const helpDiv = document.createElement('div');
            helpDiv.className = 'location-help';
            helpDiv.style.cssText = `
                font-size: 0.8rem;
                color: #f39c12;
                margin-top: 10px;
                padding: 8px;
                background: rgba(243, 156, 18, 0.1);
                border-radius: 6px;
            `;
            helpDiv.innerHTML = `
                <i class="fas fa-lightbulb"></i> 
                يمكنك تجربة:<br>
                1. تأكد من اتصال الإنترنت<br>
                2. أدخل موقعك يدوياً وحفظه<br>
                3. جرب استخدام API بديل أو VPN إذا كان محلياً محجوباً
            `;
            prayerCard.appendChild(helpDiv);
        }
        
        setTimeout(() => {
            if (updateBtn) {
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;
            }
        }, 3000);
    }
}

// ========== نظام السمات والوضع ==========

function applyTheme(themeId = AppState.currentTheme) {
    const body = document.getElementById('app-body');
    
    // تنظيف الكلاسات القديمة
    if (typeof Themes !== 'undefined') {
        Themes.forEach(theme => {
            if (theme.class) body.classList.remove(theme.class);
        });
    }
    
    // تطبيق السمة الجديدة
    const selectedTheme = (typeof Themes !== 'undefined') ? Themes.find(t => t.id === themeId) : null;
    if (selectedTheme && selectedTheme.class) {
        body.classList.add(selectedTheme.class);
    }
    
    // تحديث الحالة
    AppState.currentTheme = themeId;
    Storage.save('app_theme', themeId);
    
    // تحديث العرض
    const themeNameDisplay = document.getElementById('current-theme');
    if (themeNameDisplay) {
        const themeName = selectedTheme ? selectedTheme.name : "ذهبي ليلي";
        themeNameDisplay.textContent = `السمة: ${themeName}`;
        themeNameDisplay.style.cssText = "font-size: 0.9rem; color: var(--primary-color); margin-top: 5px;";
    }
}

function setupAutoTheme() {
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    const autoThemeEnabled = Storage.load('auto_theme') || false;
    
    if (autoThemeEnabled) {
        if (isDayTime) {
            activateLightMode();
        } else {
            activateDarkMode();
        }
    }
}

function activateLightMode() {
    const currentTheme = AppState.currentTheme;
    if (!currentTheme.includes('-light')) {
        const newTheme = currentTheme + '-light';
        if (Themes && Themes.find(t => t.id === newTheme)) {
            changeTheme(newTheme);
        } else {
            changeTheme('gold-light');
        }
    }
    Storage.save('theme_mode', 'light');
}

function activateDarkMode() {
    const currentTheme = AppState.currentTheme;
    if (currentTheme.includes('-light')) {
        const newTheme = currentTheme.replace('-light', '');
        changeTheme(newTheme || 'default');
    }
    Storage.save('theme_mode', 'dark');
}

function toggleTheme(isLight) {
    if (isLight) {
        activateLightMode();
    } else {
        activateDarkMode();
    }
}

function toggleAutoTheme() {
    const autoTheme = !(Storage.load('auto_theme') || false);
    Storage.save('auto_theme', autoTheme);
    AppState.autoTheme = autoTheme;
    
    if (autoTheme) {
        setupAutoTheme();
    }
    
    if (AppState.currentTab === 'settings') {
        renderSettings();
    }
}

// ========== الصفحة الرئيسية ==========

function renderHome() {
    const content = document.getElementById('page-content');
    if (content) content.className = 'fade-in';
    
    const today = new Date().toDateString();
    if (AppState.prayerLog.date !== today) {
        AppState.prayerLog = {
            date: today,
            list: Array(5).fill(false)
        };
        Storage.save('prayer_v3', AppState.prayerLog);
    }
    
    const ayah = getRandomAyah();
    const reminder = getRandomReminder();
    const currentPrayer = getCurrentPrayer();
    
    // جلب معلومات الموقع المخزنة (أولوية للموقع اليدوي)
    const manual = getManualLocation();
    const savedLocation = manual || JSON.parse(localStorage.getItem('user_location') || 'null');
    const locationText = savedLocation ? 
        (savedLocation.city && savedLocation.country 
            ? `${savedLocation.city}, ${savedLocation.country}`
            : `الإحداثيات: ${savedLocation.lat?.toFixed(4) || '24.7136'}, ${savedLocation.lon?.toFixed(4) || '46.6753'}`)
        : "الرياض, السعودية";
    
    const locationSource = savedLocation?.source === 'gps' ? 'GPS' : (savedLocation?.source === 'manual' ? 'يدوي' : 'IP');

    content.innerHTML = `
        <div class="card smart-reminder">
            <div class="card-title"><i class="fas fa-lightbulb"></i> تذكيرات ذكية</div>
            <div style="padding: 15px; background: color-mix(in srgb, var(--accent-color) 10%, transparent); border-radius: 10px;">
                <i class="fas fa-quote-right" style="color: var(--accent-color); float: left; margin-left: 10px;"></i>
                <p style="font-size: 1.1rem; line-height: 1.6; margin: 0; text-align: center;">${reminder}</p>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title"><i class="fas fa-clock"></i> مواقيت الصلاة</div>
            <div class="prayer-times">
                ${PrayerTimes.map(prayer => {
                    const isCurrent = prayer.name === currentPrayer;
                    const isSunrise = prayer.name === "الشروق";
                    return `
                        <div class="prayer-time ${isCurrent ? 'current' : ''} ${isSunrise ? 'sunrise' : ''}">
                            <div class="name">${prayer.name}</div>
                            <div class="time">${prayer.time}</div>
                            ${isCurrent && !isSunrise ? '<div class="current-indicator">✓</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="location-update">
                <div style="margin-bottom: 8px;">
                    <i class="fas fa-info-circle"></i> الصلاة الحالية: <strong>${currentPrayer}</strong>
                </div>
                <div class="location-info" style="font-size: 0.85rem; color: var(--accent-color); margin-bottom: 10px;">
                    <i class="fas fa-map-marker-alt"></i> ${locationText} (${locationSource})
                </div>
                <button onclick="updatePrayerTimesWithFeedback()">
                    <i class="fas fa-sync-alt"></i> تحديث الموقع
                </button>
                <div style="font-size: 0.75rem; color: #7f8c8d; margin-top: 10px; text-align: center;">
                    <i class="fas fa-info-circle"></i> يمكنك إدخال موقعك يدوياً في الإعدادات لتقليل الأخطاء
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title"><i class="fas fa-calendar-check"></i> متابعة الصلوات</div>
            ${['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'].map((prayer, index) => `
                <div class="list-item">
                    <span>${prayer}</span>
                    <div>
                        <input type="checkbox" 
                               id="prayer-${index}" 
                               ${AppState.prayerLog.list[index] ? 'checked' : ''}
                               onchange="togglePrayer(${index})">
                    </div>
                </div>
            `).join('')}
            <div class="progress-bar" style="margin-top: 20px;">
                <div class="progress-fill" style="width: ${(AppState.prayerLog.list.filter(p => p).length / 5) * 100}%"></div>
            </div>
            <div style="text-align: center; margin-top: 10px; font-size: 0.9rem;">
                ${AppState.prayerLog.list.filter(p => p).length} من 5 صلوات
            </div>
        </div>
        
        <div class="ayah-of-day">
            <p style="font-family: 'Amiri', serif; font-size: 1.3rem; line-height: 1.8; margin: 0;">${ayah.text}</p>
            <p style="margin: 10px 0 0 0; color: var(--primary-color); font-size: 0.9rem;">${ayah.reference}</p>
        </div>
    `;
}

function togglePrayer(index) {
    AppState.prayerLog.list[index] = !AppState.prayerLog.list[index];
    Storage.save('prayer_v3', AppState.prayerLog);
    renderHome();
}

// ========== صفحة الأذكار ==========

function getAllDhikr() {
    return Object.values(AdhkarDB).flat();
}

let activeDhikrCategory = Storage.load('adhkar_active_category') || 'azkari_1';

function ensureDailyAdhkarProgress() {
    const today = new Date().toISOString().slice(0, 10);
    if (Storage.load('adhkar_progress_day') === today) return;
    const progress = Storage.load('adhkar_progress') || {};
    [...(AdhkarDB.azkari_1 || []), ...(AdhkarDB.azkari_2 || [])].forEach(item => delete progress[item.id]);
    Storage.save('adhkar_progress', progress);
    Storage.save('adhkar_progress_day', today);
}

function getDhikrCategoryProgress(category, progress) {
    const items = AdhkarDB[category] || [];
    const total = items.reduce((sum, item) => sum + item.count, 0);
    const current = items.reduce((sum, item) => sum + Math.min(progress[item.id]?.current || 0, item.count), 0);
    const completed = items.filter(item => progress[item.id]?.completed).length;
    return { total, current, completed, percentage: total ? Math.round((current / total) * 100) : 0 };
}

function adhkarCategoryIcon(name='') {
    if (/صباح|استيقاظ/.test(name)) return 'fa-sun';
    if (/مساء|نوم/.test(name)) return 'fa-moon';
    if (/صلاة|مسجد/.test(name)) return 'fa-mosque';
    if (/منزل|دخول|خروج/.test(name)) return 'fa-house';
    if (/طعام|شراب/.test(name)) return 'fa-utensils';
    if (/مرض|رقية/.test(name)) return 'fa-heart-pulse';
    if (/سفر|ركوب/.test(name)) return 'fa-route';
    if (/قرآن/.test(name)) return 'fa-book-quran';
    return 'fa-hands-praying';
}
function renderAdhkar(category = activeDhikrCategory || 'azkari_1') {
    const importedCategories = window.ImportedAdhkarCategories || (typeof ImportedAdhkarCategories !== 'undefined' ? ImportedAdhkarCategories : []);
    if (!AdhkarDB[category]) category = importedCategories[0]?.key || 'azkari_1';
    ensureDailyAdhkarProgress(); activeDhikrCategory = category; Storage.save('adhkar_active_category', category);
    const content=document.getElementById('page-content'); content.className='fade-in adhkar-page';
    const progress=Storage.load('adhkar_progress')||{}, cp=getDhikrCategoryProgress(category,progress), current=importedCategories.find(c=>c.key===category)||{name:'الأذكار'};
    let html=`<section class="card adhkar-reader-head">
      <button class="adhkar-drawer-open" type="button" onclick="openAdhkarDrawer()" aria-label="فتح أقسام الأذكار" aria-controls="adhkar-drawer"><i class="fas fa-bars"></i><span>الأقسام</span></button>
      <div class="adhkar-current-category"><i class="fas ${adhkarCategoryIcon(current.name)}"></i><div><strong>${current.name}</strong><small>${AdhkarDB[category]?.length||0} ذكر</small></div></div>
      <div class="adhkar-category-progress compact"><strong>${cp.percentage}%</strong><span>${cp.completed}/${AdhkarDB[category]?.length||0}</span></div>
    </section>
    <div class="adhkar-drawer-backdrop" id="adhkar-drawer-backdrop" hidden onclick="closeAdhkarDrawer()"></div>
    <aside class="adhkar-drawer" id="adhkar-drawer" aria-hidden="true" aria-label="أقسام الأذكار">
      <div class="adhkar-drawer-header"><strong>أقسام الأذكار</strong><button type="button" onclick="closeAdhkarDrawer()" aria-label="إغلاق"><i class="fas fa-xmark"></i></button></div>
      <label class="adhkar-drawer-search"><i class="fas fa-search"></i><input type="search" placeholder="ابحث عن قسم" oninput="filterAdhkarDrawer(this.value)"></label>
      <div class="adhkar-drawer-list" id="adhkar-drawer-list">${importedCategories.map(c=>`<button type="button" data-name="${c.name}" class="${category===c.key?'active':''}" onclick="selectAdhkarCategory('${c.key}')"><i class="fas ${adhkarCategoryIcon(c.name)}"></i><span><strong>${c.name}</strong><small>${(AdhkarDB[c.key]||[]).length} ذكر</small></span><i class="fas fa-chevron-left"></i></button>`).join('')}</div>
      <div class="adhkar-drawer-actions"><button class="tab-btn" onclick="completeDhikrCategory('${category}');closeAdhkarDrawer()"><i class="fas fa-check-double"></i> إكمال القسم</button><button class="tab-btn danger" onclick="resetDhikrCategory('${category}');closeAdhkarDrawer()"><i class="fas fa-rotate-left"></i> تصفير</button></div>
    </aside>`;
    (AdhkarDB[category]||[]).forEach(item=>{const st=progress[item.id]||{current:0,completed:false},pct=item.count?Math.min(100,st.current/item.count*100):0; html+=`<article class="card dhikr-card" id="adhkar-${item.id}"><div class="dhikr-card-head"><strong>${item.sourceCategory||current.name}</strong><span>${item.times||`${item.count} مرة`}</span></div><div class="dhikr-text">${item.text}</div>${item.reference?`<small class="dhikr-reference">${item.reference}</small>`:''}<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><div class="dhikr-audio-row">${item.audio?`<button class="tab-btn dhikr-audio-btn" onclick="toggleDhikrAudio(${item.id}, '${item.audio}')"><i class="fas fa-play" id="dhikr-audio-icon-${item.id}"></i> <span id="dhikr-audio-label-${item.id}">استماع</span></button>`:'<small>لا يوجد تسجيل لهذا الذكر</small>'}<label class="adhkar-autoplay"><input type="checkbox" ${dhikrAutoNext?'checked':''} onchange="setDhikrAutoNext(this.checked)"> متابعة تلقائية</label></div><div class="counter-controls"><button class="counter-btn" onclick="updateDhikrCount(${item.id},-1)" ${st.completed?'disabled':''}><i class="fas fa-minus"></i></button><button class="complete-btn" onclick="completeDhikrNow(${item.id})" ${st.completed?'disabled':''}>${st.completed?'✓ مكتمل':`${st.current} / ${item.count}`}</button><button class="counter-btn" onclick="updateDhikrCount(${item.id},1)" ${st.completed?'disabled':''}><i class="fas fa-plus"></i></button></div></article>`});
    content.innerHTML=html; syncDhikrAudioUI();
}
function openAdhkarDrawer(){
    if(AppState.currentTab!=='adhkar') return;
    const drawer=document.getElementById('adhkar-drawer'),backdrop=document.getElementById('adhkar-drawer-backdrop'); if(!drawer||!backdrop)return;
    drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');backdrop.hidden=false;document.body.classList.add('adhkar-drawer-opened');
}
function closeAdhkarDrawer(){const drawer=document.getElementById('adhkar-drawer'),backdrop=document.getElementById('adhkar-drawer-backdrop');drawer?.classList.remove('open');drawer?.setAttribute('aria-hidden','true');if(backdrop)backdrop.hidden=true;document.body.classList.remove('adhkar-drawer-opened')}
function selectAdhkarCategory(category){closeAdhkarDrawer();renderAdhkar(category);window.scrollTo({top:0,behavior:'auto'})}
function filterAdhkarDrawer(query){const q=String(query||'').trim();document.querySelectorAll('#adhkar-drawer-list > button').forEach(b=>{b.hidden=q&&!String(b.dataset.name||'').includes(q)})}
window.openAdhkarDrawer=openAdhkarDrawer;window.closeAdhkarDrawer=closeAdhkarDrawer;window.selectAdhkarCategory=selectAdhkarCategory;window.filterAdhkarDrawer=filterAdhkarDrawer;

function filterImportedAdhkar(query){
    const q=String(query||'').trim(), box=document.getElementById('adhkar-search-results'); if(!box)return; if(!q){box.innerHTML='';return}
    const cats=window.ImportedAdhkarCategories||[]; const matches=[]; cats.forEach(c=>(AdhkarDB[c.key]||[]).forEach(i=>{if((c.name+' '+i.text+' '+(i.reference||'')).includes(q))matches.push({c,i})}));
    box.innerHTML=`<div class="adhkar-search-list">${matches.slice(0,20).map(({c,i})=>`<button onclick="renderAdhkar('${c.key}');setTimeout(()=>document.getElementById('adhkar-${i.id}')?.scrollIntoView({behavior:'smooth'}),50)"><strong>${c.name}</strong><small>${i.text.slice(0,90)}${i.text.length>90?'…':''}</small></button>`).join('')||'<p>لا توجد نتائج.</p>'}</div>`;
}
let activeDhikrAudio=null, activeDhikrAudioId=null, activeDhikrAudioCategory=null;
let dhikrAutoNext=Storage.load('adhkar_audio_autonext')!==false;
function setDhikrAutoNext(value){dhikrAutoNext=!!value;Storage.save('adhkar_audio_autonext',dhikrAutoNext);document.querySelectorAll('.adhkar-autoplay input').forEach(x=>x.checked=dhikrAutoNext)}
function dhikrItem(id){for(const [category,items] of Object.entries(AdhkarDB)){const item=items.find(x=>x.id===id);if(item)return{item,category}}return null}
function dhikrAudioProgress(id){const hit=dhikrItem(id),progress=Storage.load('adhkar_progress')||{},st=progress[id]||{current:0,completed:false};return{current:Math.max(0,Math.min(Number(st.current)||0,Number(hit?.item?.count)||1)),count:Number(hit?.item?.count)||1,completed:!!st.completed}}
function emitDhikrState(){if(!activeDhikrAudio||!activeDhikrAudioId)return;const hit=dhikrItem(activeDhikrAudioId),ap=dhikrAudioProgress(activeDhikrAudioId);window.dispatchEvent(new CustomEvent('zad:audio-state',{detail:{kind:'dhikr',playing:!activeDhikrAudio.paused,currentTime:activeDhikrAudio.currentTime||0,duration:Number.isFinite(activeDhikrAudio.duration)?activeDhikrAudio.duration:0,title:hit?.item?.sourceCategory||'الأذكار',subtitle:`التكرار ${Math.min(ap.current+1,ap.count)} من ${ap.count} • ${(hit?.item?.text||'ذكر مسموع').slice(0,52)}`}}))}
function syncDhikrAudioUI(){document.querySelectorAll('.dhikr-audio-btn').forEach(b=>{const id=Number(b.getAttribute('onclick')?.match(/\((\d+)/)?.[1]);const icon=document.getElementById(`dhikr-audio-icon-${id}`),label=document.getElementById(`dhikr-audio-label-${id}`);if(!icon||!label)return;const active=id===activeDhikrAudioId,ap=dhikrAudioProgress(id);icon.className=`fas fa-${active&&!activeDhikrAudio?.paused?'pause':'play'}`;label.textContent=active?(activeDhikrAudio?.paused?`متابعة ${ap.current}/${ap.count}`:`التكرار ${Math.min(ap.current+1,ap.count)}/${ap.count}`):'استماع'})}
function stopDhikrAudio(reset=true){if(activeDhikrAudio){activeDhikrAudio.pause();if(reset)activeDhikrAudio.currentTime=0}if(reset){activeDhikrAudio=null;activeDhikrAudioId=null;activeDhikrAudioCategory=null}syncDhikrAudioUI()}
function renderDhikrAudioProgress(id,current,count,completed=false){const card=document.getElementById(`adhkar-${id}`);if(!card)return;const fill=card.querySelector('.progress-fill');if(fill)fill.style.width=`${Math.min(100,current/count*100)}%`;const done=card.querySelector('.complete-btn');if(done){done.textContent=completed?'✓ مكتمل بالسماع':`${current} / ${count}`;done.disabled=completed}if(completed)card.classList.add('dhikr-audio-completed')}
function recordDhikrAudioRepetition(id){
    const hit=dhikrItem(id);if(!hit)return{completed:false,current:0,count:1};
    const count=Math.max(1,Number(hit.item.count)||1),progress=Storage.load('adhkar_progress')||{},old=progress[id]||{current:0,completed:false};
    if(old.completed)return{completed:true,current:count,count};
    const current=Math.min(count,(Number(old.current)||0)+1),completed=current>=count;
    progress[id]={...old,current,completed,lastAudioRepeat:new Date().toISOString(),...(completed?{lastCompleted:new Date().toISOString(),completedBy:'audio'}:{})};
    Storage.save('adhkar_progress',progress);renderDhikrAudioProgress(id,current,count,completed);return{completed,current,count};
}
function completeDhikrFromAudio(id){const hit=dhikrItem(id);if(!hit)return;const progress=Storage.load('adhkar_progress')||{};progress[id]={...(progress[id]||{}),current:hit.item.count,completed:true,lastCompleted:new Date().toISOString(),completedBy:'audio'};Storage.save('adhkar_progress',progress);renderDhikrAudioProgress(id,hit.item.count,hit.item.count,true)}
function handleDhikrAudioEnded(id){
    const result=recordDhikrAudioRepetition(id);emitDhikrState();
    if(!result.completed){
        // العدد المكتوب جزء من الذكر نفسه: نكرر التسجيل حتى يكتمل العدد، حتى لو كانت المتابعة التلقائية متوقفة.
        if(activeDhikrAudio&&activeDhikrAudioId===id){activeDhikrAudio.currentTime=0;activeDhikrAudio.play().catch(()=>window.showToast?.('تعذر متابعة تكرار الذكر'));syncDhikrAudioUI()}
        return;
    }
    const cat=activeDhikrAudioCategory,list=AdhkarDB[cat]||[],idx=list.findIndex(x=>x.id===id),next=dhikrAutoNext?list.slice(idx+1).find(x=>x.audio):null;
    if(next)playDhikrAudio(next.id,next.audio);else stopDhikrAudio();
}
function playDhikrAudio(id,src){
    const same=activeDhikrAudioId===id&&activeDhikrAudio;
    if(!same){stopDhikrAudio();window.stopQuranAyahAudio?.();window.stopSurahAudio?.();activeDhikrAudio=new Audio(src);activeDhikrAudioId=id;activeDhikrAudioCategory=dhikrItem(id)?.category||activeDhikrCategory;activeDhikrAudio.preload='auto';activeDhikrAudio.addEventListener('timeupdate',emitDhikrState);activeDhikrAudio.addEventListener('play',()=>{window.stopQuranAyahAudio?.();window.stopSurahAudio?.();syncDhikrAudioUI();emitDhikrState()});activeDhikrAudio.addEventListener('pause',()=>{syncDhikrAudioUI();emitDhikrState()});activeDhikrAudio.addEventListener('ended',()=>handleDhikrAudioEnded(id));activeDhikrAudio.addEventListener('error',()=>{stopDhikrAudio();window.showToast?.('تعذر تشغيل هذا التسجيل')})}
    activeDhikrAudio.play().catch(()=>window.showToast?.('تعذر بدء الصوت'));syncDhikrAudioUI();emitDhikrState();
}
function toggleDhikrAudio(id,src){if(activeDhikrAudioId===id&&activeDhikrAudio){activeDhikrAudio.paused?activeDhikrAudio.play():activeDhikrAudio.pause();return}playDhikrAudio(id,src)}
function dhikrAudioNext(){if(!activeDhikrAudioId)return;const hit=dhikrItem(activeDhikrAudioId),list=AdhkarDB[hit?.category]||[],idx=list.findIndex(x=>x.id===activeDhikrAudioId),next=list.slice(idx+1).find(x=>x.audio);if(next)playDhikrAudio(next.id,next.audio)}
function dhikrAudioPrevious(){if(!activeDhikrAudioId)return;const hit=dhikrItem(activeDhikrAudioId),list=AdhkarDB[hit?.category]||[],idx=list.findIndex(x=>x.id===activeDhikrAudioId),prev=list.slice(0,idx).reverse().find(x=>x.audio);if(prev)playDhikrAudio(prev.id,prev.audio)}
window.stopDhikrAudio=stopDhikrAudio;window.toggleDhikrAudio=toggleDhikrAudio;window.dhikrAudioNext=dhikrAudioNext;window.dhikrAudioPrevious=dhikrAudioPrevious;window.toggleDhikrGlobal=()=>{if(activeDhikrAudio)activeDhikrAudio.paused?activeDhikrAudio.play():activeDhikrAudio.pause()};window.filterImportedAdhkar=filterImportedAdhkar;window.setDhikrAutoNext=setDhikrAutoNext;

function updateDhikrCount(id, change) {
    const dhikr = getAllDhikr().find(d => d.id === id);
    if (!dhikr) return;

    const progress = Storage.load('adhkar_progress') || {};
    const currentState = progress[id] || { current: 0, completed: false };
    
    let newCount = currentState.current + change;
    newCount = Math.max(0, Math.min(newCount, dhikr.count));
    
    progress[id] = {
        current: newCount,
        completed: newCount >= dhikr.count,
        lastUpdated: new Date().toISOString()
    };
    
    Storage.save('adhkar_progress', progress);
    renderAdhkar(activeDhikrCategory);
}

function completeDhikrNow(id) {
    const dhikr = getAllDhikr().find(d => d.id === id);
    if (!dhikr) return;

    const progress = Storage.load('adhkar_progress') || {};
    progress[id] = {
        current: dhikr.count,
        completed: true,
        lastCompleted: new Date().toISOString()
    };
    
    Storage.save('adhkar_progress', progress);
    renderAdhkar(activeDhikrCategory);
}

function completeDhikrCategory(category) {
    const progress = Storage.load('adhkar_progress') || {};
    (AdhkarDB[category] || []).forEach(item => {
        progress[item.id] = { current: item.count, completed: true, lastCompleted: new Date().toISOString() };
    });
    Storage.save('adhkar_progress', progress);
    renderAdhkar(category);
}

function resetDhikrCategory(category) {
    if (!confirm(`هل تريد تصفير ${category === 'morning' ? 'أذكار الصباح' : category === 'evening' ? 'أذكار المساء' : 'هذا القسم'}؟`)) return;
    const progress = Storage.load('adhkar_progress') || {};
    (AdhkarDB[category] || []).forEach(item => delete progress[item.id]);
    Storage.save('adhkar_progress', progress);
    renderAdhkar(category);
}

// ========== صفحة المسبحة ==========

let tasbeehKeyboardReady = false;

function renderTasbeeh() {
    const content = document.getElementById('page-content');
    content.className = 'fade-in';
    
    let count = Storage.load('tasbeeh_count') || 0;
    let totalCount = Storage.load('tasbeeh_total') || 0;
    let sessionCount = Storage.load('tasbeeh_session') || 0;
    let currentDhikrIndex = Storage.load('current_dhikr_index') || 0;
    
    const currentDhikr = TasbeehList[currentDhikrIndex];
    const progress = Math.min(100, (count / currentDhikr.target) * 100);
    
    content.innerHTML = `
        <div class="card" style="text-align: center; padding: 20px;">
            <div class="card-title" style="justify-content: center;">
                <i class="fas fa-hands-praying"></i> المسبحة الإلكترونية
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0; flex-wrap: wrap;">
                <div style="text-align: center; flex: 1; min-width: 120px;">
                    <div style="font-size: 2rem; color: var(--primary-color);">${count}</div>
                    <div style="font-size: 0.8rem;">عدد التسبيحات</div>
                </div>
                <div style="text-align: center; flex: 1; min-width: 120px;">
                    <div style="font-size: 2rem; color: var(--secondary-color);">${totalCount}</div>
                    <div style="font-size: 0.8rem;">الإجمالي</div>
                </div>
                <div style="text-align: center; flex: 1; min-width: 120px;">
                    <div style="font-size: 2rem; color: var(--accent-color);">${sessionCount}</div>
                    <div style="font-size: 0.8rem;">هذه الجلسة</div>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; margin: 20px 0;">
                <div id="dhikr-display" style="font-size: 1.8rem; color: var(--primary-color); 
                     font-family: 'Amiri', serif; margin-bottom: 10px; min-height: 60px;">
                    ${currentDhikr.text}
                </div>
                
                <div style="font-size: 0.9rem; color: var(--text-color); opacity: 0.8;">
                    التكرار: ${count} من ${currentDhikr.target}
                </div>
                
                <div class="progress-bar" style="height: 10px; margin: 15px 0;">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                    <button onclick="changeDhikr('prev')" class="counter-btn" style="width: 40px;">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <select id="dhikr-select" onchange="selectDhikr(this.value)" 
                            style="flex: 1; padding: 10px; border-radius: 10px; 
                                   background: var(--card-bg); color: var(--text-color);
                                   border: 1px solid var(--soft-white); font-family: 'Tajawal';">
                        ${TasbeehList.map((item, index) => `
                            <option value="${index}" ${index === currentDhikrIndex ? 'selected' : ''}>
                                ${item.text} (${item.target} مرة)
                            </option>
                        `).join('')}
                    </select>
                    <button onclick="changeDhikr('next')" class="counter-btn" style="width: 40px;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
            </div>
            
            <div style="margin: 30px 0;">
                <button id="tasbeeh-btn" onclick="incrementTasbeeh()" class="tasbeeh-btn">
                    <i class="fas fa-hand-point-up"></i>
                </button>
                
                <div style="margin-top: 20px; font-size: 0.9rem; color: var(--text-color); opacity: 0.8;">
                    انقر على الزر أو استخدم مفتاح المسافة
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px;">
                <button class="tab-btn" onclick="resetCurrentDhikr()" 
                        style="background: rgba(231, 76, 60, 0.2); color: #e74c3c;">
                    <i class="fas fa-redo"></i> تصفير الحالي
                </button>
                <button class="tab-btn" onclick="completeDhikrSession()" 
                        style="background: rgba(46, 204, 113, 0.2); color: var(--secondary-color);">
                    <i class="fas fa-check"></i> إكمال الذكر
                </button>
                <button class="tab-btn" onclick="resetAllTasbeeh()" 
                        style="background: rgba(52, 152, 219, 0.2); color: var(--accent-color);">
                    <i class="fas fa-trash"></i> حذف الكل
                </button>
            </div>
        </div>
    `;
    
    setupTasbeehKeyboard();
}

function changeDhikr(direction) {
    let currentIndex = Storage.load('current_dhikr_index') || 0;
    const totalDhikr = TasbeehList.length;
    
    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % totalDhikr;
    } else {
        currentIndex = (currentIndex - 1 + totalDhikr) % totalDhikr;
    }
    
    Storage.save('current_dhikr_index', currentIndex);
    Storage.save('tasbeeh_count', 0);
    renderTasbeeh();
}

function selectDhikr(index) {
    Storage.save('current_dhikr_index', parseInt(index));
    Storage.save('tasbeeh_count', 0);
    renderTasbeeh();
}

function incrementTasbeeh() {
    let count = Storage.load('tasbeeh_count') || 0;
    let totalCount = Storage.load('tasbeeh_total') || 0;
    let sessionCount = Storage.load('tasbeeh_session') || 0;
    let currentIndex = Storage.load('current_dhikr_index') || 0;
    
    count++;
    totalCount++;
    sessionCount++;
    
    Storage.save('tasbeeh_count', count);
    Storage.save('tasbeeh_total', totalCount);
    Storage.save('tasbeeh_session', sessionCount);
    
    // تحديث العرض
    const btn = document.getElementById('tasbeeh-btn');
    if (btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 100);
    }
    
    // التحقق إذا اكتمل الذكر
    if (count >= TasbeehList[currentIndex].target) {
        // حفظ التقدم
        const progress = Storage.load('tasbeeh_progress') || {};
        progress[currentIndex] = (progress[currentIndex] || 0) + 1;
        Storage.save('tasbeeh_progress', progress);
        
        // الانتقال للذكر التالي تلقائياً
        setTimeout(() => {
            changeDhikr('next');
        }, 1000);
    }
    
    renderTasbeeh();
}

function setupTasbeehKeyboard() {
    if (tasbeehKeyboardReady) return;
    tasbeehKeyboardReady = true;
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && AppState.currentTab === 'tasbeeh') {
            e.preventDefault();
            incrementTasbeeh();
        }
    });
}

function resetCurrentDhikr() {
    if (confirm("هل تريد تصفير عداد الذكر الحالي؟")) {
        Storage.save('tasbeeh_count', 0);
        renderTasbeeh();
    }
}

function completeDhikrSession() {
    const count = Storage.load('tasbeeh_count') || 0;
    if (count > 0) {
        const progress = Storage.load('tasbeeh_progress') || {};
        const currentIndex = Storage.load('current_dhikr_index') || 0;
        progress[currentIndex] = (progress[currentIndex] || 0) + 1;
        Storage.save('tasbeeh_progress', progress);
        
        alert(`تهانينا! لقد أكملت ${count} تسبيحة`);
        Storage.save('tasbeeh_count', 0);
        Storage.save('tasbeeh_session', 0);
        changeDhikr('next');
    }
}

function resetAllTasbeeh() {
    if (confirm("هل تريد حذف جميع إحصائيات المسبحة؟")) {
        Storage.save('tasbeeh_count', 0);
        Storage.save('tasbeeh_total', 0);
        Storage.save('tasbeeh_session', 0);
        Storage.save('tasbeeh_progress', {});
        renderTasbeeh();
    }
}

// ========== صفحة الختمة ==========

function renderQuran() {
    const content = document.getElementById('page-content');
    content.className = 'fade-in';
    
    const surahs = [
        "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام",
        "الأعراف","الأنفال","التوبة","يونس","هود","يوسف",
        "الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف",
        "مريم","طه","الأنبياء","الحج","المؤمنون","النور",
        "الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
        "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس",
        "الصافات","ص","الزمر","غافر","فصلت","الشورى",
        "الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح",
        "الحجرات","ق","الذاريات","الطور","النجم","القمر",
        "الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
        "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم",
        "الملك","القلم","الحاقة","المعارج","نوح","الجن",
        "المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ",
        "النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق",
        "البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
        "الشمس","الليل","الضحى","الشرح","التين","العلق",
        "القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر",
        "العصر","الهمزة","الفيل","قريش","الماعون","الكوثر",
        "الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"
    ];
    
    let html = `
        <div class="card">
            <div class="card-title"><i class="fas fa-book-open"></i> متابعة الختمة</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <div style="font-size: 1.2rem; color: var(--primary-color);">${AppState.quranProgress.length}</div>
                    <div style="font-size: 0.8rem;">سورة مكتملة</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.2rem; color: var(--accent-color);">${Math.round((AppState.quranProgress.length/114)*100)}%</div>
                    <div style="font-size: 0.8rem;">إنجاز الختمة</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.2rem; color: var(--secondary-color);">${114 - AppState.quranProgress.length}</div>
                    <div style="font-size: 0.8rem;">متبقي</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(AppState.quranProgress.length/114)*100}%"></div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap:10px; margin-top: 20px;">
    `;

    // عرض أول 30 سورة فقط للتبسيط
    surahs.slice(0, 30).forEach((name, i) => {
        const id = i + 1;
        const isRead = AppState.quranProgress.includes(id);
        html += `
            <div onclick="toggleSurah(${id})" style="padding:10px; font-size:0.8rem; text-align:center; border-radius:8px; cursor:pointer; 
                 background:${isRead ? 'var(--primary-color)' : 'var(--soft-white)'}; 
                 color:${isRead ? '#000' : 'var(--text-color)'}; border:1px solid ${isRead ? 'transparent' : 'color-mix(in srgb, var(--primary-color) 30%, transparent)'};
                 display:flex; flex-direction:column; align-items:center;">
                <div style="font-size:0.7rem; color:${isRead ? '#000' : 'var(--primary-color)'}">${id}</div>
                <div>${name}</div>
            </div>
        `;
    });

    html += `</div>`;
    
    // إضافة أزرار للتنقل بين صفحات السور
    html += `
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
            <button class="tab-btn" onclick="showSurahPage(1)">
                <i class="fas fa-arrow-right"></i> الصفحة التالية
            </button>
        </div>
    `;
    
    html += `</div>`;
    content.innerHTML = html;
}

function toggleSurah(id) {
    const index = AppState.quranProgress.indexOf(id);
    if (index > -1) {
        AppState.quranProgress.splice(index, 1);
    } else {
        AppState.quranProgress.push(id);
        AppState.quranProgress.sort((a, b) => a - b);
    }
    Storage.save('quran_v3', AppState.quranProgress);
    renderQuran();
}

function showSurahPage(page) {
    // يمكن توسيع هذه الدالة لعرض المزيد من السور
    renderQuran();
}

// ========== صفحة السمات ==========

function renderThemes() {
    const content = document.getElementById('page-content');
    content.className = 'fade-in';
    
    content.innerHTML = `
        <div class="card">
            <div class="card-title"><i class="fas fa-palette"></i> اختيار سمة التطبيق</div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto;">
                <button class="tab-btn ${!AppState.currentTheme.includes('-light') ? 'active' : ''}" 
                        onclick="filterThemes('dark')">
                    <i class="fas fa-moon"></i> السمات الليلية
                </button>
                <button class="tab-btn ${AppState.currentTheme.includes('-light') ? 'active' : ''}" 
                        onclick="filterThemes('light')">
                    <i class="fas fa-sun"></i> السمات النهارية
                </button>
            </div>
            
            <div class="theme-selector" id="themes-container">
                ${renderFilteredThemes('all')}
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--soft-white);">
                <p style="color: var(--primary-color); font-weight: bold;">معلومات السمة الحالية:</p>
                <div style="display: flex; gap: 15px; margin-top: 15px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; border-radius: 4px; background: var(--primary-color);"></div>
                        <span>اللون الرئيسي</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; border-radius: 4px; background: var(--secondary-color);"></div>
                        <span>لون التأكيد</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; border-radius: 4px; background: var(--accent-color);"></div>
                        <span>لون التمييز</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title"><i class="fas fa-lightbulb"></i> نصائح للاستخدام</div>
            <ul style="padding-right: 20px; line-height: 1.8;">
                <li>السمة المفضلة لديك سيتم حفظها تلقائياً</li>
                <li>جرب عدة سمات لترى أيها أكثر راحة لعينيك</li>
                <li>يمكنك العودة إلى السمة الذهبية الافتراضية في أي وقت</li>
                <li>السمة الليلية مريحة للعين في الإضاءة المنخفضة</li>
                <li>السمة النهارية مناسبة للقراءة في الضوء الساطع</li>
            </ul>
        </div>
    `;
}

function renderFilteredThemes(filter) {
    let filteredThemes = Themes;
    
    if (filter === 'dark') {
        filteredThemes = Themes.filter(theme => !theme.id.includes('-light'));
    } else if (filter === 'light') {
        filteredThemes = Themes.filter(theme => theme.id.includes('-light'));
    }
    
    return filteredThemes.map(theme => `
        <div>
            <button class="theme-btn ${theme.id.includes('-light') ? theme.id.replace('-light', '-light') : theme.id} 
                    ${AppState.currentTheme === theme.id ? 'active' : ''}" 
                    onclick="changeTheme('${theme.id}')" title="${theme.name}">
            </button>
            <div class="theme-label">${theme.name}</div>
        </div>
    `).join('');
}

function filterThemes(filter) {
    const container = document.getElementById('themes-container');
    if (container) {
        container.innerHTML = renderFilteredThemes(filter);
    }
}

function changeTheme(themeId) {
    applyTheme(themeId);
    if (AppState.currentTab === 'themes') renderThemes();
    if (AppState.currentTab === 'settings') window.renderSettings?.();
}

// ========== صفحة الإعدادات ==========

function renderSettings() {
    const content = document.getElementById('page-content');
    content.className = 'fade-in';
    
    const totalDhikr = Object.values(Storage.load('adhkar_progress') || {}).filter(d => d && d.completed).length;
    const totalPrayers = (AppState.prayerLog.list || []).filter(p => p).length;
    const totalSurahs = AppState.quranProgress.length;
    const tasbeehTotal = Storage.load('tasbeeh_total') || 0;
    
    const themeMode = Storage.load('theme_mode') || 'dark';
    const autoTheme = Storage.load('auto_theme') || false;
    
    content.innerHTML = `
        <div class="settings-heading"><i class="fas fa-user-gear"></i><div><h2>الإعدادات</h2><p>المظهر، الصلاة، البيانات وخصائص التطبيق في مكان واحد.</p></div></div>
        <h3 class="settings-group-title">ملخص النشاط</h3>
        <div class="card">
            <div class="card-title"><i class="fas fa-chart-line"></i> إحصائياتك</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                <div style="background: color-mix(in srgb, var(--secondary-color) 10%, transparent); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--secondary-color);">${totalSurahs}</div>
                    <div style="font-size: 0.8rem;">سورة مقروءة</div>
                </div>
                <div style="background: color-mix(in srgb, var(--accent-color) 10%, transparent); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--accent-color);">${totalDhikr}</div>
                    <div style="font-size: 0.8rem;">ذكر مكتمل</div>
                </div>
                <div style="background: color-mix(in srgb, var(--primary-color) 10%, transparent); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--primary-color);">${totalPrayers}</div>
                    <div style="font-size: 0.8rem;">صلاة اليوم</div>
                </div>
                <div style="background: color-mix(in srgb, #9b59b6 10%, transparent); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.5rem; color: #9b59b6;">${tasbeehTotal}</div>
                    <div style="font-size: 0.8rem;">تسبيحة</div>
                </div>
            </div>
        </div>

        <h3 class="settings-group-title">المظهر والقراءة</h3>
        <div class="card settings-card">
            <div class="card-title"><i class="fas fa-adjust"></i> الوضع النهاري / الليلي</div>
            
            <div style="display: flex; gap: 15px; margin: 20px 0;">
                <div onclick="toggleTheme(true)" 
                     style="flex: 1; text-align: center; padding: 20px; border-radius: 10px; cursor: pointer;
                            background: ${themeMode === 'light' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'};
                            color: ${themeMode === 'light' ? '#000' : 'var(--text-color)'};
                            border: 2px solid ${themeMode === 'light' ? 'var(--primary-color)' : 'transparent'};">
                    <i class="fas fa-sun fa-2x"></i>
                    <div style="margin-top: 10px; font-weight: bold;">نهاري</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">فاتح وسهل القراءة</div>
                </div>
                
                <div onclick="toggleTheme(false)" 
                     style="flex: 1; text-align: center; padding: 20px; border-radius: 10px; cursor: pointer;
                            background: ${themeMode === 'dark' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'};
                            color: ${themeMode === 'dark' ? '#000' : 'var(--text-color)'};
                            border: 2px solid ${themeMode === 'dark' ? 'var(--primary-color)' : 'transparent'};">
                    <i class="fas fa-moon fa-2x"></i>
                    <div style="margin-top: 10px; font-weight: bold;">ليلي</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">مريح للعين في الليل</div>
                </div>
            </div>
            
            <div class="list-item">
                <span>
                    <i class="fas fa-robot"></i> الوضع التلقائي
                    <div style="font-size: 0.8rem; opacity: 0.8;">يتغير تلقائياً حسب الوقت</div>
                </span>
                <div>
                    <input type="checkbox" id="auto-theme" 
                           ${autoTheme ? 'checked' : ''}
                           onchange="toggleAutoTheme()">
                </div>
            </div>
        </div>

        <div class="card settings-card">
            <div class="card-title"><i class="fas fa-palette"></i> ألوان التطبيق</div>
            <p class="settings-description">اختر السمة التي تناسب القراءة نهارًا أو ليلًا. يتم حفظ اختيارك تلقائيًا.</p>
            <div class="settings-theme-filters">
                <button class="app-button" onclick="filterThemes('dark')"><i class="fas fa-moon"></i> ليلية</button>
                <button class="app-button" onclick="filterThemes('light')"><i class="fas fa-sun"></i> نهارية</button>
                <button class="app-button" onclick="filterThemes('all')"><i class="fas fa-border-all"></i> الكل</button>
            </div>
            <div class="theme-selector" id="themes-container">${renderFilteredThemes('all')}</div>
        </div>

        <h3 class="settings-group-title">التحكم والبيانات</h3>
        <div class="card settings-card">
            <div class="card-title"><i class="fas fa-gears"></i> الإعدادات والتحكم</div>
            <button class="btn-primary" style="margin-bottom: 10px;" onclick="resetToday()">
                <i class="fas fa-redo"></i> إعادة تعيين أعمال اليوم
            </button>
            <button class="btn-primary" style="background: var(--accent-color); margin-bottom: 10px;" onclick="updatePrayerTimesWithFeedback()">
                <i class="fas fa-sync-alt"></i> تحديث مواقيت الصلاة
            </button>
            <button class="btn-primary" style="background: #e74c3c;" onclick="clearAllData()">
                <i class="fas fa-trash"></i> حذف كافة البيانات
            </button>
        </div>

        <div class="card">
            <div class="card-title"><i class="fas fa-circle-info"></i> حول التطبيق</div>
            <p>تطبيق <span style="color: var(--primary-color)">زاد المسلم</span> - الإصدار ${window.ZAD_APP?.version || '4.9.3-beta.5.2'}</p>
            <p style="font-size: 0.9rem; line-height: 1.6;">
                تطبيق متكامل لمتابعة العبادات اليومية، الأذكار، وقراءة القرآن الكريم.<br>
                يعمل دون اتصال في القرآن والأذكار بعد التحميل الأول ويحفظ تقدمك محلياً.<br>
                <strong>مواقيت الصلاة:</strong> تحتاج اتصالاً عند التحديث وترسل الإحداثيات فقط إلى مزود المواقيت.
            </p>
            <div style="display: flex; gap: 15px; margin-top: 15px; justify-content: center;">
                <div style="text-align: center;">
                    <i class="fas fa-shield-alt" style="color: var(--secondary-color); font-size: 1.5rem;"></i>
                    <div style="font-size: 0.7rem;">خصوصية تامة</div>
                </div>
                <div style="text-align: center;">
                    <i class="fas fa-wifi-slash" style="color: var(--primary-color); font-size: 1.5rem;"></i>
                    <div style="font-size: 0.7rem;">يعمل بدون نت</div>
                </div>
                <div style="text-align: center;">
                    <i class="fas fa-map-marker-alt" style="color: #3498db; font-size: 1.5rem;"></i>
                    <div style="font-size: 0.7rem;">تحديد تلقائي</div>
                </div>
            </div>
        </div>

        <div class="card community-counter-card" id="community-counter-card" aria-live="polite">
            <div class="community-counter-icon"><i class="fas fa-users"></i></div>
            <div class="community-counter-copy">
                <div class="card-title">مجتمع زاد المسلم</div>
                <p id="community-counter-message">جارٍ معرفة عدد مستخدمي التطبيق…</p>
                <small>يُحتسب هذا الجهاز مرة واحدة دون اسم أو بريد أو موقع جغرافي.</small>
            </div>
            <div class="community-counter-number" id="community-counter-number">—</div>
        </div>
    `;

    window.ZadCommunityCounter?.mount();
}

function resetToday() {
    if (confirm("هل تريد إعادة تعيين أعمال اليوم؟")) {
        AppState.prayerLog.list = Array(5).fill(false);
        Storage.save('prayer_v3', AppState.prayerLog);
        renderHome();
    }
}

async function clearAllData() {
    if (confirm("هل أنت متأكد من حذف بيانات زاد المسلم؟ لا يمكن التراجع عن هذا الإجراء!")) {
        Object.keys(localStorage).filter(key => /^(zad_|quran_|prayer_|adhkar_|tasbeeh_|current_dhikr_|theme_|auto_theme|manual_location|user_location|cached_prayer_times)/.test(key)).forEach(key => localStorage.removeItem(key));
        if ('caches' in window) {
            try { await Promise.all([caches.delete('zad-quran-audio-v45'), caches.delete('zad-quran-surah-audio-v461')]); } catch (_) {}
        }
        AppState = {
            currentTab: 'home',
            currentTheme: 'default',
            quranProgress: [],
            prayerLog: { date: '', list: [] },
            adhkarHistory: {},
            themeMode: 'dark',
            autoTheme: false
        };
        applyTheme('default');
        location.reload();
    }
}

// ========== صفحة المزيد ==========

function renderMore() {
    const content = document.getElementById('page-content');
    if (!content) return;
    content.className = 'fade-in more-page';
    const items = [
        ['fa-circle-notch', 'المسبحة', 'تسبيح سريع مع حفظ العدد', "loadTab('tasbeeh')"],
        ['fa-compass', 'القبلة', 'معرفة اتجاه القبلة', 'renderQibla()'],
        ['fa-palette', 'المظهر', 'اختيار الألوان ووضع القراءة', "loadTab('themes')"],
        ['fa-user-gear', 'الإعدادات', 'التنبيهات والبيانات والخصوصية', "loadTab('settings')"],
        ['fa-download', 'التنزيلات', 'إدارة التلاوات المحفوظة', 'renderAudioDownloads()'],
        ['fa-mobile-screen-button', 'تطبيق Android', '4.9.3-beta.5.2 — إصلاحات الاستقرار والتحديث', "window.open('https://github.com/kingstoty-cyber/Zad-al-Muslim/actions/workflows/android-apk.yml','_blank','noopener')"]
    ];
    content.innerHTML = `
        <div class="simple-page-heading">
            <i class="fas fa-ellipsis"></i>
            <div><h2>المزيد</h2><p>الأدوات والإعدادات الثانوية في مكان واحد.</p></div>
        </div>
        <div class="more-grid">
            ${items.map(([icon, title, description, action]) => `<button class="more-card" onclick="${action}">
                <i class="fas ${icon}"></i>
                <span><strong>${title}</strong><small>${description}</small></span>
                <i class="fas fa-chevron-left more-arrow"></i>
            </button>`).join('')}
        </div>`;
}

window.renderMore = renderMore;

// ========== الدوال العامة ==========

function loadTab(tabName) {
    closeAdhkarDrawer?.();
    AppState.currentTab = tabName;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });

    switch(tabName) {
        case 'home': (window.renderHome || renderHome)(); break;
        case 'adhkar': (window.renderAdhkar || renderAdhkar)(); break;
        case 'tasbeeh': (window.renderTasbeeh || renderTasbeeh)(); break;
        case 'quran': (window.renderQuran || renderQuran)(); break;
        case 'audio-quran': window.renderAudioQuran?.(); break;
        case 'more': (window.renderMore || renderMore)(); break;
        case 'themes': (window.renderThemes || renderThemes)(); break;
        case 'settings': (window.renderSettings || renderSettings)(); break;
    }
    
    window.scrollTo(0, 0);
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ========== تهيئة التطبيق (تعديل خفيف) ==========

window.onload = async () => {
    // 1. تطبيق السمة الأساسية
    applyTheme();
    
    // 2. تحديد الوضع التلقائي
    setupAutoTheme();
    
    // 3. عرض التاريخ
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = getArabicDate();
    const themeEl = document.getElementById('current-theme');
    if (themeEl) themeEl.style.cssText = "font-size: 0.9rem; color: var(--primary-color); margin-top: 5px;";
    
    // 4. تحميل المواقيت من موقع محفوظ مسبقًا فقط؛ لا نطلب إذنًا أو موقع IP عند بدء التطبيق.
    console.log("بدء تحميل التطبيق...");
    setTimeout(async () => {
        try {
            let savedLocation = null;
            try { savedLocation = getManualLocation() || JSON.parse(localStorage.getItem('user_location') || 'null'); } catch (_) {}
            if (savedLocation && needsUpdateForManualLocation()) {
                console.log("جاري تحديث مواقيت الصلاة لموقع محفوظ مسبقًا...");
                await window.updatePrayerTimes?.();
            } else {
                console.log(savedLocation ? "استخدام الكاش الحالي لمواقيت اليوم" : "لم يُختر موقع بعد؛ الإذن لا يُطلب إلا بعد ضغط المستخدم");
                const cached = loadCachedTimes();
                if (cached?.times) {
                    PrayerTimes = [
                        { name: "الفجر", time: cached.times.fajr },
                        { name: "الشروق", time: cached.times.sunrise },
                        { name: "الظهر", time: cached.times.dhuhr },
                        { name: "العصر", time: cached.times.asr },
                        { name: "المغرب", time: cached.times.maghrib },
                        { name: "العشاء", time: cached.times.isha }
                    ];
                }
            }
            console.log("اكتمل تحميل التطبيق");
        } catch (e) { console.error("خطأ أثناء التحميل المبدئي:", e); }
    }, 800);
    
    // 5. تحميل الصفحة الرئيسية
    (window.renderHome || renderHome)();
    
    // 6. تحديث التاريخ كل دقيقة
    setInterval(() => {
        const el = document.getElementById('current-date');
        if (el) el.textContent = getArabicDate();
    }, 60000);
    
    // 7. تحديث مواقيت الصلاة كل 6 ساعات (اختياري)
    setInterval(async () => {
        let savedLocation = null;
        try { savedLocation = getManualLocation() || JSON.parse(localStorage.getItem('user_location') || 'null'); } catch (_) {}
        if (savedLocation) {
            console.log("تحديث دوري للمواقيت باستخدام موقع محفوظ مسبقًا...");
            await window.updatePrayerTimes?.();
        }
    }, 6 * 3600000);
    
    // 8. لا يوجد زر صعود عائم في Beta 5؛ لذلك لا نربط مستمع تمرير قديم.
    
    // 9. طلب إذن الإشعارات
    // يطلب إذن الإشعارات من زر واضح داخل الإعدادات فقط، لأن المتصفحات
    // تمنع طلب الإذن التلقائي دون تفاعل مباشر من المستخدم.
    
    // 10. إعداد الوضع التلقائي
    if (AppState.autoTheme) {
        setInterval(() => {
            setupAutoTheme();
        }, 3600000); // التحقق كل ساعة
    }
    
    // 11. التنقل السفلي يُدار مركزيًا في app-shell.js حتى لا يتعطل إذا فشل جزء آخر من onload.
};

// تصدير الدوال للاستخدام العام (أضفت دوال الموقع اليدوي لاستخدامها من الواجهة)
window.getRandomReminder = getRandomReminder;
window.getArabicDate = getArabicDate;
window.getRandomAyah = getRandomAyah;
window.updatePrayerTimes = updatePrayerTimes;
window.updatePrayerTimesWithFeedback = updatePrayerTimesWithFeedback;
window.togglePrayer = togglePrayer;
window.updateDhikrCount = updateDhikrCount;
window.completeDhikrNow = completeDhikrNow;
window.completeDhikrCategory = completeDhikrCategory;
window.resetDhikrCategory = resetDhikrCategory;
window.changeDhikr = changeDhikr;
window.selectDhikr = selectDhikr;
window.incrementTasbeeh = incrementTasbeeh;
window.resetCurrentDhikr = resetCurrentDhikr;
window.completeDhikrSession = completeDhikrSession;
window.resetAllTasbeeh = resetAllTasbeeh;
window.toggleSurah = toggleSurah;
window.filterThemes = filterThemes;
window.changeTheme = changeTheme;
window.toggleTheme = toggleTheme;
window.toggleAutoTheme = toggleAutoTheme;
window.resetToday = resetToday;
window.clearAllData = clearAllData;
window.loadTab = loadTab;
window.scrollToTop = scrollToTop;
// دوال الموقع اليدوي
window.saveManualLocation = saveManualLocation;
window.getManualLocation = getManualLocation;
window.clearManualLocation = clearManualLocation;
window.needsUpdateForManualLocation = needsUpdateForManualLocation;
setupManualLocationPanel();
