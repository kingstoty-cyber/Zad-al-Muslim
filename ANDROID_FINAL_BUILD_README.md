# Zad Al-Muslim v4.9.3-beta.5.1 — Final Android Build Instructions

This package contains the generated Capacitor Android project and the synchronized web assets.

## Local build prerequisites

Install Node.js 22, JDK 21 **with `javac`**, Android SDK Platform 35, Android SDK Build-Tools, and accept the Android licenses. Set `JAVA_HOME` and `ANDROID_HOME`/`ANDROID_SDK_ROOT` before building.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run audit:release
npm run android:add
npm run android:sync
npm run android:debug
```

The debug APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Release signing

Keep the keystore outside this repository and configure signing through protected CI secrets or an external Gradle signing configuration. Never put the keystore, passwords, or secrets in this ZIP or Git history. After signing is configured:

```bash
cd android
./gradlew test
./gradlew assembleRelease
./gradlew bundleRelease
apksigner verify --verbose app/build/outputs/apk/release/app-release.apk
```

Then run the real-device test matrix in `ANDROID_TEST_PLAN.md`, including update-over-existing-install and data-retention checks, before publishing.

## Current session result

The source and Capacitor synchronization checks passed. JDK 21, Android SDK Platform 35, Build Tools 35.0.0, and Platform Tools were installed. `./gradlew lint assembleDebug` passed, and both signed Release APK and AAB were produced. `apksigner verify --verbose` confirmed the APK's v1 and v2 signatures.

The signed keystore and password remain outside the project and are not included in the source ZIP, GitHub, or Google Drive upload. A real Android device was unavailable, so installation/update, background audio, lock screen, sharing, MP4 codec output, and offline-device tests remain **NOT RUN**.
