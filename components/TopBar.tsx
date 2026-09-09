"use client";

import { useRouter } from "next/navigation";
import { monthLabel } from "@/lib/format";
import type { Session } from "@/lib/types";

export default function TopBar({
  session,
  year,
  month,
  onPrevMonth,
  onNextMonth
}: {
  session: Session | null;
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="bg-harbor text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Our Expenses</h1>
        <div className="flex items-center gap-3 text-sm">
          {session && <span className="opacity-90">{session.name}</span>}
          <button onClick={handleLogout} className="underline opacity-90 hover:opacity-100">
            Log out
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-3 flex items-center justify-center gap-4">
        <button
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
        >
          ‹
        </button>
        <span className="font-medium">{monthLabel(year, month)}</span>
        <button
          onClick={onNextMonth}
          aria-label="Next month"
          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
        >
          ›
        </button>
      </div>
    </div>
  );
}
