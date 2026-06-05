const { Expo } = require("expo-server-sdk");
const { saveToken, getAllTokens, deleteToken } = require("../models/tokenStore");

const expo = new Expo();

/**
 * POST /api/tokens/register
 * Body: { deviceId, token, userId? }
 */
function registerToken(req, res) {
  const { deviceId, token, userId } = req.body;

  if (!deviceId || !token) {
    return res.status(400).json({ error: "deviceId and token are required" });
  }

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: "Invalid Expo push token format" });
  }

  saveToken(deviceId, token, userId);
  console.log(`[Token] Registered device: ${deviceId}`);
  return res.status(200).json({ message: "Token registered successfully" });
}

/**
 * GET /api/tokens
 */
function listTokens(req, res) {
  const tokens = getAllTokens();
  return res.json({ count: tokens.length, tokens });
}

/**
 * DELETE /api/tokens/:deviceId
 */
function removeToken(req, res) {
  const { deviceId } = req.params;
  const deleted = deleteToken(deviceId);
  if (!deleted) {
    return res.status(404).json({ error: "Device not found" });
  }
  return res.json({ message: "Token removed" });
}

module.exports = { registerToken, listTokens, removeToken };
