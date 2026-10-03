# Zad Al-Muslim — Beta 5.2 release verification

**Version:** `4.9.3-beta.5.2` (`versionCode` 493052)
**Date:** 2026-10-01
**Build environment:** OpenJDK/JDK 21, Android SDK Platform 35; Gradle 8.11.1 selected Build Tools 34.0.0 from the existing project configuration. Android SDK licenses were accepted for this project after the owner's authorization.

## Changes verified

- Quran reader actions use delegated handling rather than attaching a separate event listener to every verse. Image rendering is created on demand.
- Android video export is streamed through the native `AndroidMedia` plugin: Android 10+ uses MediaStore; compatible older versions use app-scoped/cache sharing without broad storage permissions. Capacitor `Share` remains the Android Sharesheet route.
- Location permission is requested only after the user taps **Use my location**. The legacy startup GPS/IP lookup helpers have been removed. Manual city selection remains available and can fill approximate city-center coordinates, with editable coordinate fields for other places.
- Service-worker cache revision `r1` ensures existing installs receive the Beta 5.2 web assets; the app's prior user data is not cleared by this update.

## Automated checks

| Check | Result |
|---|---|
| Release audit (`npm run audit:release`) | Pass |
| JavaScript parse check (`node --check` for root JS and release scripts) | Pass |
| Capacitor Android sync / Geolocation plugin registration | Pass; 7 plugins found |
| `npm audit` | 0 vulnerabilities (info, low, moderate, high, critical) |
| `git diff --check` | Pass |
| Android manifest and FileProvider XML parsing | Pass |
| Gradle `lint assembleDebug assembleRelease bundleRelease` | Build successful |
| Android Lint | 0 fatal / 0 errors; 25 warnings remain in generated/legacy resources and dependency/icon/splash metadata |
| Debug APK `apksigner verify --verbose` | Pass; debug signing certificate only |

## Browser smoke tests

The Sandbox browser loaded the home page with location unset and **without a location permission prompt**. The manual-location panel populated Riyadh's approximate coordinates (`24.7136`, `46.6753`) when its city suggestion was selected; the location was not saved, and no GPS lookup was run. The Quran index and Al-Fatiha reader rendered. Copying an ayah displayed a success message; generating an ayah image displayed a success message; the Quran-video settings dialog opened.

## Android build outputs

| Artifact | Path | Size | SHA-256 | Status |
|---|---|---:|---|---|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | 7,068,996 bytes | `762a4c200a84dafe39d0379d8e5952c8fdcc309e41218df6d088249b682f2640` | Build passed; signed with the debug certificate, for testing only |
| Release APK | `android/app/build/outputs/apk/release/app-release-unsigned.apk` | 5,740,496 bytes | `89d1bccbeb705b39895bd186094fd3353886c8de00110b046e2d950572e6235e` | Build passed; unsigned |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | 5,496,880 bytes | `a830e5fdf05dc9871a3cf26b4501afc2ffb6bd633b27a00467dba86a37895509` | Build passed; release signing not configured |

## Signing and device-test limitation

The original Beta 5.1 upload keystore was not found in this workspace or among the Drive files checked. A replacement key must **not** be generated for an update, because it would not match the installed Beta 5.1 signing identity. Therefore, a production-signed Release APK/AAB and release signature verification are **not available yet**. Restore the original keystore outside the repository and provide it through a protected local path or protected CI secrets before signing. Do not commit the key or passwords.

No physical Android device was available during this task. Install/update-over-existing-app, GPS permission allow/deny/permanent-denial flows, city prayer-time comparison, MediaStore gallery saving, Android Sharesheet behavior, video codec output, background audio, lock-screen controls, and offline behavior remain **NOT RUN** on device.
