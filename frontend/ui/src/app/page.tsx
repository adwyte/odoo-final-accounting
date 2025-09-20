export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl w-full">
        {[
          { href: "/masters/contacts", label: "Contact Master" },
          { href: "/masters/products", label: "Product Master" },
          { href: "/masters/taxes", label: "Taxes Master" },
          { href: "/masters/chart-of-accounts", label: "Chart of Accounts" },
        ].map((i) => (
          <a key={i.href} href={i.href} className="rounded-xl border p-6 hover:bg-neutral-50">
            <div className="text-lg font-semibold">{i.label}</div>
            <div className="text-sm text-neutral-500">Open</div>
          </a>
        ))}
      </div>
    </main>
  );
}
