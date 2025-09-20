"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Each KPI row can optionally include `taxes`. Fields are optional to avoid runtime crashes
export type KPI = {
  label: string;
  d1?: number; // last 24 hours
  d7?: number; // last 7 days
  d30?: number; // last 30 days
  taxes?: number; // total taxes for the row's context
  delta?: number; // percent vs prior period (negative = down)
};

function inr(n?: number | null) {
  if (typeof n !== "number" || !isFinite(n)) return "—"; // safe fallback
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export default function KPIs({ title, groups }: { title: string; groups: KPI[] }) {
  return (
    <Card className="rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {groups.map((g, idx) => {
          const hasTaxes = typeof g.taxes === "number" && isFinite(g.taxes);
          return (
            <div
              key={g.label}
              className={cn(
                hasTaxes
                  ? "grid grid-cols-1 gap-4 md:grid-cols-4"
                  : "grid grid-cols-1 gap-4 md:grid-cols-3",
                idx !== groups.length - 1 && "pb-6 border-b"
              )}
            >
              <KpiCell heading={g.label} sub="Last 24 hours" value={g.d1} delta={g.delta} showDelta />
              <KpiCell heading="" sub="Last 7 Days" value={g.d7} />
              <KpiCell heading="" sub="Last 30 Days" value={g.d30} />
              {hasTaxes && <KpiCell heading="" sub="Total Taxes" value={g.taxes} />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function KpiCell({
  heading,
  sub,
  value,
  delta,
  showDelta = false,
}: {
  heading?: string;
  sub: string;
  value?: number | null;
  delta?: number;
  showDelta?: boolean;
}) {
  const negative = (delta ?? 0) < 0;

  return (
    <div className="rounded-xl border p-5 bg-gradient-to-b from-white to-muted/40">
      {heading ? (
        <div className="text-xs font-medium text-muted-foreground mb-2">{heading.toUpperCase()}</div>
      ) : null}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight">{inr(value)}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>

        {showDelta && typeof delta === "number" && (
          <Badge
            variant={negative ? "outline" : "default"}
            className={cn(
              "text-xs",
              negative ? "border-red-300 text-red-700 bg-red-50" : "bg-emerald-600 hover:bg-emerald-600"
            )}
            title="Change vs previous period"
          >
            {negative ? `${delta}%` : `+${delta}%`}
          </Badge>
        )}
      </div>
    </div>
  );
}
