"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

import type { WizardFlow, WizardQuestion, WizardQuestionCategory, WizardQuestionType } from "@/app/admin/_lib/types";
import type { WizardQuestionFormState } from "@/app/admin/_lib/actions/wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

const CATEGORY_OPTIONS: { value: WizardQuestionCategory; label: string }[] = [
  { value: "profile", label: "Perfil" },
  { value: "contact", label: "Contacto" },
  { value: "situation", label: "Situación" },
  { value: "property", label: "Propiedad" },
  { value: "lifestyle", label: "Estilo de vida" },
  { value: "location", label: "Ubicación" },
  { value: "financial", label: "Financiero" },
  { value: "timeline", label: "Cronograma" },
  { value: "additional", label: "Adicional" },
];

const QUESTION_TYPE_OPTIONS: { value: WizardQuestionType; label: string }[] = [
  { value: "single", label: "Selección única (opciones)" },
  { value: "multiple", label: "Selección múltiple (opciones)" },
  { value: "select", label: "Lista desplegable (opciones)" },
  { value: "text", label: "Texto libre" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Teléfono" },
  { value: "number", label: "Número" },
  { value: "range", label: "Rango" },
  { value: "location", label: "Ubicación (texto)" },
  { value: "currency", label: "Moneda (número)" },
];

const OPERATOR_OPTIONS: { value: string; label: string }[] = [
  { value: "equals", label: "es igual a" },
  { value: "not_equals", label: "es distinto de" },
  { value: "contains", label: "contiene" },
  { value: "greater_than", label: "es mayor que" },
  { value: "less_than", label: "es menor que" },
];

const OPTION_QUESTION_TYPES: WizardQuestionType[] = ["single", "multiple", "select"];

export function WizardQuestionForm({
  flow,
  action,
  question,
  otherQuestions,
}: {
  flow: WizardFlow;
  action: (state: WizardQuestionFormState, formData: FormData) => Promise<WizardQuestionFormState>;
  question?: WizardQuestion;
  /** For the "depends on" condition dropdown — every other question in this same flow. */
  otherQuestions: WizardQuestion[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [questionType, setQuestionType] = useState<WizardQuestionType>(question?.questionType ?? "single");
  const [conditionStepKey, setConditionStepKey] = useState<string>(question?.condition?.stepKey ?? "none");
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    question?.options.map((o) => ({ value: o.value, label: o.label })) ?? []
  );

  const showOptions = OPTION_QUESTION_TYPES.includes(questionType);
  const showCondition = conditionStepKey !== "none";

  const categoryItems = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]));
  const questionTypeItems = Object.fromEntries(QUESTION_TYPE_OPTIONS.map((o) => [o.value, o.label]));
  const operatorItems = Object.fromEntries(OPERATOR_OPTIONS.map((o) => [o.value, o.label]));
  const conditionItems: Record<string, string> = {
    none: "Ninguna — siempre se muestra",
    ...Object.fromEntries(otherQuestions.map((q) => [q.stepKey, q.title])),
  };
  const statusItems = { draft: "Borrador", published: "Publicada" };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Link
        href={`/admin/wizard/${flow}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al asistente
      </Link>

      <FieldGroup className="max-w-2xl rounded-xl border border-border bg-card p-6">
        <Field>
          <FieldLabel htmlFor="title">Pregunta</FieldLabel>
          <FieldContent>
            <Input id="title" name="title" defaultValue={question?.title} required />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="stepKey">Clave interna</FieldLabel>
          <FieldContent>
            <Input
              id="stepKey"
              name="stepKey"
              defaultValue={question?.stepKey}
              placeholder="ej: preferred_locations"
              required
            />
            <FieldDescription>
              Identificador único usado internamente (minúsculas, números y guion bajo). No lo cambies en una
              pregunta existente salvo que sepas que nada más la referencia.
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="subtitle">Subtítulo (opcional)</FieldLabel>
          <FieldContent>
            <Input id="subtitle" name="subtitle" defaultValue={question?.subtitle} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="category">Categoría</FieldLabel>
            <FieldContent>
              <Select name="category" items={categoryItems} defaultValue={question?.category ?? "additional"}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="questionType">Tipo de respuesta</FieldLabel>
            <FieldContent>
              <Select
                name="questionType"
                items={questionTypeItems}
                defaultValue={questionType}
                onValueChange={(value) => setQuestionType(value as WizardQuestionType)}
              >
                <SelectTrigger id="questionType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>

        {!showOptions && (
          <Field>
            <FieldLabel htmlFor="placeholder">Placeholder</FieldLabel>
            <FieldContent>
              <Input id="placeholder" name="placeholder" defaultValue={question?.placeholder} />
              <FieldDescription>Texto de ejemplo mostrado en el campo vacío.</FieldDescription>
            </FieldContent>
          </Field>
        )}

        {showOptions && (
          <Field>
            <FieldLabel>Opciones</FieldLabel>
            <FieldContent>
              <div className="flex flex-col gap-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      name="optionValue"
                      value={option.value}
                      onChange={(event) => {
                        const next = [...options];
                        next[index] = { ...next[index], value: event.target.value };
                        setOptions(next);
                      }}
                      placeholder="Valor interno (ej: beach)"
                      className="w-2/5"
                    />
                    <Input
                      name="optionLabel"
                      value={option.label}
                      onChange={(event) => {
                        const next = [...options];
                        next[index] = { ...next[index], label: event.target.value };
                        setOptions(next);
                      }}
                      placeholder="Texto visible (ej: Cerca de la playa)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setOptions(options.filter((_, i) => i !== index))}
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
                  onClick={() => setOptions([...options, { value: "", label: "" }])}
                >
                  <Plus />
                  Agregar opción
                </Button>
              </div>
              <FieldDescription>
                Para preguntas de presupuesto/rentabilidad, el valor interno debe ser el número tal cual (ej.
                &quot;300000&quot;), no un texto simbólico — es lo que se usa directo como filtro.
              </FieldDescription>
            </FieldContent>
          </Field>
        )}

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="required">Obligatoria</FieldLabel>
          </FieldContent>
          <Switch id="required" name="required" defaultChecked={question?.required ?? true} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="conditionStepKey">Depende de</FieldLabel>
            <FieldContent>
              <Select
                name="conditionStepKey"
                items={conditionItems}
                defaultValue={conditionStepKey}
                onValueChange={(value) => setConditionStepKey(value ?? "none")}
              >
                <SelectTrigger id="conditionStepKey" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna — siempre se muestra</SelectItem>
                  {otherQuestions.map((q) => (
                    <SelectItem key={q.stepKey} value={q.stepKey}>
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Solo se muestra esta pregunta si la respuesta de otra cumple una condición.</FieldDescription>
            </FieldContent>
          </Field>

          {showCondition && (
            <Field>
              <FieldLabel htmlFor="conditionOperator">Condición</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Select
                    name="conditionOperator"
                    items={operatorItems}
                    defaultValue={question?.condition?.operator ?? "equals"}
                  >
                    <SelectTrigger id="conditionOperator" className="w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    name="conditionValue"
                    defaultValue={question?.condition?.value}
                    placeholder="valor (ej: rent)"
                    className="w-1/2"
                  />
                </div>
              </FieldContent>
            </Field>
          )}
        </div>

        <Field>
          <FieldLabel htmlFor="status">Estado</FieldLabel>
          <FieldContent>
            <Select name="status" items={statusItems} defaultValue={question?.status ?? "draft"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicada</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Solo las preguntas publicadas se muestran en el asistente real — usá borrador para preparar o
              probar cambios antes de que los vean los visitantes.
            </FieldDescription>
          </FieldContent>
        </Field>

        {state.error && <FieldError>{state.error}</FieldError>}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : question ? "Guardar cambios" : "Crear pregunta"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
