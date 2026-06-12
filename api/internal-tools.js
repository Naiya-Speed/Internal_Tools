/**
 * Vercel Serverless Function — GreenDot SOAP Proxy
 * Route: /api/internal-tools
 *
 * Forwards SOAP requests from the browser to greendotauth.tryspeed.dev,
 * bypassing CORS (browser → Vercel function → GreenDot API).
 */

const https = require("https");

const TARGET_HOST = "greendotauth.tryspeed.dev";
const TARGET_PATH = "/greendot/embedded-finance/retail-consumption";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, SOAPAction, Authorization",
};

module.exports = function handler(req, res) {
  // Set CORS headers on every response
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // Collect body
  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {
    const options = {
      hostname: TARGET_HOST,
      path:     TARGET_PATH,
      method:   "POST",
      headers: {
        "Content-Type":   req.headers["content-type"] || "application/xml",
        "Content-Length": Buffer.byteLength(body),
        "SOAPAction":     req.headers["soapaction"] || '""',
        "User-Agent":     "SpeedDepositLauncher-Vercel/1.0",
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let responseBody = "";
      proxyRes.on("data", chunk => { responseBody += chunk; });
      proxyRes.on("end", () => {
        res.status(proxyRes.statusCode)
           .setHeader("Content-Type", proxyRes.headers["content-type"] || "application/xml")
           .send(responseBody);
      });
    });

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err.message);
      res.status(502).json({ error: "Proxy error: " + err.message });
    });

    proxyReq.write(body);
    proxyReq.end();
  });
}
