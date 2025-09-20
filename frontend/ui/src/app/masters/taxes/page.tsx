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

// Frontend Tax type
type Tax = {
  id: string;
  name: string;
  method: "Percentage" | "Fixed";
  type: "Sales" | "Purchase"; // matches backend
  rate: number;              // matches backend
};

// Form schema
const schema = z.object({
  name: z.string().min(1),
  method: z.enum(["Percentage", "Fixed"]),
  type: z.enum(["Sales", "Purchase"]),
  rate: z.coerce.number().nonnegative(),
});
type FormVals = z.infer<typeof schema>;

export default function Page() {
  const [rows, setRows] = React.useState<Tax[]>([]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Tax | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", method: "Percentage", type: "Sales", rate: 0 },
  });

  // Fetch taxes from API
  React.useEffect(() => {
    fetch("http://localhost:8001/taxes/")
      .then((res) => res.json())
      .then((data: Tax[]) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to fetch taxes:", err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Reset form when switching active
  React.useEffect(() => {
    if (active) {
      const { id, ...rest } = active;
      form.reset(rest as FormVals);
    } else {
      form.reset({ name: "", method: "Percentage", type: "Sales", rate: 0 });
    }
  }, [active]);

  // Save handler (maps frontend form to backend fields)
  const save = async (data: FormVals) => {
    try {
      const payload = {
        ...data, // name, method, type, rate
      };

      const res = await fetch("http://localhost:8001/taxes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create tax");

      const saved: Tax = await res.json();

      setRows((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
      });
      setActive(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save tax. See console for details.");
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
            type: "Sales",
            rate: 0,
          })
        }
      >
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
    <MasterFrame title="Taxes Master" toolbar={toolbar}>
      {loading ? (
        <Section>
          <p>Loading taxes...</p>
        </Section>
      ) : !active ? (
        <Section>
          <SimpleTable
            columns={[
              { key: "name", title: "Tax Name" },
              { key: "method", title: "Computation" },
              { key: "type", title: "For" },
              { key: "rate", title: "Value" },
            ]}
            rows={(rows || []).filter((r) => !archived[r.id])}
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

            <UnderlineField id="type" label="Tax for">
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as FormVals["type"])}
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

            <UnderlineField id="rate" label="Value">
              <UnderlineInput
                id="rate"
                type="number"
                step="0.01"
                placeholder="e.g., 5 or 50.00"
                {...form.register("rate")}
              />
            </UnderlineField>
          </div>
        </form>
      )}
    </MasterFrame>
  );
}
