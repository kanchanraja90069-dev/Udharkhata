// Email + password signup/login/refresh through Supabase Auth (server-side proxy).
const MSG = { "Invalid login credentials": "Incorrect email or password.", "User already registered": "This email is already registered. Please log in." };

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { action, email, password, refresh_token } = req.body || {};
  let path, body;
  if (action === "signup" || action === "login") {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || "") || String(password || "").length < 6 || String(password).length > 72)
      return res.status(400).json({ error: "Enter a valid email and a password of 6 to 72 characters." });
    path = action === "signup" ? "signup" : "token?grant_type=password"; body = { email, password };
  } else if (action === "refresh" && refresh_token) {
    path = "token?grant_type=refresh_token"; body = { refresh_token };
  } else return res.status(400).json({ error: "Bad request" });
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/${path}`, {
      method: "POST", headers: { apikey: process.env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { const m = d.msg || d.error_description || d.message || "Login failed"; return res.status(400).json({ error: MSG[m] || m }); }
    if (!d.access_token) return res.json({ pending: true, message: "Account created. Confirm it using the link sent to your email, then log in." });
    res.json({ access_token: d.access_token, refresh_token: d.refresh_token, email: d.user?.email || email });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
