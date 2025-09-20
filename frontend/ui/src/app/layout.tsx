// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // keep if you have it
import Navbar from "@/components/nav/Navbar";

export const metadata: Metadata = {
  title: "Shiv Accounts Cloud",
  description: "Orders, Invoices & Real-Time Reports",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
