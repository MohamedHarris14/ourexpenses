"use client";

import { useMemo, useState } from "react";
import { formatINR, monthLabel } from "@/lib/format";
import type { Category, Expense, Session } from "@/lib/types";


export default function EntriesTable({
  expenses,
  categories,
  year,
  month,
  onDelete,
  session
}: {
  expenses: Expense[];
  categories: Category[];
  year: number;
  month: number;
  onDelete: (id: number) => void;
  session: Session | null;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [paidBy, setPaidBy] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [date, setDate] = useState("");

  const paidByOptions = useMemo(
    () => Array.from(new Set(expenses.map((e) => e.paid_by))),
    [expenses]
  );
  const paymentMethodOptions = useMemo(
    () => Array.from(new Set(expenses.map((e) => e.payment_method))),
    [expenses]
  );

  const filtered = expenses.filter((e) => {
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all" && e.category !== category) return false;
    if (paidBy !== "all" && e.paid_by !== paidBy) return false;
    if (paymentMethod !== "all" && e.payment_method !== paymentMethod) return false;
    if (date && e.date !== date) return false;
    return true;
  });

  function exportCSV() {
    const header = ["Date", "Description", "Category", "Amount", "Payment Method", "Paid By"];
    const rows = filtered.map((e) => [
      e.date,
      e.description,
      e.category,
      String(e.amount),
      e.payment_method,
      e.paid_by
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-harbor">
          Entries — {monthLabel(year, month)}
        </h2>
        <button onClick={exportCSV} className="text-xs text-harbor underline">
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Search description"
          className="border border-gray-300 rounded px-2 py-1 text-xs flex-1 min-w-[140px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-2 py-1 text-xs"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-xs"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          <option value="all">Everyone</option>
          {paidByOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-xs"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="all">All payment methods</option>
          {paymentMethodOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No expenses recorded for this month.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2">Category</th>
                <th className="py-2 pr-2">Payment</th>
                <th className="py-2 pr-2">Paid By</th>
                <th className="py-2 pr-2 text-right">Amount</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-2">{e.description || "—"}</td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {e.category_icon} {e.category}
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap">{e.payment_method}</td>
                  <td className="py-2 pr-2 whitespace-nowrap">{e.paid_by}</td>
                  <td className="py-2 pr-2 text-right whitespace-nowrap">{formatINR(e.amount)}</td>
                 <td className="py-2 text-right">
                      {session?.role === "primary" && (
                        <button
                          onClick={() => onDelete(e.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                        Delete
                        </button>
                      )}
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
