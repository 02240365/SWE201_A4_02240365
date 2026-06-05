/**
 * Simple API key authentication middleware.
 * Pass `x-api-key` header with the value set in .env API_KEY.
 */
function requireApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    // If no API_KEY is configured, skip auth (dev mode)
    return next();
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing API key" });
  }

  next();
}

module.exports = { requireApiKey };
