# UI2 Conservative — تقرير تحقق نهائي

## النطاق

هذه الحزمة مطبقة فوق فرع `fix/v4.9.3-beta.5.2-android`، والتغيير البصري المحافظ الأساسي هو `ui2-polish.css`. لم تتم إعادة كتابة صفحات القرآن أو الأذكار أو المسموع، ولم تتغير بيانات المصحف أو Package ID أو قواعد التخزين أو إعدادات التوقيع.

## ما تم تشغيله

| الاختبار | النتيجة |
|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS |
| `npm run prepare:web` | PASS — نسخ 28 ملفًا و3 مجلدات إلى `www` |
| `npm run audit:release` | PASS |
| `node --check` لملفات JavaScript | PASS |
| `npx cap sync android` | PASS — اكتشف 7 إضافات Capacitor |
| `git diff --check` | PASS عند توفر تاريخ Git |
| Android Lint | NOT RUN/FAIL بسبب عدم وجود Android SDK و`ANDROID_HOME` |
| `assembleDebug` | NOT RUN/FAIL لنفس سبب عدم وجود Android SDK |
| فحص APK النهائي للأذونات | NOT RUN — لم يُنتج APK في البيئة |
| REAL DEVICE | NOT RUN — لا يوجد هاتف Android حقيقي متصل |

## حدود مهمة

لا يمكن اعتبار Android Lint أو APK أو اختبار الجهاز PASS. يجب تشغيل Workflow البناء أو بيئة Android Studio مع SDK API 35، ثم فحص `app-debug.apk` الناتج بواسطة `apkanalyzer` أو `aapt dump badging`، وتثبيته على هاتف حقيقي لاختبار الأذونات والموقع والإشعارات والصوت والقفل والتنزيل والمشاركة.
