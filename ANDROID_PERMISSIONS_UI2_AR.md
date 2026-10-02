# تقرير صلاحيات Android — Beta 5.2 UI2

## النتيجة المختصرة

تمت مراجعة `AndroidManifest.xml` وإضافات Capacitor الموجودة بعد `npx cap sync android`. الصلاحيات الصريحة المطلوبة في التطبيق هي الصلاحيات الأربع التالية فقط. لا توجد في المصدر صلاحيات كاميرا أو ميكروفون أو جهات اتصال أو `MANAGE_EXTERNAL_STORAGE` أو `READ/WRITE_EXTERNAL_STORAGE`.

| الإذن | سبب الاستخدام | مكان الاستخدام | متى يطلبه التطبيق |
|---|---|---|---|
| `INTERNET` | تحميل مواقيت الصلاة ومحتوى الصوت/البيانات والخدمات الشبكية | `prayer.js`، مشغل القرآن، وملفات الويب | يعلن في Manifest ولا يحتاج حوارًا للمستخدم |
| `ACCESS_COARSE_LOCATION` | تحديد الموقع التقريبي لمواقيت الصلاة والقبلة | `prayer.js` عبر Capacitor Geolocation | بعد ضغط المستخدم على «استخدام موقعي» أو طلب تحديد الموقع، وليس عند التشغيل |
| `ACCESS_FINE_LOCATION` | تحديد أدق عند اختيار المستخدم الموقع التلقائي | `prayer.js` عبر Capacitor Geolocation | مع طلب الموقع نفسه وبعد ضغط المستخدم؛ الرفض لا يمنع اختيار المدينة يدويًا |
| `POST_NOTIFICATIONS` | تذكيرات الصلاة والأذكار والورد عبر Local Notifications | `native-bridge.js` عبر Capacitor Local Notifications | عند فتح صفحة الصلاحيات أو تفعيل التذكيرات، وليس عند أول تشغيل |

## التخزين والمشاركة

حفظ الفيديو على Android الحديث يستخدم `MediaStore` مع `RELATIVE_PATH` و`IS_PENDING` ابتداءً من Android 10، والمشاركة تستخدم Cache خاصة و`FileProvider`. لا يستخدم التطبيق صلاحيات التخزين العامة القديمة. لم يتم العثور على `MANAGE_EXTERNAL_STORAGE` أو `READ_EXTERNAL_STORAGE` أو `WRITE_EXTERNAL_STORAGE`.

## الصوت في الخلفية وشاشة القفل

المصدر يستخدم Web Media Session وأزرار Play/Pause/Next/Previous عندما يدعمها WebView. لا توجد خدمة Android أصلية `Foreground Media Service` أو Media3 في هذه الحزمة. لذلك لا يصح إعلان تشغيل خلفي مضمون بعد إغلاق التطبيق أو تحت قيود توفير الطاقة. يلزم تطوير Android أصلي مستقل واختباره على هاتف قبل اعتبار هذا الجزء ناجحًا.

## حالة التحقق

تم فحص Manifest المصدر وManifest إضافة Local Notifications وملفات Android بعد `npx cap sync android`. كما نجح GitHub Actions في تشغيل اختبارات Gradle وبناء Debug APK. فحص Manifest المضمّن داخل APK أكد Package ID `ly.zadalmuslim.app` والصلاحيات المتوقعة: الإنترنت، الموقع التقريبي/الدقيق، الإشعارات، ومعهما `RECEIVE_BOOT_COMPLETED` و`WAKE_LOCK` اللذان تضيفهما إضافة التنبيهات. لم تظهر صلاحيات كاميرا أو ميكروفون أو جهات اتصال أو تخزين عام.

لم يُنفذ Android Lint ولا اختبار هاتف Android حقيقي. كما لم يُنشأ Signed Release APK/AAB لعدم توفر أسرار التوقيع، وفق قرار عدم إنشاء Release رسمي قبل المراجعة.
