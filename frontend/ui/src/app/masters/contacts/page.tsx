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

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  type: "customer" | "vendor";
  city?: string;
  state?: string;
  pincode?: string;
};

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().optional(),
  type: z.enum(["customer", "vendor"]),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

type FormVals = z.infer<typeof schema>;

const API_BASE = "http://localhost:8001/contacts";

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function Page() {
  const [rows, setRows] = React.useState<Contact[]>([]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Contact | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", type: "customer" },
  });

  React.useEffect(() => {
    active
      ? form.reset({ ...active })
      : form.reset({ name: "", email: "", phone: "", type: "customer" });
  }, [active]);

  React.useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data: Contact[] = await res.json();
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const save = async (data: FormVals) => {
    try {
      if (!active) return;

      const payload = {
        ...data,
        address: `${data.city || ""} ${data.state || ""} ${data.pincode || ""}`.trim(),
      };

      let savedContact: Contact;

      if (rows.some((p) => p.id === active.id)) {
        const res = await fetch(`${API_BASE}/${active.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update contact");
        savedContact = await res.json();
      } else {
        const res = await fetch(`${API_BASE}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create contact");
        savedContact = await res.json();
      }

      setRows((prev) =>
        prev.some((p) => p.id === savedContact.id)
          ? prev.map((p) => (p.id === savedContact.id ? savedContact : p))
          : [savedContact, ...prev]
      );

      setActive(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to save contact");
    }
  };

  const toolbar = (
    <>
      <ToolbarButton
        onClick={() =>
          setActive({
            id: generateUUID(),
            name: "",
            email: "",
            phone: "",
            type: "customer",
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
        onClick={() =>
          active &&
          (setArchived((a) => ({ ...a, [active.id]: !a[active.id] })),
          setActive(null))
        }
      >
        Archived
      </ToolbarButton>
      <ToolbarButton onClick={() => setActive(null)}>Home</ToolbarButton>
      <ToolbarButton onClick={() => history.back()}>Back</ToolbarButton>
    </>
  );

  if (loading)
    return (
      <MasterFrame title="Contact Master" toolbar={toolbar}>
        <Section>
          <div className="flex justify-center items-center h-32">
            Loading contacts...
          </div>
        </Section>
      </MasterFrame>
    );

  return (
    <MasterFrame title="Contact Master" toolbar={toolbar}>
      {error && (
        <Section>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}{" "}
            <button
              onClick={loadContacts}
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
              { key: "name", title: "Contact Name" },
              { key: "email", title: "Email" },
              { key: "phone", title: "Phone" },
              { key: "type", title: "Type" },
              { key: "address", title: "Address" },
            ]}
            rows={rows.filter((r) => !archived[r.id])}
            onRowClick={setActive}
          />
        </Section>
      ) : (
        <form
          className="max-w-3xl space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <UnderlineField id="name" label="Contact Name">
            <UnderlineInput id="name" {...form.register("name")} />
          </UnderlineField>
          <UnderlineField id="email" label="Email">
            <UnderlineInput id="email" type="email" {...form.register("email")} />
          </UnderlineField>
          <UnderlineField id="phone" label="Phone">
            <UnderlineInput id="phone" {...form.register("phone")} />
          </UnderlineField>

          <UnderlineField id="type" label="Contact Type">
            <select
              {...form.register("type")}
              className="border-b border-gray-400 focus:outline-none p-1"
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </UnderlineField>

          <UnderlineField id="addr" label="Address">
            <div className="grid grid-cols-3 gap-4">
              <UnderlineInput placeholder="city" {...form.register("city")} />
              <UnderlineInput placeholder="state" {...form.register("state")} />
              <UnderlineInput placeholder="pincode" {...form.register("pincode")} />
            </div>
          </UnderlineField>
        </form>
      )}
    </MasterFrame>
  );
}
