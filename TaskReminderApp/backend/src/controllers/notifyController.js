const { Expo } = require("expo-server-sdk");
const { getAllTokens, getTokenByDevice } = require("../models/tokenStore");

const expo = new Expo();

/**
 * Send push messages via Expo and handle receipts.
 * @param {Array} messages
 */
async function sendPushMessages(messages) {
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error("[Push] Error sending chunk:", err);
    }
  }

  // Log any errors from tickets
  tickets.forEach((ticket, i) => {
    if (ticket.status === "error") {
      console.error(`[Push] Ticket error for message ${i}:`, ticket.message, ticket.details);
    }
  });

  return tickets;
}

/**
 * POST /api/notify/device
 * Body: { deviceId, title, body, data? }
 */
async function sendToDevice(req, res) {
  const { deviceId, title, body, data } = req.body;

  if (!deviceId || !title || !body) {
    return res.status(400).json({ error: "deviceId, title, and body are required" });
  }

  const record = getTokenByDevice(deviceId);
  if (!record) {
    return res.status(404).json({ error: "Device not found" });
  }

  if (!Expo.isExpoPushToken(record.token)) {
    return res.status(400).json({ error: "Stored token is invalid" });
  }

  const messages = [
    {
      to: record.token,
      sound: "default",
      title,
      body,
      data: data || {},
      channelId: "task-reminders",
    },
  ];

  const tickets = await sendPushMessages(messages);
  return res.json({ message: "Notification sent", tickets });
}

/**
 * POST /api/notify/broadcast
 * Body: { title, body, data? }
 */
async function sendToAll(req, res) {
  const { title, body, data } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  const allTokens = getAllTokens();
  if (allTokens.length === 0) {
    return res.status(404).json({ error: "No registered devices" });
  }

  const messages = allTokens
    .filter((r) => Expo.isExpoPushToken(r.token))
    .map((r) => ({
      to: r.token,
      sound: "default",
      title,
      body,
      data: data || {},
      channelId: "task-reminders",
    }));

  const tickets = await sendPushMessages(messages);
  return res.json({ message: `Broadcast sent to ${messages.length} devices`, tickets });
}

/**
 * POST /api/notify/task-reminder
 * Body: { deviceId, taskId, taskTitle, dueTime }
 */
async function sendTaskReminder(req, res) {
  const { deviceId, taskId, taskTitle, dueTime } = req.body;

  if (!deviceId || !taskId || !taskTitle) {
    return res.status(400).json({ error: "deviceId, taskId, and taskTitle are required" });
  }

  const record = getTokenByDevice(deviceId);
  if (!record) {
    return res.status(404).json({ error: "Device not found" });
  }

  const messages = [
    {
      to: record.token,
      sound: "default",
      title: "Task Reminder",
      body: `"${taskTitle}" is due${dueTime ? ` at ${dueTime}` : " soon"}`,
      data: { type: "task-reminder", taskId },
      channelId: "task-reminders",
    },
  ];

  const tickets = await sendPushMessages(messages);
  return res.json({ message: "Task reminder sent", tickets });
}

module.exports = { sendToDevice, sendToAll, sendTaskReminder };
