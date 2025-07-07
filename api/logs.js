const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../data/logs.json');

// Pastikan kamu sudah punya middleware auth
const auth = require('./auth'); // harus role admin

// Fungsi baca semua log
function getLogs() {
  if (!fs.existsSync(logFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(logFile, 'utf-8'));
  } catch (e) {
    return [];
  }
}

// Fungsi tambah log baru
function addLog({ user, action, desc }) {
  let logs = getLogs();
  logs.push({
    time: new Date().toLocaleString('id-ID'),
    user,
    action,
    desc
  });
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// Endpoint GET /api/logs
router.get('/', auth, (req, res) => {
  const logs = getLogs();
  res.json(logs.reverse()); // Terbaru di atas
});

module.exports = { router, addLog };

