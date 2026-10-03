# Beta 5.2 UI2 — تحسين محافظ

## النطاق
UI2 لا يعيد تصميم التطبيق ولا يحذف أي ميزة. التغيير الأساسي هو `ui2-polish.css` لتحسين المسافات، أحجام اللمس، قراءة القرآن، بطاقات الأذكار، المسموع، المزيد، الإعدادات، والشريط السفلي مع إبقاء JavaScript الوظيفي كما هو.

## Android permissions
- `INTERNET`: مطلوب للمحتوى/الصوت الخارجي والخدمات الشبكية.
- `ACCESS_COARSE_LOCATION` و`ACCESS_FINE_LOCATION`: موجودان لتحديد مواقيت الصلاة بالموقع، ويجب طلبهما فقط عند ضغط المستخدم على تحديد الموقع. الاختيار اليدوي يبقى بديلًا دون GPS.
- `POST_NOTIFICATIONS`: أضيف للإشعارات على Android الحديث؛ طلبه الفعلي يتم عند تفعيل المستخدم للتذكيرات عبر LocalNotifications.
- لم تتم إضافة `MANAGE_EXTERNAL_STORAGE` أو READ/WRITE_EXTERNAL_STORAGE أو كاميرا أو ميكروفون أو جهات اتصال.
- الحفظ/المشاركة الحاليان يجب أن يستخدما Scoped Storage/MediaStore أو واجهات Capacitor المناسبة، لا التخزين الشامل.

## تنبيه الخلفية والصوت
المصدر يستخدم Web Media Session لأزرار التشغيل/الإيقاف/السابق/التالي. لا توجد في المصدر خدمة Android أصلية Media3/Foreground Media Service. لذلك لا يصح إعلان "تشغيل بلا قيود في الخلفية" قبل اختبار هاتف حقيقي. إذا أوقف Android/WebView الصوت بعد قفل الشاشة أو مع توفير البطارية، فالخطوة الصحيحة هي خدمة Media3 أصلية، لا مجرد إضافة permission.

## ما لم يتغير
Package ID، التخزين المحلي، بيانات القرآن والأذكار، منطق أدوات الآية، الفيديو، الموقع، محرك الصوت، signing configuration.

## تحقق هذه الحزمة
- `npm run prepare:web`: PASS
- `npm run audit:release`: PASS
- JavaScript syntax: PASS
- root → www لملف UI2: PASS
- Android lint/assembleDebug في بيئة ChatGPT: NOT RUN؛ Gradle wrapper حاول تنزيل Gradle لكن الشبكة في البيئة لا تصل إلى services.gradle.org.
- Real Android device: NOT RUN.
