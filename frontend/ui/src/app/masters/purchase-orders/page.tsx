"use client";

import React from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  MasterFrame,
  ToolbarButton,
  UnderlineField,
  UnderlineInput,
  Section,
} from "@/components/master/ui";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Trash2, Plus, FileText } from "lucide-react";

type POItem = {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
};

type PurchaseOrder = {
  poNumber: string;
  date: string;
  vendorName: string;
  vendorAddress?: string;
  items: POItem[];
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  notes?: string;
};

const itemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate must be positive"),
  taxRate: z.coerce.number().min(0).max(100, "Tax rate must be between 0-100"),
});

const poSchema = z.object({
  poNumber: z.string().min(1, "PO Number is required"),
  date: z.string().min(1, "Date is required"),
  vendorName: z.string().min(1, "Vendor name is required"),
  vendorAddress: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

type FormVals = z.infer<typeof poSchema>;

const generatePONumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PO${year}${month}${random}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function PurchaseOrderSlip() {
  const [previewMode, setPreviewMode] = React.useState(false);
  const [savedPOs, setSavedPOs] = React.useState<PurchaseOrder[]>([]);

  const form = useForm<FormVals>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      poNumber: generatePONumber(),
      date: new Date().toISOString().split('T')[0],
      vendorName: "",
      vendorAddress: "",
      items: [
        {
          productName: "",
          description: "",
          quantity: 1,
          rate: 0,
          taxRate: 18,
        }
      ],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  // Calculate amounts for each item
  const calculateItemAmounts = React.useCallback((items: any[]) => {
    return items.map((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const taxRate = Number(item.taxRate) || 0;
      
      const amount = quantity * rate;
      const taxAmount = (amount * taxRate) / 100;
      const totalAmount = amount + taxAmount;

      return {
        ...item,
        amount,
        taxAmount,
        totalAmount,
      };
    });
  }, []);

  // Calculate totals
  const calculatedItems = calculateItemAmounts(watchedItems);
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const grandTotal = subtotal + totalTax;

  const addItem = () => {
    append({
      productName: "",
      description: "",
      quantity: 1,
      rate: 0,
      taxRate: 18,
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const savePO = (data: FormVals) => {
    const po: PurchaseOrder = {
      ...data,
      items: calculatedItems.map((item, index) => ({
        id: crypto.randomUUID(),
        ...item,
      })),
      subtotal,
      totalTax,
      grandTotal,
    };
    
    setSavedPOs(prev => [po, ...prev]);
    setPreviewMode(true);
  };

  const resetForm = () => {
    form.reset({
      poNumber: generatePONumber(),
      date: new Date().toISOString().split('T')[0],
      vendorName: "",
      vendorAddress: "",
      items: [
        {
          productName: "",
          description: "",
          quantity: 1,
          rate: 0,
          taxRate: 18,
        }
      ],
      notes: "",
    });
    setPreviewMode(false);
  };

  const printPO = () => {
    window.print();
  };

  const toolbar = (
    <>
      <ToolbarButton onClick={resetForm}>New PO</ToolbarButton>
      <ToolbarButton onClick={form.handleSubmit(savePO)} disabled={previewMode}>
        Generate
      </ToolbarButton>
      <ToolbarButton onClick={() => setPreviewMode(!previewMode)}>
        {previewMode ? "Edit" : "Preview"}
      </ToolbarButton>
      <ToolbarButton onClick={printPO} disabled={!previewMode}>
        Print
      </ToolbarButton>
    </>
  );

  if (previewMode && savedPOs.length > 0) {
    const currentPO = savedPOs[0];
    
    return (
      <MasterFrame title="Purchase Order" toolbar={toolbar}>
        <Section>
          <div className="max-w-4xl mx-auto bg-white p-8 print:p-6">
            {/* Header */}
            <div className="border-b-2 border-gray-300 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">PURCHASE ORDER</h1>
                  <p className="text-gray-600 mt-2">Shiv Accounts Cloud</p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-100 px-4 py-2 rounded">
                    <p className="text-sm text-gray-600">PO Number</p>
                    <p className="text-xl font-bold text-blue-800">{currentPO.poNumber}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Date: {formatDate(currentPO.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Vendor Details:</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{currentPO.vendorName}</p>
                {currentPO.vendorAddress && (
                  <p className="text-gray-600 whitespace-pre-line">{currentPO.vendorAddress}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Tax%</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Tax Amt</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPO.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="font-medium">{item.productName}</div>
                        {item.description && (
                          <div className="text-sm text-gray-600">{item.description}</div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.rate)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.taxRate}%</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.taxAmount)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium">{formatCurrency(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(currentPO.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Total Tax:</span>
                  <span>{formatCurrency(currentPO.totalTax)}</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold bg-blue-50 px-2 rounded">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(currentPO.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {currentPO.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes:</h3>
                <p className="text-gray-600 whitespace-pre-line">{currentPO.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-300 pt-6 text-center text-gray-600">
              <p>Thank you for your business!</p>
              <p className="text-sm mt-2">This is a computer-generated document.</p>
            </div>
          </div>
        </Section>
      </MasterFrame>
    );
  }

  return (
    <MasterFrame title="Create Purchase Order" toolbar={toolbar}>
      <Section>
        <form className="max-w-4xl space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* PO Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnderlineField id="poNumber" label="PO Number">
              <UnderlineInput
                id="poNumber"
                {...form.register("poNumber")}
                placeholder="Auto-generated"
              />
            </UnderlineField>

            <UnderlineField id="date" label="Date">
              <UnderlineInput
                id="date"
                type="date"
                {...form.register("date")}
              />
            </UnderlineField>
          </div>

          {/* Vendor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnderlineField id="vendorName" label="Vendor Name">
              <UnderlineInput
                id="vendorName"
                {...form.register("vendorName")}
                placeholder="Enter vendor name"
              />
            </UnderlineField>

            <UnderlineField id="vendorAddress" label="Vendor Address">
              <textarea
                id="vendorAddress"
                {...form.register("vendorAddress")}
                placeholder="Enter vendor address"
                className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none"
                rows={3}
              />
            </UnderlineField>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button type="button" onClick={addItem} className="flex items-center gap-2">
                <Plus size={16} />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <UnderlineField id={`items.${index}.productName`} label="Product Name">
                        <UnderlineInput
                          {...form.register(`items.${index}.productName`)}
                          placeholder="Enter product name"
                        />
                      </UnderlineField>
                    </div>

                    <div>
                      <UnderlineField id={`items.${index}.quantity`} label="Quantity">
                        <UnderlineInput
                          type="number"
                          step="1"
                          {...form.register(`items.${index}.quantity`)}
                        />
                      </UnderlineField>
                    </div>

                    <div>
                      <UnderlineField id={`items.${index}.rate`} label="Rate">
                        <UnderlineInput
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.rate`)}
                        />
                      </UnderlineField>
                    </div>

                    <div>
                      <UnderlineField id={`items.${index}.taxRate`} label="Tax %">
                        <UnderlineInput
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.taxRate`)}
                        />
                      </UnderlineField>
                    </div>

                    <div className="flex items-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <UnderlineField id={`items.${index}.description`} label="Description (Optional)">
                      <UnderlineInput
                        {...form.register(`items.${index}.description`)}
                        placeholder="Item description"
                      />
                    </UnderlineField>
                  </div>

                  {/* Item Calculations */}
                  <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div>Amount: {formatCurrency(calculatedItems[index]?.amount || 0)}</div>
                      <div>Tax: {formatCurrency(calculatedItems[index]?.taxAmount || 0)}</div>
                      <div className="font-semibold">Total: {formatCurrency(calculatedItems[index]?.totalAmount || 0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-xl font-semibold">{formatCurrency(subtotal)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Tax</div>
                <div className="text-xl font-semibold">{formatCurrency(totalTax)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Grand Total</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(grandTotal)}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <UnderlineField id="notes" label="Notes (Optional)">
            <textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes or terms"
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none"
              rows={3}
            />
          </UnderlineField>
        </form>
      </Section>
    </MasterFrame>
  );
}