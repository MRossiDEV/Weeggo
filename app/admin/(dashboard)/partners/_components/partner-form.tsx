"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Partner } from "@/app/admin/_lib/types";
import type { PartnerFormState } from "@/app/admin/_lib/actions/partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function PartnerForm({
  action,
  partner,
}: {
  action: (state: PartnerFormState, formData: FormData) => Promise<PartnerFormState>;
  partner?: Partner;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Link
        href="/admin/partners"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Partners
      </Link>

      <FieldGroup className="max-w-xl rounded-xl border border-border bg-card p-6">
        <Field>
          <FieldLabel htmlFor="name">Nombre de la inmobiliaria / partner</FieldLabel>
          <FieldContent>
            <Input id="name" name="name" defaultValue={partner?.name} required />
          </FieldContent>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contactName">Persona de contacto</FieldLabel>
            <FieldContent>
              <Input id="contactName" name="contactName" defaultValue={partner?.contactName} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
            <FieldContent>
              <Input id="phone" name="phone" defaultValue={partner?.phone} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input id="email" name="email" type="email" defaultValue={partner?.email} required />
              <p className="text-xs text-muted-foreground">
                Recibe el link de invitación para acceder al portal de partners.
              </p>
            </FieldContent>
          </Field>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="active">Activo</FieldLabel>
            </FieldContent>
            <Switch id="active" name="active" defaultChecked={partner?.active ?? true} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="country">País</FieldLabel>
            <FieldContent>
              <Input id="country" name="country" defaultValue={partner?.country ?? "Uruguay"} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="city">Ciudad</FieldLabel>
            <FieldContent>
              <Input id="city" name="city" defaultValue={partner?.city} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="address">Dirección</FieldLabel>
          <FieldContent>
            <Input id="address" name="address" defaultValue={partner?.address} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <FieldContent>
            <Textarea id="notes" name="notes" defaultValue={partner?.notes} rows={3} />
          </FieldContent>
        </Field>

        {state.error && <FieldError>{state.error}</FieldError>}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : partner ? "Guardar cambios" : "Crear partner"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
