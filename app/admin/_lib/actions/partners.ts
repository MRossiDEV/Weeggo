"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { partnersStore } from "@/app/admin/_lib/store";
import { sendAccountInviteEmail } from "@/lib/email/invite-email";

export interface PartnerFormState {
  error?: string;
}

function parsePartnerForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || "Uruguay";
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!name || !email) {
    return { error: "Completá nombre y email del partner." } as const;
  }

  return { data: { name, contactName, email, phone, country, city, address, notes, active } } as const;
}

export async function createPartnerAction(
  _prevState: PartnerFormState,
  formData: FormData
): Promise<PartnerFormState> {
  const parsed = parsePartnerForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const partner = await partnersStore.create(parsed.data);
  if (partner.email) {
    await sendAccountInviteEmail("partner", partner.id, partner.name, partner.email);
  }
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function updatePartnerAction(
  id: string,
  _prevState: PartnerFormState,
  formData: FormData
): Promise<PartnerFormState> {
  const parsed = parsePartnerForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await partnersStore.update(id, parsed.data);
  if (!updated) return { error: "No se encontró el partner." };

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deletePartnerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await partnersStore.remove(id);
  revalidatePath("/admin/partners");
}
