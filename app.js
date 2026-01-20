<meta name='viewport' content='width=device-width, initial-scale=1'/><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تطبيق زاد المسلم v3.0</title>
    
    <!-- مكتبات خارجية -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;500;800&family=Amiri&display=swap" rel="stylesheet">
    
    <!-- ملفات التطبيق -->
    <link rel="stylesheet" href="styles.css">
</head>
<body id="app-body">

    <div class="header-section">
        <h1>زاد المسلم</h1>
        <p id="current-date"></p>
        <div id="current-theme"></div>
    </div>

    <main class="main-content">
        <div id="page-content"></div>
    </main>

    <div class="scroll-top" id="scrollTop">
        <i class="fas fa-arrow-up"></i>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" data-tab="home">
            <i class="fas fa-home"></i>
            <span>الرئيسية</span>
        </div>
        <div class="nav-item" data-tab="adhkar">
            <i class="fas fa-bead-tree"></i>
            <span>الأذكار</span>
        </div>
        <div class="nav-item" data-tab="tasbeeh">
            <i class="fas fa-circle-notch"></i>
            <span>المسبحة</span>
        </div>
        <div class="nav-item" data-tab="quran">
            <i class="fas fa-book-quran"></i>
            <span>الختمة</span>
        </div>
        <div class="nav-item" data-tab="themes">
            <i class="fas fa-palette"></i>
            <span>السمات</span>
        </div>
        <div class="nav-item" data-tab="settings">
            <i class="fas fa-user-gear"></i>
            <span>الإعدادات</span>
        </div>
    </nav>

    <!-- ملفات JavaScript -->
    <script src="data.js"></script>
    <script src="app.js"></script>
</body>
</html><style>:root {
    /* ألوان السمة الذهبية (الافتراضية) */
    --primary-color: #c5a059;
    --primary-dark: #8e6d2d;
    --secondary-color: #2ecc71;
    --accent-color: #3498db;
    --bg-color: #0a0b10;
    --card-bg: #16181d;
    --text-color: #e0e0e0;
    --soft-white: rgba(255, 255, 255, 0.05);
    --shadow: 0 10px 30px rgba(0,0,0,0.3);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --theme-name: "ذهبي ليلي";
}

/* سمة زرقاء ليلية */
.theme-blue {
    --primary-color: #3498db;
    --primary-dark: #1d6fa5;
    --secondary-color: #2ecc71;
    --accent-color: #9b59b6;
    --bg-color: #0a1520;
    --card-bg: #16202d;
    --text-color: #e0f0ff;
    --theme-name: "أزرق ليلي";
}

/* سمة خضراء ليلية */
.theme-green {
    --primary-color: #2ecc71;
    --primary-dark: #27ae60;
    --secondary-color: #3498db;
    --accent-color: #f39c12;
    --bg-color: #0a100b;
    --card-bg: #16201a;
    --text-color: #e0ffe7;
    --theme-name: "أخضر ليلي";
}

/* سمة أرجوانية ليلية */
.theme-purple {
    --primary-color: #9b59b6;
    --primary-dark: #8e44ad;
    --secondary-color: #e74c3c;
    --accent-color: #3498db;
    --bg-color: #150a20;
    --card-bg: #20162d;
    --text-color: #f0e0ff;
    --theme-name: "أرجواني ليلي";
}

/* سمة برتقالية ليلية */
.theme-orange {
    --primary-color: #e67e22;
    --primary-dark: #d35400;
    --secondary-color: #2ecc71;
    --accent-color: #3498db;
    --bg-color: #1a0e0a;
    --card-bg: #2d1c16;
    --text-color: #ffeae0;
    --theme-name: "برتقالي ليلي";
}

/* ========== السمات النهارية ========== */

/* سمة ذهبية نهارية */
.theme-gold-light {
    --primary-color: #c5a059;
    --primary-dark: #8e6d2d;
    --secondary-color: #2ecc71;
    --accent-color: #3498db;
    --bg-color: #f8f9fa;
    --card-bg: #ffffff;
    --text-color: #2c3e50;
    --soft-white: rgba(0, 0, 0, 0.08);
    --shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    --theme-name: "ذهبي نهار";
}

/* سمة زرقاء نهارية */
.theme-blue-light {
    --primary-color: #3498db;
    --primary-dark: #1d6fa5;
    --secondary-color: #2ecc71;
    --accent-color: #9b59b6;
    --bg-color: #f0f8ff;
    --card-bg: #ffffff;
    --text-color: #2c3e50;
    --soft-white: rgba(0, 0, 0, 0.08);
    --shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    --theme-name: "أزرق نهار";
}

/* سمة خضراء نهارية */
.theme-green-light {
    --primary-color: #2ecc71;
    --primary-dark: #27ae60;
    --secondary-color: #3498db;
    --accent-color: #f39c12;
    --bg-color: #f0fff4;
    --card-bg: #ffffff;
    --text-color: #2c3e50;
    --soft-white: rgba(0, 0, 0, 0.08);
    --shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    --theme-name: "أخضر نهار";
}

/* سمة أرجوانية نهارية */
.theme-purple-light {
    --primary-color: #9b59b6;
    --primary-dark: #8e44ad;
    --secondary-color: #e74c3c;
    --accent-color: #3498db;
    --bg-color: #f9f0ff;
    --card-bg: #ffffff;
    --text-color: #2c3e50;
    --soft-white: rgba(0, 0, 0, 0.08);
    --shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    --theme-name: "أرجواني نهار";
}

/* سمة برتقالية نهارية */
.theme-orange-light {
    --primary-color: #e67e22;
    --primary-dark: #d35400;
    --secondary-color: #2ecc71;
    --accent-color: #3498db;
    --bg-color: #fff4e6;
    --card-bg: #ffffff;
    --text-color: #2c3e50;
    --soft-white: rgba(0, 0, 0, 0.08);
    --shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    --theme-name: "برتقالي نهار";
}

* {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: 'Tajawal', sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition: var(--transition);
}

/* شريط التنقل السفلي */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: var(--card-bg);
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top: 1px solid var(--soft-white);
    z-index: 1000;
    backdrop-filter: blur(10px);
    transition: var(--transition);
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #7f8c8d;
    text-decoration: none;
    font-size: 0.75rem;
    cursor: pointer;
    transition: var(--transition);
    padding: 8px 0;
}

.nav-item.active {
    color: var(--primary-color);
}

.nav-item i {
    font-size: 1.4rem;
    margin-bottom: 4px;
}

/* المحتوى الرئيسي */
.main-content {
    padding: 20px;
    padding-bottom: 90px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
}

.header-section {
    text-align: center;
    padding: 40px 0;
    background: linear-gradient(to bottom, var(--card-bg), transparent);
    border-radius: 0 0 30px 30px;
    margin-bottom: 25px;
    transition: var(--transition);
}

.header-section h1 {
    font-family: 'Amiri', serif;
    font-size: 2.5rem;
    color: var(--primary-color);
    margin: 0;
    transition: var(--transition);
}

.ayah-of-day {
    background: linear-gradient(135deg, var(--card-bg), color-mix(in srgb, var(--card-bg) 80%, #000));
    border-right: 4px solid var(--accent-color);
    margin: 15px 0;
    padding: 15px;
    border-radius: 12px;
    font-family: 'Amiri', serif;
    font-size: 1.2rem;
    line-height: 1.8;
    text-align: center;
    transition: var(--transition);
}

/* تصميم البطاقات */
.card {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid var(--soft-white);
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
    transition: var(--transition);
}

.card::before {
    content: "";
    position: absolute;
    top: 0; left: 0; width: 4px; height: 100%;
    background: var(--primary-color);
    transition: var(--transition);
}

.card-title {
    font-size: 1.2rem;
    font-weight: 800;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--primary-color);
    transition: var(--transition);
}

/* أنظمة الإدخال */
input[type="checkbox"] {
    appearance: none;
    width: 25px;
    height: 25px;
    border: 2px solid var(--primary-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: var(--transition);
}

input[type="checkbox"]:checked {
    background: var(--primary-color);
}

input[type="checkbox"]:checked::after {
    content: "\f00c";
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    color: var(--bg-color);
    font-size: 14px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid var(--soft-white);
}

.prayer-times {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 15px;
}

.prayer-time {
    background: rgba(255,255,255,0.05);
    padding: 12px;
    border-radius: 10px;
    text-align: center;
    transition: var(--transition);
}

.prayer-time.current {
    background: var(--primary-color);
    color: #000;
    font-weight: bold;
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.prayer-time .name {
    font-size: 0.9rem;
    color: var(--text-color);
    margin-bottom: 5px;
}

.prayer-time.current .name {
    color: #000;
}

.prayer-time .time {
    font-size: 1.1rem;
    font-weight: bold;
}

.dhikr-counter {
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    padding: 12px;
    border-radius: 12px;
    margin: 10px 0;
    border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
    transition: var(--transition);
}

.dhikr-text {
    font-family: 'Amiri', serif;
    font-size: 1.3rem;
    line-height: 1.8;
    margin-bottom: 15px;
    text-align: center;
    color: var(--text-color);
}

.counter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.counter-btn {
    background: var(--primary-color);
    color: #000;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    transition: var(--transition);
}

.counter-btn:hover {
    transform: scale(1.1);
}

.counter-display {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
}

.complete-btn {
    background: var(--secondary-color);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    font-family: 'Tajawal', sans-serif;
    cursor: pointer;
    transition: var(--transition);
}

.complete-btn:hover {
    transform: scale(1.05);
}

.progress-bar {
    height: 8px;
    background: var(--soft-white);
    border-radius: 4px;
    overflow: hidden;
    margin: 10px 0;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
    transition: width 0.5s ease, background 0.5s ease;
}

/* أزرار السمة */
.theme-selector {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-top: 15px;
}

.theme-btn {
    height: 50px;
    border-radius: 10px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.theme-btn.active {
    border-color: var(--text-color);
    transform: scale(1.05);
}

.theme-btn.active::after {
    content: "✓";
    position: absolute;
    top: 5px;
    left: 5px;
    background: rgba(0,0,0,0.7);
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
}

.theme-btn.gold { background: linear-gradient(135deg, #c5a059, #8e6d2d); }
.theme-btn.blue { background: linear-gradient(135deg, #3498db, #1d6fa5); }
.theme-btn.green { background: linear-gradient(135deg, #2ecc71, #27ae60); }
.theme-btn.purple { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
.theme-btn.orange { background: linear-gradient(135deg, #e67e22, #d35400); }

.theme-label {
    font-size: 0.8rem;
    text-align: center;
    margin-top: 5px;
    color: var(--text-color);
}

/* زر المتابعة */
.btn-primary {
    background: linear-gradient(45deg, var(--primary-dark), var(--primary-color));
    border: none;
    color: #000;
    padding: 15px 30px;
    border-radius: 12px;
    font-weight: bold;
    width: 100%;
    cursor: pointer;
    font-family: 'Tajawal', sans-serif;
    transition: var(--transition);
}

.btn-primary:hover {
    transform: scale(1.02);
    filter: brightness(1.1);
}

.tab-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 10px;
}

.tab-btn {
    background: var(--soft-white);
    border: none;
    color: var(--text-color);
    padding: 10px 20px;
    border-radius: 20px;
    font-family: 'Tajawal', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition);
}

.tab-btn.active {
    background: var(--primary-color);
    color: #000;
}

/* تأثيرات التحميل */
.fade-in {
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* زر العودة إلى الأعلى */
.scroll-top {
    position: fixed;
    bottom: 80px;
    left: 20px;
    background: var(--primary-color);
    color: #000;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0;
    transform: translateY(20px);
    transition: var(--transition);
    z-index: 999;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.scroll-top.visible {
    opacity: 1;
    transform: translateY(0);
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}

.smart-reminder {
    animation: pulse 3s infinite ease-in-out;
    border-right: 5px solid var(--accent-color);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

@keyframes tasbeeh-click {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}

.tasbeeh-clicked {
    animation: tasbeeh-click 0.2s ease;
}

/* تحسينات إضافية */
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.loading-spinner i {
    font-size: 3rem;
    color: var(--primary-color);
    margin-bottom: 20px;
}

/* تأثيرات الوضع النهاري */
body .theme-btn.gold-light { background: linear-gradient(135deg, #f8d7a4, #c5a059); }
body .theme-btn.blue-light { background: linear-gradient(135deg, #a8d5f7, #3498db); }
body .theme-btn.green-light { background: linear-gradient(135deg, #a3e9c3, #2ecc71); }
body .theme-btn.purple-light { background: linear-gradient(135deg, #d4b1e6, #9b59b6); }
body .theme-btn.orange-light { background: linear-gradient(135deg, #f7c9a1, #e67e22); }

/* تحسينات المسبحة */
.tasbeeh-container {
    text-align: center;
    padding: 20px;
}

.tasbeeh-btn {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 10px solid var(--card-bg);
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: #000;
    font-size: 3.5rem;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    transition: transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.tasbeeh-btn:active {
    transform: scale(0.95);
}

.dhikr-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dhikr-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* تحسينات للوضع النهاري */
body .card {
    box-shadow: var(--shadow);
}

body .bottom-nav {
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

body .ayah-of-day {
    background: linear-gradient(135deg, var(--card-bg), color-mix(in srgb, var(--card-bg) 90%, #fff));
}

/* تحسين شريط التقدم */
.progress-bar {
    position: relative;
}

.progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
        transparent, 
        rgba(255,255,255,0.2), 
        transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* تحسينات التحميل */
.location-update {
    background: rgba(52, 152, 219, 0.1);
    padding: 10px;
    border-radius: 10px;
    margin-top: 10px;
}

.location-update button {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Tajawal';
    margin-right: 10px;
}

.location-update button:hover {
    filter: brightness(1.1);
}</style><script>// ========== المتغيرات العامة ==========

// مواقيت الصلاة (سيتم تحديثها تلقائياً)
let PrayerTimes = [...Prayers];

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

function getCurrentPrayer() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayerTimesInMinutes = PrayerTimes.map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        return {
            name: prayer.name,
            minutes: hours * 60 + minutes
        };
    });
    
    for (let i = 0; i < prayerTimesInMinutes.length - 1; i++) {
        if (currentTime >= prayerTimesInMinutes[i].minutes && 
            currentTime < prayerTimesInMinutes[i + 1].minutes) {
            return prayerTimesInMinutes[i].name;
        }
    }
    
    return "الفجر";
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

    async getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.log("Geolocation غير مدعوم");
                resolve(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    
                    const locationData = {
                        lat: this.latitude,
                        lon: this.longitude,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('user_location', JSON.stringify(locationData));
                    
                    console.log("الموقع تم تحديده:", this.latitude, this.longitude);
                    resolve(true);
                },
                (error) => {
                    console.log("خطأ في تحديد الموقع:", error.message);
                    
                    const savedLocation = JSON.parse(localStorage.getItem('user_location') || 'null');
                    if (savedLocation && (Date.now() - savedLocation.timestamp) < 7 * 24 * 60 * 60 * 1000) {
                        this.latitude = savedLocation.lat;
                        this.longitude = savedLocation.lon;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },
                { 
                    enableHighAccuracy: true, 
                    timeout: 10000, 
                    maximumAge: 60000 
                }
            );
        });
    }

    // حساب مبسط لمواقيت الصلاة
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

    async getPrayerTimes() {
        const today = new Date().toDateString();
        const cached = JSON.parse(localStorage.getItem('cached_prayer_times') || 'null');
        
        if (cached && cached.date === today && cached.location) {
            return cached.times;
        }
        
        await this.getLocation();
        const times = this.computePrayerTimes();
        
        const cacheData = {
            date: today,
            location: { lat: this.latitude, lon: this.longitude },
            times: times
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
        const times = await prayerCalculator.getPrayerTimes();
        
        PrayerTimes = [
            { name: "الفجر", time: times.fajr },
            { name: "الشروق", time: times.sunrise },
            { name: "الظهر", time: times.dhuhr },
            { name: "العصر", time: times.asr },
            { name: "المغرب", time: times.maghrib },
            { name: "العشاء", time: times.isha }
        ];
        
        if (AppState.currentTab === 'home') {
            renderHome();
        }
    } catch (error) {
        console.log("استخدام الأوقات الافتراضية:", error);
    }
}

// ========== نظام السمات والوضع ==========

function applyTheme(themeId = AppState.currentTheme) {
    const body = document.getElementById('app-body');
    
    // تنظيف الكلاسات القديمة
    Themes.forEach(theme => {
        if (theme.class) body.classList.remove(theme.class);
    });
    
    // تطبيق السمة الجديدة
    const selectedTheme = Themes.find(t => t.id === themeId);
    if (selectedTheme && selectedTheme.class) {
        body.classList.add(selectedTheme.class);
    }
    
    // تحديث الحالة
    AppState.currentTheme = themeId;
    Storage.save('app_theme', themeId);
    
    // تحديث العرض
    const themeNameDisplay = document.getElementById('current-theme');
    if (themeNameDisplay) {
        themeNameDisplay.textContent = `السمة: ${selectedTheme ? selectedTheme.name : "ذهبي ليلي"}`;
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
        if (Themes.find(t => t.id === newTheme)) {
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
    content.className = 'fade-in';
    
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
                ${PrayerTimes.map(prayer => `
                    <div class="prayer-time ${prayer.name === currentPrayer ? 'current' : ''}">
                        <div class="name">${prayer.name}</div>
                        <div class="time">${prayer.time}</div>
                    </div>
                `).join('')}
            </div>
            <div class="location-update">
                <i class="fas fa-info-circle"></i> الصلاة الحالية: ${currentPrayer}
                <button onclick="updatePrayerTimesWithFeedback()">
                    <i class="fas fa-sync-alt"></i> تحديث الموقع
                </button>
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

function updatePrayerTimesWithFeedback() {
    const content = document.getElementById('page-content');
    const prayerCard = content.querySelector('.card:nth-child(2)');
    const updateBtn = prayerCard.querySelector('button');
    
    const originalText = updateBtn.innerHTML;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
    updateBtn.disabled = true;
    
    setTimeout(async () => {
        try {
            await updatePrayerTimes();
            updateBtn.innerHTML = '<i class="fas fa-check"></i> تم التحديث';
            setTimeout(() => {
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;
            }, 2000);
        } catch (error) {
            updateBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> فشل التحديث';
            setTimeout(() => {
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;
            }, 2000);
        }
    }, 1000);
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

function getCurrentDhikrCategory() {
    const categories = Object.keys(AdhkarDB);
    for (let cat of categories) {
        if (AdhkarDB[cat].some(d => AppState.adhkarHistory[d.id])) {
            return cat;
        }
    }
    return 'morning';
}

function renderAdhkar(category = 'morning') {
    const content = document.getElementById('page-content');
    content.className = 'fade-in';
    
    const categories = {
        morning: { name: 'أذكار الصباح', icon: 'fa-sun' },
        evening: { name: 'أذكار المساء', icon: 'fa-moon' },
        afterPrayer: { name: 'أذكار بعد الصلاة', icon: 'fa-mosque' },
        sleeping: { name: 'أذكار النوم', icon: 'fa-bed' },
        wakingUp: { name: 'أذكار الاستيقاظ', icon: 'fa-alarm-clock' }
    };

    const adhkarProgress = Storage.load('adhkar_progress') || {};
    
    let html = `
        <div class="card">
            <div class="card-title" style="justify-content: center;">
                <i class="fas ${categories[category].icon}"></i> ${categories[category].name}
            </div>
            
            <div class="tab-buttons">
                ${Object.entries(categories).map(([key, cat]) => `
                    <button class="tab-btn ${category === key ? 'active' : ''}" 
                            onclick="renderAdhkar('${key}')">
                        <i class="fas ${cat.icon}"></i> ${cat.name}
                    </button>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
                <div style="display: inline-flex; gap: 15px; background: rgba(255,255,255,0.05); 
                     padding: 10px 20px; border-radius: 20px;">
                    <div>
                        <div style="font-size: 1.2rem; color: var(--primary-color);">
                            ${Object.values(adhkarProgress).filter(v => v && v.completed).length}
                        </div>
                        <div style="font-size: 0.7rem;">أذكار مكتملة</div>
                    </div>
                    <div style="border-left: 1px solid var(--soft-white); padding-left: 15px;">
                        <div style="font-size: 1.2rem; color: var(--secondary-color);">
                            ${Object.values(AdhkarDB).flat().length}
                        </div>
                        <div style="font-size: 0.7rem;">مجموع الأذكار</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    AdhkarDB[category].forEach(item => {
        const progress = adhkarProgress[item.id] || { current: 0, completed: false };
        const percentage = (progress.current / item.count) * 100;
        
        html += `
            <div class="card dhikr-card" id="adhkar-${item.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div class="card-title" style="margin: 0;">
                        <i class="fas fa-quote-right"></i> ${item.reference}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--accent-color); background: rgba(52,152,219,0.1); 
                         padding: 2px 8px; border-radius: 10px;">
                        ${item.times}
                    </div>
                </div>
                
                <div class="dhikr-text">${item.text}</div>
                
                <div style="margin: 15px 0;">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-top: 5px;">
                        <span>${progress.current} من ${item.count}</span>
                        <span style="color: var(--primary-color);">${Math.round(percentage)}%</span>
                    </div>
                </div>
                
                <div class="counter-controls">
                    <button class="counter-btn" onclick="updateDhikrCount(${item.id}, -1)" 
                            ${progress.completed ? 'disabled style="opacity:0.5"' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="complete-btn" onclick="completeDhikrNow(${item.id})" 
                                ${progress.completed ? 'disabled style="opacity:0.5"' : ''}>
                            ${progress.completed ? '✓ مكتمل' : 'إكمال الذكر'}
                        </button>
                    </div>
                    
                    <button class="counter-btn" onclick="updateDhikrCount(${item.id}, 1)" 
                            ${progress.completed ? 'disabled style="opacity:0.5"' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
}

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
    renderAdhkar(getCurrentDhikrCategory());
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
    renderAdhkar(getCurrentDhikrCategory());
}

// ========== صفحة المسبحة ==========

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
                <i class="fas fa-bead-tree"></i> المسبحة الإلكترونية
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
    if (AppState.currentTab === 'themes') {
        renderThemes();
    }
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

        <div class="card">
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

        <div class="card">
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
            <p>تطبيق <span style="color: var(--primary-color)">زاد المسلم</span> - الإصدار 3.0</p>
            <p style="font-size: 0.9rem; line-height: 1.6;">
                تطبيق متكامل لمتابعة العبادات اليومية، الأذكار، وختم القرآن الكريم.<br>
                يعمل بدون إنترنت ويحفظ جميع بياناتك محلياً على جهازك.
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
                    <i class="fas fa-heart" style="color: #e74c3c; font-size: 1.5rem;"></i>
                    <div style="font-size: 0.7rem;">بالحب نصنعه</div>
                </div>
            </div>
        </div>
    `;
}

function resetToday() {
    if (confirm("هل تريد إعادة تعيين أعمال اليوم؟")) {
        AppState.prayerLog.list = Array(5).fill(false);
        Storage.save('prayer_v3', AppState.prayerLog);
        renderHome();
    }
}

function clearAllData() {
    if (confirm("هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!")) {
        localStorage.clear();
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

// ========== الدوال العامة ==========

function loadTab(tabName) {
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
        case 'home': renderHome(); break;
        case 'adhkar': renderAdhkar(); break;
        case 'tasbeeh': renderTasbeeh(); break;
        case 'quran': renderQuran(); break;
        case 'themes': renderThemes(); break;
        case 'settings': renderSettings(); break;
    }
    
    window.scrollTo(0, 0);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScroll() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

// ========== تهيئة التطبيق ==========

window.onload = async () => {
    // 1. تطبيق السمة الأساسية
    applyTheme();
    
    // 2. تحديد الوضع التلقائي
    setupAutoTheme();
    
    // 3. عرض التاريخ
    document.getElementById('current-date').textContent = getArabicDate();
    document.getElementById('current-theme').style.cssText = "font-size: 0.9rem; color: var(--primary-color); margin-top: 5px;";
    
    // 4. تحميل مواقيت الصلاة
    setTimeout(async () => {
        await updatePrayerTimes();
    }, 1000);
    
    // 5. تحميل الصفحة الرئيسية
    renderHome();
    
    // 6. تحديث التاريخ كل دقيقة
    setInterval(() => {
        document.getElementById('current-date').textContent = getArabicDate();
    }, 60000);
    
    // 7. تحديث مواقيت الصلاة كل 6 ساعات
    setInterval(async () => {
        await updatePrayerTimes();
    }, 6 * 3600000);
    
    // 8. إعداد مستمع التمرير
    window.addEventListener('scroll', handleScroll);
    
    // 9. طلب إذن الإشعارات
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // 10. إعداد الوضع التلقائي
    if (AppState.autoTheme) {
        setInterval(() => {
            setupAutoTheme();
        }, 3600000); // التحقق كل ساعة
    }
    
    // 11. إعداد أحداث التنقل
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            loadTab(item.dataset.tab);
        });
    });
    
    // 12. إعداد حدث زر العودة للأعلى
    document.getElementById('scrollTop').addEventListener('click', scrollToTop);
};

// تصدير الدوال للاستخدام العام
window.getRandomReminder = getRandomReminder;
window.getArabicDate = getArabicDate;
window.getRandomAyah = getRandomAyah;
window.updatePrayerTimes = updatePrayerTimes;
window.updatePrayerTimesWithFeedback = updatePrayerTimesWithFeedback;
window.togglePrayer = togglePrayer;
window.updateDhikrCount = updateDhikrCount;
window.completeDhikrNow = completeDhikrNow;
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
window.scrollToTop = scrollToTop;</script>