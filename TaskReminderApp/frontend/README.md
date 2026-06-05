# TaskReminderApp - Frontend

React Native app built with Expo SDK 54 and TypeScript.

## Tech Stack

- Expo SDK 54
- expo-notifications (local scheduling + remote push)
- expo-router v4 (file-based navigation)
- @react-native-community/datetimepicker (native date/time picker)
- @react-native-async-storage/async-storage (task persistence)
- TypeScript

## Setup

### 1. Install dependencies

```bash
# Run inside the frontend/ folder
npm install
```

### 2. Add placeholder assets

Create an `assets/` folder and add these 4 image files (any PNG works as placeholder):

| File | Size |
|------|------|
| `icon.png` | 1024×1024 |
| `splash.png` | any |
| `adaptive-icon.png` | 1024×1024 |
| `notification-icon.png` | 96×96 (white icon, transparent background) |

Free placeholder: https://placehold.co/1024/0F172A/6366F1/png

### 3. Configure environment

```bash
cp .env.example .env
```

Find your machine's local IP:
- **Windows:** run `ipconfig`, look for IPv4 Address
- **Mac/Linux:** run `ifconfig`, look for `inet` under `en0`

Edit `.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.x:4000
EXPO_PUBLIC_API_KEY=mysecretkey123
```

> Use the same `API_KEY` as in the backend `.env`. Use your LAN IP, not `localhost`.

### 4. Run the app

```bash
npx expo start
```

- Press `a` for Android emulator
- Scan the QR code with **Expo Go** on a physical Android device

## EAS Build (Android APK)

### One-time setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account (create one free at expo.dev)
eas login

# Link this project to your Expo account
eas init
```

After `eas init`, copy the project ID it gives you and paste it into `app.json`:

```json
"extra": {
  "eas": {
    "projectId": "PASTE-YOUR-ID-HERE"
  }
}
```

### Build APK

```bash
# Run inside the frontend/ folder
eas build --platform android --profile preview
```

When complete, a download link for the `.apk` appears in the terminal and at expo.dev.

## Folder Structure

```
frontend/
├── app/
│   ├── _layout.tsx          # Root layout — notification listeners registered here
│   ├── +not-found.tsx       # 404 fallback
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   ├── index.tsx        # Task list screen
│   │   └── settings.tsx     # Permissions, push token, preferences
│   └── task/
│       ├── [id].tsx         # Task detail screen (notification tap lands here)
│       ├── new.tsx          # Create task + schedule local reminder
│       └── edit/[id].tsx    # Edit task, reschedule notification
└── src/
    ├── api/                 # HTTP client for backend
    ├── components/          # Reusable UI components
    ├── constants/           # Theme (colors, spacing)
    ├── notifications/       # Expo notification setup, scheduler, permission handler
    ├── services/            # AsyncStorage task CRUD
    ├── types/               # TypeScript interfaces
    └── utils/               # Helper functions
```

## Notification Handling Summary

| State | Behavior |
|-------|----------|
| Foreground | Alert banner shown via `setNotificationHandler` |
| Background / Closed | System tray notification |
| Tapped | `addNotificationResponseReceivedListener` navigates to `/task/[taskId]` |

## Limitations

- Expo push tokens require a physical device (Android emulator returns null for push token)
- Date picker is Android + iOS native (uses `@react-native-community/datetimepicker`)
- EAS build is configured for Android only
