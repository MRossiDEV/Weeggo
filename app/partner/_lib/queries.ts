import { leadsStore, partnersStore, propertiesStore } from "@/app/admin/_lib/store";
import type { Partner, Property } from "@/app/admin/_lib/types";
import { getCurrentPartner } from "./session";

export async function getMyPartnerProperties(): Promise<Property[]> {
  const result = await getCurrentPartner();
  if (result.status !== "ok") return [];

  return propertiesStore.listByPartner(result.partner.id);
}

export async function getMyPartnerProfile(): Promise<Partner | null> {
  const result = await getCurrentPartner();
  if (result.status !== "ok") return null;

  return (await partnersStore.get(result.partner.id)) ?? null;
}

/** Lead count per property, for the dashboard's "Consultas" column. */
export async function getMyLeadCountByProperty(): Promise<Map<string, number>> {
  const properties = await getMyPartnerProperties();
  const leads = await leadsStore.listByPropertyIds(properties.map((p) => p.id));

  const counts = new Map<string, number>();
  for (const lead of leads) {
    if (!lead.propertyId) continue;
    counts.set(lead.propertyId, (counts.get(lead.propertyId) ?? 0) + 1);
  }
  return counts;
}
