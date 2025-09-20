"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TopMenu from "@/components/home/TopMenu";
import KPIs from "@/components/home/KPIs";
import { Button } from "@/components/ui/button";

// Example data – replace with API later
const kpiData = {
  invoice: { d1: 0, d7: 23610, d30: 23610, delta: -12.2, taxes: 5000 },
  purchase: { d1: 0, d7: 17857, d30: 17857, delta: -8.33, taxes: 2400 },
  payment: { d1: 0, d7: 5752, d30: 5752, delta: -80.0, taxes: 1300 },
};

// Simple client-side guard. For production, move auth to httpOnly cookies & middleware.
function useAuthGuard() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) router.replace("/login");
  }, [router]);
}

export default function Dashboard() {
  useAuthGuard();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("remember");
    window.location.href = "/login";
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Log out</Button>
      </div>

      <TopMenu />
      <KPIs
        title="Dashboard"
        groups={[
          { label: "Total Invoice", ...kpiData.invoice },
          { label: "Total Purchase", ...kpiData.purchase },
          { label: "Total Payment", ...kpiData.payment },
        ]}
      />
    </div>
  );
}
