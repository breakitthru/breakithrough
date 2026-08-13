# Break It Thru — Owner Handover Guide

This is the plain-language guide to running Break It Thru. It covers what the app
is, how to sign in and use the admin panel, the accounts and keys that power it,
and the short list of things still to switch on before launch.

Two companion files:
- **`DEPLOYMENT.md`** — one-time setup of the database and hosting (technical).
- **`CREDENTIALS.txt`** — the master list of every login, key, and account
  (kept private, never shared publicly). Keep this safe.

---

## 1 · What this is

Break It Thru is a 60-day guided breakup-recovery program delivered as a website.
A member signs up, answers a few onboarding questions, and then gets one day of
tasks, videos, and a reflection at a time, with points, badges, a rewards shop, an
AI companion (Daylight), and an SOS safety flow.

You (the owner) control the entire product from a separate **admin panel** at
`/admin`. Nothing needs code changes for day-to-day running — everything below is
done through the website.

- **Member app:** the main site (e.g. `https://breakitthru.com`)
- **Admin panel:** the same site with `/admin` on the end
  (e.g. `https://breakitthru.com/admin`)

---

## 2 · Signing in as owner

The owner account is hard-wired to one email: **breakitthru@gmail.com**.
Whoever signs in with that email automatically becomes the Owner and sees `/admin`.

First time:
1. Go to the sign-up page and create the account using **breakitthru@gmail.com**
   and a strong password (store it in `CREDENTIALS.txt`).
2. Sign in, then visit `/admin`. You now have full access.

A normal member who visits `/admin` is sent back to the app. Staff you invite get
only the sections their role allows (see Staff below).

---

## 3 · The admin panel, section by section

The left sidebar lists every section. Here is what each one does.

### Overview (`/admin`)
Your dashboard: active members, how many finished yesterday, SOS alerts in the last
24 hours, and a "needs a look" list (recent SOS, failed payments, new orders).
A red banner appears when there is an unresolved SOS event. Start your day here.

### Program (`/admin/program`)
The 60-day plan. This is where the actual content lives.
- **Days** — click any day (1–60) to open its editor: add, remove, or reorder the
  day's tasks, attach a video, and mark milestone days.
- **Tasks** — edit each task in a side drawer: title, category, how long it takes,
  points, whether it's mandatory, and the "why it matters" note.
- **Videos** (`/admin/program/videos`) — your video library. See **Uploading
  videos** below.
- **Phases** — the four phase names and which day ranges they cover, plus badges.
- **Rules** — cadence and missed-day settings.
- **Intake** — the onboarding questions new members answer.

Edits go live immediately, so change content carefully once you have real members.

### Uploading videos
Videos are hosted on **Cloudflare Stream**. In a day editor or the video library,
choose **upload a video file** and pick the file from your computer; it uploads
straight to Cloudflare and shows a status chip:
- **No file** — nothing uploaded yet
- **Processing** — Cloudflare is still preparing it (wait a minute, then refresh)
- **Ready** — it will play for members

Note: Cloudflare Stream must have an active subscription with video minutes for
uploads to succeed (see the task list at the end).

### Daylight (`/admin/daylight`)
Daylight is the AI companion members chat with. Here you edit its **system
prompt** — the instructions that shape its tone and boundaries (warm, supportive,
not therapy, points members to SOS in a crisis). The page also shows whether the
AI key is connected. If it isn't connected, members see a note and the chat is
disabled.

### Members (`/admin/members`)
The member list with filters and CSV export. Click a member to see their overview,
progress, payments, and safety history.
- **Privacy wall:** you can see that a member wrote a reflection or chatted with
  Daylight, but never the actual text. This is deliberate and permanent.
- **Delete a member (DPDP):** anonymizes their personal data and keeps only what
  the law requires (payment records), leaving a tombstone. This is one member at a
  time, never in bulk, and it is logged.

### Safety (`/admin/safety`)
The SOS log — every time a member used the safety flow. Open an event to review it
and mark it reviewed. `/admin/safety/on-call` holds the helpline list and the
on-call rota. Helplines edited here appear in the member SOS screen.

### Money (`/admin/money/...`)
- **Purchases** — all program payments and totals; refund from here.
- **Failed** — payments that didn't complete.
- **Points** — the points economy: rupee-per-point value and earning amounts, plus
  points issued vs redeemed.
- **Rewards** — the rewards members redeem with points, and the redemption queue
  (mark them fulfilled or cancelled).
- **Promo codes** (`/admin/money/promos`) — create discount codes for the program
  purchase (percentage or flat off, with optional expiry and usage limit). A 100%
  code unlocks the program for free without going through payment.

### Shop (`/admin/shop`)
The merchandise store members see under "Shop".
- **Items** — add a product with a price, description, and photo. Toggle **sizes**
  on to add size options and upload a size chart image.
- **Orders** (`/admin/shop/orders`) — every order placed, with the shipping
  address and item/size. Mark orders fulfilled or cancelled. Orders can never be
  deleted, and each new paid order raises a notification badge in the top bar.
  An order email is also sent to **breakitthru@gmail.com** (once a mail provider is
  connected — see the task list).

### Staff (`/admin/staff`)
Invite team members and give them a role (Ops, Clinician, Moderator, Specialist).
Each role sees only its allowed sections. Invites generate a link the person opens
to set up their account. (Until a mail provider is connected, copy the invite link
and send it to them yourself.)

### Settings (`/admin/settings`)
- **Workspace** — name, support email, timezone, currency, day-rollover hour.
- **Notifications** — which alerts you want.
- **Integrations** — shows which services are connected (never shows the secret
  values themselves).
- **Legal** — your policy documents and versions.
- **Design** (`/admin/settings/design`) — upload your **logo** and set its size.
  Until you upload one, the default logo box stays. The logo shows across the app.
- **Data export** (`/admin/settings/data`) — download members, payments, or a full
  backup as CSV/JSON. Reflection and chat text are never included (privacy wall).

### Audit log (`/admin/audit`)
A record of every admin action, with CSV export. Exporting is itself logged;
filtering is not.

---

## 4 · The accounts and keys behind it

Everything is listed in full in **`CREDENTIALS.txt`**. In short, the app relies on:

| Service | What it does | Where the key lives |
|---|---|---|
| **Neon** | The database (all member data) | Render env vars |
| **Render** | Hosts the website | Render dashboard |
| **Cloudflare Stream** | Hosts the videos | Render env vars |
| **Razorpay** | Takes payments (program + shop) | Render env vars |
| **OpenAI** | Powers the Daylight AI chat | Render env vars |
| **Google OAuth** | Optional "sign in with Google" | Render env vars |
| **Mail provider** | Sends order/invite emails | Render env vars (TBD) |
| **Hostinger** | The domain names | Hostinger account |

Secret keys are **never** put in the code. They are set on **Render → your service
→ Environment**. After changing an env var, Render redeploys automatically. The
full list of variable names is in `.env.example`.

---

## 5 · What's left before launch (task list)

These are the remaining switch-on items. Most need an account, a key, or content —
not new code.

1. **OpenAI key** — paste your OpenAI API key into `AI_API_KEY` on Render so
   Daylight goes live. (Usage-based billing; budget accordingly.)
2. **Cloudflare Stream subscription** — subscribe to Stream and buy video minutes,
   then upload the real program videos. (A card on file is not the same as an
   active subscription.)
3. **Razorpay keys** — add the TEST keys first, verify a test payment end to end,
   then switch to LIVE keys and set the webhook. Covers both program and shop.
4. **Mail provider** — connect an email service so order emails and staff invites
   actually send (right now they are logged, not delivered).
5. **Domain** — point **breakitthru.com** (and www) to Render, add the DNS records
   in Hostinger, then set `AUTH_URL` to `https://breakitthru.com` and redeploy.
   Finish the `.in` domain KYC if you want it.
6. **Google OAuth** (optional) — add Google credentials if you want "sign in with
   Google" in addition to email/password.
7. **Real content** — author the actual tasks, "why it matters" notes, reflections,
   videos, rewards, and shop items through the admin panel.
8. **Support mailboxes** — once the domain email is live, switch the interim
   address `breakitthru@gmail.com` over to `support@breakitthru.com` /
   `privacy@breakitthru.com`.
9. **Mobile layout** — the app is built for desktop; a mobile-optimized layout is a
   future pass.
10. **Automated SOS escalation** — the on-call rota is configurable, but automatic
    time-based escalation needs a background worker (future work).

---

## 6 · Day-to-day checklist

- Check **Overview** each morning; act on any red SOS banner first.
- Clear the **Shop orders** and **Rewards** redemption queues.
- Review **Money → Failed** payments if any appear.
- Keep **Program** content and **Shop** items up to date.
- Everything you do is recorded in the **Audit log**.
