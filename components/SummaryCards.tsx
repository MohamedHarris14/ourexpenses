"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import type { Session } from "@/lib/types";

export default function SummaryCards({
  session,
  year,
  month,
  income,
  totalSpent,
  daysElapsed,
  onIncomeUpdated
}: {
  session: Session | null;
  year: number;
  month: number;
  income: number;
  totalSpent: number;
  daysElapsed: number;
  onIncomeUpdated: (newIncome: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(income));
  const [saving, setSaving] = useState(false);

  const remaining = income - totalSpent;
  const avgPerDay = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

  async function saveIncome() {
    const value = parseFloat(draft);
    if (Number.isNaN(value) || value < 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/income", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, amount: value })
      });
      if (res.ok) {
        onIncomeUpdated(value);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="card">
        <p className="text-xs text-gray-500">Monthly Income</p>
        {editing ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <button
              onClick={saveIncome}
              disabled={saving}
              className="text-xs bg-harbor text-white rounded px-2 py-1"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setDraft(String(income));
              }}
              className="text-xs text-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <p className="text-2xl font-semibold mt-1">
              {income > 0 ? formatINR(income) : "—"}
            </p>
            {session?.role === "primary" && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-harbor underline mt-1"
              >
                Edit Income
              </button>
            )}
          </>
        )}
      </div>

      <div className="card">
        <p className="text-xs text-gray-500">Total Spent</p>
        <p className="text-2xl font-semibold mt-1">{formatINR(totalSpent)}</p>
      </div>

      <div className="card">
        <p className="text-xs text-gray-500">Remaining</p>
        <p
          className={`text-2xl font-semibold mt-1 ${
            income > 0 && remaining < 0 ? "text-red-600" : ""
          }`}
        >
          {income > 0 ? formatINR(remaining) : "—"}
        </p>
      </div>

      <div className="card sm:col-span-3">
        <p className="text-xs text-gray-500">Average Expense / Day</p>
        <p className="text-2xl font-semibold mt-1">{formatINR(avgPerDay)}</p>
      </div>
    </div>
  );
}
