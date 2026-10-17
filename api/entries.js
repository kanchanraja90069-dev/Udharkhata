const { db, requireUser } = require("./_lib");

module.exports = async (req, res) => {
  try {
    const shop = await requireUser(req); // shop column now holds the logged-in user id
    if (!shop) return res.status(401).json({ error: "Please log in" });
    const s = encodeURIComponent(shop);

    if (req.method === "GET") {
      const rows = await db(`entries?shop=eq.${s}&order=created_at.desc&limit=1000`);
      return res.json({ entries: rows });
    }
    if (req.method === "POST") {
      const list = Array.isArray(req.body?.entries) ? req.body.entries.slice(0, 30) : [];
      const rows = list.map((e) => ({
        shop, customer: String(e.customer || "").trim().slice(0, 60),
        type: e.type === "jama" ? "jama" : "udhaar",
        amount: Number(e.amount), item: String(e.item || "").slice(0, 80),
      })).filter((e) => e.customer && e.amount > 0 && e.amount < 1e8);
      if (!rows.length) return res.status(400).json({ error: "No valid entries to save" });
      const saved = await db("entries", { method: "POST", body: rows, prefer: "return=representation" });
      return res.json({ entries: saved });
    }
    if (req.method === "DELETE") {
      const id = String(req.query.id || "");
      if (!/^\d+$/.test(id)) return res.status(400).json({ error: "Invalid id" });
      await db(`entries?id=eq.${id}&shop=eq.${s}`, { method: "DELETE" });
      return res.json({ ok: true });
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
