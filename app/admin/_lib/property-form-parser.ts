import type { PropertyStatus, PropertyType } from "@/app/admin/_lib/types";

// Plain helper (no "use server") shared by app/admin/_lib/actions/properties.ts
// and app/partner/_lib/actions/properties.ts — a "use server" file requires
// every export to be an async Server Action, so this synchronous parser
// can't live there directly.

const PROPERTY_TYPES: PropertyType[] = ["apartment", "house", "ph", "loft"];

export interface PropertyFormState {
  error?: string;
}

export function parsePropertyForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || "Uruguay";
  const departmentRaw = String(formData.get("department") ?? "").trim();
  const department = departmentRaw === "" ? null : departmentRaw;
  const localityRaw = String(formData.get("locality") ?? "").trim();
  const locality = localityRaw === "" ? null : localityRaw;
  const city = String(formData.get("city") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const areaM2 = Number(formData.get("areaM2"));
  const badges = formData.getAll("badges").map((badge) => String(badge).trim()).filter(Boolean);
  const image = String(formData.get("image") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as PropertyStatus;
  const featured = formData.get("featured") === "on";
  const propertyType = String(formData.get("propertyType") ?? "apartment") as PropertyType;
  const rentPriceRaw = String(formData.get("rentPrice") ?? "").trim();
  const rentPrice = rentPriceRaw === "" ? null : Number(rentPriceRaw);
  const tags = formData.getAll("tags").map((tag) => String(tag).trim()).filter(Boolean);
  const images = formData
    .getAll("images")
    .map((url) => String(url).trim())
    .filter(Boolean);
  const agentIdRaw = String(formData.get("agentId") ?? "");
  const agentId = agentIdRaw === "" || agentIdRaw === "none" ? null : agentIdRaw;
  const partnerIdRaw = String(formData.get("partnerId") ?? "");
  const partnerId = partnerIdRaw === "" || partnerIdRaw === "none" ? null : partnerIdRaw;

  if (!title || !city || !description || !image) {
    return { error: "Completá título, ciudad, descripción e imagen." } as const;
  }
  if (!Number.isFinite(price) || !Number.isFinite(bedrooms) || !Number.isFinite(bathrooms) || !Number.isFinite(areaM2)) {
    return { error: "Precio, dormitorios, baños y superficie deben ser números válidos." } as const;
  }
  if (!PROPERTY_TYPES.includes(propertyType)) {
    return { error: "Tipo de propiedad inválido." } as const;
  }
  if (rentPrice !== null && !Number.isFinite(rentPrice)) {
    return { error: "El alquiler mensual debe ser un número válido." } as const;
  }

  return {
    data: {
      title,
      country,
      department,
      locality,
      city,
      description,
      price,
      currency: "USD" as const,
      bedrooms,
      bathrooms,
      areaM2,
      badges,
      tags,
      image,
      images,
      status,
      featured,
      propertyType,
      rentPrice,
      agentId,
      partnerId,
    },
  } as const;
}
