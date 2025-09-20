"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function MasterFrame({
  title, toolbar, children,
}: { title: string; toolbar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <Card className="rounded-[28px] border-2 border-neutral-200">
          <div className="border-b-2 border-neutral-200 px-4 sm:px-6 py-3">
            <h1 className="text-center text-2xl font-semibold">{title}</h1>
          </div>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap gap-2">{toolbar}</div>
            <div className="h-2" />
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ToolbarButton(props: React.ComponentProps<typeof Button>) {
  return <Button variant="outline" size="sm" {...props} />;
}

export function UnderlineField({
  id, label, children,
}: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 items-center">
      <Label htmlFor={id} className="text-base text-neutral-800">{label}</Label>
      <div className="relative">
        {children}
        <div className="absolute left-0 right-0 -bottom-1 h-[2px] bg-neutral-300" />
      </div>
    </div>
  );
}

export function UnderlineInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className="border-0 bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
    />
  );
}

export function Section({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

export function SimpleTable({
  columns, rows, onRowClick,
}: {
  columns: { key: string; title: string; className?: string }[];
  rows: any[];
  onRowClick?: (row: any) => void;
}) {
  return (
    <div className="rounded-xl border">
      <table className="w-full text-left">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-3 py-2 text-sm font-medium text-neutral-700 ${c.className || ""}`}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t hover:bg-neutral-50 cursor-pointer" onClick={() => onRowClick?.(r)}>
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 text-sm ${c.className || ""}`}>{String(r[c.key] ?? "")}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-sm text-neutral-500" colSpan={columns.length}>No records.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
