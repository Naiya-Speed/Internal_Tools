const mysql = require("mysql2/promise");

const ALLOWED_TYPES = ["creditcard", "applepay", "debitcard", "googlepay", "papermoney"];

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false });

  const type = req.query?.type || new URL(req.url, "http://x").searchParams.get("type");

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ ok: false, error: "Invalid type" });
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT),
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
    });

    const [rows] = await conn.execute(
      "SELECT payment_method_fee_percentage, payment_method_fee_fixed, payment_method_fee_logic FROM speed_core_live.tbl_deposit_method_configuration WHERE type = ? LIMIT 1",
      [type]
    );

    if (!rows.length) return res.status(404).json({ ok: false, error: "Type not found" });

    const row = rows[0];
    return res.status(200).json({
      ok:         true,
      pf_pct:     parseFloat(row.payment_method_fee_percentage) || 0,
      pf_fixed:   row.payment_method_fee_fixed !== null ? parseFloat(row.payment_method_fee_fixed) : 0,
      fee_logic:  row.payment_method_fee_logic,
    });
  } catch (e) {
    console.error("DB error:", e.message);
    return res.status(502).json({ ok: false, error: "DB error: " + e.message });
  } finally {
    if (conn) await conn.end();
  }
};
