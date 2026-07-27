import { notFound } from "next/navigation";

import { getCurrentPartner } from "@/app/partner/_lib/session";
import { propertiesStore } from "@/app/admin/_lib/store";
import { updateMyPropertyAction } from "@/app/partner/_lib/actions/properties";
import { PageHeader } from "@/app/admin/_components/page-header";
import { PropertyFormWithPreview } from "@/app/admin/(dashboard)/properties/_components/property-form-with-preview";

export default async function EditPartnerPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCurrentPartner();
  if (result.status !== "ok") notFound();

  const property = await propertiesStore.get(id);
  if (!property || property.partnerId !== result.partner.id) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={property.title} description="Editá los detalles de tu propiedad." />
      <PropertyFormWithPreview
        action={updateMyPropertyAction.bind(null, id)}
        property={property}
        variant="partner"
        backHref="/partner"
        backLabel="Volver a Mis Propiedades"
      />
    </div>
  );
}
