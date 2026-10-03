# Zad Al-Muslim v4.9.3-beta.5.2 — Final Android Build Instructions

This package contains the generated Capacitor Android project and the synchronized web assets.

## Local build prerequisites

Install Node.js 22, JDK 21 **with `javac`**, Android SDK Platform 35, Android SDK Build-Tools, and accept the Android licenses. Set `JAVA_HOME` and `ANDROID_HOME`/`ANDROID_SDK_ROOT` before building.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run audit:release
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

## Current Beta 5.2 status

The Beta 5.2 source audit and Capacitor synchronization are maintained with this release. Record each Android lint/build/signature result in the release verification report only after it runs in the current environment. Do not mark signed Release APK/AAB as passing until the existing upload key has been restored outside the repository and signature verification succeeds.

The Beta 5.1 signing key was not present in this workspace or source archive when Beta 5.2 work began. Never create a replacement key for an update release; it would not match the installed Beta 5.1 app. Device installation/update, background audio, lock-screen controls, native video save/share, location permission states, and offline-device tests require a connected Android device and must be reported as **NOT RUN** until tested.
