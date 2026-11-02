# Chroma Spiral — Android

Standalone Android Studio project. Open this repository root (the folder containing settings.gradle), allow Gradle Sync, then Run on an Android device/emulator. Android SDK 36 and a Gradle-compatible JDK 21/24 are required. The first Gradle/Maven dependency downloads need internet.

No Node.js, npm, Vite, Xcode or iOS project is required to build this Android snapshot. NativePackages contains the local Capacitor Android modules and their licenses. app/src/main/assets/public contains the compiled Phaser game and licensed music needed inside the Android app; those assets must remain present.

This repository intentionally contains only the Android project. The editable TypeScript/full development project is preserved separately on the owner's computer. To update gameplay, build those sources there, refresh the Android assets, and update this Android repository. Do not run Capacitor sync inside this standalone snapshot.

Application display name is Chroma Spiral. Application ID is com.chromaspiral.game. This new identity installs separately; progress from an earlier identity is not automatically migrated. Confirm ID ownership before store publication. Debug APKs are for testing; Google Play needs an AAB signed with the owner's release key. Signing credentials and machine-specific SDK settings are not committed.

Validation: standalone Gradle assembleDebug completed successfully before packaging. Physical-device testing remains separate.
