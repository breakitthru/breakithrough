# Deploying Break It Through — Neon + Render

Order matters: **Neon first** (you need its connection strings), then **GitHub**,
then **Render**. Google OAuth is last and optional.

---

## 1 · Neon (Postgres database)

1. Sign up / log in at **https://neon.tech** (Google login is fine).
2. **Create a project.** Name it e.g. `break-it-through`. Pick region
   **AWS Singapore (ap-southeast-1)** — closest to India; match Render's region.
3. On the project's **Dashboard → Connection Details**, copy TWO strings:
   - **Pooled** connection string → this is your `DATABASE_URL`
     (the host contains `-pooler`).
   - **Direct / unpooled** connection string → this is your `DIRECT_URL`
     (toggle "Connection pooling" **off**, or use the "Direct connection" option;
     the host has no `-pooler`).
   Both end in `?sslmode=require`. Keep them somewhere safe for step 3.

That's all on Neon. Migrations create the tables automatically on first deploy.

---

## 2 · GitHub (Render deploys from here)

The repo is already `Abhijay09/break-it-thru`. Push the current code to `main`
(the developer will do this, or run `git add -A && git commit && git push`).

---

## 3 · Render (hosting)

1. Sign up / log in at **https://render.com** and connect your GitHub account.
2. **New → Blueprint**, pick the `break-it-thru` repo. Render reads `render.yaml`
   and proposes a web service called **break-it-through**.
3. It will prompt for the secret env vars (marked `sync: false`). Fill:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon **pooled** string from step 1 |
   | `DIRECT_URL` | Neon **direct** string from step 1 |
   | `AUTH_URL` | leave blank for now, set after first deploy (step 4) |
   | `AUTH_GOOGLE_ID` | blank until you set up Google (step 5) |
   | `AUTH_GOOGLE_SECRET` | blank |
   - `AUTH_SECRET` is generated automatically. `NODE_VERSION` is preset to 22.
4. **Apply / Create**. Render runs
   `npm install → prisma migrate deploy → next build`, so your Neon tables are
   created during the first build. When it's live you'll get a URL like
   `https://break-it-through.onrender.com`.
   → Go to **Environment**, set `AUTH_URL` to that exact URL, and save
   (this triggers one redeploy).
5. (Optional) Run the seed once to fill baseline data (config, phases, helplines,
   rewards, badges): open the Render **Shell** for the service and run
   `npm run db:seed` — or run it locally with the Neon `DATABASE_URL` in `.env`.

The app renders on demo/mock data today, so it works immediately even before the
DB has rows. The database becomes essential when real auth + persistence land.

---

## 4 · Google OAuth (optional, enables real sign-in)

1. **https://console.cloud.google.com** → create a project → **APIs & Services →
   Credentials → Create credentials → OAuth client ID → Web application**.
2. **Authorized redirect URI:** `https://<your-render-url>/api/auth/callback/google`
3. Copy the Client ID + Secret into Render's `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
   and save (redeploys). Sign-in via Google now works.

---

## Notes

- **Free tier:** Render's free web service sleeps after inactivity and cold-starts
  (~30–60s) on the next request. Fine for demos; upgrade for always-on.
- Migrations run inside the build command (free tier has no `preDeployCommand`).
  On a paid plan, move `npx prisma migrate deploy` into a `preDeployCommand`.
- Never commit real secrets. `.env` is gitignored; set values in the Render
  dashboard only.
