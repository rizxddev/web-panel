import dbConnect from './db';
import Log from './models/log';

export default async function handler(req, res) {
  await dbConnect();

  // GET: Ambil log (limit 100 terbaru)
  if (req.method === 'GET') {
    try {
      const logs = await Log.find({}).sort({ _id: -1 }).limit(100);
      res.status(200).json(logs);
    } catch {
      res.status(200).json([]);
    }
    return;
  }

  // POST: Tambah log aktivitas (opsional, kalau frontend/backend mau kirim manual)
  if (req.method === 'POST') {
    const { user, action, desc } = req.body;
    try {
      await Log.create({
        time: new Date().toLocaleString('id-ID'),
        user, action, desc,
      });
      res.status(201).json({ message: "Log ditambah" });
    } catch {
      res.status(500).json({ error: "Server error" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}