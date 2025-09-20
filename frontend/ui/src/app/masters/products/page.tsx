"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MasterFrame, ToolbarButton, SimpleTable, UnderlineField, UnderlineInput, Section } from "@/components/master/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  name: z.string().min(2),
  type: z.enum(["Goods","Service"]),
  category: z.string().optional(),
  salesPrice: z.coerce.number().nonnegative().optional(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  salesTax: z.coerce.number().min(0).max(100).optional(),
  purchaseTax: z.coerce.number().min(0).max(100).optional(),
  hsn: z.string().optional(),
});
type FormVals = z.infer<typeof schema>;

// API functions
const API_BASE = "http://localhost:8000";

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE}/products/`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await fetch(`${API_BASE}/products/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export default function Page() {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Product | null>(null);

  const form = useForm<FormVals>({ 
    resolver: zodResolver(schema), 
    defaultValues: { name:"", type:"Goods" } 
  });

  // Load products on component mount
  React.useEffect(() => {
    loadProducts();
  }, []);

  React.useEffect(() => { 
    active ? form.reset({ ...active }) : form.reset({ name:"", type:"Goods" }); 
  }, [active]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await fetchProducts();
      setRows(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const save = async (data: FormVals) => {
    try {
      if (!active) return;
      
      if (active.id && rows.some(p => p.id === active.id)) {
        // Update existing product
        const updated = await updateProduct(active.id, data);
        setRows(prev => prev.map(p => p.id === active.id ? updated : p));
      } else {
        // Create new product
        const newProduct = await createProduct({ ...data });
        setRows(prev => [newProduct, ...prev]);
      }
      
      setActive(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      console.error('Error saving product:', err);
    }
  };

  const handleNewProduct = () => {
    setActive({ 
      id: crypto.randomUUID(), 
      name: "", 
      type: "Goods" 
    });
  };

  const handleArchive = (product: Product) => {
    setArchived(prev => ({ ...prev, [product.id]: !prev[product.id] }));
    setActive(null);
  };

  const toolbar = (
    <>
      <ToolbarButton onClick={handleNewProduct}>New</ToolbarButton>
      <ToolbarButton disabled={!active} onClick={form.handleSubmit(save)}>
        Confirm
      </ToolbarButton>
      <ToolbarButton 
        disabled={!active} 
        onClick={() => active && handleArchive(active)}
      >
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
          <div className="flex justify-center items-center h-32">
            Loading products...
          </div>
        </Section>
      </MasterFrame>
    );
  }

  return (
    <MasterFrame title="Product Master" toolbar={toolbar}>
      {error && (
        <Section>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
            <button 
              onClick={loadProducts} 
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </Section>
      )}
      
      {!active ? (
        <Section>
          <SimpleTable
            columns={[
              { key:"name", title:"Product Name" },
              { key:"type", title:"Type" },
              { key:"salesPrice", title:"Sales Price (₹)" },
              { key:"purchasePrice", title:"Purchase Price (₹)" },
              { key:"salesTax", title:"Sales Tax (%)" },
            ]}
            rows={rows.filter(r => !archived[r.id])}
            onRowClick={setActive}
          />
        </Section>
      ) : (
        <form className="max-w-3xl space-y-6" onSubmit={(e)=>e.preventDefault()}>
          <UnderlineField id="name" label="Product Name">
            <UnderlineInput id="name" {...form.register("name")} />
          </UnderlineField>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            <UnderlineField id="category" label="Category">
              <UnderlineInput id="category" {...form.register("category")} />
            </UnderlineField>
            <UnderlineField id="salesPrice" label="Sales Price">
              <UnderlineInput id="salesPrice" type="number" step="0.01" {...form.register("salesPrice")} />
            </UnderlineField>
            <UnderlineField id="purchasePrice" label="Purchase Price">
              <UnderlineInput id="purchasePrice" type="number" step="0.01" {...form.register("purchasePrice")} />
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
        </form>
      )}
    </MasterFrame>
  );
}