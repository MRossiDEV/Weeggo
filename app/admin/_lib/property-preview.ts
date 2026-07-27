import type { PropertyType } from "@/app/admin/_lib/types";

/**
 * A live, best-effort snapshot of the property form for the preview panel —
 * unlike parsePropertyForm (property-form-parser.ts), this never fails or
 * requires valid data. It's read on every keystroke while the admin/partner
 * is still mid-edit, so it always returns something displayable (a blank
 * title shows a placeholder, no image shows an empty frame) instead of an
 * error.
 */
export interface PropertyPreviewData {
  title: string;
  city: string;
  locality: string;
  department: string;
  description: string;
  price: number;
  rentPrice: number | null;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  propertyType: PropertyType;
  tags: string[];
  badges: string[];
  image: string;
  images: string[];
  featured: boolean;
}

function numberOr(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function buildPropertyPreview(formData: FormData): PropertyPreviewData {
  const rentPriceRaw = String(formData.get("rentPrice") ?? "").trim();

  return {
    title: String(formData.get("title") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    locality: String(formData.get("locality") ?? "").trim(),
    department: String(formData.get("department") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: numberOr(formData.get("price"), 0),
    rentPrice: rentPriceRaw === "" ? null : numberOr(formData.get("rentPrice"), 0),
    bedrooms: numberOr(formData.get("bedrooms"), 0),
    bathrooms: numberOr(formData.get("bathrooms"), 0),
    areaM2: numberOr(formData.get("areaM2"), 0),
    propertyType: (String(formData.get("propertyType") ?? "apartment") as PropertyType) || "apartment",
    tags: formData.getAll("tags").map((tag) => String(tag)),
    badges: formData.getAll("badges").map((badge) => String(badge)),
    image: String(formData.get("image") ?? "").trim(),
    images: formData
      .getAll("images")
      .map((url) => String(url).trim())
      .filter(Boolean),
    featured: formData.get("featured") === "on",
  };
}
