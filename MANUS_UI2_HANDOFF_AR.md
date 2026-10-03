# تسليم UI2 إلى Manus

هذه نسخة UI2 محافظة للمستودع الأساسي. لا تطبق New UI الكبير.

1. راجع diff أولًا؛ التغيير البصري الأساسي `ui2-polish.css`.
2. لا تغيّر JavaScript الوظيفي إلا لإصلاح خطأ مثبت.
3. شغّل `npm run prepare:web` و`npm run audit:release` و`npx cap sync android`.
4. شغّل Android lint + assembleDebug.
5. افحص merged manifest/APK الفعلي وتأكد من INTERNET + COARSE/FINE LOCATION + POST_NOTIFICATIONS وعدم وجود صلاحيات زائدة.
6. اختبر 360/390/412px والقرآن/القراءة/أدوات الآية/الأذكار/المسموع/المشغل/المزيد/الإعدادات.
7. اختبر على هاتف فعلي إن توفر: الموقع allow/deny/manual، الإشعارات، حفظ/مشاركة الفيديو، وقفل الشاشة/الخلفية للصوت.
8. لا تقل Background Audio PASS إذا لم يُختبر على هاتف. Media Session موجودة، لكن لا توجد خدمة Android Media3 foreground أصلية في هذا المصدر.
9. لا تغيّر Package ID أو signing أو بيانات المستخدم.
10. لا تدمج أو تنشر Release قبل مراجعة المستخدم.
