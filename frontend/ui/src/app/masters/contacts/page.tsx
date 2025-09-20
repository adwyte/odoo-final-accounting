"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MasterFrame, ToolbarButton, SimpleTable, UnderlineField, UnderlineInput, Section } from "@/components/master/ui";
import { Button } from "@/components/ui/button";

type Contact = { id: string; name: string; email: string; phone: string; city?: string; state?: string; pincode?: string; };

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});
type FormVals = z.infer<typeof schema>;

export default function Page() {
  const [rows, setRows] = React.useState<Contact[]>([
    { id:"1", name:"Azure Interior", email:"azure_interior24@example.com", phone:"+91 8080808080", city:"Mumbai" },
    { id:"2", name:"Nimesh Pathak", email:"nimesh@example.com", phone:"+91 9090909090", city:"Surat" },
  ]);
  const [archived, setArchived] = React.useState<Record<string, boolean>>({});
  const [active, setActive] = React.useState<Contact | null>(null);

  const form = useForm<FormVals>({ resolver: zodResolver(schema), defaultValues: { name:"", email:"", phone:"" } });
  React.useEffect(() => { active ? form.reset({ ...active }) : form.reset({ name:"", email:"", phone:"" }); }, [active]); // hydrate

  const save = (data: FormVals) => {
    setRows(prev => {
      if (!active) return prev;
      return prev.some(p => p.id === active.id)
        ? prev.map(p => p.id === active.id ? { ...active, ...data } : p)
        : [{ ...(active as Contact), ...data }, ...prev];
    });
    setActive(null);
  };

  const toolbar = <>
    <ToolbarButton onClick={() => setActive({ id: crypto.randomUUID(), name:"", email:"", phone:"" })}>New</ToolbarButton>
    <ToolbarButton disabled={!active} onClick={form.handleSubmit(save)}>Confirm</ToolbarButton>
    <ToolbarButton disabled={!active} onClick={() => active && (setArchived(a => ({ ...a, [active.id]: !a[active.id] })), setActive(null))}>Archived</ToolbarButton>
    <ToolbarButton onClick={() => setActive(null)}>Home</ToolbarButton>
    <ToolbarButton onClick={() => history.back()}>Back</ToolbarButton>
  </>;

  return (
    <MasterFrame title="Contact Master" toolbar={toolbar}>
      {!active ? (
        <Section>
          <SimpleTable
            columns={[{ key:"name", title:"Contact Name" }, { key:"email", title:"Email" }, { key:"phone", title:"Phone" }, { key:"city", title:"City" }]}
            rows={rows.filter(r => !archived[r.id])}
            onRowClick={setActive}
          />
        </Section>
      ) : (
        <form className="max-w-3xl space-y-6" onSubmit={(e)=>e.preventDefault()}>
          <UnderlineField id="name" label="Contact Name"><UnderlineInput id="name" {...form.register("name")} /></UnderlineField>
          <UnderlineField id="email" label="Email"><UnderlineInput id="email" type="email" {...form.register("email")} /></UnderlineField>
          <UnderlineField id="phone" label="Phone"><UnderlineInput id="phone" {...form.register("phone")} /></UnderlineField>
          <UnderlineField id="addr" label="Address">
            <div className="grid grid-cols-3 gap-4">
              <UnderlineInput placeholder="city" {...form.register("city")} />
              <UnderlineInput placeholder="state" {...form.register("state")} />
              <UnderlineInput placeholder="pincode" {...form.register("pincode")} />
            </div>
          </UnderlineField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div />
            <div className="border-2 border-dashed rounded-xl aspect-[4/3] flex items-center justify-center">
              <Button type="button" variant="outline" size="sm">Upload image</Button>
            </div>
          </div>
        </form>
      )}
    </MasterFrame>
  );
}
