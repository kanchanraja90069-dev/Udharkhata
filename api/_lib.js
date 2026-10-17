const MODEL = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";

async function gemma(parts, maxOutputTokens = 2048) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { temperature: 0.2, maxOutputTokens } }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || "Gemini API error");
  return (d.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || "").join("");
}

function parseJSON(text) {
  const t = text.replace(/```json|```/g, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b < 0) throw new Error("Model did not return JSON");
  return JSON.parse(t.slice(a, b + 1));
}

async function db(path, { method = "GET", body, prefer } = {}) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY not set");
  const r = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error("Database error: " + text.slice(0, 200));
  return text ? JSON.parse(text) : null;
}

const okShop = (s) => /^[A-Za-z0-9_-]{8,64}$/.test(s || "");

// Verifies the logged-in user's token with Supabase Auth and returns their user id (or null).
async function requireUser(req) {
  try {
    const t = (req.headers.authorization || "").replace(/^Bearer /, "");
    if (!t) return null;
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + t } });
    if (!r.ok) return null;
    const u = await r.json();
    return okShop(u.id) ? u.id : null;
  } catch { return null; }
}
module.exports = { gemma, parseJSON, db, okShop, requireUser, MODEL };
