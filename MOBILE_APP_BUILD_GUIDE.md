# 📱 Recruit Logbook — Mobile App Build & Deployment Guide (Android & iOS)

This guide walks you through building, testing, and deploying your **Recruit Logbook System** as a native mobile application using **Capacitor**.

---

## 🗺️ Summary of Completed Setup

Your project is fully configured for native mobile builds:
- ✅ **Web Asset Bundler**: `www/` directory generated with `index.html`, `login.html`, `admin-dashboard.html`, `member-dashboard.html`, `member/`, and `assets/`.
- ✅ **Android Native Project**: `android/` directory created with Gradle build files & permissions (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`).
- ✅ **iOS Native Project**: `ios/` directory created with Xcode project files & `Package.swift`.
- ✅ **Capacitor Configuration**: [capacitor.config.json](file:///d:/XboxGames/Recruit%20log%20book/capacitor.config.json) initialized with App ID `com.sunnexus.recruitlogbook`.

---

## 🔌 Phase 1: Mobile App Server URL & Backend Connection

When running on an Android or iOS device, the app must connect to your backend API (`server.js` + Neon Database).

### **A. Local Testing on Android Emulator**
- Android Emulator uses `http://10.0.2.2:3000` to talk to your laptop's `localhost:3000`.

### **B. Local Testing on Real Phone (Same Wi-Fi)**
1. Find your computer's local IP address in terminal:
   ```powershell
   ipconfig
   ```
   *(Look for IPv4 Address, e.g. `192.168.1.50`)*
2. In your mobile app settings or server URL, point to `http://192.168.1.50:3000`.

### **C. Production Deployment (Cloud Server)**
1. Deploy `server.js` to a free cloud host like Render, Railway, Vercel, or Google Cloud Run connected to your Neon Postgres database.
2. Point your app API calls to `https://your-app-api.onrender.com`.

---

## 🤖 Phase 2: Building the Native Android App (.APK / .AAB)

### **Step 1: Install Android Studio**
If Android Studio is not yet installed on your computer:
1. Download Android Studio for free from: **[developer.android.com/studio](https://developer.android.com/studio)**.
2. Complete standard installation (includes Android SDK and Java JDK).

### **Step 2: Open Project in Android Studio**
1. Launch **Android Studio**.
2. Click **Open** (or *File* → *Open*).
3. Browse to your project folder:
   ```text
   d:\XboxGames\Recruit log book\android
   ```
4. Click **OK**. Android Studio will load Gradle dependencies automatically (wait 1–2 minutes).

### **Step 3: Generate APK Binary**
1. In Android Studio's top menu bar, click:
   **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build process to finish.
3. A notification popup will appear at the bottom right: *"APK(s) generated successfully"*.
4. Click **locate** to open the folder containing your APK file:
   ```text
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

### **Step 4: Install APK on Your Phone**
1. Copy `app-debug.apk` to your Android phone via USB cable, Google Drive, or WhatsApp.
2. Open the file manager on your phone, tap `app-debug.apk`, and tap **Install**!

---

## 🍏 Phase 3: Building the Native iOS App (.IPA)

*Note: iOS native builds require Xcode on macOS or a cloud Mac build service (e.g. MacinCloud, Codemagic).*

1. Copy the `ios/` folder or whole project to a Mac computer.
2. Run:
   ```bash
   npm run cap:build
   ```
3. Open the Xcode workspace:
   ```bash
   npx cap open ios
   ```
4. In Xcode, select your **Signing & Capabilities** (Apple Developer ID).
5. Click **Product** → **Archive** → **Distribute App** to generate `.ipa` or publish to TestFlight!

---

## 🔄 Phase 4: Developer Workflow (Making Future Updates)

Whenever you edit HTML, CSS, or JavaScript files in your project, sync the changes to mobile by running:

```bash
npm run cap:build
```

### **NPM Command Cheatsheet**
| Command | What It Does |
| :--- | :--- |
| **`npm run dev`** | Runs local Node.js Express server on port 3000. |
| **`npm run cap:build`** | Compiles web assets to `www/` and syncs with `android/` and `ios/`. |
| **`npm run cap:sync`** | Syncs `www/` folder with native Android & iOS platforms. |
| **`npm run cap:android`** | Builds web assets and launches Android Studio. |
| **`npm run cap:ios`** | Builds web assets and launches Xcode. |

---

## 🚀 You're All Set!
Your app is fully structured, synced, and ready to compile into a native Android APK!
