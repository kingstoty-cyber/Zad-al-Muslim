# حالة بناء زاد المسلم v4.9.3 Beta 3

## مكتمل

- مشروع Android تحت `android/` ومعرّف التطبيق `ly.zadalmuslim.app`.
- Capacitor App وLocal Notifications وFilesystem وShare وSplash Screen وStatus Bar.
- زر الرجوع، الروابط العميقة، صفحة الصلاحيات، سياسة الخصوصية، التذكيرات، والأيقونات.
- `npm install` و`npx cap add android` و`npx cap sync android` تعمل.

## مانع بناء APK في بيئة Sandbox الحالية

تم تنزيل Gradle Wrapper 8.11.1 وتشغيله، لكن الاختبار توقف قبل التجميع لأن Android SDK غير مثبت ولا يوجد `ANDROID_HOME` أو `android/local.properties`. لذلك لا يوجد APK حقيقي محليًا.

## البناء على Manus أو الكمبيوتر

1. ثبّت Android Studio وAndroid SDK API 35 وJDK 21 وNode.js، أو استخدم Workflow GitHub الذي يثبت هذه الأدوات تلقائيًا.
2. نفّذ `npm install` ثم `npm run android:debug`.
3. ستجد APK التجريبي في `android/app/build/outputs/apk/debug/app-debug.apk`.
4. بعد الاختبار أنشئ مفتاح توقيع خارج المستودع واضبط توقيع Release.
5. نفّذ `npm run android:bundle` لإنتاج AAB؛ لا تنشره قبل اختبارات الهاتف وسياسة متجر Google Play.

## قيود متبقية قبل Release الموقّع

- MP4 في الويب يُستخدم إذا دعمته MediaRecorder، وإلا يظهر WebM بوضوح. التحويل الأصلي الإجباري إلى H.264/AAC داخل Android يحتاج طبقة ترميز MediaCodec/Transformer لم تُضمّن في هذا الإصدار، لذلك لا أصف APK بأنه متوافق MP4 قبل اختباره على جهاز فعلي.
- الصوت بعد إغلاق التطبيق: Media Session الحالية تحسن أزرار الوسائط أثناء بقاء WebView، لكن الخدمة الأمامية الدائمة تحتاج تطويرًا واختبارًا أصليًا مستقلًا.
- Release APK/AAB الموقّع يتطلب أسرار GitHub الأربعة؛ فحص GitHub Secrets في هذه الجلسة أعاد HTTP 403 ولم يسمح بالتحقق أو الإضافة.
