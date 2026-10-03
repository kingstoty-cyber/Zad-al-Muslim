# UI13 — تقرير بناء Android

الإصدار: `4.9.3-beta.5.3`
versionCode: `493053`
Commit: `64ddd15`

## المخرجات

- `Zad-Al-Muslim-UI13-debug.apk`
- `Zad-Al-Muslim-UI13-release-signed.apk`
- `Zad-Al-Muslim-UI13-release.aab`

## التحقق

تم تنفيذ `npm run audit:release` و`npm run android:sync` وGradle بنجاح. تم تنفيذ `zipalign` قبل التوقيع، ثم تحقق `apksigner verify --verbose --print-certs` من توقيعات APK التالية:

- v1 JAR signing: **true**
- v2 APK Signature Scheme: **true**
- v3 APK Signature Scheme: **true**

شهادة التوقيع: `CN=Zad Al-Muslim, OU=Mobile, O=Zad Al-Muslim, L=Amman, ST=Amman, C=JO`.

يحتوي APK Debug على 169 ملف MP3 للأذكار وملف `azkari-import.js`.
