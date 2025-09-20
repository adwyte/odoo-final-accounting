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

// ---------- Mock masters (swap with API later) ----------
const VENDORS = [
  { id: "v1", name: "Azure Interior" },
  { id: "v2", name: "Wood Kart" },
];

const PRODUCTS = [
  { id: "p1", name: "Table", hsn: "940370", expenseAccountId: "coa_purchase_exp", defaultPrice: 2300 },
  { id: "p2", name: "Chair", hsn: "956300", expenseAccountId: "coa_purchase_exp", defaultPrice: 850 },
  { id: "p3", name: "Office Sofa", hsn: "940161", expenseAccountId: "coa_purchase_exp", defaultPrice: 12500 },
];

const TAXES = [
  { id: "t0", name: "0%", rate: 0 },
  { id: "t5", name: "GST 5%", rate: 5 },
  { id: "t10", name: "GST 10%", rate: 10 },
];

const COA = [
  { id: "coa_purchase_exp", name: "Purchase Expense A/c" },
  { id: "coa_other_exp", name: "Other Expense A/c" },
];

// ---------- Validation ----------
const billLineSchema = z.object({
  productId: z.string().min(1, "Choose product"),
  qty: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0),
  accountId: z.string().min(1, "Choose account"),
});

const billSchema = z.object({
  billNo: z.string(),
  billDate: z.string().min(1, "Bill date required"),
  dueDate: z.string().min(1, "Due date required"),
  vendorId: z.string().min(1, "Select vendor"),
  reference: z.string().optional(),
  lines: z.array(billLineSchema).min(1, "Add at least one line"),
  paidCash: z.coerce.number().default(0),
  paidBank: z.coerce.number().default(0),
});
type BillValues = z.infer<typeof billSchema>;

// ---------- Helpers ----------
const money = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function computeLine(l: z.infer<typeof billLineSchema>) {
  const untaxed = l.qty * l.unitPrice;
  const taxAmt = (untaxed * l.taxRate) / 100;
  const total = untaxed + taxAmt;
  return { untaxed, taxAmt, total };
}

// =========================================================
export default function VendorBillPage() {
  // Pretend auto number (replace with API/sequence)
  const nextBill = React.useMemo(() => "BILL/2025/0001", []);

  const form = useForm<BillValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      billNo: nextBill,
      billDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      vendorId: "",
      reference: "",
      lines: [
        { productId: "", qty: 1, unitPrice: 0, taxRate: 5, accountId: "coa_purchase_exp" },
      ],
      paidCash: 0,
      paidBank: 0,
    },
    mode: "onBlur",
  });

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "lines" });
  const watchLines = form.watch("lines");
  const paidCash = form.watch("paidCash");
  const paidBank = form.watch("paidBank");

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

  const paidTotal = (paidCash || 0) + (paidBank || 0);
  const amountDue = Math.max(totals.total - paidTotal, 0);

  const [status, setStatus] = React.useState<"draft" | "confirmed" | "cancelled">("draft");

  const onSubmit = (vals: BillValues) => {
    // send to backend
    console.log("VENDOR BILL SUBMIT", { ...vals, totals, amountDue });
    setStatus("confirmed");
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Vendor Bill</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
          <Button variant="outline" onClick={() => alert("E-mailed to vendor (stub)")}>Send</Button>
          <Button variant="destructive" onClick={() => setStatus("cancelled")}>Cancel</Button>
          <Button disabled={status !== "confirmed"} onClick={() => alert("Paid (stub)")}>Pay</Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="billNo">Vendor Bill No.</Label>
                <Input id="billNo" readOnly {...form.register("billNo")} />
                <p className="text-[11px] text-muted-foreground mt-1">auto generate (last bill + 1)</p>
              </div>
              <div>
                <Label htmlFor="billDate">Bill Date</Label>
                <Input id="billDate" type="date" {...form.register("billDate")} />
                {form.formState.errors.billDate && (
                  <p className="text-xs text-red-500">{form.formState.errors.billDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...form.register("dueDate")} />
                {form.formState.errors.dueDate && (
                  <p className="text-xs text-red-500">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Vendor Name</Label>
                <Select
                  value={form.watch("vendorId")}
                  onValueChange={(v) => form.setValue("vendorId", v, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {VENDORS.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.formState.errors.vendorId && (
                  <p className="text-xs text-red-500">{form.formState.errors.vendorId.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="reference">Bill Reference</Label>
                <Input id="reference" placeholder="SUP-25-001" {...form.register("reference")} />
              </div>
            </div>

            <Separator />

            {/* Lines table */}
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                    <th className="w-12">Sr.</th>
                    <th>Product</th>
                    <th className="w-28">HSN No.</th>
                    <th className="w-48">Account Name</th>
                    <th className="w-16 text-right">Qty</th>
                    <th className="w-24 text-right">Unit Price</th>
                    <th className="w-28 text-right">Untaxed</th>
                    <th className="w-20 text-right">Tax</th>
                    <th className="w-28 text-right">Tax Amount</th>
                    <th className="w-28 text-right">Total</th>
                    <th className="w-14"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, idx) => {
                    const v = form.watch(`lines.${idx}`);
                    const comp = computeLine(v);
                    const prod = PRODUCTS.find(p => p.id === v.productId);
                    return (
                      <tr key={f.id} className="border-t align-middle [&>td]:px-3 [&>td]:py-2">
                        <td>{idx + 1}</td>

                        <td className="min-w-[220px]">
                          <Select
                            value={v.productId}
                            onValueChange={(pid) => {
                              const p = PRODUCTS.find(x => x.id === pid)!;
                              update(idx, {
                                ...v,
                                productId: pid,
                                unitPrice: p.defaultPrice,
                                accountId: p.expenseAccountId,
                              });
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                            <SelectContent>
                              {PRODUCTS.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td>
                          <Input readOnly value={prod?.hsn ?? ""} />
                        </td>

                        <td>
                          <Select
                            value={v.accountId}
                            onValueChange={(aid) => update(idx, { ...v, accountId: aid })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {COA.map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="text-right">
                          <Input
                            type="number"
                            min={1}
                            value={v.qty}
                            onChange={(e) => update(idx, { ...v, qty: +e.target.value })}
                            className="text-right"
                          />
                        </td>

                        <td className="text-right">
                          <Input
                            type="number"
                            min={0}
                            value={v.unitPrice}
                            onChange={(e) => update(idx, { ...v, unitPrice: +e.target.value })}
                            className="text-right"
                          />
                        </td>

                        <td className="text-right font-medium">{money(comp.untaxed)}</td>

                        <td className="text-right">
                          <Select
                            value={String(v.taxRate)}
                            onValueChange={(r) => update(idx, { ...v, taxRate: +r })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {TAXES.map(t => (
                                <SelectItem key={t.id} value={String(t.rate)}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="text-right">{money(comp.taxAmt)}</td>
                        <td className="text-right font-semibold">{money(comp.total)}</td>

                        <td className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => remove(idx)} disabled={fields.length === 1}>
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
                onClick={() => append({ productId: "", qty: 1, unitPrice: 0, taxRate: 5, accountId: "coa_purchase_exp" })}
              >
                + Add Line
              </Button>

              <div className="text-right space-y-1 min-w-[320px]">
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Untaxed Amount</span>
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

            {/* Payment box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="paidCash">Paid via Cash</Label>
                <Input id="paidCash" type="number" min={0} {...form.register("paidCash")} />
              </div>
              <div>
                <Label htmlFor="paidBank">Paid via Bank</Label>
                <Input id="paidBank" type="number" min={0} {...form.register("paidBank")} />
              </div>
              <div className="rounded-xl border p-4 bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="font-semibold">{money(amountDue)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 text-right">
                  (Total − Payment)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={status !== "draft"}>Confirm</Button>
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={status !== "draft"}>
                New
              </Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()}>Back</Button>
              <span className="ml-auto text-sm text-muted-foreground">
                Status:{" "}
                <b className={status === "cancelled" ? "text-red-600" : status === "confirmed" ? "text-emerald-600" : ""}>
                  {status}
                </b>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
