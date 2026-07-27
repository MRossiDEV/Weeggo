"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { propertiesStore } from "@/app/admin/_lib/store";
import { parsePropertyForm, type PropertyFormState } from "@/app/admin/_lib/property-form-parser";
import { notifyNewListings, propertyToListing } from "@/lib/notifications/match";

export async function createPropertyAction(
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const parsed = parsePropertyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const property = await propertiesStore.create(parsed.data);
  revalidatePath("/admin/properties");
  revalidatePath("/admin");

  if (property.status === "published") {
    await notifyMatchingSavedSearches(property);
  }

  redirect("/admin/properties");
}

export async function updatePropertyAction(
  id: string,
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const parsed = parsePropertyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await propertiesStore.get(id);
  const updated = await propertiesStore.update(id, parsed.data);
  if (!updated) return { error: "No se encontró la propiedad." };

  revalidatePath("/admin/properties");
  revalidatePath("/admin");

  // Only a draft/off-market -> published transition is a "new listing" for
  // saved-search alerts — re-saving an already-published property (e.g. a
  // typo fix) shouldn't re-trigger it.
  if (updated.status === "published" && existing?.status !== "published") {
    await notifyMatchingSavedSearches(updated);
  }

  redirect("/admin/properties");
}

async function notifyMatchingSavedSearches(property: Awaited<ReturnType<typeof propertiesStore.get>>) {
  if (!property) return;
  try {
    await notifyNewListings([propertyToListing(property)]);
  } catch (err) {
    console.error("[notifications] failed to notify saved searches for new listing", err);
  }
}

export async function deletePropertyAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await propertiesStore.remove(id);
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
}
