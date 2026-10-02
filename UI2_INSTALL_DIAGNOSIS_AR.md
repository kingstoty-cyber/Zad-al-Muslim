# تشخيص وتصحيح زاد المسلم — UI2

## نتيجة التدقيق والتصحيح

تمت مراجعة ملفات الموقع وAndroid وJavaScript وبيانات القرآن. نجحت فحوص `npm run prepare:web` و`npm run audit:release` وفحص صياغة جميع ملفات JavaScript وJSON. كما تم تصحيح خطأين فعليين في الموقع: رابط تنزيل Android كان يشير إلى Release غير موجود، وService Worker كان يستخدم كاش UI1 ولا يضمّن `ui2-polish.css`.

التصحيحات المرفوعة إلى الفرع `ui2/v4.9.3-beta.5.2-conservative` هي:

- إصلاح رابط Android ليشير إلى صفحة Workflow الرسمية بدل رابط Release غير موجود.
- تحديث كاش PWA إلى `zad-al-muslim-v4-9-3-beta-5-2-ui2`.
- إضافة `ui2-polish.css` إلى أصول Service Worker.
- إضافة Android Lint إلى Workflow.
- إضافة هذا التقرير وتعليمات التثبيت إلى المستودع.

## نتيجة Android

نجح Workflow المصحح [36989902308](https://github.com/kingstoty-cyber/Zad-al-Muslim/actions/runs/36989902308) في:

- Capacitor Sync
- Android Unit Tests
- Android Lint
- `assembleDebug`
- رفع Debug APK كـartifact

وفحص الـAPK الناتج فعليًا وأكد:

- Package ID: `ly.zadalmuslim.app`
- Version: `4.9.3-beta.5.2` / Version Code `493052`
- `minSdk=23` و`targetSdk=35`
- الصلاحيات المتوقعة فقط: الإنترنت، الموقع، الإشعارات، وصلاحيات التنبيهات النظامية.
- لا توجد صلاحيات كاميرا أو ميكروفون أو جهات اتصال أو تخزين عام.

## سبب رسالة «التطبيق ليس مثبتًا»

الـAPK Debug صالح وموقع بتوقيع Android Debug. إذا كانت نسخة زاد المسلم الموجودة على الهاتف موقعة بمفتاح Release مختلف، يمنع Android تثبيت Debug فوقها بنفس Package ID ويعرض «التطبيق ليس مثبتًا». هذا تعارض توقيع وليس خطأ JavaScript.

لتثبيت Debug: احذف النسخة القديمة أولًا من إعدادات الهاتف، ثم ثبّت ملف `app-debug.apk` نفسه، وليس ملف ZIP. حذف النسخة قد يحذف بياناتها المحلية.

للتحديث دون حذف البيانات يجب بناء Release بنفس Keystore الذي استخدمت به النسخة القديمة. لا يتوفر Keystore التوقيع الأصلي في بيئة العمل الحالية، لذلك لم أغيّر Package ID ولم أضع مفتاحًا جديدًا داخل المستودع.

## القيود المتبقية

لا يوجد هاتف Android حقيقي متصل، لذلك `REAL DEVICE = NOT RUN`. كما لم يُنشأ Signed Release APK/AAB لعدم توفر أسرار التوقيع. بعد توفير Keystore الأصلي، يجب بناء Release واختباره فوق النسخة الموجودة دون حذف البيانات.
