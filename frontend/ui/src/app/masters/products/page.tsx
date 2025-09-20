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

type HSNResult = {
  c: string; // HSN Code
  n: string; // Description
};

type HSNResponse = {
  data: HSNResult[];
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
const HSN_API_BASE = "https://services.gst.gov.in/commonservices/hsn/search";

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

// HSN API functions
const searchHSNByCode = async (code: string): Promise<HSNResult[]> => {
  if (!code || code.length < 2) return [];
  
  try {
    const response = await fetch(
      `${HSN_API_BASE}/qsearch?inputText=${encodeURIComponent(code)}&selectedType=byCode&category=null`
    );
    if (!response.ok) throw new Error('HSN API request failed');
    const data: HSNResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('HSN search error:', error);
    return [];
  }
};

// Default tax rates based on common HSN patterns
const getDefaultTaxRates = (hsnCode: string, description: string): { salesTax?: number; purchaseTax?: number } => {
  const code = hsnCode.slice(0, 4); // First 4 digits for broad classification
  
  // Common GST rates based on HSN codes
  const taxRates: Record<string, { salesTax: number; purchaseTax: number }> = {
    // Food items - 5%
    '0701': { salesTax: 5, purchaseTax: 5 }, // Vegetables
    '1001': { salesTax: 5, purchaseTax: 5 }, // Wheat
    '1006': { salesTax: 5, purchaseTax: 5 }, // Rice
    
    // Textiles - 5% or 12%
    '5208': { salesTax: 5, purchaseTax: 5 }, // Cotton fabrics
    '6109': { salesTax: 12, purchaseTax: 12 }, // T-shirts
    
    // Electronics - 18%
    '8517': { salesTax: 18, purchaseTax: 18 }, // Telephones, mobile phones
    '8528': { salesTax: 18, purchaseTax: 18 }, // Televisions
    
    // Furniture - 18%
    '9401': { salesTax: 18, purchaseTax: 18 }, // Seats and furniture
    '9403': { salesTax: 18, purchaseTax: 18 }, // Other furniture
    
    // Automobiles - 28%
    '8702': { salesTax: 28, purchaseTax: 28 }, // Motor vehicles for transport
    '8703': { salesTax: 28, purchaseTax: 28 }, // Motor cars
    
    // Services - 18%
    '9983': { salesTax: 18, purchaseTax: 18 }, // Business services
  };
  
  return taxRates[code] || { salesTax: 18, purchaseTax: 18 }; // Default 18%
};

// Determine product type based on HSN code
const getProductType = (hsnCode: string): "Goods" | "Service" => {
  // Service codes typically start with 99
  return hsnCode.startsWith('99') ? 'Service' : 'Goods';
};

export default function Page() {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Product | null>(null);
  const [hsnSuggestions, setHsnSuggestions] = React.useState<HSNResult[]>([]);
  const [showHsnSuggestions, setShowHsnSuggestions] = React.useState(false);
  const [hsnLoading, setHsnLoading] = React.useState(false);

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

  const handleHSNChange = async (hsnValue: string) => {
    form.setValue("hsn", hsnValue);
    
    if (hsnValue.length >= 4) {
      setHsnLoading(true);
      try {
        const suggestions = await searchHSNByCode(hsnValue);
        setHsnSuggestions(suggestions);
        setShowHsnSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Error fetching HSN suggestions:', error);
      } finally {
        setHsnLoading(false);
      }
    } else {
      setHsnSuggestions([]);
      setShowHsnSuggestions(false);
    }
  };

  const applyHSNData = (hsn: HSNResult) => {
    const { c: hsnCode, n: description } = hsn;
    
    // Auto-fill product name if empty
    const currentName = form.getValues("name");
    if (!currentName || currentName.trim() === "") {
      form.setValue("name", description);
    }
    
    // Set product type based on HSN code
    const productType = getProductType(hsnCode);
    form.setValue("type", productType);
    
    // Set default tax rates
    const taxRates = getDefaultTaxRates(hsnCode, description);
    form.setValue("salesTax", taxRates.salesTax);
    form.setValue("purchaseTax", taxRates.purchaseTax);
    
    // Set category based on description
    if (description) {
      form.setValue("category", description.split(' ')[0]); // First word as category
    }
    
    // Update HSN code
    form.setValue("hsn", hsnCode);
    
    // Hide suggestions
    setShowHsnSuggestions(false);
    setHsnSuggestions([]);
  };

  const save = async (data: FormVals) => {
    try {
      if (!active) return;
      
      if (active.id && rows.some(p => p.id === active.id)) {
        const updated = await updateProduct(active.id, data);
        setRows(prev => prev.map(p => p.id === active.id ? updated : p));
      } else {
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
              { key:"hsn", title:"HSN Code" },
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
            
            <div className="relative">
              <UnderlineField id="hsn" label="HSN/SAC Code">
                <UnderlineInput 
                  id="hsn" 
                  placeholder="Enter HSN code (e.g., 9401)" 
                  {...form.register("hsn")}
                  onChange={(e) => handleHSNChange(e.target.value)}
                  onFocus={() => setShowHsnSuggestions(hsnSuggestions.length > 0)}
                />
              </UnderlineField>
              
              {hsnLoading && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-sm text-gray-500 z-10">
                  Searching HSN codes...
                </div>
              )}
              
              {showHsnSuggestions && hsnSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                  {hsnSuggestions.slice(0, 10).map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                      onClick={() => applyHSNData(suggestion)}
                    >
                      <div className="font-medium">{suggestion.c}</div>
                      <div className="text-gray-600 text-xs">{suggestion.n}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
          </div>
        </form>
      )}
    </MasterFrame>
  );
}