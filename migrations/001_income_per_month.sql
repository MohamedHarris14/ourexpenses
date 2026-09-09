-- Migration: make income per-month instead of a single global row.
-- Run this ONCE against your existing database (it's already live, so don't
-- re-run schema.sql's CREATE TABLE for income — use this instead).

ALTER TABLE income ADD COLUMN IF NOT EXISTS year INT;
ALTER TABLE income ADD COLUMN IF NOT EXISTS month INT;

-- Assign whatever income you'd already saved to the current month, so you
-- don't lose the value you entered. Adjust year/month below if you'd rather
-- it apply to a different month.
UPDATE income
SET year = EXTRACT(YEAR FROM NOW())::INT,
    month = EXTRACT(MONTH FROM NOW())::INT
WHERE year IS NULL;

ALTER TABLE income ALTER COLUMN year SET NOT NULL;
ALTER TABLE income ALTER COLUMN month SET NOT NULL;

-- Add the uniqueness constraint the app relies on (safe to run once)
ALTER TABLE income ADD CONSTRAINT income_year_month_unique UNIQUE (year, month);
