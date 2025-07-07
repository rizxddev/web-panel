import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./data/resellers.json');

export default function handler(req, res) {
  // GET: list semua reseller
  if (req.method === 'GET') {
    try {
      const resellers = JSON.parse(fs.readFileSync(filePath));
      res.status(200).json(resellers);
    } catch {
      res.status(200).json([]);
    }
    return;
  }

  // POST: tambah reseller
  if (req.method === 'POST') {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username & password harus diisi" });
    }

    let resellers = [];
    try { resellers = JSON.parse(fs.readFileSync(filePath)); } catch {}
    if (resellers.find(r => r.username === username)) {
      return res.status(409).json({ error: "Username sudah ada" });
    }
    resellers.push({ username, password });
    fs.writeFileSync(filePath, JSON.stringify(resellers, null, 2));
    res.status(201).json({ message: "Reseller berhasil ditambah" });
    return;
  }

  // DELETE: hapus reseller (by username)
  if (req.method === 'DELETE') {
    const { username } = req.body;
    let resellers = [];
    try { resellers = JSON.parse(fs.readFileSync(filePath)); } catch {}
    const newList = resellers.filter(r => r.username !== username);
    fs.writeFileSync(filePath, JSON.stringify(newList, null, 2));
    res.status(200).json({ message: "Reseller dihapus" });
    return;
  }

  // PATCH: ganti password reseller
  if (req.method === 'PATCH') {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ error: "Username & newPassword harus diisi" });
    }
    let resellers = [];
    try { resellers = JSON.parse(fs.readFileSync(filePath)); } catch {}
    let updated = false;
    resellers = resellers.map(r => {
      if (r.username === username) {
        updated = true;
        return { ...r, password: newPassword };
      }
      return r;
    });
    fs.writeFileSync(filePath, JSON.stringify(resellers, null, 2));
    if (updated) {
      res.status(200).json({ message: "Password reseller diupdate" });
    } else {
      res.status(404).json({ error: "Reseller tidak ditemukan" });
    }
    return;
  }

  // Method tidak diijinkan
  res.status(405).json({ error: "Method not allowed" });
}