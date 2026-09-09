"use client";

import { formatINR } from "@/lib/format";
import type { FixedExpense } from "@/lib/types";

const SECTIONS: FixedExpense["section"][] = ["Needs", "Wants", "Other / Recurring"];

const BAR_COLORS: Record<string, string> = {
  Needs: "#5782BB", // harbor
  Wants: "#64D7D6", // seafoam
  "Other / Recurring": "#C4AFF0" // lilac
};

export default function BudgetSummary({ items }: { items: FixedExpense[] }) {
  const totals = SECTIONS.map((section) => {
    const sectionItems = items.filter((i) => i.section === section);
    const budget = sectionItems.reduce((sum, i) => sum + Number(i.budget_amount), 0);
    const actual = sectionItems.reduce((sum, i) => sum + Number(i.actual_amount), 0);
    const pct = budget > 0 ? Math.round((actual / budget) * 100) : 0;
    return { section, budget, actual, pct };
  });

  const totalBudget = totals.reduce((s, t) => s + t.budget, 0);
  const totalActual = totals.reduce((s, t) => s + t.actual, 0);
  const buffer = totalBudget - totalActual;

  return (
    <div className="card">
      <h2 className="font-semibold text-harbor mb-3">Monthly Budget Summary</h2>
      <ul className="space-y-3 text-sm">
        {totals.map((t) => (
          <li key={t.section}>
            <div className="flex justify-between mb-1">
              <span>{t.section}</span>
              <span>
                {formatINR(t.budget)} ({t.pct}%)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(t.pct, 100)}%`,
                  backgroundColor: t.pct > 100 ? "#DC2626" : BAR_COLORS[t.section]
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Total budget</span>
          <span>{formatINR(totalBudget)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Buffer</span>
          <span className={buffer < 0 ? "text-red-600" : ""}>{formatINR(buffer)}</span>
        </div>
        <div className="flex justify-between text-harbor font-medium">
          <span>Actual spend this month</span>
          <span>{formatINR(totalActual)}</span>
        </div>
      </div>
    </div>
  );
}
