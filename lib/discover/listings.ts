import { cache } from "react";

import { supabasePublic } from "@/lib/supabase/public";
import type { PropertyType } from "@/app/admin/_lib/types";
import type { Listing } from "./types";

type PublishedPropertyRow = {
  id: string;
  title: string;
  city: string;
  locality: string | null;
  department: string | null;
  description: string;
  price: number;
  rent_price: number | null;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  property_type: PropertyType;
  tags: string[] | null;
  cover_image_url: string;
  badges: string[] | null;
  featured: boolean;
};

type PropertyImageRow = {
  property_id: string;
  url: string;
  sort_order: number;
};

/**
 * All published listings for the Discover deck / shortlist / compare.
 * Wrapped in React's cache() so app/(app)/layout.tsx and its child pages can
 * each call this within one request without re-querying Supabase per page.
 */
export const getPublishedListings = cache(async (): Promise<Listing[]> => {
  const [{ data: properties, error: propertiesError }, { data: images, error: imagesError }] =
    await Promise.all([
      supabasePublic
        .from("weeggo_properties")
        .select(
          "id, title, city, locality, department, description, price, rent_price, bedrooms, bathrooms, area_m2, property_type, tags, cover_image_url, badges, featured"
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false }),
      supabasePublic
        .from("weeggo_property_images")
        .select("property_id, url, sort_order")
        .order("sort_order", { ascending: true }),
    ]);

  if (propertiesError) throw new Error(propertiesError.message);
  if (imagesError) throw new Error(imagesError.message);

  const galleryByProperty = new Map<string, string[]>();
  for (const row of (images ?? []) as PropertyImageRow[]) {
    const existing = galleryByProperty.get(row.property_id) ?? [];
    existing.push(row.url);
    galleryByProperty.set(row.property_id, existing);
  }

  return ((properties ?? []) as PublishedPropertyRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    city: row.city,
    locality: row.locality,
    department: row.department,
    description: row.description,
    price: Number(row.price),
    rentPrice: row.rent_price === null ? null : Number(row.rent_price),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaM2: Number(row.area_m2),
    propertyType: row.property_type,
    tags: row.tags ?? [],
    image: row.cover_image_url,
    images: [row.cover_image_url, ...(galleryByProperty.get(row.id) ?? [])],
    badges: row.badges ?? [],
    featured: row.featured,
  }));
});
