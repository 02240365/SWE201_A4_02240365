# TaskNotify – Push Notification Task Reminder App

Never miss a deadline again! TaskNotify is a task management app that keeps you on track with timely reminders, both locally on your phone and via remote push notifications from our backend.

---

## What You Can Do

- **Create & Manage Tasks** — Add tasks with descriptions, due dates, and custom reminder times
- **Get Notifications** — Receive local alerts on your phone and remote push notifications from the server
- **Smart Navigation** — Tap a notification and go directly to the task details
- **Always Available** — Notifications work whether the app is open, running in the background, or closed
- **Local Backup** — Your tasks are saved locally on your phone, so you never lose them

---

## Technology Behind the Scenes

| Component | What We Use |
|---|---|
| **Mobile App** | React Native with Expo SDK 54 |
| **Notifications** | Expo Push Notifications library |
| **Navigation** | React Navigation (smooth screen transitions) |
| **Local Storage** | AsyncStorage for your tasks |
| **Backend Server** | Node.js with Express |
| **Database** | MongoDB for storing push tokens |
| **Hosting** | Render (free cloud hosting) |
| **Building** | EAS Build (creates the Android app) |

---

## Project Layout

```
TaskNotify/
├── App.tsx                          # Main app entry
├── app.json                         # Expo configuration
├── eas.json                         # Build configuration
├── package.json                     # Dependencies
├── src/
│   ├── api/backendApi.ts           # Connects to backend
│   ├── navigation/AppNavigator.tsx  # Screen routing
│   ├── notifications/               # Notification setup & listeners
│   ├── screens/                     # All app screens (8 screens)
│   ├── services/storageService.ts  # Save/load tasks locally
│   ├── types/index.ts              # TypeScript types
│   └── utils/helpers.ts            # Helper functions
├── assets/screenshots/              # App screenshots for docs
└── backend/                         # Backend server code
```

---

## Backend API

The app talks to the backend through these endpoints:

| Action | Endpoint | Notes |
|---|---|---|
| Health Check | `GET /api/health` | Make sure backend is alive |
| Register Device | `POST /api/register-token` | Send your push token to the server |
| Get All Tokens | `GET /api/tokens` | List registered devices |
| Send Notification | `POST /api/send-notification` | Send a push notification (requires secret key) |

---

## Setup Instructions

### Frontend Environment (`TaskNotify/.env`)
```
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
EXPO_PUBLIC_PROJECT_ID=your-eas-project-id
```

### Backend Environment (`TaskNotify/backend/.env`)
```
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tasknotify?retryWrites=true&w=majority
API_KEY=your-secret-key
```

---

## Testing Remote Notifications with Postman

Want to send a test push notification? Use Postman:

```
POST https://your-backend.onrender.com/api/send-notification

Headers:
  Content-Type: application/json
  x-api-key: your-secret-key

Body:
{
  "title": "Task Due Soon!",
  "body": "Don't forget to complete your assignment",
  "broadcast": true,
  "data": { "taskId": "123", "screen": "TaskDetail" }
}
```

---

## Screenshots

### Permission & Setup
![Permission Request](assets/screenshots/01-permission-request.png)
*First time? We ask for permission to send notifications.*

![Permission Granted](assets/screenshots/02-permission-granted.png)
*All set! Check the Settings screen to see your permission status.*

### Creating & Managing Tasks
![Add Task](assets/screenshots/03-add-task.png)
*Create a new task with all the details you need.*

![Task List](assets/screenshots/04-task-list.png)
*See all your tasks at a glance with quick edit and delete options.*

![Task Detail](assets/screenshots/05-task-detail.png)
*View complete task details and manage notifications.*

### Notifications in Action
![Local Notification](assets/screenshots/06-local-notification.png)
*Get an instant alert when a local notification pops up.*

![Remote Notification](assets/screenshots/07-remote-notification.png)
*See push notifications from the backend in your notification tray.*

![Notification Navigation](assets/screenshots/08-notification-navigation.png)
*Tap a notification and jump straight to the task.*

### Backend & Database
![Postman](assets/screenshots/09-postman.png)
*Send test notifications through Postman.*

![MongoDB](assets/screenshots/10-mongodb-token.png)
*Your push tokens are safely stored in MongoDB.*

![Render](assets/screenshots/11-render-deployment.png)
*Backend is running live on Render cloud.*

---

## Things to Know

- **Real Device Required** — Push tokens only work on actual Android phones, not emulators
- **Render Free Tier** — The backend may take ~30 seconds to wake up if unused for 15 minutes
- **Android 13+** — You need the `SCHEDULE_EXACT_ALARM` permission for precise reminder timing

