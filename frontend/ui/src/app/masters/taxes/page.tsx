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
};

const schema = z.object({
  name: z.string().min(1),
  method: z.enum(["Percentage", "Fixed"]),
  appliesTo: z.enum(["Sales", "Purchase"]),
  value: z.coerce.number().nonnegative(),
});
type FormVals = z.infer<typeof schema>;

export default function Page() {
  const [rows, setRows] = React.useState<Tax[]>([
    { id: "t1", name: "GST 5%", method: "Percentage", appliesTo: "Sales", value: 5 },
    { id: "t2", name: "GST 10%", method: "Percentage", appliesTo: "Purchase", value: 10 },
  ]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Tax | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", method: "Percentage", appliesTo: "Sales", value: 0 },
  });

  // hydrate form when switching list <-> form
  React.useEffect(() => {
    if (active) {
      const { id, ...rest } = active;
      form.reset(rest as FormVals);
    } else {
      form.reset({ name: "", method: "Percentage", appliesTo: "Sales", value: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const save = (data: FormVals) => {
    setRows((prev) => {
      if (!active) return prev;
      const exists = prev.some((p) => p.id === active.id);
      return exists
        ? prev.map((p) => (p.id === active.id ? { ...active, ...data } : p))
        : [{ ...(active as Tax), ...data }, ...prev];
    });
    setActive(null);
  };

  const toolbar = (
    <>
      <ToolbarButton onClick={() => setActive({ id: crypto.randomUUID(), name: "", method: "Percentage", appliesTo: "Sales", value: 0 })}>
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
