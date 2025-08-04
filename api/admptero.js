// File: /pages/api/admptero.js (Next.js)
export default async function handler(req, res) {
  const PanelURL = process.env.PANEL_API_URL; // Contoh: https://panel.rizxmods.my.id
  const PanelKey = process.env.PANEL_API_KEY;

  if (!PanelURL || !PanelKey) {
    return res.status(500).json({ error: "ENV tidak dikonfigurasi dengan benar." });
  }

  try {
    const response = await fetch(`${PanelURL}/api/application/users`, {
      headers: {
        "Authorization": `Bearer ${PanelKey}`,
        "Accept": "Application/vnd.pterodactyl.v1+json"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Gagal fetch ke Pterodactyl." });
    }

    const json = await response.json();
    const users = json.data.map(u => ({
      id: u.attributes.id,
      username: u.attributes.username,
      email: u.attributes.email,
      role: u.attributes.root_admin ? "Admin" : "User"
    }));

    res.status(200).json({ users });
  } catch (err) {
    console.error("[admptero.js] ERROR:", err);
    res.status(500).json({ error: "Server error." });
  }
}
