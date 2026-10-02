# تقرير بناء Android — UI2 Beta 5.2

- **الفرع:** `ui2/v4.9.3-beta.5.2-conservative`
- **Commit البناء:** `ff2d0fff61e48408f7405baad3fda1cda91bff79`
- **Workflow:** [36987762666](https://github.com/kingstoty-cyber/Zad-al-Muslim/actions/runs/36987762666)
- **النتيجة:** SUCCESS
- **نوع الناتج:** Debug APK
- **اسم الملف:** `Zad-al-Muslim-v4.9.3-beta.5.2-ui2-debug.apk`
- **SHA-256:** `dc70078ac1b0a3e64231486c4397e2e328f718b934a6c02471667bd3d538ad82`

## الاختبارات السحابية

- Capacitor sync: PASS
- Android unit tests: PASS
- `assembleDebug`: PASS
- Upload artifact: PASS
- Signed Release APK/AAB: لم يُشغّل لأن Secrets التوقيع غير متاحة، ولم يتم إنشاء Release رسمي.
- REAL DEVICE: NOT RUN

## فحص APK الفعلي

تم استخراج Manifest المضمّن داخل APK والتحقق من:

- Package ID: `ly.zadalmuslim.app`
- Version name: `4.9.3-beta.5.2`
- Version code: `493052`
- الصلاحيات:
  - `android.permission.INTERNET`
  - `android.permission.ACCESS_COARSE_LOCATION`
  - `android.permission.ACCESS_FINE_LOCATION`
  - `android.permission.POST_NOTIFICATIONS`
  - `android.permission.RECEIVE_BOOT_COMPLETED`
  - `android.permission.WAKE_LOCK`
  - صلاحية داخلية تلقائية: `ly.zadalmuslim.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`

لم تظهر صلاحيات كاميرا أو ميكروفون أو جهات اتصال أو `MANAGE_EXTERNAL_STORAGE` أو صلاحيات التخزين القديمة.
