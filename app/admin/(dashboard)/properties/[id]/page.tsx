import { notFound } from "next/navigation";

import { agentsStore, partnersStore, propertiesStore } from "@/app/admin/_lib/store";
import { updatePropertyAction } from "@/app/admin/_lib/actions/properties";
import { PageHeader } from "@/app/admin/_components/page-header";
import { PropertyFormWithPreview } from "@/app/admin/(dashboard)/properties/_components/property-form-with-preview";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, agents, partners] = await Promise.all([
    propertiesStore.get(id),
    agentsStore.list(),
    partnersStore.list(),
  ]);
  if (!property) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={property.title} description="Editá los detalles de la propiedad." />
      <PropertyFormWithPreview
        action={updatePropertyAction.bind(null, id)}
        property={property}
        agents={agents.filter((a) => a.active || a.id === property.agentId)}
        partners={partners.filter((p) => p.active || p.id === property.partnerId)}
      />
    </div>
  );
}
