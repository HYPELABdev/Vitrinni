// api/github.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const GITHUB_KEY = process.env.GITHUB_KEY;
  const REPO = "hypelabdev/Vitrinni";

  if (!GITHUB_KEY) {
    return res.status(500).json({ error: "Chave do GitHub não configurada." });
  }

  // Caminho sempre vem pela query string
  const { caminho } = req.query;

  if (!caminho) {
    return res.status(400).json({ error: "Parâmetro 'caminho' não informado." });
  }

  const url = `https://api.github.com/repos/${REPO}/contents/${caminho}`;
  const headers = {
    "Authorization": `token ${GITHUB_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/vnd.github.v3+json"
  };

  try {
    // ── GET: busca o arquivo (retorna conteúdo + sha) ──────────────────
    if (req.method === 'GET') {
      const resposta = await fetch(url, { method: "GET", headers });
      const dados = await resposta.json();
      if (!resposta.ok) return res.status(resposta.status).json(dados);
      return res.status(200).json(dados);
    }

    // ── POST: salva o arquivo no GitHub via PUT ─────────────────────────
    if (req.method === 'POST') {
      const { metodo, corpo } = req.body;

      // Valida se os campos obrigatórios chegaram
      if (metodo !== "PUT" || !corpo || !corpo.content) {
        return res.status(400).json({ error: "Body inválido. Esperado: { metodo: 'PUT', corpo: { message, content, sha? } }" });
      }

      const resposta = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: corpo.message || "Atualiza catálogo",
          content: corpo.content,          // Base64 — vem do Catalogo.html
          sha:     corpo.sha || undefined  // undefined = cria novo arquivo
        })
      });

      const dados = await resposta.json();
      if (!resposta.ok) return res.status(resposta.status).json(dados);
      return res.status(200).json(dados);
    }

    return res.status(405).json({ error: "Método não permitido." });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
