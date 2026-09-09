export type Category = {
  id: number;
  name: string;
  icon: string;
};

export type Expense = {
  id: number;
  date: string;
  description: string;
  amount: string | number;
  payment_method: string;
  paid_by: string;
  category: string;
  category_icon: string;
};

export type FixedExpense = {
  id: number;
  section: "Needs" | "Wants" | "Other / Recurring";
  budget_amount: string | number;
  category: string;
  category_icon: string;
  checked: boolean;
  actual_amount: string | number;
};

export type Session = {
  name: string;
  role: "primary" | "partner";
};
