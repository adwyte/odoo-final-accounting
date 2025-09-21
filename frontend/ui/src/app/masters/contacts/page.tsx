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
import { Button } from "@/components/ui/button";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "customer" | "vendor";
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

const schema = z.object({
  name: z.string().min(2, "Name looks too short"),
  email: z.string().email("Use a valid email"),
  phone: z.string().min(7, "Phone looks too short"),
  type: z.enum(["customer", "vendor"]),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});
type FormVals = z.infer<typeof schema>;

const API_BASE = "http://localhost:8001/contacts";

// small UUID helper (no crypto dependency surprises on some browsers)
const generateUUID = (): string =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

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

  // hydrate form when switching modes
  React.useEffect(() => {
    active
      ? form.reset({
          name: active.name ?? "",
          email: active.email ?? "",
          phone: active.phone ?? "",
          type: active.type ?? "customer",
          city: active.city ?? "",
          state: active.state ?? "",
          pincode: active.pincode ?? "",
        })
      : form.reset({ name: "", email: "", phone: "", type: "customer" });
  }, [active, form]);

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
      setRows(data ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const save = async (data: FormVals) => {
    try {
      if (!active) return;
      // Compose a simple address string from city/state/pincode (backend can store a single field).
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
        address: [data.city, data.state, data.pincode].filter(Boolean).join(", "),
      };

      let saved: Contact;

      // Update if it already exists, else create.
      if (rows.some((r) => r.id === active.id)) {
        const res = await fetch(`${API_BASE}/${active.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update contact");
        saved = await res.json();
      } else {
        const res = await fetch(`${API_BASE}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create contact");
        saved = await res.json();
      }

      setRows((prev) =>
        prev.some((p) => p.id === saved.id)
          ? prev.map((p) => (p.id === saved.id ? saved : p))
          : [saved, ...prev]
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

  if (loading) {
    return (
      <MasterFrame title="Contact Master" toolbar={toolbar}>
        <Section>
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Loading contacts…
          </div>
        </Section>
      </MasterFrame>
    );
  }

  return (
    <MasterFrame title="Contact Master" toolbar={toolbar}>
      {error && (
        <Section>
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Error: {error}{" "}
            <button className="ml-4 underline hover:no-underline" onClick={loadContacts}>
              Retry
            </button>
          </div>
        </Section>
      )}

      {!active ? (
        // ——— LIST VIEW (same alignment; wrapped in a clean card) ———
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h3 className="text-base font-medium">Contacts</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Click a row to open the form view. (
                {rows.filter((r) => !archived[r.id]).length} active)
              </p>
            </div>

            <SimpleTable
              columns={[
                { key: "name", title: "Contact Name" },
                { key: "email", title: "Email" },
                { key: "phone", title: "Phone" },
                { key: "type", title: "Type" },
                { key: "address", title: "Address" },
              ]}
              rows={rows.filter((r) => !archived[r.id])}
              onRowClick={(row) => {
                // If the backend stores a single address string, you can split it later if needed.
                setActive({
                  ...row,
                  city: "",
                  state: "",
                  pincode: "",
                });
              }}
            />

            <div className="border-t px-5 py-3 text-xs text-muted-foreground">
              Tip: Use the toolbar above to create or archive a contact.
            </div>
          </div>
        </Section>
      ) : (
        // ——— FORM VIEW (same fields, polished chrome) ———
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-base font-medium">
                  {rows.some((r) => r.id === active.id) ? "Edit Contact" : "New Contact"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fill in the details and click <span className="font-medium">Confirm</span>.
                </p>
              </div>
              <div className="text-[11px] text-muted-foreground">
                ID: <span className="font-mono">{active.id.slice(0, 8)}</span>
              </div>
            </div>

            <form className="space-y-6 p-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <UnderlineField id="name" label="Contact Name">
                  <UnderlineInput id="name" {...form.register("name")} />
                </UnderlineField>

                <UnderlineField id="phone" label="Phone">
                  <UnderlineInput id="phone" {...form.register("phone")} />
                </UnderlineField>

                <UnderlineField id="email" label="Email">
                  <UnderlineInput id="email" type="email" {...form.register("email")} />
                </UnderlineField>

                <UnderlineField id="type" label="Contact Type">
                  <select
                    {...form.register("type")}
                    className="w-full border-b border-gray-400 p-1 outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </UnderlineField>

                {/* Upload area (kept, just nicer) */}
                <div>
                  <div className="mb-2 text-xs text-muted-foreground">Profile Image</div>
                  <div className="grid aspect-[4/3] place-items-center rounded-xl border-2 border-dashed">
                    <div className="text-center">
                      <Button type="button" variant="outline" size="sm">
                        Upload image
                      </Button>
                      <p className="mt-1 text-[11px] text-muted-foreground">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <UnderlineField id="addr" label="Address">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <UnderlineInput placeholder="City" {...form.register("city")} />
                  <UnderlineInput placeholder="State" {...form.register("state")} />
                  <UnderlineInput placeholder="Pincode" {...form.register("pincode")} />
                </div>
              </UnderlineField>

              <div className="pt-2">
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setActive(null)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={form.handleSubmit(save)}>
                    Save Contact
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Section>
      )}
    </MasterFrame>
  );
}
