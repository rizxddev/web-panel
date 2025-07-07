export default async function handler(req, res) {
  const api = process.env.PANEL_API_URL;
  const key = process.env.PANEL_API_KEY;

  try {
    const resp = await fetch(`${api}/api/application/servers`, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "Application/vnd.pterodactyl.v1+json"
      }
    });

    const data = await resp.json();

    // Adaptasikan ke struktur dashboard-admin.html
    const servers = data.data.map(s => ({
      id: s.attributes.uuid,                // Untuk kolom ID
      name: s.attributes.name,              // Untuk kolom Nama Panel
      owner: s.attributes.user,             // Untuk kolom Pemilik
      status: s.attributes.suspended ? "Suspended" : "Active"  // Status panel (jika ada)
    }));

    res.status(200).json(servers);

  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data dari panel." });
  }
}