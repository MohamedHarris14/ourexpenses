import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Expenses",
  description: "Household income and expense tracker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
