"use server";

import { revalidatePath } from "next/cache";

import { partnersStore } from "@/app/admin/_lib/store";
import { getCurrentPartner } from "@/app/partner/_lib/session";

export interface PartnerProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateMyPartnerProfileAction(
  _prevState: PartnerProfileFormState,
  formData: FormData
): Promise<PartnerProfileFormState> {
  const result = await getCurrentPartner();
  if (result.status !== "ok") {
    return { error: "No autorizado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || "Uruguay";
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  await partnersStore.updateProfile(result.partner.id, { name, contactName, phone, country, city, address });

  revalidatePath("/partner/profile");
  revalidatePath("/partner");
  return { success: true };
}
