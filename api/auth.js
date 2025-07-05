import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  // 1. Login Admin dari .env
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return res.status(200).json({ token: "admin-token", role: "admin" });
  }

  // 2. Login Reseller dari .env (opsional, bisa lebih dari satu jika ingin)
  if (
    process.env.RESELLER_USER &&
    process.env.RESELLER_PASS &&
    username === process.env.RESELLER_USER &&
    password === process.env.RESELLER_PASS
  ) {
    return res.status(200).json({ token: "reseller-token", role: "reseller" });
  }

  // 3. Login Reseller dari file JSON
  try {
    const filePath = path.resolve('./data/resellers.json');
    const rawData = fs.readFileSync(filePath);
    const resellers = JSON.parse(rawData);

    const reseller = resellers.find(
      (r) => r.username === username && r.password === password
    );
    if (reseller) {
      return res.status(200).json({ token: "reseller-token", role: "reseller" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to read reseller data" });
  }

  // Jika gagal semua
  return res.status(401).json({ error: "Username atau password salah" });
}