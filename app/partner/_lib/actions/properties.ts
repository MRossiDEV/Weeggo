"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { propertiesStore } from "@/app/admin/_lib/store";
import { parsePropertyForm, type PropertyFormState } from "@/app/admin/_lib/property-form-parser";
import { getCurrentPartner } from "@/app/partner/_lib/session";

// The partner form never renders status/featured/agentId/partnerId fields,
// but parsePropertyForm still reads them from formData with safe defaults
// when absent (status -> "draft", featured -> false, agentId/partnerId ->
// null) — this still explicitly overrides all four rather than trusting
// that, since a crafted POST could include them even without the UI.

export async function createMyPropertyAction(
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const result = await getCurrentPartner();
  if (result.status !== "ok") {
    return { error: "No autorizado." };
  }

  const parsed = parsePropertyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await propertiesStore.create({
    ...parsed.data,
    status: "draft",
    featured: false,
    agentId: null,
    partnerId: result.partner.id,
  });

  revalidatePath("/partner");
  redirect("/partner");
}

export async function updateMyPropertyAction(
  id: string,
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const result = await getCurrentPartner();
  if (result.status !== "ok") {
    return { error: "No autorizado." };
  }

  const existing = await propertiesStore.get(id);
  if (!existing || existing.partnerId !== result.partner.id) {
    return { error: "No se encontró la propiedad." };
  }

  const parsed = parsePropertyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await propertiesStore.update(id, {
    ...parsed.data,
    status: existing.status,
    featured: existing.featured,
    agentId: existing.agentId,
    partnerId: existing.partnerId,
  });

  revalidatePath("/partner");
  redirect("/partner");
}
