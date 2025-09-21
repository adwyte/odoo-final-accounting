"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  MasterFrame,
  ToolbarButton,
  SimpleTable,
  UnderlineField,
  UnderlineInput,
  Section,
} from "@/components/master/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  type: "Goods" | "Service";
  category?: string;
  salesPrice?: number;
  purchasePrice?: number;
  salesTax?: number;
  purchaseTax?: number;
  hsn?: string;
};

const schema = z.object({
  name: z.string().min(2, "Name looks too short"),
  type: z.enum(["Goods", "Service"]),
  category: z.string().optional(),
  salesPrice: z.coerce.number().nonnegative().optional(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  salesTax: z.coerce.number().min(0).max(100).optional(),
  purchaseTax: z.coerce.number().min(0).max(100).optional(),
  hsn: z.string().optional(),
});
type FormVals = z.infer<typeof schema>;

export default function Page() {
  const [rows, setRows] = React.useState<Product[]>([
    { id: "p1", name: "Office Chair", type: "Goods", salesPrice: 2200, purchasePrice: 1500, salesTax: 5, purchaseTax: 5, hsn: "9401" },
    { id: "p2", name: "Assembly Service", type: "Service", salesPrice: 500, salesTax: 18 },
  ]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Product | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "Goods" },
  });

  React.useEffect(() => {
    active ? form.reset({ ...active }) : form.reset({ name: "", type: "Goods" });
  }, [active, form]);

  const save = (data: FormVals) => {
    setRows((prev) => {
      if (!active) return prev;
      return prev.some((p) => p.id === active.id)
        ? prev.map((p) => (p.id === active.id ? { ...active, ...data } : p))
        : [{ ...(active as Product), ...data }, ...prev];
    });
    setActive(null);
  };

  const toolbar = (
    <>
      <ToolbarButton onClick={() => setActive({ id: crypto.randomUUID(), name: "", type: "Goods" })}>
        New
      </ToolbarButton>
      <ToolbarButton disabled={!active} onClick={form.handleSubmit(save)}>
        Confirm
      </ToolbarButton>
      <ToolbarButton
        disabled={!active}
        onClick={() => {
          if (!active) return;
          setArchived((a) => ({ ...a, [active.id]: !a[active.id] }));
          setActive(null);
        }}
      >
        Archived
      </ToolbarButton>
      <ToolbarButton onClick={() => setActive(null)}>Home</ToolbarButton>
      <ToolbarButton onClick={() => history.back()}>Back</ToolbarButton>
    </>
  );

  return (
    <MasterFrame title="Product Master" toolbar={toolbar}>
      {!active ? (
        // ——— LIST VIEW (unchanged alignment, wrapped in neat card) ———
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="px-5 py-4 border-b">
              <h3 className="text-base font-medium">Products</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Click a row to open the form view. (
                {rows.filter((r) => !archived[r.id]).length} active)
              </p>
            </div>

            <SimpleTable
              columns={[
                { key: "name", title: "Product Name" },
                { key: "type", title: "Type" },
                { key: "salesPrice", title: "Sales Price (₹)" },
                { key: "purchasePrice", title: "Purchase Price (₹)" },
                { key: "salesTax", title: "Sales Tax (%)" },
              ]}
              rows={rows.filter((r) => !archived[r.id])}
              onRowClick={setActive}
            />

            <div className="px-5 py-3 border-t text-xs text-muted-foreground">
              Tip: Use the toolbar above to create or archive a product.
            </div>
          </div>
        </Section>
      ) : (
        // ——— FORM VIEW (same layout, cleaner chrome) ———
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">
                  {rows.some((r) => r.id === active.id) ? "Edit Product" : "New Product"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill in the details and click <span className="font-medium">Confirm</span>.
                </p>
              </div>
              <div className="text-[11px] text-muted-foreground">
                ID: <span className="font-mono">{active.id.slice(0, 8)}</span>
              </div>
            </div>

            <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
              <UnderlineField id="name" label="Product Name">
                <UnderlineInput id="name" {...form.register("name")} />
              </UnderlineField>

              {/* Product Type */}
              <div className="flex items-center gap-4">
                <Label className="min-w-24">Product Type</Label>
                <RadioGroup
                  className="flex gap-6"
                  value={form.watch("type")}
                  onValueChange={(v: "Goods" | "Service") => form.setValue("type", v)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Goods" id="goods" />
                    <Label htmlFor="goods">Goods</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Service" id="service" />
                    <Label htmlFor="service">Service</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Two-column fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                <UnderlineField id="category" label="Category">
                  <UnderlineInput id="category" {...form.register("category")} />
                </UnderlineField>

                <UnderlineField id="salesPrice" label="Sales Price (₹)">
                  <UnderlineInput id="salesPrice" type="number" step="0.01" {...form.register("salesPrice")} />
                </UnderlineField>

                <UnderlineField id="purchasePrice" label="Purchase Price (₹)">
                  <UnderlineInput
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    {...form.register("purchasePrice")}
                  />
                </UnderlineField>

                <UnderlineField id="salesTax" label="Sales Tax %">
                  <UnderlineInput id="salesTax" type="number" step="0.01" {...form.register("salesTax")} />
                </UnderlineField>

                <UnderlineField id="purchaseTax" label="Purchase Tax %">
                  <UnderlineInput id="purchaseTax" type="number" step="0.01" {...form.register("purchaseTax")} />
                </UnderlineField>

                <UnderlineField id="hsn" label="HSN/SAC Code">
                  <UnderlineInput id="hsn" placeholder="9401" {...form.register("hsn")} />
                </UnderlineField>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setActive(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={form.handleSubmit(save)}>
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </Section>
      )}
    </MasterFrame>
  );
}
