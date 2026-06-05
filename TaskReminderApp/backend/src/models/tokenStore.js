const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Store the DB file in a data/ folder next to src/
const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, "taskreminder.db");
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS push_tokens (
    device_id   TEXT PRIMARY KEY,
    token       TEXT NOT NULL,
    user_id     TEXT,
    registered_at TEXT NOT NULL
  )
`);

console.log(`[DB] SQLite database ready at ${DB_PATH}`);

/**
 * Save or update a push token for a device.
 * @param {string} deviceId
 * @param {string} token - Expo push token
 * @param {string} [userId]
 */
function saveToken(deviceId, token, userId) {
  const stmt = db.prepare(`
    INSERT INTO push_tokens (device_id, token, user_id, registered_at)
    VALUES (@deviceId, @token, @userId, @registeredAt)
    ON CONFLICT(device_id) DO UPDATE SET
      token = excluded.token,
      user_id = excluded.user_id,
      registered_at = excluded.registered_at
  `);
  stmt.run({
    deviceId,
    token,
    userId: userId || null,
    registeredAt: new Date().toISOString(),
  });
}

/**
 * Get all stored tokens.
 * @returns {Array}
 */
function getAllTokens() {
  return db.prepare("SELECT * FROM push_tokens").all().map(mapRow);
}

/**
 * Get a token record by deviceId.
 * @param {string} deviceId
 */
function getTokenByDevice(deviceId) {
  const row = db.prepare("SELECT * FROM push_tokens WHERE device_id = ?").get(deviceId);
  return row ? mapRow(row) : null;
}

/**
 * Delete a token by deviceId.
 * @param {string} deviceId
 * @returns {boolean}
 */
function deleteToken(deviceId) {
  const result = db.prepare("DELETE FROM push_tokens WHERE device_id = ?").run(deviceId);
  return result.changes > 0;
}

/** Map snake_case DB columns to camelCase */
function mapRow(row) {
  return {
    deviceId: row.device_id,
    token: row.token,
    userId: row.user_id,
    registeredAt: row.registered_at,
  };
}

module.exports = { saveToken, getAllTokens, getTokenByDevice, deleteToken };
