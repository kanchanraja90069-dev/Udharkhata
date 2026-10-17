const { gemma, parseJSON, requireUser } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!(await requireUser(req))) return res.status(401).json({ error: "Please log in" });
  const { text, image, mime, customers } = req.body || {};
  if (!text && !image) return res.status(400).json({ error: "Type, speak or add a photo of a ledger page" });

  const known = (Array.isArray(customers) ? customers : []).slice(0, 60).map((c) => String(c).slice(0, 40)).join(", ");
  const prompt = `You are the bookkeeper of a small neighbourhood shop. Convert the input (English text, or a photo of a handwritten ledger page) into ledger entries.
Rules:
- type "udhaar" = customer took goods/money on credit (customer owes the shop).
- type "jama" = customer paid money back (words like paid, paid back, returned, settled).
- amount is a positive number in rupees. item is a short goods name or "" if unknown.
- If a name matches one of these existing customers (spelling may differ), reuse that exact name: [${known}]. Otherwise write the name in Title Case in Roman letters.
- Never invent entries. Skip anything you cannot read.
Return ONLY JSON: {"entries":[{"customer":string,"type":"udhaar"|"jama","amount":number,"item":string}]}
${text ? "Input text: " + String(text).slice(0, 1500) : "The input is the attached photo."}`;
  const parts = [];
  if (image) parts.push({ inline_data: { mime_type: mime || "image/jpeg", data: image } });
  parts.push({ text: prompt });

  try {
    const out = parseJSON(await gemma(parts));
    const entries = (out.entries || []).map((e) => ({
      customer: String(e.customer || "").trim().slice(0, 60),
      type: e.type === "jama" ? "jama" : "udhaar",
      amount: Math.abs(Number(e.amount)) || 0, item: String(e.item || "").slice(0, 80),
    })).filter((e) => e.customer && e.amount > 0);
    if (!entries.length) return res.status(422).json({ error: "Could not find any entries. Try: Ramesh took 500 on credit" });
    res.json({ entries });
  } catch (e) { res.status(500).json({ error: "Could not read Gemma's answer: " + e.message }); }
};
