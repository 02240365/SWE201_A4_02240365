# TaskReminderApp - Backend

Node.js/Express server with a **SQLite database** that stores Expo push tokens and sends remote push notifications via the Expo Push API.

## Tech Stack

- Node.js + Express
- SQLite via `better-sqlite3` (persistent, file-based, no setup needed)
- expo-server-sdk (sends push notifications to Expo)

## Database

Push tokens are stored in a SQLite file at `data/taskreminder.db`, which is created automatically when the server starts. No database installation or credentials are required.

The `data/` folder is in `.gitignore` and will not be committed.

**Schema:**

```sql
CREATE TABLE push_tokens (
  device_id    TEXT PRIMARY KEY,
  token        TEXT NOT NULL,
  user_id      TEXT,
  registered_at TEXT NOT NULL
)
```

## Setup

### 1. Install dependencies

```bash
# Run inside the backend/ folder
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=4000
API_KEY=mysecretkey123
NODE_ENV=development
```

### 3. Run the server

```bash
# Development (auto-restarts on file change)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:4000`. The SQLite database file is created automatically at `data/taskreminder.db`.

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{ "status": "ok", "service": "TaskReminderApp Backend" }
```

---

### Register Push Token _(called by the app)_

```
POST /api/tokens/register
Content-Type: application/json

{
  "deviceId": "device_1234567890",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "userId": "optional-user-id"
}
```

---

### List All Registered Tokens

```
GET /api/tokens
```

---

### Send Notification to Specific Device _(protected)_

```
POST /api/notify/device
x-api-key: mysecretkey123
Content-Type: application/json

{
  "deviceId": "device_1234567890",
  "title": "Test Notification",
  "body": "This is sent from the server",
  "data": { "type": "task-reminder", "taskId": "abc123" }
}
```

---

### Send Task Reminder _(protected)_

```
POST /api/notify/task-reminder
x-api-key: mysecretkey123
Content-Type: application/json

{
  "deviceId": "device_1234567890",
  "taskId": "abc123",
  "taskTitle": "Submit final report",
  "dueTime": "3:00 PM"
}
```

---

### Broadcast to All Devices _(protected)_

```
POST /api/notify/broadcast
x-api-key: mysecretkey123
Content-Type: application/json

{
  "title": "Reminder",
  "body": "You have pending tasks!"
}
```

---

## Testing with curl

```bash
# 1. Check server is running
curl http://localhost:4000/health

# 2. List registered tokens (see deviceId values)
curl http://localhost:4000/api/tokens

# 3. Send a test notification to a device
curl -X POST http://localhost:4000/api/notify/device \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecretkey123" \
  -d '{"deviceId":"device_1234567890","title":"Hello","body":"Push from server!"}'

# 4. Send a task reminder
curl -X POST http://localhost:4000/api/notify/task-reminder \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecretkey123" \
  -d '{"deviceId":"device_1234567890","taskId":"abc123","taskTitle":"Submit report","dueTime":"3:00 PM"}'
```

## Notes

- Token data **persists across server restarts** thanks to SQLite
- The `API_KEY` protects notification-sending endpoints — use the same value in the frontend `.env`
- For remote push notifications to work, the server must be reachable from your device (use your machine's LAN IP, not `localhost`)
