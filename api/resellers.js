import axios from 'axios';

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const branch = process.env.GITHUB_BRANCH || 'main';
const filePath = 'data/resellers.json';
const githubApi = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

async function getFileData() {
  const res = await axios.get(githubApi, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const decoded = Buffer.from(res.data.content, 'base64').toString();
  return {
    json: JSON.parse(decoded),
    sha: res.data.sha,
  };
}

async function updateFile(newJson, sha, message) {
  const encoded = Buffer.from(JSON.stringify(newJson, null, 2)).toString('base64');

  return axios.put(githubApi, {
    message,
    content: encoded,
    sha,
    branch,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default async function handler(req, res) {
  try {
    // Ambil file dan SHA
    const { json: resellers, sha } = await getFileData();

    if (req.method === 'GET') {
      return res.status(200).json(resellers);
    }

    if (req.method === 'POST') {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username & password harus diisi' });
      }
      if (resellers.find(r => r.username === username)) {
        return res.status(409).json({ error: 'Username sudah ada' });
      }
      const newList = [...resellers, { username, password }];
      await updateFile(newList, sha, `Menambah reseller: ${username}`);
      return res.status(201).json({ message: 'Reseller berhasil ditambah' });
    }

    if (req.method === 'DELETE') {
      const { username } = req.body;
      const newList = resellers.filter(r => r.username !== username);
      await updateFile(newList, sha, `Menghapus reseller: ${username}`);
      return res.status(200).json({ message: 'Reseller dihapus' });
    }

    if (req.method === 'PATCH') {
      const { username, newPassword } = req.body;
      if (!username || !newPassword) {
        return res.status(400).json({ error: 'Username & newPassword harus diisi' });
      }
      let updated = false;
      const newList = resellers.map(r => {
        if (r.username === username) {
          updated = true;
          return { ...r, password: newPassword };
        }
        return r;
      });
      if (!updated) {
        return res.status(404).json({ error: 'Reseller tidak ditemukan' });
      }
      await updateFile(newList, sha, `Mengubah password reseller: ${username}`);
      return res.status(200).json({ message: 'Password reseller diupdate' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[GITHUB API ERROR]', err.message);
    return res.status(500).json({ error: 'Terjadi kesalahan', detail: err.message });
  }
}
