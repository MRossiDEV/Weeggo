"use client";

import { useActionState } from "react";

import type { Partner } from "@/app/admin/_lib/types";
import { updateMyPartnerProfileAction, type PartnerProfileFormState } from "@/app/partner/_lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

const initialState: PartnerProfileFormState = {};

export function ProfileForm({ partner }: { partner: Partner }) {
  const [state, formAction, pending] = useActionState(updateMyPartnerProfileAction, initialState);

  return (
    <form action={formAction} className="max-w-xl">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nombre de la inmobiliaria / partner</FieldLabel>
          <FieldContent>
            <Input id="name" name="name" defaultValue={partner.name} required />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="contactName">Persona de contacto</FieldLabel>
          <FieldContent>
            <Input id="contactName" name="contactName" defaultValue={partner.contactName} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
          <FieldContent>
            <Input id="phone" name="phone" defaultValue={partner.phone} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="country">País</FieldLabel>
            <FieldContent>
              <Input id="country" name="country" defaultValue={partner.country ?? "Uruguay"} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="city">Ciudad</FieldLabel>
            <FieldContent>
              <Input id="city" name="city" defaultValue={partner.city} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="address">Dirección</FieldLabel>
          <FieldContent>
            <Input id="address" name="address" defaultValue={partner.address} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input id="email" value={partner.email} disabled />
            <FieldDescription>
              Es tu email de acceso — escribinos si necesitás cambiarlo.
            </FieldDescription>
          </FieldContent>
        </Field>

        {state.error && <FieldError>{state.error}</FieldError>}
        {state.success && <p className="text-sm text-accent">Perfil actualizado.</p>}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
