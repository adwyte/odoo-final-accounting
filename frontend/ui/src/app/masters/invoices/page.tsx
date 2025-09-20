"use client";
import Script from "next/script";
<Script src="https://checkout.razorpay.com/v1/checkout.js" />

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
import { Trash2, Plus, CreditCard, FileText, Download } from "lucide-react";

type InvoiceItem = {
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

type Invoice = {
  invoiceNumber: string;
  poNumber?: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerAddress?: string;
  customerGSTIN?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  notes?: string;
  paymentStatus: "Pending" | "Paid" | "Partial" | "Overdue";
  paymentMethod?: string;
};

const itemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate must be positive"),
  taxRate: z.coerce.number().min(0).max(100, "Tax rate must be between 0-100"),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  poNumber: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerAddress: z.string().optional(),
  customerGSTIN: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

type FormVals = z.infer<typeof invoiceSchema>;

const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV${year}${month}${random}`;
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

const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case "Paid": return "text-green-600 bg-green-100";
    case "Pending": return "text-yellow-600 bg-yellow-100";
    case "Partial": return "text-blue-600 bg-blue-100";
    case "Overdue": return "text-red-600 bg-red-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

// Props for when creating invoice from PO
interface InvoiceFromPOProps {
  poData?: {
    poNumber: string;
    vendorName: string;
    vendorAddress?: string;
    items: any[];
  };
}

export default function InvoiceComponent({ poData }: InvoiceFromPOProps = {}) {
  const [previewMode, setPreviewMode] = React.useState(false);
  const [savedInvoices, setSavedInvoices] = React.useState<Invoice[]>([]);
  const [paymentProcessing, setPaymentProcessing] = React.useState(false);

  // Calculate due date (30 days from invoice date)
  const calculateDueDate = (invoiceDate: string): string => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const form = useForm<FormVals>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: generateInvoiceNumber(),
      poNumber: poData?.poNumber || "",
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: calculateDueDate(new Date().toISOString().split('T')[0]),
      customerName: poData?.vendorName || "",
      customerAddress: poData?.vendorAddress || "",
      customerGSTIN: "",
      items: poData?.items ? poData.items.map(item => ({
        productName: item.productName || item.name || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        taxRate: item.taxRate || 18,
      })) : [
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
  const watchedInvoiceDate = form.watch("invoiceDate");

  // Auto-update due date when invoice date changes
  React.useEffect(() => {
    if (watchedInvoiceDate) {
      form.setValue("dueDate", calculateDueDate(watchedInvoiceDate));
    }
  }, [watchedInvoiceDate, form]);

  // Calculate amounts for each item
  const calculateItemAmounts = React.useCallback((items: any[]) => {
    return items.map((item) => {
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

  const saveInvoice = (data: FormVals) => {
    const invoice: Invoice = {
      ...data,
      items: calculatedItems.map((item) => ({
        id: crypto.randomUUID(),
        ...item,
      })),
      subtotal,
      totalTax,
      grandTotal,
      paymentStatus: "Pending",
    };
    
    setSavedInvoices(prev => [invoice, ...prev]);
    setPreviewMode(true);
  };

  const resetForm = () => {
    form.reset({
      invoiceNumber: generateInvoiceNumber(),
      poNumber: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: calculateDueDate(new Date().toISOString().split('T')[0]),
      customerName: "",
      customerAddress: "",
      customerGSTIN: "",
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

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = () => {
    // You can implement PDF generation here
    alert("PDF download functionality - integrate with libraries like jsPDF or react-pdf");
  };

  const handlePayNow = async () => {
  setPaymentProcessing(true);
  try {
    // Updated API call with proper error handling
    const res = await fetch("http://localhost:8000/api/payment_gateway/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ cart_total: grandTotal }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
    }

    const order = await res.json();
    console.log("Order created:", order);

    // Verify Razorpay script is loaded
    if (typeof window.Razorpay === 'undefined') {
      throw new Error("Razorpay SDK not loaded. Please refresh the page.");
    }

    const options = {
      key: "rzp_test_RJkBeE2eYR62GS", // Your hardcoded key
      amount: order.amount,
      currency: order.currency,
      name: "Shiv Accounts Cloud",
      description: `Invoice ${savedInvoices[0]?.invoiceNumber || "N/A"}`,
      order_id: order.order_id,
      handler: function (response) {
        console.log("Payment success:", response);
        alert(`Payment successful! 
               Payment ID: ${response.razorpay_payment_id}
               Order ID: ${response.razorpay_order_id}
               Signature: ${response.razorpay_signature}`);

        // Update invoice status
        if (savedInvoices.length > 0) {
          const updatedInvoices = [...savedInvoices];
          updatedInvoices[0] = {
            ...updatedInvoices[0],
            paymentStatus: "Paid",
            paymentMethod: "Razorpay",
          };
          setSavedInvoices(updatedInvoices);
        }
      },
      prefill: {
        name: savedInvoices[0]?.customerName || "Customer",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal dismissed");
          setPaymentProcessing(false);
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    
    // Handle payment failures
    rzp1.on('payment.failed', function (response) {
      console.error("Payment failed:", response.error);
      alert(`Payment failed: ${response.error.description}`);
      setPaymentProcessing(false);
    });

    rzp1.open();
    
  } catch (error) {
    console.error("Payment initialization failed:", error);
    alert(`Payment failed: ${error.message}`);
    setPaymentProcessing(false);
  }
};

  const toolbar = (
    <>
      <ToolbarButton onClick={resetForm}>New Invoice</ToolbarButton>
      <ToolbarButton onClick={form.handleSubmit(saveInvoice)} disabled={previewMode}>
        Generate
      </ToolbarButton>
      <ToolbarButton onClick={() => setPreviewMode(!previewMode)}>
        {previewMode ? "Edit" : "Preview"}
      </ToolbarButton>
      <ToolbarButton onClick={printInvoice} disabled={!previewMode}>
        Print
      </ToolbarButton>
      <ToolbarButton onClick={downloadInvoice} disabled={!previewMode}>
        <Download size={16} />
        PDF
      </ToolbarButton>
    </>
  );

  if (previewMode && savedInvoices.length > 0) {
    const currentInvoice = savedInvoices[0];
    const isOverdue = new Date(currentInvoice.dueDate) < new Date() && currentInvoice.paymentStatus !== "Paid";
    
    return (
      <MasterFrame title="Invoice" toolbar={toolbar}>
        <Section>
          <div className="max-w-4xl mx-auto bg-white print:p-6">
            {/* Payment Status Banner */}
            <div className={`mb-6 p-4 rounded-lg text-center ${getPaymentStatusColor(isOverdue ? "Overdue" : currentInvoice.paymentStatus)}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Status: {isOverdue ? "OVERDUE" : currentInvoice.paymentStatus.toUpperCase()}
                </span>
                {(currentInvoice.paymentStatus === "Pending" || isOverdue) && (
                  <Button 
                    onClick={handlePayNow}
                    disabled={paymentProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CreditCard size={16} className="mr-2" />
                    {paymentProcessing ? "Processing..." : "Pay Now"}
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8">
              {/* Header */}
              <div className="border-b-2 border-gray-300 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
                    <p className="text-gray-600 mt-2">Shiv Accounts Cloud</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-100 px-4 py-2 rounded mb-2">
                      <p className="text-sm text-gray-600">Invoice Number</p>
                      <p className="text-xl font-bold text-blue-800">{currentInvoice.invoiceNumber}</p>
                    </div>
                    {currentInvoice.poNumber && (
                      <div className="bg-gray-100 px-4 py-2 rounded mb-2">
                        <p className="text-sm text-gray-600">PO Number</p>
                        <p className="font-semibold">{currentInvoice.poNumber}</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <p>Invoice Date: {formatDate(currentInvoice.invoiceDate)}</p>
                      <p>Due Date: {formatDate(currentInvoice.dueDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium text-lg">{currentInvoice.customerName}</p>
                  {currentInvoice.customerAddress && (
                    <p className="text-gray-600 whitespace-pre-line mt-1">{currentInvoice.customerAddress}</p>
                  )}
                  {currentInvoice.customerGSTIN && (
                    <p className="text-gray-600 mt-1">GSTIN: {currentInvoice.customerGSTIN}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left">Item</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Qty</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">Rate</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">Amount</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Tax%</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">Tax Amt</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="font-medium">{item.productName}</div>
                          {item.description && (
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center font-medium">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right">{formatCurrency(item.rate)}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right">{formatCurrency(item.amount)}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center">{item.taxRate}%</td>
                        <td className="border border-gray-300 px-4 py-3 text-right">{formatCurrency(item.taxAmount)}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-semibold">{formatCurrency(item.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-72">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(currentInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span>Total Tax:</span>
                      <span className="font-medium">{formatCurrency(currentInvoice.totalTax)}</span>
                    </div>
                    <div className="flex justify-between py-3 text-xl font-bold bg-blue-100 px-4 rounded mt-2">
                      <span>Grand Total:</span>
                      <span className="text-blue-700">{formatCurrency(currentInvoice.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6 bg-yellow-50 p-4 rounded border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Payment Information</h3>
                <div className="text-sm text-yellow-700">
                  <p>• Payment is due within 30 days of invoice date</p>
                  <p>• Late payments may incur additional charges</p>
                  <p>• Use the "Pay Now" button above for instant payment</p>
                </div>
              </div>

              {/* Notes */}
              {currentInvoice.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes:</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-700 whitespace-pre-line">{currentInvoice.notes}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-300 pt-6 text-center text-gray-600">
                <p className="font-medium">Thank you for your business!</p>
                <p className="text-sm mt-2">This is a computer-generated invoice.</p>
                <p className="text-xs mt-1">For queries, contact: support@shivaccounts.com</p>
              </div>
            </div>
          </div>
        </Section>
      </MasterFrame>
    );
  }

  return (
    <MasterFrame title="Create Invoice" toolbar={toolbar}>
      <Section>
        <form className="max-w-4xl space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UnderlineField id="invoiceNumber" label="Invoice Number">
              <UnderlineInput
                id="invoiceNumber"
                {...form.register("invoiceNumber")}
                placeholder="Auto-generated"
              />
            </UnderlineField>

            <UnderlineField id="invoiceDate" label="Invoice Date">
              <UnderlineInput
                id="invoiceDate"
                type="date"
                {...form.register("invoiceDate")}
              />
            </UnderlineField>

            <UnderlineField id="dueDate" label="Due Date">
              <UnderlineInput
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
              />
            </UnderlineField>
          </div>

          {/* Reference */}
          {poData && (
            <UnderlineField id="poNumber" label="PO Reference">
              <UnderlineInput
                id="poNumber"
                {...form.register("poNumber")}
                placeholder="Reference PO Number"
                readOnly
                className="bg-gray-100"
              />
            </UnderlineField>
          )}

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnderlineField id="customerName" label="Customer Name">
              <UnderlineInput
                id="customerName"
                {...form.register("customerName")}
                placeholder="Enter customer name"
              />
            </UnderlineField>

            <UnderlineField id="customerGSTIN" label="Customer GSTIN">
              <UnderlineInput
                id="customerGSTIN"
                {...form.register("customerGSTIN")}
                placeholder="Customer GST number (optional)"
              />
            </UnderlineField>
          </div>

          <UnderlineField id="customerAddress" label="Customer Address">
            <textarea
              id="customerAddress"
              {...form.register("customerAddress")}
              placeholder="Enter customer address"
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none"
              rows={3}
            />
          </UnderlineField>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <Button type="button" onClick={addItem} className="flex items-center gap-2">
                <Plus size={16} />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <UnderlineField id={`items.${index}.productName`} label="Product/Service">
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

                    <div className="flex items-end justify-center">
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

                  <div className="mt-4">
                    <UnderlineField id={`items.${index}.description`} label="Description (Optional)">
                      <UnderlineInput
                        {...form.register(`items.${index}.description`)}
                        placeholder="Item description or additional details"
                      />
                    </UnderlineField>
                  </div>

                  {/* Item Calculations */}
                  <div className="mt-4 bg-white p-3 rounded border text-sm">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <span className="text-gray-600">Amount: </span>
                        <span className="font-semibold">{formatCurrency(calculatedItems[index]?.amount || 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tax: </span>
                        <span className="font-semibold">{formatCurrency(calculatedItems[index]?.taxAmount || 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total: </span>
                        <span className="font-bold text-blue-600">{formatCurrency(calculatedItems[index]?.totalAmount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Totals Summary */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-center">Invoice Summary</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                <div className="text-xl font-semibold">{formatCurrency(subtotal)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Tax</div>
                <div className="text-xl font-semibold">{formatCurrency(totalTax)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Grand Total</div>
                <div className="text-3xl font-bold text-blue-700">{formatCurrency(grandTotal)}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <UnderlineField id="notes" label="Notes & Terms (Optional)">
            <textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Payment terms, additional notes, or special instructions"
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none"
              rows={4}
            />
          </UnderlineField>
        </form>
      </Section>
    </MasterFrame>
  );
}