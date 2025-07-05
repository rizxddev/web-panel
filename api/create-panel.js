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

  const api = process.env.PANEL_API_URL;
  const key = process.env.PANEL_API_KEY;

  if (!api || !key) {
    return res.status(500).json({ error: "API_KEY atau URL belum dikonfigurasi." });
  }

  // 1. Cari user berdasarkan email
  let userId = null;
  let userPassword = null;
  try {
    // Cek apakah user sudah ada (filter by email)
    const search = await fetch(`${api}/api/application/users?filter[email]=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "Application/vnd.pterodactyl.v1+json"
      }
    });
    const searchData = await search.json();

    if (Array.isArray(searchData.data) && searchData.data.length > 0) {
      // User sudah ada, pakai user id yang ada
      userId = searchData.data[0].attributes.id;
      userPassword = null; // Tidak bisa ambil password existing
    } else {
      // User belum ada, buat user baru
      const password = generateRandomPassword();
      const createUser = await fetch(`${api}/api/application/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Accept: "Application/vnd.pterodactyl.v1+json"
        },
        body: JSON.stringify({
          username: username,
          email: email,
          first_name: username,
          last_name: "Reseller",
          password: password
        })
      });
      const userData = await createUser.json();

      if (createUser.ok && userData.attributes) {
        userId = userData.attributes.id;
        userPassword = password;
      } else {
        return res.status(400).json({
          error: userData.errors?.[0]?.detail || "Gagal membuat user baru di panel."
        });
      }
    }
  } catch (e) {
    return res.status(500).json({ error: "Gagal cek/buat user panel." });
  }

  // 2. Buat server di bawah user id yang sudah ditemukan/dibuat
  const payload = {
    name: serverName,
    user: userId,
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
      PASSWORD: userPassword || "Password kamu saat create akun", // hanya untuk info, tidak digunakan panel
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
        email,
        password: userPassword || "(akun sudah pernah ada, silakan login dengan password sebelumnya)",
        panelUrl: api
      });
    }

    return res.status(400).json({
      error: data.errors?.[0]?.detail || "Gagal membuat panel."
    });
  } catch {
    return res.status(500).json({ error: "Koneksi ke panel gagal." });
  }
}
