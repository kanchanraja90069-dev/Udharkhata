# Credit Ledger (Gemma 4 + Supabase + Vercel)

AI credit ledger for small shops. Type, speak or photograph a handwritten ledger page.
Gemma 4 turns it into ledger entries, saved in Supabase Postgres. Balances, history and
payment reminders (written by Gemma 4) are built in.

## Setup (10 minutes)
1. Supabase: create a free project at supabase.com. SQL Editor -> paste `supabase.sql` -> Run.
   Then Project Settings -> API: copy the Project URL and the `service_role` key (keep it secret).
2. Gemini key: https://aistudio.google.com/apikey
3. Push this folder to a public GitHub repo, import it in Vercel (Framework: Other).
4. Vercel -> Settings -> Environment Variables:
   - GEMINI_API_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - (optional) GEMMA_MODEL = gemma-4-31b-it
5. Supabase -> Authentication -> Providers -> Email: keep enabled. For a quick demo turn OFF "Confirm email" so signup logs in instantly.
6. Deploy. Sign up with email + password; each shopkeeper only sees their own ledger. Use the legacy `service_role` key (Project Settings -> API Keys -> Legacy).

## Local
npm i -g vercel && vercel dev   (env vars in .env.local)
