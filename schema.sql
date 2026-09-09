-- Our Expenses — database schema
-- Run this once against your Postgres database (Vercel Postgres / Neon).

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL DEFAULT '💰'
);

CREATE TABLE IF NOT EXISTS fixed_expenses (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('Needs', 'Wants', 'Other / Recurring')),
  budget_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);

-- Per-month status of each fixed expense (checked off + actual amount paid)
CREATE TABLE IF NOT EXISTS fixed_expense_status (
  id SERIAL PRIMARY KEY,
  fixed_expense_id INT NOT NULL REFERENCES fixed_expenses(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL, -- 1-12
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  actual_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  UNIQUE (fixed_expense_id, year, month)
);

CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL, -- 1-12
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (year, month)
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id INT NOT NULL REFERENCES categories(id),
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  paid_by TEXT NOT NULL, -- display name of whoever was logged in
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
CREATE INDEX IF NOT EXISTS idx_fixed_status_period ON fixed_expense_status (year, month);

-- Seed categories (icons are simple emoji so no icon library is required)
INSERT INTO categories (name, icon) VALUES
  ('Home', '🏠'),
  ('Loan', '🏦'),
  ('Rent', '🔑'),
  ('EB', '⚡'),
  ('Grocery', '🛒'),
  ('Baby', '🍼'),
  ('Savings', '💰'),
  ('Entertainment', '🎬'),
  ('Eating Out', '🍽️'),
  ('Petrol', '⛽'),
  ('Mobile', '📱'),
  ('Insurance', '🛡️'),
  ('WiFi', '📶'),
  ('Other', '❓')
ON CONFLICT (name) DO NOTHING;

-- Seed fixed expenses / monthly budget plan
INSERT INTO fixed_expenses (category_id, section, budget_amount, sort_order)
SELECT c.id, v.section, v.budget_amount, v.sort_order
FROM (VALUES
  ('Home', 'Needs', 18000.00, 1),
  ('Loan', 'Needs', 18000.00, 2),
  ('Rent', 'Needs', 12000.00, 3),
  ('EB', 'Needs', 2000.00, 4),
  ('Grocery', 'Needs', 10000.00, 5),
  ('Baby', 'Needs', 3000.00, 6),
  ('Savings', 'Needs', 0.00, 7),
  ('Entertainment', 'Wants', 1000.00, 8),
  ('Eating Out', 'Wants', 2000.00, 9),
  ('Petrol', 'Other / Recurring', 1000.00, 10),
  ('Mobile', 'Other / Recurring', 800.00, 11),
  ('Insurance', 'Other / Recurring', 1111.11, 12),
  ('WiFi', 'Other / Recurring', 966.67, 13),
  ('Other', 'Other / Recurring', 0.00, 14)
) AS v(category_name, section, budget_amount, sort_order)
JOIN categories c ON c.name = v.category_name
ON CONFLICT DO NOTHING;

-- Seed a starting income row for the current month (edit the amount from the app afterwards)
INSERT INTO income (year, month, amount)
SELECT EXTRACT(YEAR FROM NOW())::INT, EXTRACT(MONTH FROM NOW())::INT, 0
WHERE NOT EXISTS (
  SELECT 1 FROM income
  WHERE year = EXTRACT(YEAR FROM NOW())::INT AND month = EXTRACT(MONTH FROM NOW())::INT
);
