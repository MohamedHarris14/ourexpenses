"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import SummaryCards from "@/components/SummaryCards";
import AddExpenseForm from "@/components/AddExpenseForm";
import FixedExpenses from "@/components/FixedExpenses";
import BudgetSummary from "@/components/BudgetSummary";
import EntriesTable from "@/components/EntriesTable";
import type { Category, Expense, FixedExpense, Session } from "@/lib/types";

function currentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [{ year, month }, setPeriod] = useState(currentYearMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  const monthParam = `${year}-${String(month).padStart(2, "0")}`;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionRes, catRes, expRes, fixedRes, incomeRes] = await Promise.all([
        fetch("/api/auth/session"),
        fetch("/api/categories"),
        fetch(`/api/expenses?month=${monthParam}`),
        fetch(`/api/fixed-expenses?year=${year}&month=${month}`),
        fetch(`/api/income?year=${year}&month=${month}`)
      ]);

      if (sessionRes.ok) setSession(await sessionRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (fixedRes.ok) setFixedExpenses(await fixedRes.json());
      if (incomeRes.ok) {
        const data = await incomeRes.json();
        setIncome(Number(data.amount) || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [monthParam, year, month]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleDelete(id: number) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    loadAll();
  }

  function goToPrevMonth() {
    setPeriod((p) => (p.month === 1 ? { year: p.year - 1, month: 12 } : { year: p.year, month: p.month - 1 }));
  }
  function goToNextMonth() {
    setPeriod((p) => (p.month === 12 ? { year: p.year + 1, month: 1 } : { year: p.year, month: p.month + 1 }));
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const daysElapsed = isCurrentMonth
    ? now.getDate()
    : new Date(year, month, 0).getDate(); // full days in a past month

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-12">
      <TopBar
        session={session}
        year={year}
        month={month}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        <SummaryCards
          session={session}
          year={year}
          month={month}
          income={income}
          totalSpent={totalSpent}
          daysElapsed={daysElapsed}
          onIncomeUpdated={setIncome}
        />

        {loading ? (
          <p className="text-center text-sm text-gray-400 py-10">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AddExpenseForm categories={categories} onAdded={loadAll} />
              <div className="space-y-6">
                <FixedExpenses
                  items={fixedExpenses}
                  year={year}
                  month={month}
                  onChanged={loadAll}
                />
                <BudgetSummary items={fixedExpenses} />
              </div>
            </div>

            <EntriesTable
              expenses={expenses}
              categories={categories}
              year={year}
              month={month}
              onDelete={handleDelete}
              session={session}
            />
          </>
        )}
      </div>
    </div>
  );
}
