# Deploying DeutschCoach

This guide walks through deploying the full platform using free-tier services.  
**Estimated time:** 30–45 minutes. **Monthly cost:** $0 (at your scale).

---

## Architecture

```
                        ┌──────────────────┐
                        │    Vercel        │
                        │  Frontend :443   │
                        │  Next.js + React │
                        └────────┬─────────┘
                                 │ API calls (browser → backend directly)
                        ┌────────▼─────────┐
                        │    Render        │
                        │  Backend :443    │
                        │  FastAPI + Docker│
                        └───┬──────────┬───┘
                            │          │
                   ┌────────▼──┐  ┌───▼──────────┐
                   │ PlanetScale│  │  Resend      │
                   │ MySQL      │  │  Email (SMTP)│
                   └────────────┘  └──────────────┘
```

**No shared network — the browser talks to each service directly over HTTPS.**

---

## Prerequisites

- [ ] GitHub account
- [ ] A GitHub remote added to this repo: `git remote add origin https://github.com/YOUR_USERNAME/german-tutor-chatbot.git`
- [ ] Push to GitHub: `git push -u origin master`

---

## Step 1: Database — PlanetScale (5 min)

PlanetScale gives you a serverless MySQL database with automatic backups and a generous free tier.

1. Go to [planetscale.com](https://planetscale.com) → Sign up with GitHub
2. Click **"New database"** → Name it `deutschcoach`
3. Select region closest to you → Click **"Create database"**
4. Once created, click **"Connect"** → Select **"Python"** from the dropdown
5. Copy the connection string. It looks like:
   ```
   mysql+pymysql://abc123:password@aws.connect.psdb.cloud/deutschcoach?ssl_ca=%2Fetc%2Fssl%2Fcert.pem
   ```
6. **⚠️ Important:** PlanetScale requires SSL. In the connection string, PlanetScale gives you something like:
   ```
   mysql+pymysql://abc123:password@aws.connect.psdb.cloud/deutschcoach?ssl_ca=%2Fetc%2Fssl%2Fcert.pem
   ```
   Replace `?ssl_ca=%2Fetc%2Fssl%2Fcert.pem` with just `?ssl=true` — this uses the system CA bundle instead of a specific cert file and works on Render/Railway/etc. without any extra setup.

**Save this connection string — you'll need it in Step 3.**

<details>
<summary>⛅ Alternative: Render PostgreSQL (if you prefer)</summary>

If you'd rather use Render's built-in PostgreSQL:

1. In the Render dashboard, create a **PostgreSQL** database
2. Copy the **Internal Database URL**
3. Update `backend/requirements.txt`: replace `pymysql` with `psycopg2-binary`
4. Update `backend/database.py`: remove the `check_same_thread` SQLite check
5. Use `postgresql://...` as your `DATABASE_URL`

PlanetScale is recommended because it has a better free tier (1B rows read/month, 10M written) and no cold-start issues.
</details>

---

## Step 2: Frontend — Vercel (5 min)

Vercel is built by the Next.js team and deploys Next.js apps with zero configuration.

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"** → Import `german-tutor-chatbot`
3. Configure:
   | Setting | Value |
   |---------|-------|
   | Framework Preset | Next.js |
   | Root Directory | `.` (project root — the `vercel.json` handles the rest) |
   | Build Command | `npm run build --workspace=web` |
   | Output Directory | `web/.next` |
4. Click **"Environment Variables"** → Add:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://deutschcoach-api.onrender.com` *(you'll update this after Step 3)* |

5. Click **"Deploy"** → Wait ~2 minutes for the build
6. After deployment, note your URL: `https://deutschcoach.vercel.app` (or your custom name)

---

## Step 3: Backend — Render (10 min)

Render runs your Docker container with automatic HTTPS and health checks.

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **"New +"** → **"Web Service"** → Connect `german-tutor-chatbot`
3. Configure:
   | Setting | Value |
   |---------|-------|
   | Name | `deutschcoach-api` |
   | Root Directory | `backend` |
   | Runtime | Docker |
   | Dockerfile Path | `backend/Dockerfile` |
   | Plan | Free |
   | Health Check Path | `/health` |

4. Click **"Environment Variables"** → Add these:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *(Paste your PlanetScale connection string from Step 1)* |
   | `JWT_SECRET` | *(Click "Generate" — Render creates a random 64-char secret)* |
   | `JWT_ALGORITHM` | `HS256` |
   | `JWT_EXPIRE_MINUTES` | `1440` |
   | `CORS_ORIGIN` | `https://YOUR_APP.vercel.app` *(from Step 2)* |
   | `STRIPE_SECRET_KEY` | *(Your Stripe secret key — or leave blank to disable payments)* |
   | `STRIPE_WEBHOOK_SECRET` | *(Your Stripe webhook secret — or leave blank)* |
   | `ANTHROPIC_API_KEY` | *(Your DeepSeek/Anthropic API key)* |
   | `ANTHROPIC_BASE_URL` | `https://api.deepseek.com/anthropic` |
   | `ANTHROPIC_MODEL` | `deepseek-v4-pro[1m]` |
   | `SMTP_HOST` | *(Leave blank for now — we'll set this up in Step 4)* |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | *(Leave blank for now)* |
   | `SMTP_PASSWORD` | *(Leave blank for now)* |
   | `FROM_EMAIL` | `noreply@deutschcoach.app` |
   | `FRONTEND_URL` | `https://YOUR_APP.vercel.app` |

5. Click **"Create Web Service"** → Wait ~5 minutes for the first deploy
6. After deployment, copy your backend URL: `https://deutschcoach-api.onrender.com`
7. **Go back to Vercel** → Settings → Environment Variables → Update `NEXT_PUBLIC_API_URL` to the Render URL → **Redeploy**

<details>
<summary>ℹ️ Render free tier note</summary>

Free Render services **spin down after 15 minutes of inactivity.** The first request after idle takes ~30–60 seconds to wake up. Subsequent requests are instant. If this is a problem, upgrade to the Starter plan ($7/month) for always-on service.
</details>

---

## Step 4: Email — Resend (5 min)

Resend provides both an API and SMTP endpoint for sending emails.

1. Go to [resend.com](https://resend.com) → Sign up
2. Go to **"API Keys"** → Create a new API key → Copy it
3. Go to **"Domains"** → Add your domain (or use Resend's test domain for development)
4. Go to **"SMTP"** → Note these credentials:
   - SMTP Host: `smtp.resend.com`
   - SMTP Port: `587`
   - SMTP User: `resend`
   - SMTP Password: *(Your API key)*

5. **Go back to Render** → Environment Variables → Update:
   | Key | Value |
   |-----|-------|
   | `SMTP_HOST` | `smtp.resend.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `resend` |
   | `SMTP_PASSWORD` | *(Your Resend API key)* |

6. Render will automatically restart with the new env vars

<details>
<summary>ℹ️ Testing without a domain</summary>

Resend requires domain verification to send to real addresses. During development:
- Use `resend.dev` as your domain (included in the free tier)
- Password reset emails will work for addresses you've verified in the Resend dashboard
- Or skip this step entirely — the backend falls back to logging reset links to the console
</details>

---

## Step 5: Run Migrations

The database is empty — you need to create the tables.

### Option A: From your local machine (recommended for first deploy)

```bash
# Set the DATABASE_URL to your PlanetScale connection string
export DATABASE_URL="mysql+pymysql://user:password@aws.connect.psdb.cloud/deutschcoach?ssl_ca=/etc/ssl/cert.pem"

cd backend
alembic upgrade head

# Sync the curriculum data
python -c "
from database import SessionLocal
from app.curriculum_loader import sync_curriculum
db = SessionLocal()
sync_curriculum(db)
db.close()
"
```

### Option B: Via Render shell

1. Go to your Render web service → **Shell** tab
2. Run:
   ```bash
   cd /app/backend  # or wherever your Docker WORKDIR is
   alembic upgrade head
   python -c "from database import SessionLocal; from app.curriculum_loader import sync_curriculum; db=SessionLocal(); sync_curriculum(db); db.close()"
   ```

---

## Step 6: Verify Everything

1. **Backend health check:** `curl https://deutschcoach-api.onrender.com/health` → `{"status":"ok"}`
2. **Frontend:** Open `https://YOUR_APP.vercel.app` → Should see the login page
3. **Auth:** Create an account → Should work
4. **Curriculum:** Log in → Should see A1–C1 lessons
5. **CI/CD:** Push a commit to GitHub → GitHub Actions runs 30 tests against MySQL

---

## Environment Variables Quick Reference

| Service | Where to set | Key variables |
|---------|-------------|---------------|
| Vercel | Dashboard → Settings → Environment Variables | `NEXT_PUBLIC_API_URL` |
| Render | Dashboard → Web Service → Environment | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, SMTP vars, Stripe keys, Anthropic API key |
| PlanetScale | Connection string only | Just the `DATABASE_URL` |
| Resend | API key only | `SMTP_PASSWORD` (the API key) |

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Frontend can't reach API | `NEXT_PUBLIC_API_URL` is wrong | Update in Vercel env vars, redeploy |
| 500 errors from backend | `JWT_SECRET` not set | Add to Render env vars, restart |
| CORS errors in browser | `CORS_ORIGIN` doesn't match frontend URL | Update in Render env vars |
| 500 on curriculum endpoints | Curriculum not synced | Run Step 5 |
| Password reset "email sent" but nothing arrives | SMTP not configured | Complete Step 4 |
| First request slow (30-60s) | Render free tier cold start | Wait, or upgrade to $7/mo starter |
| 404 on lesson detail | Migrations not run against production DB | Run Step 5 |
