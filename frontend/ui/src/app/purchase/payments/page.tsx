"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ---------------- Mock masters (swap with API later) ----------------
const CUSTOMERS = [
  { id: "c1", name: "Nimesh Pathak" },
  { id: "c2", name: "Omkar Kulkarni" },
];
const VENDORS = [
  { id: "v1", name: "Azure Interior" },
  { id: "v2", name: "Wood Kart" },
];

// ---------------- Validation ----------------
const schema = z.object({
  paymentNo: z.string(),                                 // auto number
  date: z.string().min(1, "Date is required"),
  type: z.enum(["send", "receive"]),                     // Send (pay out) / Receive (collect)
  partnerType: z.enum(["customer", "vendor"]),
  partnerId: z.string().min(1, "Pick a partner"),
  method: z.enum(["cash", "bank"]),
  amount: z.coerce.number().min(0, "Amount ≥ 0"),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const inr = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

// ====================================================================
export default function BillPaymentPage() {
  const router = useRouter();
  const qs = useSearchParams();

  // Prefill if you navigated from a Bill/Invoice: ?partnerId=...&partnerType=vendor&amount=17857.5&type=send
  const nextNo = React.useMemo(() => "Pay/25/0001", []);
  const pfPartner = qs.get("partnerId") ?? "";
  const pfType = (qs.get("type") as "send" | "receive") ?? "send";
  const pfPartnerType = (qs.get("partnerType") as "customer" | "vendor") ?? "vendor";
  const pfAmount = Number(qs.get("amount") ?? 0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentNo: nextNo,
      date: new Date().toISOString().slice(0, 10),
      type: pfType,
      partnerType: pfPartnerType,
      partnerId: pfPartner,
      method: "bank",
      amount: pfAmount,
      note: "",
    },
    mode: "onBlur",
  });

  const watchType = form.watch("type");                 // send / receive
  const watchPartnerType = form.watch("partnerType");   // customer / vendor
  const watchAmount = form.watch("amount");

  const partners =
    watchPartnerType === "customer" ? CUSTOMERS : VENDORS;

  const [status, setStatus] = React.useState<"draft" | "confirmed" | "cancelled">("draft");

  const onSubmit = (vals: FormValues) => {
    // TODO: call backend
    console.log("PAYMENT SUBMIT", vals);
    setStatus("confirmed");
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Bill Payment</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
          <Button variant="outline" onClick={() => alert("Sent (stub)")}>Send</Button>
          <Button variant="destructive" onClick={() => setStatus("cancelled")}>Cancel</Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Header</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Row: number + date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="paymentNo">Payment No.</Label>
                <Input id="paymentNo" readOnly {...form.register("paymentNo")} />
                <p className="text-[11px] text-muted-foreground mt-1">
                  auto generate (last payment + 1)
                </p>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Payment type & partner type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Payment Type</Label>
                <RadioGroup
                  className="flex gap-6"
                  value={watchType}
                  onValueChange={(v) => form.setValue("type", v as FormValues["type"], { shouldValidate: true })}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="send" id="type-send" />
                    <Label htmlFor="type-send">Send</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="receive" id="type-receive" />
                    <Label htmlFor="type-receive">Receive</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Partner Type</Label>
                <RadioGroup
                  className="flex gap-6"
                  value={watchPartnerType}
                  onValueChange={(v) => {
                    form.setValue("partnerType", v as FormValues["partnerType"], { shouldValidate: true });
                    form.setValue("partnerId", "", { shouldValidate: true });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="customer" id="pt-cust" />
                    <Label htmlFor="pt-cust">Customer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="vendor" id="pt-vendor" />
                    <Label htmlFor="pt-vendor">Vendor</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Partner + method + amount + note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Partner</Label>
                <Select
                  value={form.watch("partnerId")}
                  onValueChange={(v) => form.setValue("partnerId", v, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder={`Select ${watchPartnerType}`} /></SelectTrigger>
                  <SelectContent>
                    {partners.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.partnerId && (
                  <p className="text-xs text-red-500">{form.formState.errors.partnerId.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  (auto fill partner when coming from Bill/Invoice)
                </p>
              </div>

              <div>
                <Label>Payment Via</Label>
                <Select
                  value={form.watch("method")}
                  onValueChange={(v) => form.setValue("method", v as FormValues["method"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  (Default: Bank, can switch to Cash)
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" min={0} step="0.01" {...form.register("amount")} />
                {form.formState.errors.amount && (
                  <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  (auto fill amount due when launched from Bill/Invoice)
                </p>
              </div>

              <div>
                <Label htmlFor="note">Note</Label>
                <Input id="note" placeholder="Alpha numeric (text)" {...form.register("note")} />
              </div>
            </div>

            <div className="rounded-xl border p-4 bg-muted/30 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-semibold">{inr(watchAmount || 0)}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={status !== "draft"}>Confirm</Button>
              <Button type="button" variant="outline" onClick={() => form.reset({
                paymentNo: nextNo,
                date: new Date().toISOString().slice(0,10),
                type: "send",
                partnerType: "vendor",
                partnerId: "",
                method: "bank",
                amount: 0,
                note: "",
              })}>
                New
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Back</Button>
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
