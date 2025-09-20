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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type Coa = {
  id: string;
  name: string;
  type: "Asset" | "Liability" | "Expense" | "Income" | "Equity";
};

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["Asset", "Liability", "Expense", "Income", "Equity"]),
});
type FormVals = z.infer<typeof schema>;

// API functions
const API_BASE = "http://localhost:8000";

const fetchAccounts = async (): Promise<Coa[]> => {
  const response = await fetch(`${API_BASE}/coa/`);
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return response.json();
};

const createAccount = async (account: Omit<Coa, 'id'>): Promise<Coa> => {
  const response = await fetch(`${API_BASE}/coa/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
  });
  if (!response.ok) throw new Error('Failed to create account');
  return response.json();
};

const updateAccount = async (id: string, account: Partial<Coa>): Promise<Coa> => {
  const response = await fetch(`${API_BASE}/coa/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
  });
  if (!response.ok) throw new Error('Failed to update account');
  return response.json();
};

const deleteAccount = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/coa/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete account');
};

// Account suggestions based on type
const getAccountSuggestions = (type: string): string[] => {
  const suggestions: Record<string, string[]> = {
    Asset: [
      "Cash A/c",
      "Bank A/c", 
      "Debtors A/c",
      "Inventory A/c",
      "Fixed Assets A/c",
      "Petty Cash A/c",
      "Prepaid Expenses A/c"
    ],
    Liability: [
      "Creditors A/c",
      "Bank Loan A/c",
      "Outstanding Expenses A/c",
      "Provision for Tax A/c",
      "Accrued Expenses A/c"
    ],
    Income: [
      "Sales Income A/c",
      "Service Income A/c",
      "Interest Income A/c",
      "Commission Income A/c",
      "Other Income A/c"
    ],
    Expense: [
      "Purchases Expense A/c",
      "Office Rent A/c",
      "Salary Expense A/c",
      "Electricity Expense A/c",
      "Travel Expense A/c",
      "Telephone Expense A/c",
      "Stationery Expense A/c"
    ],
    Equity: [
      "Capital A/c",
      "Retained Earnings A/c",
      "Drawings A/c",
      "Share Capital A/c"
    ]
  };
  return suggestions[type] || [];
};

export default function Page() {
  const [rows, setRows] = React.useState<Coa[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Coa | null>(null);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "Asset" },
  });

  // Load accounts on component mount
  React.useEffect(() => {
    loadAccounts();
  }, []);

  React.useEffect(() => {
    if (active) {
      const { id, ...rest } = active;
      form.reset(rest as FormVals);
    } else {
      form.reset({ name: "", type: "Asset" });
    }
  }, [active]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const accounts = await fetchAccounts();
      setRows(accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const save = async (data: FormVals) => {
    try {
      if (!active) return;
      
      if (active.id && rows.some(acc => acc.id === active.id)) {
        // Update existing account
        const updated = await updateAccount(active.id, data);
        setRows(prev => prev.map(acc => acc.id === active.id ? updated : acc));
      } else {
        // Create new account
        const newAccount = await createAccount({ ...data });
        setRows(prev => [newAccount, ...prev]);
      }
      
      setActive(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save account');
      console.error('Error saving account:', err);
    }
  };

  const handleDelete = async (account: Coa) => {
    if (!confirm(`Are you sure you want to delete "${account.name}"?`)) {
      return;
    }
    
    try {
      await deleteAccount(account.id);
      setRows(prev => prev.filter(acc => acc.id !== account.id));
      setActive(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      console.error('Error deleting account:', err);
    }
  };

  const handleNewAccount = () => {
    setActive({ 
      id: crypto.randomUUID(), 
      name: "", 
      type: "Asset" 
    });
  };

  const handleArchive = (account: Coa) => {
    setArchived(prev => ({ ...prev, [account.id]: !prev[account.id] }));
    setActive(null);
  };

  const applySuggestion = (suggestion: string) => {
    form.setValue("name", suggestion);
    setShowSuggestions(false);
  };

  const currentType = form.watch("type");
  const suggestions = getAccountSuggestions(currentType);

  const toolbar = (
    <>
      <ToolbarButton onClick={handleNewAccount}>New</ToolbarButton>
      <ToolbarButton disabled={!active} onClick={form.handleSubmit(save)}>
        Confirm
      </ToolbarButton>
      <ToolbarButton 
        disabled={!active} 
        onClick={() => active && handleArchive(active)}
      >
        Archive
      </ToolbarButton>
      <ToolbarButton 
        disabled={!active} 
        onClick={() => active && handleDelete(active)}
        className="text-red-600 hover:text-red-700"
      >
        Delete
      </ToolbarButton>
      <ToolbarButton onClick={() => setActive(null)}>Home</ToolbarButton>
      <ToolbarButton onClick={() => history.back()}>Back</ToolbarButton>
    </>
  );

  if (loading) {
    return (
      <MasterFrame title="Chart of Accounts" toolbar={toolbar}>
        <Section>
          <div className="flex justify-center items-center h-32">
            Loading accounts...
          </div>
        </Section>
      </MasterFrame>
    );
  }

  // Group accounts by type for better organization
  const groupedAccounts = rows.reduce((acc, account) => {
    if (!archived[account.id]) {
      if (!acc[account.type]) acc[account.type] = [];
      acc[account.type].push(account);
    }
    return acc;
  }, {} as Record<string, Coa[]>);

  // Prepare data for pie chart
  const pieChartData = Object.entries(groupedAccounts).map(([type, accounts]) => ({
    name: type,
    value: accounts.length,
    count: accounts.length
  }));

  // Colors for each account type
  const COLORS = {
    'Asset': '#22c55e',      // Green
    'Liability': '#ef4444',   // Red
    'Income': '#3b82f6',     // Blue
    'Expense': '#f59e0b',    // Orange
    'Equity': '#8b5cf6'      // Purple
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label for slices < 5%
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <MasterFrame title="Chart of Accounts" toolbar={toolbar}>
      {error && (
        <Section>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
            <button 
              onClick={loadAccounts} 
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </Section>
      )}

      {!active ? (
        <Section>
          {/* Dashboard with Chart and Summary */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Account Distribution</h3>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.name as keyof typeof COLORS]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value} account${value !== 1 ? 's' : ''}`, 
                          name
                        ]}
                      />
                      <Legend 
                        formatter={(value: string, entry: any) => 
                          `${value} (${entry.payload.count})`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No accounts to display
                  </div>
                )}
              </div>
            </div>

            {/* Account Type Summary Cards */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Account Summary</h3>
              {["Asset", "Liability", "Income", "Expense", "Equity"].map(type => (
                <div key={type} className="bg-gray-50 p-4 rounded-lg border-l-4" 
                     style={{borderLeftColor: COLORS[type as keyof typeof COLORS]}}>
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-800">{type}</div>
                    <div className="text-xl font-bold" 
                         style={{color: COLORS[type as keyof typeof COLORS]}}>
                      {groupedAccounts[type]?.length || 0}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {type === "Asset" && "Resources owned"}
                    {type === "Liability" && "Debts owed"}
                    {type === "Income" && "Revenue earned"}
                    {type === "Expense" && "Costs incurred"}
                    {type === "Equity" && "Owner's investment"}
                  </div>
                </div>
              ))}
              
              {/* Total Accounts */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-blue-800">Total Accounts</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {rows.filter(r => !archived[r.id]).length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SimpleTable
            columns={[
              { key: "name", title: "Account Name" },
              { key: "type", title: "Type" },
            ]}
            rows={rows.filter((r) => !archived[r.id])}
            onRowClick={(row) => setActive(row)}
          />
        </Section>
      ) : (
        <form className="max-w-3xl space-y-6" onSubmit={(e) => e.preventDefault()}>
          <UnderlineField id="type" label="Account Type">
            <Select
              value={form.watch("type")}
              onValueChange={(v) => {
                form.setValue("type", v as FormVals["type"]);
                form.setValue("name", ""); // Clear name when type changes
                setShowSuggestions(false);
              }}
            >
              <SelectTrigger className="px-0 border-0 shadow-none">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                {["Asset", "Liability", "Expense", "Income", "Equity"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </UnderlineField>

          <div className="relative">
            <UnderlineField id="name" label="Account Name">
              <UnderlineInput 
                id="name" 
                placeholder={`Enter ${currentType.toLowerCase()} account name`}
                {...form.register("name")}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </UnderlineField>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                <div className="p-2 text-xs text-gray-500 border-b">
                  Common {currentType} accounts:
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onMouseDown={() => applySuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Show account type description */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <strong>{currentType} accounts</strong> are used to track{" "}
            {currentType === "Asset" && "resources owned by the business (cash, inventory, equipment)"}
            {currentType === "Liability" && "debts and obligations owed by the business"}
            {currentType === "Income" && "revenue earned by the business"}
            {currentType === "Expense" && "costs incurred in running the business"}
            {currentType === "Equity" && "owner's investment and retained earnings"}
          </div>
        </form>
      )}
    </MasterFrame>
  );
}