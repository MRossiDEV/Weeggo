import { PageHeader } from "@/app/admin/_components/page-header";
import { PropertyFormWithPreview } from "@/app/admin/(dashboard)/properties/_components/property-form-with-preview";
import { createMyPropertyAction } from "@/app/partner/_lib/actions/properties";

export default function NewPartnerPropertyPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nueva Propiedad"
        description="Se guarda como borrador hasta que un administrador la revise y publique."
      />
      <PropertyFormWithPreview
        action={createMyPropertyAction}
        variant="partner"
        backHref="/partner"
        backLabel="Volver a Mis Propiedades"
      />
    </div>
  );
}
