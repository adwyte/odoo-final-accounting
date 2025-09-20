"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // if you don’t have this helper, see note below

const links = [
  { href: "/", label: "Home" },
  { href: "/masters/contacts", label: "Contacts" },
  { href: "/masters/products", label: "Products" },
  { href: "/masters/taxes", label: "Taxes" },
  { href: "/masters/chart-of-accounts", label: "Chart of Accounts" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Shiv Accounts Cloud
        </Link>

        <nav className="hidden gap-4 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm px-2 py-1 rounded-md hover:bg-neutral-100 transition-colors",
                pathname === l.href ? "bg-neutral-100 font-medium" : "text-neutral-700"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>

      {/* Mobile row for master links */}
      <div className="md:hidden border-t">
        <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap gap-2">
          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-xs px-2 py-1 rounded-md bg-neutral-50 border hover:bg-neutral-100",
                pathname === l.href && "bg-neutral-100"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
