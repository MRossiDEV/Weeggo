import type { PropertyType } from "@/app/admin/_lib/types";

export type Mode = "buy" | "rent" | "invest";

export interface AppNotification {
  id: string;
  message: string;
  createdAt: number;
  read: boolean;
}

/** Client-facing shape for a published property in the swipe deck. */
export interface Listing {
  id: string;
  title: string;
  /** Neighborhood — reuses weeggo_properties.city, e.g. "Pocitos". */
  city: string;
  /** City/locality, e.g. "Montevideo", "Punta del Este". Null when not set. */
  locality: string | null;
  /** Uruguayan department, e.g. "Montevideo", "Maldonado". Null when not set. */
  department: string | null;
  description: string;
  /** Sale price, USD. */
  price: number;
  /** Monthly rent, USD. Null when the property has no rental estimate. */
  rentPrice: number | null;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  propertyType: PropertyType;
  /** Amenity/feature tags, e.g. "Parking", "Pool". */
  tags: string[];
  image: string;
  images: string[];
  badges: string[];
  featured: boolean;
}

export interface Filters {
  /**
   * Lifestyle priorities (e.g. "beach", "walkable") — a soft signal used to
   * favor matching neighborhoods in scoring when no explicit hood is picked,
   * so visitors who don't know Montevideo's geography still get a curated
   * deck instead of an unfiltered one.
   */
  lifestyles: string[];
  hoods: string[];
  propertyTypes: PropertyType[];
  minBeds: number;
  minBaths: number;
  budgetMax: number | null;
  /** Invest mode only — minimum gross yield %. */
  targetYield: number;
  amenities: string[];
  /** When true, `amenities` becomes a hard requirement (listing must have all of them) instead of a scoring bonus. */
  amenitiesRequired: boolean;
  /** Hard requirement — separate from `amenities`/`amenitiesRequired` because "parking is a dealbreaker" is a common, decisive preference that shouldn't be tangled up with the softer nice-to-have amenity list. */
  parkingRequired: boolean;
  /** "Nice to have" parking — a soft scoring nudge, ignored when parkingRequired is already hard-filtering. */
  parkingPreferred: boolean;
}

export function createEmptyFilters(): Filters {
  return {
    lifestyles: [],
    hoods: [],
    propertyTypes: [],
    minBeds: 0,
    minBaths: 0,
    budgetMax: null,
    targetYield: 0,
    amenities: [],
    amenitiesRequired: false,
    parkingRequired: false,
    parkingPreferred: false,
  };
}
