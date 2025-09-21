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

/* ======================== Types & Schema ======================== */

type Product = {
  id: string;
  name: string;
  type: "goods" | "service";
  category?: string;
  salesPrice?: number;
  purchasePrice?: number;
  salesTax?: number;
  purchaseTax?: number;
  hsn?: string;
};

type HSNResult = { c: string; n: string };
type HSNResponse = { data: HSNResult[] };

const schema = z.object({
  name: z.string().min(2, "Name looks too short"),
  type: z.enum(["goods", "service"]),
  category: z.string().optional(),
  salesPrice: z.coerce.number().nonnegative().optional(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  salesTax: z.coerce.number().min(0).max(100).optional(),
  purchaseTax: z.coerce.number().min(0).max(100).optional(),
  hsn: z.string().optional(),
});
type FormVals = z.infer<typeof schema>;

/* ======================== Utils & APIs ======================== */

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const API_BASE = "http://localhost:8001";
const HSN_API_BASE = "https://services.gst.gov.in/commonservices/hsn/search";

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API_BASE}/products/`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const res = await fetch(`${API_BASE}/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
};

const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
};

const searchHSNByCode = async (code: string): Promise<HSNResult[]> => {
  if (!code || code.length < 2) return [];
  try {
    const res = await fetch(
      `${HSN_API_BASE}/qsearch?inputText=${encodeURIComponent(code)}&selectedType=byCode&category=null`
    );
    if (!res.ok) throw new Error("HSN API request failed");
    const data: HSNResponse = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("HSN search error:", err);
    return [];
  }
};

/** Guess tax rates from HSN prefix (fallback 18%) */
const getDefaultTaxRates = (hsnCode: string) => {
  const code = hsnCode.slice(0, 4);
  const taxRates: Record<string, { salesTax: number; purchaseTax: number }> = {
    "0701": { salesTax: 5, purchaseTax: 5 },
    "1001": { salesTax: 5, purchaseTax: 5 },
    "1006": { salesTax: 5, purchaseTax: 5 },
    "5208": { salesTax: 5, purchaseTax: 5 },
    "6109": { salesTax: 12, purchaseTax: 12 },
    "8517": { salesTax: 18, purchaseTax: 18 },
    "8528": { salesTax: 18, purchaseTax: 18 },
    "9401": { salesTax: 18, purchaseTax: 18 },
    "9403": { salesTax: 18, purchaseTax: 18 },
    "8702": { salesTax: 28, purchaseTax: 28 },
    "8703": { salesTax: 28, purchaseTax: 28 },
    "9983": { salesTax: 18, purchaseTax: 18 },
  };
  return taxRates[code] || { salesTax: 18, purchaseTax: 18 };
};

const getProductType = (hsnCode: string): "goods" | "service" =>
  hsnCode.startsWith("99") ? "service" : "goods";

/* ======================== Component ======================== */

export default function Page() {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Product | null>(null);

  // HSN UI
  const [hsnSuggestions, setHsnSuggestions] = React.useState<HSNResult[]>([]);
  const [showHsnSuggestions, setShowHsnSuggestions] = React.useState(false);
  const [hsnLoading, setHsnLoading] = React.useState(false);

  // status
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "goods" },
  });

  React.useEffect(() => {
    loadProducts();
  }, []);

  React.useEffect(() => {
    active ? form.reset({ ...active }) : form.reset({ name: "", type: "goods" });
  }, [active, form]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await fetchProducts();
      setRows(products);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleHSNChange = async (hsnValue: string) => {
    form.setValue("hsn", hsnValue);
    if (hsnValue.length >= 4) {
      setHsnLoading(true);
      const suggestions = await searchHSNByCode(hsnValue);
      setHsnSuggestions(suggestions);
      setShowHsnSuggestions(suggestions.length > 0);
      setHsnLoading(false);
    } else {
      setHsnSuggestions([]);
      setShowHsnSuggestions(false);
    }
  };

  const applyHSNData = (hsn: HSNResult) => {
    const { c: hsnCode, n: description } = hsn;
    if (!form.getValues("name")) form.setValue("name", description);
    form.setValue("type", getProductType(hsnCode));
    const rates = getDefaultTaxRates(hsnCode);
    form.setValue("salesTax", rates.salesTax);
    form.setValue("purchaseTax", rates.purchaseTax);
    form.setValue("category", description.split(" ")[0]);
    form.setValue("hsn", hsnCode);
    setShowHsnSuggestions(false);
  };

  const save = async (data: FormVals) => {
    try {
      if (!active) return;

      // sanitize optional numbers
      const payload: Omit<Product, "id"> = {
        ...data,
        salesPrice: data.salesPrice ?? undefined,
        purchasePrice: data.purchasePrice ?? undefined,
        salesTax: data.salesTax ?? undefined,
        purchaseTax: data.purchaseTax ?? undefined,
        type: data.type,
      };

      if (rows.some((p) => p.id === active.id)) {
        const updated = await updateProduct(active.id, payload);
        setRows((prev) => prev.map((p) => (p.id === active.id ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setRows((prev) => [created, ...prev]);
      }

      setActive(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  const handleNew = () => setActive({ id: generateUUID(), name: "", type: "goods" });
  const handleArchive = (product: Product) => {
    setArchived((prev) => ({ ...prev, [product.id]: !prev[product.id] }));
    setActive(null);
  };

  const toolbar = (
    <>
      <ToolbarButton onClick={handleNew}>New</ToolbarButton>
      <ToolbarButton disabled={!active} onClick={form.handleSubmit(save)}>
        Confirm
      </ToolbarButton>
      <ToolbarButton disabled={!active} onClick={() => active && handleArchive(active)}>
        Archive
      </ToolbarButton>
      <ToolbarButton onClick={() => setActive(null)}>Home</ToolbarButton>
      <ToolbarButton onClick={() => history.back()}>Back</ToolbarButton>
    </>
  );

  if (loading) {
    return (
      <MasterFrame title="Product Master" toolbar={toolbar}>
        <Section>
          <div className="flex h-32 items-center justify-center">Loading products...</div>
        </Section>
      </MasterFrame>
    );
  }

  return (
    <MasterFrame title="Product Master" toolbar={toolbar}>
      {error && (
        <Section>
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Error: {error}{" "}
            <button onClick={loadProducts} className="ml-4 underline hover:no-underline">
              Retry
            </button>
          </div>
        </Section>
      )}

      {!active ? (
        /* -------- LIST VIEW (same alignment, wrapped in neat card) -------- */
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h3 className="text-base font-medium">Products</h3>
              <p className="mt-1 text-xs text-muted-foreground">
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
                { key: "hsn", title: "HSN Code" },
              ]}
              rows={rows.filter((r) => !archived[r.id])}
              onRowClick={setActive}
            />

            <div className="border-t px-5 py-3 text-xs text-muted-foreground">
              Tip: Use the toolbar above to create or archive a product.
            </div>
          </div>
        </Section>
      ) : (
        /* -------- FORM VIEW (same layout, cleaner chrome) -------- */
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-base font-medium">
                  {rows.some((r) => r.id === active.id) ? "Edit Product" : "New Product"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fill in the details and click <span className="font-medium">Confirm</span>.
                </p>
              </div>
              <div className="text-[11px] text-muted-foreground">
                ID: <span className="font-mono">{active.id.slice(0, 8)}</span>
              </div>
            </div>

            <form className="space-y-6 p-6" onSubmit={(e) => e.preventDefault()}>
              <UnderlineField id="name" label="Product Name">
                <UnderlineInput id="name" {...form.register("name")} />
              </UnderlineField>

              {/* Product Type */}
              <div className="flex items-center gap-4">
                <Label className="min-w-24">Product Type</Label>
                <RadioGroup
                  className="flex gap-6"
                  value={form.watch("type")}
                  onValueChange={(v: "goods" | "service") => form.setValue("type", v)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="goods" id="goods" />
                    <Label htmlFor="goods">Goods</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="service" id="service" />
                    <Label htmlFor="service">Service</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Two-column fields */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-10 sm:grid-cols-2">
                <UnderlineField id="category" label="Category">
                  <UnderlineInput id="category" {...form.register("category")} />
                </UnderlineField>

                {/* HSN with suggestions */}
                <div className="relative">
                  <UnderlineField id="hsn" label="HSN/SAC Code">
                    <UnderlineInput
                      id="hsn"
                      placeholder="Enter HSN code"
                      {...form.register("hsn")}
                      onChange={(e) => handleHSNChange(e.target.value)}
                      onFocus={() => setShowHsnSuggestions(hsnSuggestions.length > 0)}
                    />
                  </UnderlineField>

                  {hsnLoading && (
                    <div className="absolute left-0 right-0 top-full z-10 bg-white p-2 text-sm text-gray-500">
                      Searching HSN codes...
                    </div>
                  )}

                  {showHsnSuggestions && hsnSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 max-h-44 overflow-y-auto border bg-white">
                      {hsnSuggestions.slice(0, 10).map((s, i) => (
                        <div
                          key={i}
                          className="cursor-pointer border-b p-2 text-sm last:border-b-0 hover:bg-gray-100"
                          onClick={() => applyHSNData(s)}
                        >
                          <div className="font-medium">{s.c}</div>
                          <div className="text-xs text-gray-600">{s.n}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <UnderlineField id="salesPrice" label="Sales Price (₹)">
                  <UnderlineInput id="salesPrice" type="number" step="0.01" {...form.register("salesPrice")} />
                </UnderlineField>

                <UnderlineField id="purchasePrice" label="Purchase Price (₹)">
                  <UnderlineInput id="purchasePrice" type="number" step="0.01" {...form.register("purchasePrice")} />
                </UnderlineField>

                <UnderlineField id="salesTax" label="Sales Tax %">
                  <UnderlineInput id="salesTax" type="number" step="0.01" {...form.register("salesTax")} />
                </UnderlineField>

                <UnderlineField id="purchaseTax" label="Purchase Tax %">
                  <UnderlineInput id="purchaseTax" type="number" step="0.01" {...form.register("purchaseTax")} />
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
