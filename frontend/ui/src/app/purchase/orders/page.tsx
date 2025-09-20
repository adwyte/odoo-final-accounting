"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ------- Mock master data (replace with API calls later) -------
const VENDORS = [
  { id: "v1", name: "Azure Interior" },
  { id: "v2", name: "Wood Kart" },
];
const PRODUCTS = [
  { id: "p1", name: "Table", defaultPrice: 2300 },
  { id: "p2", name: "Chair", defaultPrice: 850 },
  { id: "p3", name: "Office Sofa", defaultPrice: 12500 },
];
const TAXES = [
  { id: "t0", name: "0%", rate: 0 },
  { id: "t5", name: "GST 5%", rate: 5 },
  { id: "t10", name: "GST 10%", rate: 10 },
];

// ------- Validation -------
const lineSchema = z.object({
  productId: z.string().min(1, "Pick a product"),
  qty: z.coerce.number().min(1, "≥ 1"),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0),
});
const formSchema = z.object({
  poNo: z.string(), // auto-generated; still keep it here
  poDate: z.string().min(1, "Date required"),
  vendorId: z.string().min(1, "Select a vendor"),
  reference: z.string().optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
});
type FormValues = z.infer<typeof formSchema>;

// ------- Helpers -------
const money = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function computeLine(line: z.infer<typeof lineSchema>) {
  const untaxed = line.qty * line.unitPrice;
  const taxAmt = (untaxed * line.taxRate) / 100;
  const total = untaxed + taxAmt;
  return { untaxed, taxAmt, total };
}

// ===============================================================
export default function PurchaseOrderPage() {
  // In a real app: fetch last PO and generate next number.
  const nextPo = React.useMemo(() => "PO0001", []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poNo: nextPo,
      poDate: new Date().toISOString().slice(0, 10),
      vendorId: "",
      reference: "",
      lines: [
        { productId: "", qty: 1, unitPrice: 0, taxRate: 5 },
      ],
    },
    mode: "onBlur",
  });

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "lines" });
  const watchLines = form.watch("lines");

  const totals = React.useMemo(() => {
    return watchLines.reduce(
      (acc, l) => {
        const c = computeLine(l);
        acc.untaxed += c.untaxed;
        acc.tax += c.taxAmt;
        acc.total += c.total;
        return acc;
      },
      { untaxed: 0, tax: 0, total: 0 }
    );
  }, [watchLines]);

  const [status, setStatus] = React.useState<"draft" | "confirmed" | "cancelled">("draft");

  const onSubmit = (vals: FormValues) => {
    // integrate with backend here
    console.log("PO SUBMIT", { ...vals, totals });
    setStatus("confirmed");
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Purchase Order</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
          <Button variant="outline" onClick={() => alert("Sent to vendor (stub)")}>Send</Button>
          <Button variant="outline" onClick={() => setStatus("cancelled")}>Cancel</Button>
          <Button disabled={status !== "confirmed"} onClick={() => alert("Create Vendor Bill (stub)")}>
            Create Bill
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Row 1: PO No / PO Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="poNo">PO No.</Label>
                <Input id="poNo" readOnly {...form.register("poNo")} />
                <p className="text-[11px] text-muted-foreground mt-1">
                  auto generate (last PO + 1)
                </p>
              </div>
              <div>
                <Label htmlFor="poDate">PO Date</Label>
                <Input id="poDate" type="date" {...form.register("poDate")} />
                {form.formState.errors.poDate && (
                  <p className="text-xs text-red-500">{form.formState.errors.poDate.message}</p>
                )}
              </div>
            </div>

            {/* Row 2: Vendor / Reference */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Vendor Name</Label>
                <Select
                  value={form.watch("vendorId")}
                  onValueChange={(v) => form.setValue("vendorId", v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDORS.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.vendorId && (
                  <p className="text-xs text-red-500">{form.formState.errors.vendorId.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input id="reference" placeholder="REQ-25-0001" {...form.register("reference")} />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Lines Table */}
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                    <th className="w-12">Sr.</th>
                    <th>Product</th>
                    <th className="w-24 text-right">Qty</th>
                    <th className="w-28 text-right">Unit Price</th>
                    <th className="w-28 text-right">Untaxed</th>
                    <th className="w-24 text-right">Tax</th>
                    <th className="w-28 text-right">Tax Amt</th>
                    <th className="w-28 text-right">Total</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, idx) => {
                    const lineVals = watchLines[idx];
                    const c = computeLine(lineVals);
                    return (
                      <tr key={f.id} className="border-t align-middle [&>td]:px-3 [&>td]:py-2">
                        <td>{idx + 1}</td>

                        <td className="min-w-[220px]">
                          <Select
                            value={lineVals.productId}
                            onValueChange={(v) => {
                              const p = PRODUCTS.find((x) => x.id === v);
                              update(idx, {
                                ...lineVals,
                                productId: v,
                                unitPrice: p ? p.defaultPrice : lineVals.unitPrice,
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCTS.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="text-right">
                          <Input
                            type="number"
                            min={1}
                            value={lineVals.qty}
                            onChange={(e) => update(idx, { ...lineVals, qty: +e.target.value })}
                            className="text-right"
                          />
                        </td>

                        <td className="text-right">
                          <Input
                            type="number"
                            min={0}
                            value={lineVals.unitPrice}
                            onChange={(e) => update(idx, { ...lineVals, unitPrice: +e.target.value })}
                            className="text-right"
                          />
                        </td>

                        <td className="text-right font-medium">{money(c.untaxed)}</td>

                        <td className="text-right">
                          <Select
                            value={String(lineVals.taxRate)}
                            onValueChange={(v) => update(idx, { ...lineVals, taxRate: +v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TAXES.map(t => (
                                <SelectItem key={t.id} value={String(t.rate)}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="text-right">{money(c.taxAmt)}</td>
                        <td className="text-right font-semibold">{money(c.total)}</td>

                        <td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(idx)}
                            disabled={fields.length === 1}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => append({ productId: "", qty: 1, unitPrice: 0, taxRate: 5 })}
              >
                + Add Line
              </Button>

              <div className="text-right space-y-1">
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Total (Untaxed)</span>
                  <span className="font-medium">{money(totals.untaxed)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Tax Amount</span>
                  <span className="font-medium">{money(totals.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between gap-8 text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{money(totals.total)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={status !== "draft"}>Confirm</Button>
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={status !== "draft"}>
                New
              </Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()}>Back</Button>
              <span className="ml-auto text-sm text-muted-foreground">
                Status: <b className={status === "cancelled" ? "text-red-600" : status === "confirmed" ? "text-emerald-600" : ""}>{status}</b>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
