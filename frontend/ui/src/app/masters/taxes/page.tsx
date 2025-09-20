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

type Tax = {
  id: string;
  name: string;
  method: "Percentage" | "Fixed";
  appliesTo: "Sales" | "Purchase";
  value: number;
  archived?: boolean;
};

const schema = z.object({
  name: z.string().min(1),
  method: z.enum(["Percentage", "Fixed"]),
  appliesTo: z.enum(["Sales", "Purchase"]),
  value: z.coerce.number().nonnegative(),
});
type FormVals = z.infer<typeof schema>;

const API_BASE = "http://localhost:8000";

export default function Page() {
  const [rows, setRows] = React.useState<Tax[]>([]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Tax | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", method: "Percentage", appliesTo: "Sales", value: 0 },
  });

  // Load taxes from API
  const fetchTaxes = async (includeArchived = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/taxes?include_archived=${includeArchived}`);
      if (!res.ok) throw new Error(`Error fetching taxes: ${res.statusText}`);
      const data: Tax[] = await res.json();
      setRows(data);
      // Update archived state from fetched data
      const archMap: Record<string, boolean> = {};
      data.forEach((tax) => (archMap[tax.id] = !!tax.archived));
      setArchived(archMap);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTaxes(false);
  }, []);

  React.useEffect(() => {
    if (active) {
      const { id, archived, ...rest } = active;
      form.reset(rest as FormVals);
    } else {
      form.reset({ name: "", method: "Percentage", appliesTo: "Sales", value: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Create or update tax API call
  const save = async (data: FormVals) => {
    if (!active) return;
    setLoading(true);
    setError(null);
    try {
      let updatedTax: Tax;
      if (rows.find((t) => t.id === active.id)) {
        // Update existing tax
        const res = await fetch(`${API_BASE}/taxes/${active.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
        updatedTax = await res.json();
        setRows((prev) => prev.map((t) => (t.id === active.id ? updatedTax : t)));
      } else {
        // Create new tax
        const res = await fetch(`${API_BASE}/taxes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Create failed: ${res.statusText}`);
        updatedTax = await res.json();
        setRows((prev) => [updatedTax, ...prev]);
      }
      setActive(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle archive API call
  const toggleArchive = async () => {
    if (!active) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/taxes/${active.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Archive toggle failed: ${res.statusText}`);
      const updatedTax: Tax = await res.json();
      setRows((prev) => prev.map((t) => (t.id === active.id ? updatedTax : t)));
      setArchived((a) => ({ ...a, [active.id]: updatedTax.archived ?? false }));
      setActive(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toolbar = (
    <>
      <ToolbarButton
        onClick={() =>
          setActive({
            id: crypto.randomUUID(),
            name: "",
            method: "Percentage",
            appliesTo: "Sales",
            value: 0,
          })
        }
      >
        New
      </ToolbarButton>
      <ToolbarButton disabled={!active || loading} onClick={form.handleSubmit(save)}>
        Confirm
      </ToolbarButton>
      <ToolbarButton disabled={!active || loading} onClick={toggleArchive}>
        Archived
      </ToolbarButton>
      <ToolbarButton onClick={() => setActive(null)}>Home</ToolbarButton>
      <ToolbarButton onClick={() => history.back()}>Back</ToolbarButton>
    </>
  );

  return (
    <MasterFrame title="Taxes Master" toolbar={toolbar}>
      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          <strong>Error: </strong>
          {error}
        </div>
      )}

      {loading && <div>Loading...</div>}

      {!active ? (
        <Section>
          <SimpleTable
            columns={[
              { key: "name", title: "Tax Name" },
              { key: "method", title: "Computation" },
              { key: "appliesTo", title: "For" },
              { key: "value", title: "Value" },
            ]}
            rows={rows.filter((r) => !archived[r.id])}
            onRowClick={(row) => setActive(row)}
          />
        </Section>
      ) : (
        <form className="max-w-3xl space-y-6" onSubmit={(e) => e.preventDefault()}>
          <UnderlineField id="name" label="Tax Name">
            <UnderlineInput id="name" placeholder="GST 5%" {...form.register("name")} />
          </UnderlineField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            <UnderlineField id="method" label="Tax Computation">
              <Select
                value={form.watch("method")}
                onValueChange={(v) => form.setValue("method", v as FormVals["method"])}
              >
                <SelectTrigger className="px-0 border-0 shadow-none">
                  <SelectValue placeholder="Percentage or Fixed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">% Percentage</SelectItem>
                  <SelectItem value="Fixed">₹ Fixed Value</SelectItem>
                </SelectContent>
              </Select>
            </UnderlineField>

            <UnderlineField id="appliesTo" label="Tax for">
              <Select
                value={form.watch("appliesTo")}
                onValueChange={(v) => form.setValue("appliesTo", v as FormVals["appliesTo"])}
              >
                <SelectTrigger className="px-0 border-0 shadow-none">
                  <SelectValue placeholder="Sales/Purchase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </UnderlineField>

            <UnderlineField id="value" label="Value">
              <UnderlineInput
                id="value"
                type="number"
                step="0.01"
                placeholder="e.g., 5 or 50.00"
                {...form.register("value")}
              />
            </UnderlineField>
          </div>
        </form>
      )}
    </MasterFrame>
  );
}
