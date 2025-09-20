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

export default function Page() {
  const [rows, setRows] = React.useState<Coa[]>([
    { id: "c1", name: "Cash A/c", type: "Asset" },
    { id: "c2", name: "Bank A/c", type: "Asset" },
    { id: "c3", name: "Sales Income A/c", type: "Income" },
    { id: "c4", name: "Purchases Expense A/c", type: "Expense" },
    { id: "c5", name: "Creditors A/c", type: "Liability" },
  ]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Coa | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "Asset" },
  });

  React.useEffect(() => {
    if (active) {
      const { id, ...rest } = active;
      form.reset(rest as FormVals);
    } else {
      form.reset({ name: "", type: "Asset" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const save = (data: FormVals) => {
    setRows((prev) => {
      if (!active) return prev;
      const exists = prev.some((p) => p.id === active.id);
      return exists
        ? prev.map((p) => (p.id === active.id ? { ...active, ...data } : p))
        : [{ ...(active as Coa), ...data }, ...prev];
    });
    setActive(null);
  };

  const toolbar = (
    <>
      <ToolbarButton onClick={() => setActive({ id: crypto.randomUUID(), name: "", type: "Asset" })}>
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
    <MasterFrame title="Chart of Accounts" toolbar={toolbar}>
      {!active ? (
        <Section>
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
          <UnderlineField id="name" label="Account Name">
            <UnderlineInput id="name" placeholder="Sales Income A/c" {...form.register("name")} />
          </UnderlineField>

          <UnderlineField id="type" label="Type">
            <Select
              value={form.watch("type")}
              onValueChange={(v) => form.setValue("type", v as FormVals["type"])}
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
        </form>
      )}
    </MasterFrame>
  );
}
