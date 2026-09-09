"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import type { FixedExpense } from "@/lib/types";

const SECTIONS: FixedExpense["section"][] = ["Needs", "Wants", "Other / Recurring"];

export default function FixedExpenses({
  items,
  year,
  month,
  onChanged
}: {
  items: FixedExpense[];
  year: number;
  month: number;
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  async function patch(id: number, body: Record<string, unknown>) {
    await fetch(`/api/fixed-expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, ...body })
    });
    onChanged();
  }

  function startEditing(item: FixedExpense) {
    setEditingId(item.id);
    setDraft(String(item.actual_amount));
  }

  async function saveActualAmount(item: FixedExpense) {
    const value = parseFloat(draft);
    if (Number.isNaN(value) || value < 0) return;
    await patch(item.id, { actualAmount: value, checked: value > 0 ? true : item.checked });
    setEditingId(null);
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-harbor mb-3">Fixed Expenses</h2>
      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const sectionItems = items.filter((i) => i.section === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section}>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{section}</p>
              <ul className="divide-y divide-gray-100">
                {sectionItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => patch(item.id, { checked: e.target.checked })}
                      className="w-4 h-4 accent-harbor"
                    />
                    <span className="text-sm flex-1">
                      {item.category_icon} {item.category}
                    </span>
                    {editingId === item.id ? (
                      <span className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          className="w-20 border border-gray-300 rounded px-1 py-0.5"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => saveActualAmount(item)}
                          className="text-harbor font-medium"
                        >
                          ✓
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => startEditing(item)}
                        className="text-xs text-gray-500 hover:text-harbor"
                      >
                        {formatINR(item.actual_amount)} / {formatINR(item.budget_amount)}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
