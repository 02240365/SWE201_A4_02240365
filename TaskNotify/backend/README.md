# TaskNotify Backend

Simple Node.js + Express server that manages push notifications for the TaskNotify app.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment** — Create `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tasknotify?retryWrites=true&w=majority
   API_KEY=your-secret-key
   ```

3. **Start the server**
   ```bash
   npm start
   ```

Server runs on `http://localhost:3000`

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check if server is running |
| `POST` | `/api/register-token` | Save a device push token |
| `GET` | `/api/tokens` | Get all registered tokens |
| `POST` | `/api/send-notification` | Send a push notification |

---

## Authentication

The `/api/send-notification` endpoint requires:
- Header: `x-api-key` with your API key

Example:
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task Due!",
    "body": "Your task is coming up",
    "broadcast": true,
    "data": { "taskId": "123" }
  }'
```

---

## Database

Uses MongoDB to store device push tokens. When a mobile device registers, its token is saved so the backend can send notifications to it later.

---

## Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables (create this)
├── models/
│   └── PushToken.js         # MongoDB token schema
├── controllers/
│   ├── notificationController.js
│   └── tokenController.js
├── middleware/
│   └── auth.js              # API key validation
└── routes/
    ├── notificationRoutes.js
    └── tokenRoutes.js
```

---

## Environment Variables

| Variable | Example | Notes |
|---|---|---|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB connection string |
| `API_KEY` | `your-secret-key` | Secret key for sending notifications |

---

## Deployment

This backend is designed to run on **Render** (free tier):

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Set environment variables
5. Deploy!

First request may take ~30 seconds if the free tier is sleeping.

---

## Notes

- The server manages push tokens for the mobile app
- It sends notifications via Expo Push Service
- MongoDB stores tokens persistently
- Simple authentication via API key for sending notifications
