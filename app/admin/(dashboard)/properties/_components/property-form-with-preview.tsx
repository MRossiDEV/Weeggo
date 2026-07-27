"use client";

import { useState } from "react";

import type { Agent, Partner, Property } from "@/app/admin/_lib/types";
import type { PropertyFormState } from "@/app/admin/_lib/property-form-parser";
import { buildPropertyPreview, type PropertyPreviewData } from "@/app/admin/_lib/property-preview";
import { PropertyPreviewPanel } from "@/components/PropertyPreview";
import { PropertyForm } from "./property-form";

function initialPreview(property?: Property): PropertyPreviewData {
  // Reuses the same lenient extractor, fed with property's own values via a
  // throwaway FormData — keeps "what does an existing property look like at
  // first render" and "what does it look like after an edit" going through
  // exactly one code path instead of two that could drift apart.
  const formData = new FormData();
  formData.set("title", property?.title ?? "");
  formData.set("city", property?.city ?? "");
  formData.set("locality", property?.locality ?? "");
  formData.set("department", property?.department ?? "");
  formData.set("description", property?.description ?? "");
  formData.set("price", String(property?.price ?? ""));
  if (property?.rentPrice != null) formData.set("rentPrice", String(property.rentPrice));
  formData.set("bedrooms", String(property?.bedrooms ?? ""));
  formData.set("bathrooms", String(property?.bathrooms ?? ""));
  formData.set("areaM2", String(property?.areaM2 ?? ""));
  formData.set("propertyType", property?.propertyType ?? "apartment");
  for (const tag of property?.tags ?? []) formData.append("tags", tag);
  for (const badge of property?.badges ?? []) formData.append("badges", badge);
  formData.set("image", property?.image ?? "");
  for (const url of property?.images ?? []) formData.append("images", url);
  if (property?.featured) formData.set("featured", "on");
  return buildPropertyPreview(formData);
}

export function PropertyFormWithPreview({
  action,
  property,
  agents,
  partners,
  variant = "admin",
  backHref = "/admin/properties",
  backLabel = "Volver a Propiedades",
}: {
  action: (state: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;
  property?: Property;
  agents?: Agent[];
  partners?: Partner[];
  variant?: "admin" | "partner";
  backHref?: string;
  backLabel?: string;
}) {
  const [preview, setPreview] = useState<PropertyPreviewData>(() => initialPreview(property));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <PropertyForm
        action={action}
        property={property}
        agents={agents}
        partners={partners}
        variant={variant}
        backHref={backHref}
        backLabel={backLabel}
        onPreviewChange={setPreview}
      />
      <PropertyPreviewPanel data={preview} />
    </div>
  );
}
