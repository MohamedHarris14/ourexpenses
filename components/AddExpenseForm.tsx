"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";

const PAYMENT_METHODS = ["Cash", "Debit Card", "Credit Card", "UPI", "Net Banking"];

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export default function AddExpenseForm({
  categories,
  onAdded
}: {
  categories: Category[];
  onAdded: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (!categoryId || Number.isNaN(amountNum) || amountNum <= 0 || !paymentMethod) {
      setError("Please fill in amount, category and payment method.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          description,
          categoryId,
          amount: amountNum,
          paymentMethod
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not add expense");
        return;
      }
      setDescription("");
      setAmount("");
      setPaymentMethod("");
      onAdded();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h2 className="font-semibold text-harbor">Add an expense</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <input
          type="text"
          placeholder="e.g., Big Bazaar groceries"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Payment method *</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
        >
          <option value="">Select payment method</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-gray-800 text-white rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Adding…" : "Add entry"}
      </button>
    </form>
  );
}
