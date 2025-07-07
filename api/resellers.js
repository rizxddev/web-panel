import dbConnect from "./db";
import Reseller from "./models/Reseller";

export default async function handler(req, res) {
  await dbConnect();

  // GET: list semua reseller
  if (req.method === 'GET') {
    const resellers = await Reseller.find({}, "-__v");
    res.status(200).json(resellers);
    return;
  }

  // POST: tambah reseller
  if (req.method === 'POST') {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username & password harus diisi" });
    }
    try {
      const existing = await Reseller.findOne({ username });
      if (existing) {
        return res.status(409).json({ error: "Username sudah ada" });
      }
      await Reseller.create({ username, password });
      res.status(201).json({ message: "Reseller berhasil ditambah" });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
    return;
  }

  // DELETE: hapus reseller (by username)
  if (req.method === 'DELETE') {
    const { username } = req.body;
    await Reseller.deleteOne({ username });
    res.status(200).json({ message: "Reseller dihapus" });
    return;
  }

  // PATCH: ganti password reseller
  if (req.method === 'PATCH') {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ error: "Username & newPassword harus diisi" });
    }
    const updated = await Reseller.updateOne({ username }, { password: newPassword });
    if (updated.nModified > 0) {
      res.status(200).json({ message: "Password reseller diupdate" });
    } else {
      res.status(404).json({ error: "Reseller tidak ditemukan" });
    }
    return;
  }

  // Method tidak diijinkan
  res.status(405).json({ error: "Method not allowed" });
}