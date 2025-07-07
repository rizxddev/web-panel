import dbConnect from './db';
import Admin from './models/Admin';

export default async function handler(req, res) {
  await dbConnect();

  // GET: list admin
  if (req.method === 'GET') {
    try {
      const admins = await Admin.find({}, "-__v -password");
      res.status(200).json(admins);
    } catch {
      res.status(200).json([]);
    }
    return;
  }

  // POST: tambah admin
  if (req.method === 'POST') {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username & password harus diisi" });
    }
    try {
      const existing = await Admin.findOne({ username });
      if (existing) {
        return res.status(409).json({ error: "Username sudah ada" });
      }
      await Admin.create({ username, password, email });
      res.status(201).json({ message: "Admin berhasil ditambah" });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
    return;
  }

  // PATCH: update password
  if (req.method === 'PATCH') {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ error: "Username & newPassword harus diisi" });
    }
    try {
      const updated = await Admin.updateOne({ username }, { password: newPassword });
      if (updated.modifiedCount > 0) {
        res.status(200).json({ message: "Password admin diupdate" });
      } else {
        res.status(404).json({ error: "Admin tidak ditemukan" });
      }
    } catch {
      res.status(500).json({ error: "Server error" });
    }
    return;
  }

  // DELETE: hapus admin
  if (req.method === 'DELETE') {
    const { username } = req.body;
    try {
      await Admin.deleteOne({ username });
      res.status(200).json({ message: "Admin dihapus" });
    } catch {
      res.status(500).json({ error: "Server error" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}