const express = require("express");
const router = express.Router();
const { requireApiKey } = require("../middleware/auth");
const {
  sendToDevice,
  sendToAll,
  sendTaskReminder,
} = require("../controllers/notifyController");

// Send notification to a specific device (protected)
router.post("/device", requireApiKey, sendToDevice);

// Broadcast to all registered devices (protected)
router.post("/broadcast", requireApiKey, sendToAll);

// Send a task reminder notification (protected)
router.post("/task-reminder", requireApiKey, sendTaskReminder);

module.exports = router;
