import { createPropertyAction } from "@/app/admin/_lib/actions/properties";
import { agentsStore, partnersStore } from "@/app/admin/_lib/store";
import { PageHeader } from "@/app/admin/_components/page-header";
import { PropertyFormWithPreview } from "@/app/admin/(dashboard)/properties/_components/property-form-with-preview";

export default async function NewPropertyPage() {
  const [agents, partners] = await Promise.all([agentsStore.list(), partnersStore.list()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nueva Propiedad" description="Agregá una propiedad al catálogo." />
      <PropertyFormWithPreview
        action={createPropertyAction}
        agents={agents.filter((a) => a.active)}
        partners={partners.filter((p) => p.active)}
      />
    </div>
  );
}
