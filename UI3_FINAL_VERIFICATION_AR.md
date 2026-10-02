# زاد المسلم — Beta 5.2 UI3 — تقرير التحقق النهائي

**الإصدار:** `4.9.3-beta.5.2` — **Version Code:** `493052`  
**Package ID:** `ly.zadalmuslim.app`  
**تاريخ التحقق:** 2 أكتوبر 2026

## نطاق التحديث

تم تطبيق طبقة UI3 الإضافية فوق UI2 دون حذف ميزات قائمة. تشمل التغييرات تحسين التركيز والتنقل بلوحة المفاتيح وقارئات الشاشة، safe-area للهواتف ذات النوتش، reduced-motion، وضوح النصوص، شريط التنقل السفلي، ونسخة Service Worker جديدة لضمان وصول الأصول الجديدة.

كما يتضمن المصدر إصلاحات Beta 5.2 الوظيفية: تحديد الموقع عند طلب المستخدم فقط، اختيار المدينة يدويًا، Android MediaStore للفيديو، المشاركة عبر Android Sharesheet، وتحسين أداء إجراءات المصحف.

## نتائج التحقق

| الفحص | النتيجة |
|---|---|
| `npm install` | PASS |
| `npm run prepare:web` | PASS؛ تم تجهيز 30 ملفًا و3 مجلدات |
| `npm run audit:release` | PASS؛ AUDIT PASS |
| JavaScript syntax (`node --check`) | PASS |
| JSON validation | PASS |
| `npm audit --omit=dev --audit-level=high` | PASS؛ 0 vulnerabilities |
| تطابق ملفات UI3 بين الجذر و`www/` | PASS |
| Browser smoke test | PASS؛ الصفحة الرئيسية والتبويبات الخمسة بلا أخطاء JavaScript |
| `npx cap sync android` | PASS؛ تم اكتشاف 7 Capacitor plugins |
| Android lint | PASS؛ لا أخطاء قاتلة، مع تحذيرات اعتماديات/موارد معروفة |
| Debug APK | PASS |
| Release APK | PASS؛ موقّع بمفتاح Beta 5.1 نفسه لضمان التحديث |
| Release AAB | PASS؛ موقّع |
| `apksigner verify --verbose` | PASS؛ توقيعا v1 وv2 صحيحان، signer واحد |
| اختبار جهاز Android فعلي | NOT RUN؛ لا يوجد جهاز ADB متصل |
| اختبار تثبيت فوق Beta 5.1 وحفظ البيانات | NOT RUN؛ يحتاج جهازًا فعليًا |
| اختبار MediaStore وSharesheet وGPS الفعلي | NOT RUN؛ يحتاج جهازًا فعليًا |

## الأذونات

يضم APK أذونات الموقع التقريبي والدقيق، الإنترنت، الإشعارات، وإعادة جدولة التنبيهات (`RECEIVE_BOOT_COMPLETED` و`WAKE_LOCK`). طلب الموقع لا يبدأ إلا بعد ضغط المستخدم على خيار استخدام الموقع. لا توجد أذونات كاميرا أو ميكروفون أو تخزين عام.

## الملفات الناتجة وSHA-256

| الملف | SHA-256 |
|---|---|
| `Zad-Al-Muslim-v4.9.3-beta.5.2-debug.apk` | `cea22ff8f7f235f2f454ec19b9faefcce7a91dcb3599324db47a129ad5abf75a` |
| `Zad-Al-Muslim-v4.9.3-beta.5.2-release.apk` | `9a462c25e7af5bc17b0792f6d2328e2689783d792999da472a5262a893ac6636` |
| `Zad-Al-Muslim-v4.9.3-beta.5.2-release.aab` | `75e26f5893a73e16f74c28247e9fed51e6e13b81bada54bbae072e89a22b25f4` |

## النشر

- Pull Request Beta 5.2 UI3: https://github.com/kingstoty-cyber/Zad-al-Muslim/pull/1 — تم دمجه.
- GitHub Release المقترح: `v4.9.3-beta.5.2`.
- رابط APK داخل التطبيق موجّه مباشرة إلى ملف Release APK الخاص بالإصدار.
- مفتاح التوقيع وكلمة المرور خارج المصدر والحزمة وGoogle Drive.
