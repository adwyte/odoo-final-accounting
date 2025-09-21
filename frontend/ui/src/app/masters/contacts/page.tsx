"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// your master ui pieces (unchanged)
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
  city?: string;
  state?: string;
  pincode?: string;
};

const schema = z.object({
  name: z.string().min(2, "Name looks too short"),
  email: z.string().email("Use a valid email"),
  phone: z.string().min(7, "Phone looks too short"),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});
type FormVals = z.infer<typeof schema>;

export default function Page() {
  const [rows, setRows] = React.useState<Contact[]>([
    { id: "1", name: "Azure Interior", email: "azure_interior24@example.com", phone: "+91 8080808080", city: "Mumbai" },
    { id: "2", name: "Nimesh Pathak", email: "nimesh@example.com", phone: "+91 9090909090", city: "Surat" },
  ]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Contact | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  React.useEffect(() => {
    if (active) {
      form.reset({ ...active });
    } else {
      form.reset({ name: "", email: "", phone: "", city: "", state: "", pincode: "" });
    }
  }, [active, form]);

  const save = (data: FormVals) => {
    setRows((prev) => {
      if (!active) return prev;
      return prev.some((p) => p.id === active.id)
        ? prev.map((p) => (p.id === active.id ? { ...active, ...data } : p))
        : [{ ...(active as Contact), ...data }, ...prev];
    });
    setActive(null);
  };

  const toolbar = (
    <>
      <ToolbarButton onClick={() => setActive({ id: crypto.randomUUID(), name: "", email: "", phone: "" })}>
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
    <MasterFrame title="Contact Master" toolbar={toolbar}>
      {!active ? (
        // ——— LIST VIEW (same alignment, just wrapped in a neat card) ———
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="px-5 py-4 border-b">
              <h3 className="text-base font-medium">Contacts</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Click a row to open the form view. ({rows.filter((r) => !archived[r.id]).length} active)
              </p>
            </div>

            <div className="p-0">
              <SimpleTable
                columns={[
                  { key: "name", title: "Contact Name" },
                  { key: "email", title: "Email" },
                  { key: "phone", title: "Phone" },
                  { key: "city", title: "City" },
                ]}
                rows={rows.filter((r) => !archived[r.id])}
                onRowClick={setActive}
              />
            </div>

            <div className="px-5 py-3 border-t text-xs text-muted-foreground">
              Tip: Use the toolbar above to create or archive a contact.
            </div>
          </div>
        </Section>
      ) : (
        // ——— FORM VIEW (same layout, refined borders + spacing) ———
        <Section>
          <div className="rounded-2xl border bg-white shadow-sm">
            {/* Header strip */}
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">
                  {rows.some((r) => r.id === active.id) ? "Edit Contact" : "New Contact"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill in the details and click <span className="font-medium">Confirm</span>.
                </p>
              </div>
              <div className="text-[11px] text-muted-foreground">
                ID: <span className="font-mono">{active.id.slice(0, 8)}</span>
              </div>
            </div>

            <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UnderlineField id="name" label="Contact Name">
                  <UnderlineInput id="name" {...form.register("name")} />
                </UnderlineField>

                <UnderlineField id="phone" label="Phone">
                  <UnderlineInput id="phone" {...form.register("phone")} />
                </UnderlineField>

                <UnderlineField id="email" label="Email">
                  <UnderlineInput id="email" type="email" {...form.register("email")} />
                </UnderlineField>

                {/* Upload area kept where it was, just nicer */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Profile Image</div>
                  <div className="border-2 border-dashed rounded-xl aspect-[4/3] grid place-items-center">
                    <div className="text-center">
                      <Button type="button" variant="outline" size="sm">
                        Upload image
                      </Button>
                      <p className="text-[11px] text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <UnderlineField id="addr" label="Address">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UnderlineInput placeholder="City" {...form.register("city")} />
                  <UnderlineInput placeholder="State" {...form.register("state")} />
                  <UnderlineInput placeholder="Pincode" {...form.register("pincode")} />
                </div>
              </UnderlineField>

              {/* subtle footer bar to mirror the list card */}
              <div className="px-0 pt-2">
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
