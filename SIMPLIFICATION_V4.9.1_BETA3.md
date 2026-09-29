# زاد المسلم — مرحلة التبسيط الأولى

الإصدار: `4.9.1-beta.3`

## المنجز

- تبسيط شريط التنقل السفلي إلى خمسة أقسام: الرئيسية، القرآن، الأذكار، المسموع، المزيد.
- إضافة صفحة «المزيد» للمسبحة والقبلة والمظهر والإعدادات والتنزيلات.
- تنظيم صفحة الإعدادات في أقسام قابلة للفتح والإغلاق.
- الحفاظ على عداد مجتمع زاد المسلم وإعدادات Supabase دون تغيير.
- إضافة ملف `simplification.js` إلى نسخة الويب وتجهيز Capacitor وService Worker.
- تحديث رقم الإصدار واسم ذاكرة التخزين المؤقت.
- تضمين صفحة «المزيد» داخل `app.js` كمسار احتياطي حتى تعمل عند تأخر تحميل `simplification.js`.
- إضافة رقم الإصدار إلى روابط CSS وJavaScript لمنع استخدام نسخة قديمة من الكاش.

## الملفات المعدلة

- `index.html`
- `app.js`
- `app-shell.js`
- `styles.css`
- `config.js`
- `sw.js`
- `scripts/prepare-capacitor.mjs`
- `package.json`
- `package-lock.json`
- `quran.js`
- `enhancements.js`

## الملف الجديد

- `simplification.js`

## الاختبارات

- `node --check simplification.js` — PASS
- `node --check app.js` — PASS
- `node --check app-shell.js` — PASS
- `node --check sw.js` — PASS
- `node --check scripts/prepare-capacitor.mjs` — PASS
- `npm run prepare:web` — PASS
- مطابقة `www/simplification.js` مع المصدر — PASS

لم يتم تغيير مفاتيح Supabase أو مخطط قاعدة البيانات أو سياسات RLS.
