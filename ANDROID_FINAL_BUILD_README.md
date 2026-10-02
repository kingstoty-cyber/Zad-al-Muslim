# Zad Al-Muslim v4.9.3-beta.5.2 UI3 — Android Build Instructions

## Verified build

The UI3 source was built with JDK 21, Android SDK Platform 35, Gradle 8.11.1, and Capacitor 7. The following checks passed:

```bash
npm install --no-audit --no-fund
npm run prepare:web
npm run audit:release
npx cap sync android
cd android
./gradlew lint assembleDebug assembleRelease bundleRelease
```

The Release APK and AAB were signed with the same local signing key used for Beta 5.1, kept outside the repository and delivery archives. The keystore and password must never be committed or uploaded.

## Artifacts

- `Zad-Al-Muslim-v4.9.3-beta.5.2-debug.apk` — testing only
- `Zad-Al-Muslim-v4.9.3-beta.5.2-release.apk` — signed update APK
- `Zad-Al-Muslim-v4.9.3-beta.5.2-release.aab` — signed Play distribution bundle

Package ID: `ly.zadalmuslim.app`  
Version: `4.9.3-beta.5.2`  
Version Code: `493052`

## Device validation still required

A real Android device is still required for installing over Beta 5.1, confirming user-data preservation, granting/denying location permission, comparing city prayer times, saving video through MediaStore, testing Android Sharesheet behavior, background audio, lock-screen controls, offline behavior, and confirming produced video codecs.
