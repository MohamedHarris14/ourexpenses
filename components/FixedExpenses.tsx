"use client";

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
  async function toggleChecked(id: number, checked: boolean) {
    await fetch(`/api/fixed-expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, checked })
    });
    onChanged();
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
                      onChange={(e) => toggleChecked(item.id, e.target.checked)}
                      className="w-4 h-4 accent-harbor"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        item.checked ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.category_icon} {item.category}
                    </span>
                    <span
                      className={`text-xs ${
                        item.checked ? "line-through text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatINR(item.actual_amount)} / {formatINR(item.budget_amount)}
                    </span>
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
