// src/app/page.tsx
import Link from "next/link";

export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Shiv Accounts Cloud</h1>
      <p className="text-slate-600 mt-2">Orders, Invoices & Real-Time Reports</p>

      <div className="mt-6 flex gap-4">
        <Link href="/login" className="underline">Log in</Link>
        <Link href="/signup" className="underline">Sign up</Link>
      </div>
    </main>
  );
}
