const { gemma, parseJSON, requireUser } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!(await requireUser(req))) return res.status(401).json({ error: "Please log in" });
  const { customer, balance, items, lang } = req.body || {};
  if (!customer || !(Number(balance) > 0)) return res.status(400).json({ error: "Customer and positive balance required" });
  const prompt = `Write a short, polite WhatsApp payment reminder from a shopkeeper to a customer, in simple, friendly English.
Customer: ${String(customer).slice(0, 60)}. Pending amount: Rs ${Number(balance)}. Recent items: ${String(items || "").slice(0, 150) || "n/a"}.
Be warm and respectful, max 3 sentences, no threats. Return ONLY JSON: {"message":string}`;
  try {
    const out = parseJSON(await gemma([{ text: prompt }], 512));
    res.json({ message: String(out.message || "").slice(0, 600) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
