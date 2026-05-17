// api/github.js
export default async function handler(req, res) {
  // Habilita CORS para o seu próprio site
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { caminho, metodo, corpo } = req.body || req.query;
  const GITHUB_KEY = process.env.GITHUB_KEY; // Sua chave estará salva na Vercel seguro!
  const REPO = "hypelabdev/Vitrinni";

  if (!GITHUB_KEY) {
    return res.status(500).json({ error: "Chave do GitHub não configurada no servidor Vercel." });
  }

  try {
    const url = `https://api.github.com/repos/${REPO}/contents/${caminho}`;
    
    const configFetch = {
      method: metodo || "GET",
      headers: {
        "Authorization": `token ${GITHUB_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json"
      }
    };

    if (metodo === "PUT" && corpo) {
      configFetch.body = JSON.stringify(corpo);
    }

    const respostaGit = await fetch(url, configFetch);
    const dadosGit = await respostaGit.json();

    if (!respostaGit.ok) {
      return res.status(respostaGit.status).json(dadosGit);
    }

    return res.status(200).json(dadosGit);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
