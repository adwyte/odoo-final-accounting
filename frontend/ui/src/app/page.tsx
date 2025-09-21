// src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      {/* FULL-BLEED, FULL-SCREEN HERO */}
      <section
        className="
          relative min-h-screen flex items-center justify-center
          w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
        "
      >
        {/* background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/auth-bg.png"
            alt="Shiv Accounts Cloud backdrop"
            fill
            priority
            sizes="100vw"
            className="object-cover scale-105 blur-[2px] md:blur-sm"
          />
          {/* dim + vignette */}
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
        </div>

        {/* hero content */}
        <div className="px-6 text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow">
            Welcome to Shiv Accounts Cloud
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/85">
            Manage your accounts with ease — orders, invoices & real-time reports.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/80 backdrop-blur text-slate-900 hover:bg-white"
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* optional content below hero */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {/* add feature cards/links here if you want */}
      </section>
    </main>
  );
}
