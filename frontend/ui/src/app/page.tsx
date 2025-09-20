// src/app/page.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiles = [
  {
    href: "/masters/contacts",
    title: "Contact Master",
    blurb: "Customers, Vendors & Addresses",
  },
  {
    href: "/masters/products",
    title: "Product Master",
    blurb: "Goods/Services, HSN/SAC, Pricing & Tax",
  },
  {
    href: "/masters/taxes",
    title: "Taxes Master",
    blurb: "GST %, Fixed Value, Sales/Purchase",
  },
  {
    href: "/masters/chart-of-accounts",
    title: "Chart of Accounts",
    blurb: "Assets, Liabilities, Income, Expenses, Equity",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Shiv Accounts Cloud</h1>
        <p className="text-neutral-600">
          Start by managing your Master Data, or jump to login/sign up from the navbar.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <CardTitle>{t.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-600">{t.blurb}</CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
