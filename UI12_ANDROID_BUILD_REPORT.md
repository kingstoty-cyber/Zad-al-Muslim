# UI12 — تقرير بناء Android

## الإصدار

`4.9.3-beta.5.2` — Application ID: `ly.zadalmuslim.app`

## النتائج

- `npm run audit:release`: PASS.
- `npm run prepare:web`: PASS.
- `npx cap sync android`: PASS.
- `./gradlew clean assembleDebug`: PASS.
- `./gradlew assembleRelease bundleRelease`: PASS.
- APK Debug: `Zad-Al-Muslim-UI12-debug.apk` — حوالي 21MB.
- APK Release: `Zad-Al-Muslim-UI12-release-signed.apk` — حوالي 19MB.
- AAB: `Zad-Al-Muslim-UI12-release.aab` — حوالي 19MB.

## التوقيع

تم استخدام keystore المشروع الموجود خارج Git دون تغييره.

APK Release تحقق بنجاح عبر `apksigner`:

- v1: true
- v2: true
- v3: true
- v3.1: false، وهو غير مطلوب هنا

بصمة شهادة التوقيع:

`b799679f68c28b4e1f0af3e7f6fc8c61f6d8bf5259dc1a7a57c44f21d500cd05`

## اختبار المحتوى

تم التحقق من وجود `azkari-import.js` و169 ملف MP3 داخل APK Debug.

## حد مهم

لم يوجد جهاز Android أو محاكي متصل؛ لذلك تثبيت APK واختبار اللمس والصوت والتنقل وقفل الشاشة على جهاز حقيقي: **REAL DEVICE TEST: NOT RUN**.
