module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  let raw = "";
  req.on("data", chunk => { raw += chunk; });
  req.on("end", () => {
    let body = {};
    try { body = JSON.parse(raw); } catch {}
    const { email, password } = body;
    if (
      email === process.env.SITE_EMAIL &&
      password === process.env.SITE_PASSWORD
    ) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  });
};
