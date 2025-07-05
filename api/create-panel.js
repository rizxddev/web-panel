function generateRandomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default async function handler(req, res) {
  const { username, email, serverName, ram, cpu } = req.body;

  const api = process.env.PANEL_API_URL; // contoh: https://panel.domain.com
  const key = process.env.PANEL_API_KEY;

  if (!api || !key) {
    return res.status(500).json({ error: "API_KEY atau URL belum dikonfigurasi." });
  }

  const password = generateRandomPassword();

  const payload = {
    name: serverName,
    user: 1,
    egg: 15,
    docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18",
    startup: "{{CMD_RUN}}",
    limits: {
      memory: ram,
      swap: 0,
      disk: 10240,
      io: 500,
      cpu: cpu
    },
    environment: {
      USERNAME: username,
      EMAIL: email,
      PASSWORD: password,
      CMD_RUN: "npm start"
    },
    feature_limits: {
      databases: 1,
      allocations: 1,
      backups: 1
    },
    deploy: {
      locations: [1],
      dedicated_ip: false,
      port_range: []
    },
    start_on_completion: true
  };

  try {
    const resp = await fetch(`${api}/api/application/servers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (resp.ok) {
      return res.status(200).json({
        username,
        password,
        panelUrl: api // ✅ hanya URL utama, tanpa uuid atau path lain
      });
    }

    return res.status(400).json({
      error: data.errors?.[0]?.detail || "Gagal membuat panel."
    });
  } catch {
    return res.status(500).json({ error: "Koneksi ke panel gagal." });
  }
}