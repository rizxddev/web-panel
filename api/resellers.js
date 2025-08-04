import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = "data/resellers.json"

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  throw new Error("❌ Missing GitHub config in environment variables.");
}

const githubHeaders = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

async function getFile() {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      { headers: githubHeaders }
    );
    const content = Buffer.from(res.data.content, 'base64').toString();
    return { content: JSON.parse(content), sha: res.data.sha };
  } catch {
    return { content: [], sha: null };
  }
}

async function updateFile(data, message, sha = null) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = {
    message,
    content,
    committer: {
      name: 'Reseller Bot',
      email: 'bot@example.com' // Diperlukan GitHub API, tapi tidak akan masuk ke JSON
    },
  };
  if (sha) body.sha = sha;

  await axios.put(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
    body,
    { headers: githubHeaders }
  );
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { content } = await getFile();
    return res.status(200).json(content);
  }

  if (req.method === 'POST') {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username & password harus diisi" });
    }

    const { content: resellers, sha } = await getFile();
    if (resellers.find(r => r.username === username)) {
      return res.status(409).json({ error: "Username sudah ada" });
    }

    const updated = [...resellers, { username, password }];
    await updateFile(updated, `Tambah reseller: ${username}`, sha);
    return res.status(201).json({ message: "Reseller berhasil ditambah" });
  }

  if (req.method === 'DELETE') {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username harus diisi" });
    }

    const { content: resellers, sha } = await getFile();
    const updated = resellers.filter(r => r.username !== username);
    if (updated.length === resellers.length) {
      return res.status(404).json({ error: "Reseller tidak ditemukan" });
    }

    await updateFile(updated, `Hapus reseller: ${username}`, sha);
    return res.status(200).json({ message: "Reseller dihapus" });
  }

  if (req.method === 'PATCH') {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ error: "Username & newPassword harus diisi" });
    }

    const { content: resellers, sha } = await getFile();
    let found = false;
    const updated = resellers.map(r => {
      if (r.username === username) {
        found = true;
        return { ...r, password: newPassword };
      }
      return r;
    });

    if (!found) {
      return res.status(404).json({ error: "Reseller tidak ditemukan" });
    }

    await updateFile(updated, `Update password reseller: ${username}`, sha);
    return res.status(200).json({ message: "Password reseller diupdate" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
