import { getMyPartnerProfile } from "@/app/partner/_lib/queries";
import { PageHeader } from "@/app/admin/_components/page-header";
import { ProfileForm } from "./_components/profile-form";

export default async function PartnerProfilePage() {
  const partner = await getMyPartnerProfile();

  if (!partner) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mi Perfil" description="Gestioná tu información de contacto." />
      <ProfileForm partner={partner} />
    </div>
  );
}
