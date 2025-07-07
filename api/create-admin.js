export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username wajib diisi!" });

  // Email otomatis dari username
  const email = username + "@gmail.com";

  // Password random
  function randomPassword(len=12) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pw = "";
    for (let i=0;i<len;i++) pw += chars[Math.floor(Math.random()*chars.length)];
    return pw;
  }
  const password = randomPassword(12);

  // Konfigurasi Pterodactyl
  const panelURL = process.env.PANEL_API_URL; // contoh: https://panel.domain.com
  const panelKey = process.env.PANEL_API_KEY; // API Application Key (bukan client key!)

  if (!panelURL || !panelKey) {
    return res.status(500).json({ error: "PANEL_API_URL/PANEL_API_KEY belum dikonfigurasi!" });
  }

  // Payload user baru admin Pterodactyl
  const payload = {
    username,
    email,
    first_name: username,
    last_name: "Admin",
    password,
    root_admin: true,
    language: "en"
  };

  try {
    const resp = await fetch(`${panelURL}/api/application/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${panelKey}`,
        "Content-Type": "application/json",
        "Accept": "Application/vnd.pterodactyl.v1+json"
      },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();

    if (!resp.ok) {
      return res.status(400).json({ error: data.errors?.[0]?.detail || "Gagal membuat admin panel." });
    }

    // Berhasil
    return res.status(201).json({
      username,
      password,
      domain: process.env.NEXT_PUBLIC_PANEL_DOMAIN || panelURL
    });

  } catch (e) {
    return res.status(500).json({ error: "Gagal koneksi ke panel." });
  }
}