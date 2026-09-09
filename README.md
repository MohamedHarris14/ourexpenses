# Our Expenses

A household income & expense tracker built with Next.js (App Router) and Postgres, designed to deploy to Vercel with GitHub for source control.

## Features

- Login for two accounts — a "primary" account that can edit income, and a "partner" account that can add expenses only. Every expense is tagged with whoever is logged in.
- Dashboard: monthly income, total spent, remaining balance, average expense/day.
- Add-expense form with date, description, category, amount, and payment method.
- Fixed Expenses checklist grouped into Needs / Wants / Other-Recurring, with a monthly checkbox and editable actual amount per item.
- Monthly Budget Summary comparing budgeted vs. actual spend.
- Entries table for the selected month with search, category/payer/payment-method filters, date range, and CSV export.
- Month switcher (‹ / ›) so past months stay visible.

## 1. Create the database

Use **Vercel Postgres** or **Neon** (Neon is what Vercel Postgres runs on under the hood).

1. In your Vercel project, go to **Storage → Create Database → Postgres** (or connect an existing Neon database).
2. Vercel automatically adds a `POSTGRES_URL` environment variable to your project once connected.
3. Run the schema once against that database. Easiest way: open the database's built-in SQL query editor in the Vercel/Neon dashboard, paste the contents of `schema.sql`, and run it. Alternatively, from your machine with `psql`:

   ```bash
   psql "$POSTGRES_URL" -f schema.sql
   ```

   This creates all tables and seeds:
   - The category list (Home, Loan, Rent, EB, Grocery, Baby, Savings, Entertainment, Eating Out, Petrol, Mobile, Insurance, WiFi, Other).
   - The fixed-expense budget plan (₹18,000 Home, ₹18,000 Loan, ₹12,000 Rent, ₹2,000 EB, ₹10,000 Grocery, ₹3,000 Baby, ₹1,000 Entertainment, ₹2,000 Eating Out, ₹1,000 Petrol, ₹800 Mobile, ₹1,111.11 Insurance, ₹966.67 WiFi).
   - A starting income row of ₹0 (edit it from the app after logging in).

   Re-running `schema.sql` is safe — every insert uses `ON CONFLICT DO NOTHING`.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` for local development, and add the same variables in **Vercel → Project → Settings → Environment Variables** for production:

| Variable | Purpose |
|---|---|
| `POSTGRES_URL` / `DATABASE_URL` | Connection string (set automatically if you used Vercel's Postgres integration) |
| `SESSION_SECRET` | Long random string used to sign login cookies — generate with `openssl rand -base64 32` |
| `PRIMARY_USERNAME` / `PRIMARY_PASSWORD` / `PRIMARY_NAME` | Your login |
| `PARTNER_USERNAME` / `PARTNER_PASSWORD` / `PARTNER_NAME` | Your wife's login |

There's no user table to seed — the two accounts are defined entirely by these environment variables, so you can change passwords any time from the Vercel dashboard without touching the database.

## 3. Push to GitHub

```bash
cd our-expenses
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/our-expenses.git
git push -u origin main
```

## 4. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Add the environment variables from step 2 (skip `POSTGRES_URL` if you connect Postgres storage in the next step — Vercel will add it for you).
3. If you haven't already, connect a Postgres/Neon database from the project's **Storage** tab — this auto-populates `POSTGRES_URL` and redeploys.
4. Deploy. Visit the deployment URL, log in with either account, and start adding expenses.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, SESSION_SECRET, and the two logins
psql "$DATABASE_URL" -f schema.sql
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`.

## Project structure

```
app/
  login/              Login page
  dashboard/          Main app UI (client component)
  api/
    auth/             login, logout, session
    income/           get/update the single income row
    expenses/         list/create/delete expenses
    fixed-expenses/   list + per-month checklist status
    categories/       category list
components/           UI building blocks used by the dashboard
lib/
  db.ts               Postgres connection pool
  auth.ts             Cookie session signing/verification, env-based login check
  types.ts, format.ts Shared types and currency/date formatting
schema.sql            Table definitions + seed data
middleware.ts         Redirects unauthenticated requests to /login
```

## Adjusting the budget plan later

The fixed-expense budget amounts and categories live in the `categories` and `fixed_expenses` tables. Update them directly with SQL (e.g. via the Vercel/Neon SQL editor) if your monthly plan changes — the app reads them live, so no redeploy is needed:

```sql
UPDATE fixed_expenses
SET budget_amount = 15000
WHERE category_id = (SELECT id FROM categories WHERE name = 'Rent');
```
