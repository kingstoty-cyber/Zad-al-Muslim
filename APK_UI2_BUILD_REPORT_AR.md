# تقرير بناء Android — UI2 المصحح

- **الفرع:** `ui2/v4.9.3-beta.5.2-conservative`
- **Commit المصدر المبني:** `b635039be2495c6019bfd2b58a875fee106f0e8e`
- **Workflow:** [36989902308](https://github.com/kingstoty-cyber/Zad-al-Muslim/actions/runs/36989902308)
- **النتيجة:** SUCCESS
- **الناتج:** Debug APK

## الاختبارات

| الاختبار | النتيجة |
|---|---|
| Capacitor sync | PASS |
| Android unit tests | PASS |
| Android Lint | PASS |
| `assembleDebug` | PASS |
| Upload debug artifact | PASS |
| Signed Release APK/AAB | لم يُشغّل؛ لا تتوفر أسرار التوقيع |
| هاتف Android حقيقي | NOT RUN |

## فحص APK الفعلي

أكد فحص Manifest المضمّن داخل الـAPK أن Package ID هو `ly.zadalmuslim.app`، والإصدار `4.9.3-beta.5.2`، وVersion Code هو `493052`، و`minSdk=23` و`targetSdk=35`. الصلاحيات المضمّنة هي الإنترنت والموقع التقريبي/الدقيق والإشعارات، إضافة إلى `RECEIVE_BOOT_COMPLETED` و`WAKE_LOCK` اللتين تضيفهما إضافة التنبيهات. لم تظهر صلاحيات كاميرا أو ميكروفون أو جهات اتصال أو تخزين عام.

الـAPK Debug صالح، لكنه موقّع بمفتاح Android Debug. لا يمكن تثبيته فوق نسخة Release موقعة بمفتاح مختلف؛ يجب حذف النسخة القديمة أو توفير Keystore Release الأصلي لبناء تحديث يحافظ على بيانات التطبيق.
