export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only" });
    }

    const { files } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!token) return res.status(500).json({ error: "Missing GITHUB_TOKEN" });
    if (!owner) return res.status(500).json({ error: "Missing GITHUB_OWNER" });
    if (!repo) return res.status(500).json({ error: "Missing GITHUB_REPO" });

    const siteId = "site-" + Date.now();

    let htmlFile = files.find(file => file.name.toLowerCase().endsWith(".html"));
    let cssFile = files.find(file => file.name.toLowerCase().endsWith(".css"));
    let jsFile = files.find(file => file.name.toLowerCase().endsWith(".js"));

    let finalFiles = [];

    if (htmlFile) {
      finalFiles.push({
        name: "index.html",
        text: htmlFile.text
      });
    } else {
      finalFiles.push({
        name: "index.html",
        text: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>주소뽑자 사이트</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<h1>주소뽑자로 만든 사이트</h1>
<p>HTML file was not uploaded.</p>
<script src="script.js"></script>
</body>
</html>`
      });
    }

    if (cssFile) {
      finalFiles.push({
        name: "style.css",
        text: cssFile.text
      });
    }

    if (jsFile) {
      finalFiles.push({
        name: "script.js",
        text: jsFile.text
      });
    }

    for (const file of finalFiles) {
      const path = `sites/${siteId}/${file.name}`;
      const content = Buffer.from(file.text, "utf8").toString("base64");

      const githubResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "juso-ppobja"
          },
          body: JSON.stringify({
            message: `Create ${siteId}`,
            content
          })
        }
      );

      const githubText = await githubResponse.text();

      if (!githubResponse.ok) {
        return res.status(500).json({
          error: "GitHub error: " + githubText
        });
      }
    }

    const url = `https://${owner}.github.io/${repo}/sites/${siteId}/`;

    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Unknown server error"
    });
  }
}
