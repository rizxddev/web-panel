import dbConnect from "./db";
import Log from "./models/Log";

export default async function handler(req, res) {
  await dbConnect();

  // GET: List log aktivitas (max 100, terbaru di atas)
  if (req.method === "GET") {
    const logs = await Log.find({}).sort({ _id: -1 }).limit(100);
    res.status(200).json(logs);
  }
  // POST: Tambah log aktivitas
  else if (req.method === "POST") {
    const { user, action, desc } = req.body;
    await Log.create({
      time: new Date().toLocaleString("id-ID"),
      user,
      action,
      desc,
    });
    res.status(201).json({ success: true });
  }
  else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}