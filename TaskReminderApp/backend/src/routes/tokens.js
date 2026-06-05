const express = require("express");
const router = express.Router();
const { registerToken, listTokens, removeToken } = require("../controllers/tokenController");

// Register or update a push token
router.post("/register", registerToken);

// List all tokens (admin use, protected)
router.get("/", listTokens);

// Remove a token
router.delete("/:deviceId", removeToken);

module.exports = router;
