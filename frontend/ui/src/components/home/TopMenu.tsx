import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "Purchase",
    items: [
      { label: "Purchase Order", href: "/purchase/orders" },
      { label: "Purchase Bill", href: "/purchase/bills" },
      { label: "Payment", href: "/purchase/payments" },
    ],
  },
  {
    title: "Sale",
    items: [
      { label: "Sale Order", href: "/sales/orders" },
      { label: "Sale Invoice", href: "/sales/invoices" },
      { label: "Receipt", href: "/sales/receipts" },
    ],
  },
  {
    title: "Report",
    items: [
      { label: "Profit & Loss", href: "/reports/pnl" },
      { label: "Balance Sheet", href: "/reports/balance-sheet" },
      { label: "Stock Statement", href: "/reports/stock" },
    ],
  },
];

export default function TopMenu() {
  return (
    <Card className="rounded-2xl border-2">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {sections.map((sec, i) => (
            <div key={sec.title} className="p-6">
              <h3 className="text-2xl font-semibold tracking-tight">
                {sec.title}
                <span className="ml-2 align-middle text-xs font-normal text-muted-foreground">
                  (Open on click)
                </span>
              </h3>

              <Separator className="my-4" />

              <ul className="space-y-2">
                {sec.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:shadow-sm hover:bg-muted transition-colors"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* subtle column dividers on md+ */}
          <div className="hidden md:block absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-3 h-full">
              <div className="border-r"></div>
              <div className="border-r"></div>
              <div></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
