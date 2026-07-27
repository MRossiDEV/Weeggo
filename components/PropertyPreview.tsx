"use client";

import { useRef, useState } from "react";

import type { PropertyPreviewData } from "@/app/admin/_lib/property-preview";

type PreviewMode = "buy" | "rent" | "invest";

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  ph: "PH",
  loft: "Loft",
};

function fmtUSD(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function priceFor(data: PropertyPreviewData, mode: PreviewMode): string {
  if (mode === "rent") {
    return data.rentPrice !== null ? `${fmtUSD(data.rentPrice)}/mes` : "Alquiler a consultar";
  }
  return fmtUSD(data.price);
}

function yieldPct(data: PropertyPreviewData): number | null {
  if (data.rentPrice === null || data.price <= 0) return null;
  return Math.round(((data.rentPrice * 12) / data.price) * 1000) / 10;
}

const modeOptions: { value: PreviewMode; label: string }[] = [
  { value: "buy", label: "Comprar" },
  { value: "rent", label: "Alquilar" },
  { value: "invest", label: "Invertir" },
];

function PropertyCardPreview({ data, mode }: { data: PropertyPreviewData; mode: PreviewMode }) {
  const statsItems =
    mode === "invest"
      ? [
          yieldPct(data) !== null ? `${yieldPct(data)}% rentab.` : "Rentab. N/D",
          `${data.bedrooms} dorm.`,
          `${data.areaM2} m²`,
        ]
      : [`${data.bedrooms} dorm.`, `${data.areaM2} m²`, PROPERTY_TYPE_LABEL[data.propertyType] ?? data.propertyType];

  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--weeggo-radius-lg)] bg-muted shadow-[0_20px_40px_-18px_rgba(24,24,27,0.25)]"
    >
      {data.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary pasted URL, live-previewed before it's ever stored
        <img src={data.image} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
          Sin imagen de portada
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 to-transparent" />

      {data.badges.length > 0 && (
        <div className="absolute inset-x-3 top-3 z-10 flex flex-wrap gap-1.5">
          {data.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_4px_10px_-3px_rgba(0,0,0,0.35)]"
              style={{ background: "var(--weeggo-orange)" }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      <div className="absolute inset-x-[18px] bottom-4 z-10 text-white">
        <div className="text-[24px] font-extrabold leading-none tracking-tight">{priceFor(data, mode)}</div>
        <div className="mt-1 text-[13px] font-semibold opacity-90">
          {data.title || "Sin título"} · {data.city || "Sin barrio"}
        </div>
        <div className="font-weeggo-mono mt-2.5 flex gap-3.5 text-[11.5px]">
          {statsItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label }: { label: string }) {
  return <div className="font-weeggo-mono rounded-xl bg-secondary px-3 py-2 text-[11px] font-semibold">{label}</div>;
}

/** Mirrors components/discover/PropertyDrawer.tsx's gallery — same scroll-snap carousel + dot indicators, so the editor preview matches what a visitor actually sees. */
function PhotoGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (images.length === 0) {
    return (
      <div className="flex h-[140px] w-full items-center justify-center bg-muted text-xs text-muted-foreground">
        Sin imagen de portada
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-[140px] w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary pasted URL, live-previewed before it's ever stored
          <img key={i} src={src} alt="" className="h-full w-full shrink-0 snap-center object-cover" />
        ))}
      </div>

      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className="size-1.5 rounded-full transition-colors"
              style={{ background: i === index ? "white" : "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyDetailPreview({ data, mode }: { data: PropertyPreviewData; mode: PreviewMode }) {
  const score = yieldPct(data);
  const galleryImages = data.image ? [data.image, ...data.images] : data.images;
  const locationLabel = data.locality ? `${data.city || "Sin barrio"}, ${data.locality}` : data.city || "Sin barrio";

  return (
    <div className="overflow-hidden rounded-[var(--weeggo-radius-lg)] border border-border bg-card">
      <PhotoGallery images={galleryImages} />

      <div className="p-4">
        <h3 className="mb-0.5 text-[19px] font-extrabold text-foreground">{priceFor(data, mode)}</h3>
        <div className="mb-3 text-[12px] font-semibold text-muted-foreground">
          {data.title || "Sin título"} · {locationLabel}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <Stat label={`${data.bedrooms} dorm.`} />
          <Stat label={`${data.bathrooms} baños`} />
          <Stat label={`${data.areaM2} m²`} />
          <Stat label={PROPERTY_TYPE_LABEL[data.propertyType] ?? data.propertyType} />
          {mode === "invest" && <Stat label={score !== null ? `${score}% rentab. bruta` : "Rentab. N/D"} />}
        </div>

        <p className="mb-3 text-[12.5px] leading-relaxed text-muted-foreground">
          {data.description || "Sin descripción todavía."}
        </p>

        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-1 text-[10.5px] font-bold"
                style={{ background: "var(--weeggo-green-tint)", color: "#065F46" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PropertyPreviewPanel({ data }: { data: PropertyPreviewData }) {
  const [mode, setMode] = useState<PreviewMode>("buy");

  return (
    <div className="theme-weeggo sticky top-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">Vista previa pública</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Así se va a ver esta propiedad en Explorar y en el detalle — se actualiza mientras escribís.
        </p>
      </div>

      <div className="flex gap-1 rounded-full bg-muted p-1">
        {modeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className="flex-1 rounded-full py-1.5 text-[11px] font-bold transition-colors"
            style={
              mode === option.value
                ? { background: "var(--weeggo-blue)", color: "white" }
                : { color: "var(--weeggo-mute)" }
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <PropertyCardPreview data={data} mode={mode} />
      <PropertyDetailPreview data={data} mode={mode} />
    </div>
  );
}
