"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

import type { Agent, Partner, Property, PropertyStatus, PropertyType } from "@/app/admin/_lib/types";
import type { PropertyFormState } from "@/app/admin/_lib/property-form-parser";
import { buildPropertyPreview, type PropertyPreviewData } from "@/app/admin/_lib/property-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AMENITIES, BADGES, CITIES, DEPARTMENTS, NEIGHBORHOODS, PROPERTY_TYPES } from "@/lib/discover/constants";

const statusOptions: { value: PropertyStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
  { value: "off-market", label: "Fuera de mercado" },
];

const propertyTypeOptions: { value: PropertyType; label: string }[] = PROPERTY_TYPES;

export function PropertyForm({
  action,
  property,
  agents,
  partners,
  variant = "admin",
  backHref = "/admin/properties",
  backLabel = "Volver a Propiedades",
  onPreviewChange,
}: {
  action: (state: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;
  property?: Property;
  /** Only needed for variant="admin" — the partner variant never shows these assignment selects. */
  agents?: Agent[];
  partners?: Partner[];
  /**
   * "partner" hides the fields that control publish state or internal
   * assignment (Estado, Destacada, Agente, Partner) — a partner submitting
   * or editing their own listing shouldn't be able to self-publish, promote,
   * or reassign it. The server action enforces this too; hiding the fields
   * is about not implying partners have that control, not the actual
   * security boundary.
   */
  variant?: "admin" | "partner";
  backHref?: string;
  backLabel?: string;
  /** Fires on every field change with a lenient, always-displayable snapshot — for a live preview panel rendered alongside this form. */
  onPreviewChange?: (data: PropertyPreviewData) => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [galleryUrls, setGalleryUrls] = useState<string[]>(property?.images ?? []);
  const formRef = useRef<HTMLFormElement>(null);

  function emitPreview() {
    if (formRef.current) {
      onPreviewChange?.(buildPropertyPreview(new FormData(formRef.current)));
    }
  }

  // Initial snapshot on mount (so the preview shows existing values when
  // editing, not just once the admin/partner touches a field) and whenever
  // the gallery list changes — those inputs are added/removed via buttons,
  // not typed into, so they don't reliably fire the form's own onChange.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(emitPreview, [galleryUrls]);

  // Base UI's <Select.Value> only shows the matched item's *label* when the
  // root is given an explicit `items` map — without it, it falls back to
  // rendering the raw `value` (e.g. an agent's UUID instead of their name).
  const departmentItems = Object.fromEntries(DEPARTMENTS.map((dept) => [dept, dept]));
  const localityItems = Object.fromEntries(CITIES.map((city) => [city, city]));
  const cityItems = Object.fromEntries(NEIGHBORHOODS.map((hood) => [hood, hood]));
  const propertyTypeItems = Object.fromEntries(propertyTypeOptions.map((o) => [o.value, o.label]));
  const statusItems = Object.fromEntries(statusOptions.map((o) => [o.value, o.label]));
  const agentItems = {
    none: "Sin asignar",
    ...Object.fromEntries((agents ?? []).map((agent) => [agent.id, agent.name])),
  };
  const partnerItems = {
    none: "Directo / sin partner",
    ...Object.fromEntries((partners ?? []).map((partner) => [partner.id, partner.name])),
  };

  return (
    <form ref={formRef} action={formAction} onChange={emitPreview} className="flex flex-col gap-6">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>

      <FieldGroup className="max-w-2xl rounded-xl border border-border bg-card p-6">
        <Field>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <FieldContent>
            <Input id="title" name="title" defaultValue={property?.title} required />
          </FieldContent>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="country">País</FieldLabel>
            <FieldContent>
              <Input id="country" name="country" defaultValue={property?.country ?? "Uruguay"} required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="department">Departamento</FieldLabel>
            <FieldContent>
              <Select name="department" items={departmentItems} defaultValue={property?.department ?? undefined}>
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Seleccioná un departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="locality">Ciudad</FieldLabel>
            <FieldContent>
              <Select name="locality" items={localityItems} defaultValue={property?.locality ?? undefined}>
                <SelectTrigger id="locality" className="w-full">
                  <SelectValue placeholder="Seleccioná una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="city">Barrio</FieldLabel>
            <FieldContent>
              <Select name="city" items={cityItems} defaultValue={property?.city}>
                <SelectTrigger id="city" className="w-full">
                  <SelectValue placeholder="Seleccioná un barrio" />
                </SelectTrigger>
                <SelectContent>
                  {NEIGHBORHOODS.map((hood) => (
                    <SelectItem key={hood} value={hood}>
                      {hood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Tiene que ser uno de los barrios reconocidos por los filtros de Explorar.
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              name="description"
              defaultValue={property?.description}
              rows={4}
              required
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="image">URL de imagen de portada</FieldLabel>
          <FieldContent>
            <Input id="image" name="image" defaultValue={property?.image} required />
            <FieldDescription>Ej: /images/property-1.png</FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Badges</FieldLabel>
          <FieldContent>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {BADGES.map((badge) => (
                <label key={badge} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox name="badges" value={badge} defaultChecked={property?.badges.includes(badge)} />
                  {badge}
                </label>
              ))}
            </div>
            <FieldDescription>Etiquetas de marketing — solo se muestran, no filtran búsquedas.</FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Galería adicional</FieldLabel>
          <FieldContent>
            <div className="flex flex-col gap-2">
              {galleryUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    name="images"
                    value={url}
                    onChange={(event) => {
                      const next = [...galleryUrls];
                      next[index] = event.target.value;
                      setGalleryUrls(next);
                    }}
                    placeholder="https://..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== index))}
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setGalleryUrls([...galleryUrls, ""])}
              >
                <Plus />
                Agregar imagen
              </Button>
            </div>
            <FieldDescription>
              Fotos adicionales más allá de la portada — se muestran en este orden en el detalle de la
              propiedad.
            </FieldDescription>
          </FieldContent>
        </Field>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="price">Precio de venta (USD)</FieldLabel>
            <FieldContent>
              <Input id="price" name="price" type="number" min={0} defaultValue={property?.price} required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="rentPrice">Alquiler mensual (USD)</FieldLabel>
            <FieldContent>
              <Input
                id="rentPrice"
                name="rentPrice"
                type="number"
                min={0}
                defaultValue={property?.rentPrice ?? undefined}
              />
              <FieldDescription>Opcional. Dejar vacío si no aplica.</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="bedrooms">Dormitorios</FieldLabel>
            <FieldContent>
              <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={property?.bedrooms} required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="bathrooms">Baños</FieldLabel>
            <FieldContent>
              <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={property?.bathrooms} required />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="propertyType">Tipo de propiedad</FieldLabel>
            <FieldContent>
              <Select name="propertyType" items={propertyTypeItems} defaultValue={property?.propertyType ?? "apartment"}>
                <SelectTrigger id="propertyType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="areaM2">Superficie (m²)</FieldLabel>
            <FieldContent>
              <Input id="areaM2" name="areaM2" type="number" min={0} defaultValue={property?.areaM2} required />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Comodidades</FieldLabel>
          <FieldContent>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox name="tags" value={amenity} defaultChecked={property?.tags.includes(amenity)} />
                  {amenity}
                </label>
              ))}
            </div>
            <FieldDescription>
              Estas son las que alimentan los filtros de comodidades en Explorar — un tag libre no
              coincidiría con ningún filtro.
            </FieldDescription>
          </FieldContent>
        </Field>

        {variant === "admin" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="status">Estado</FieldLabel>
              <FieldContent>
                <Select name="status" items={statusItems} defaultValue={property?.status ?? "draft"}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="featured">Destacada en portada</FieldLabel>
              </FieldContent>
              <Switch id="featured" name="featured" defaultChecked={property?.featured} />
            </Field>
          </div>
        )}

        {variant === "admin" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="agentId">Agente asignado</FieldLabel>
              <FieldContent>
                <Select name="agentId" items={agentItems} defaultValue={property?.agentId ?? "none"}>
                  <SelectTrigger id="agentId" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {(agents ?? []).map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="partnerId">Partner / realtor (lado vendedor)</FieldLabel>
              <FieldContent>
                <Select name="partnerId" items={partnerItems} defaultValue={property?.partnerId ?? "none"}>
                  <SelectTrigger id="partnerId" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Directo / sin partner</SelectItem>
                    {(partners ?? []).map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  La inmobiliaria o realtor externo del que vino esta propiedad, si corresponde.
                </FieldDescription>
              </FieldContent>
            </Field>
          </div>
        )}

        {variant === "partner" && (
          <p className="text-xs text-muted-foreground">
            Tu propiedad queda como borrador hasta que un administrador la revise y publique. No podés
            cambiar su estado ni destacarla vos mismo.
          </p>
        )}

        {state.error && <FieldError>{state.error}</FieldError>}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : property ? "Guardar cambios" : "Crear propiedad"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
