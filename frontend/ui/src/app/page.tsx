// Home (server component)
import TopMenu from "@/components/home/TopMenu";
import KPIs from "@/components/home/KPIs";

// Example data – replace with API later
const kpiData = {
  invoice: { d1: 0, d7: 23610, d30: 23610, delta: -12.2 },
  purchase: { d1: 0, d7: 17857, d30: 17857, delta: -8.33 },
  payment: { d1: 0, d7: 5752, d30: 5752, delta: -80.0 },
};

export default function Home() {
  return (
    <div className="space-y-10">
      <TopMenu />
      <KPIs
        title="Dashboard"
        groups={[
          { label: "Total Invoice", ...kpiData.invoice },
          { label: "Total Purchase", ...kpiData.purchase },
          { label: "Total Payment", ...kpiData.payment },
        ]}
      />
    </div>
  );
}
