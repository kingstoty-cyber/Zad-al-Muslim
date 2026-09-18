# حالة بناء زاد المسلم v4.9 Beta 1

## مكتمل

- مشروع Android تحت `android/` ومعرّف التطبيق `ly.zadalmuslim.app`.
- Capacitor App وLocal Notifications وFilesystem وShare وSplash Screen وStatus Bar.
- زر الرجوع، الروابط العميقة، صفحة الصلاحيات، سياسة الخصوصية، التذكيرات، والأيقونات.
- `npm install` و`npx cap add android` و`npx cap sync android` تعمل.

## مانع بناء APK في بيئة Codex الحالية

فشل `./gradlew assembleDebug` قبل بدء التجميع لأن Gradle Wrapper لم يستطع تنزيل `gradle-8.11.1-all.zip` بسبب منع الشبكة. كذلك لا يوجد Android SDK مثبت في البيئة. لذلك لا يوجد APK حقيقي ضمن الحزمة.

## البناء على Manus أو الكمبيوتر

1. ثبّت Android Studio وAndroid SDK API 35 وJDK 21 وNode.js؛ مشروع Capacitor 7 المولد يضبط Java 21.
2. نفّذ `npm install` ثم `npm run android:debug`.
3. ستجد APK التجريبي في `android/app/build/outputs/apk/debug/app-debug.apk`.
4. بعد الاختبار أنشئ مفتاح توقيع خارج المستودع واضبط توقيع Release.
5. نفّذ `npm run android:bundle` لإنتاج AAB؛ لا تنشره قبل اختبارات الهاتف وسياسة متجر Google Play.

## ميزتان غير مكتملتين عمدًا

- MP4: يحتاج ترميزًا أصليًا؛ لم يُضف محول وهمي أو خدمة خارجية.
- الصوت بعد إغلاق التطبيق: Media Session الحالية تحسن أزرار الوسائط أثناء بقاء WebView، لكن الخدمة الأمامية الدائمة تحتاج تطويرًا واختبارًا أصليًا مستقلًا.
