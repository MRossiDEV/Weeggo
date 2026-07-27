"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { wizardQuestionsStore, type WizardQuestionInput } from "@/app/admin/_lib/store";
import type {
  WizardConditionOperator,
  WizardFlow,
  WizardQuestionCategory,
  WizardQuestionStatus,
  WizardQuestionType,
} from "@/app/admin/_lib/types";
import { PROTECTED_STEP_KEYS } from "@/app/admin/_lib/wizard-constants";

export interface WizardQuestionFormState {
  error?: string;
}

function parseWizardQuestionForm(formData: FormData): { error: string } | { data: WizardQuestionInput } {
  const title = String(formData.get("title") ?? "").trim();
  const stepKey = String(formData.get("stepKey") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const placeholder = String(formData.get("placeholder") ?? "").trim();
  const category = String(formData.get("category") ?? "additional") as WizardQuestionCategory;
  const questionType = String(formData.get("questionType") ?? "single") as WizardQuestionType;
  const required = formData.get("required") === "on";
  const status = String(formData.get("status") ?? "draft") as WizardQuestionStatus;

  const conditionStepKeyRaw = String(formData.get("conditionStepKey") ?? "");
  const conditionStepKey = conditionStepKeyRaw === "" || conditionStepKeyRaw === "none" ? null : conditionStepKeyRaw;
  const conditionOperator = conditionStepKey
    ? (String(formData.get("conditionOperator") ?? "equals") as WizardConditionOperator)
    : null;
  const conditionValue = conditionStepKey ? String(formData.get("conditionValue") ?? "").trim() : null;

  const optionValues = formData.getAll("optionValue").map((v) => String(v).trim());
  const optionLabels = formData.getAll("optionLabel").map((v) => String(v).trim());
  const options = optionValues
    .map((value, i) => ({ value, label: optionLabels[i] ?? "" }))
    .filter((o) => o.value && o.label);

  if (!title || !stepKey) {
    return { error: "Completá el título y la clave interna de la pregunta." };
  }
  if (!/^[a-z][a-z0-9_]*$/.test(stepKey)) {
    return { error: "La clave interna debe empezar con una letra minúscula y solo puede tener minúsculas, números y guion bajo (ej: preferred_locations)." };
  }
  if (conditionStepKey && !conditionValue) {
    return { error: "Completá el valor de la condición, o quitá la pregunta de la que depende." };
  }
  if (["single", "multiple", "select"].includes(questionType) && options.length === 0) {
    return { error: "Este tipo de pregunta necesita al menos una opción." };
  }

  return {
    data: {
      stepKey,
      title,
      subtitle: subtitle || null,
      placeholder: placeholder || null,
      category,
      questionType,
      required,
      status,
      conditionStepKey,
      conditionOperator,
      conditionValue,
      options,
    },
  };
}

export async function createWizardQuestionAction(
  flow: WizardFlow,
  _prevState: WizardQuestionFormState,
  formData: FormData
): Promise<WizardQuestionFormState> {
  const parsed = parseWizardQuestionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await wizardQuestionsStore.list(flow);
  if (existing.some((q) => q.stepKey === parsed.data.stepKey)) {
    return { error: "Ya existe una pregunta con esa clave interna en este asistente." };
  }

  await wizardQuestionsStore.create(flow, parsed.data);
  revalidatePath(`/admin/wizard/${flow}`);
  redirect(`/admin/wizard/${flow}`);
}

export async function updateWizardQuestionAction(
  flow: WizardFlow,
  id: string,
  _prevState: WizardQuestionFormState,
  formData: FormData
): Promise<WizardQuestionFormState> {
  const parsed = parseWizardQuestionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await wizardQuestionsStore.list(flow);
  if (existing.some((q) => q.stepKey === parsed.data.stepKey && q.id !== id)) {
    return { error: "Ya existe otra pregunta con esa clave interna en este asistente." };
  }

  const updated = await wizardQuestionsStore.update(id, parsed.data);
  if (!updated) return { error: "No se encontró la pregunta." };

  revalidatePath(`/admin/wizard/${flow}`);
  redirect(`/admin/wizard/${flow}`);
}

export async function deleteWizardQuestionAction(flow: WizardFlow, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const stepKey = String(formData.get("stepKey") ?? "");
  if (!id || PROTECTED_STEP_KEYS[flow].includes(stepKey)) return;

  await wizardQuestionsStore.remove(id);
  revalidatePath(`/admin/wizard/${flow}`);
}

export async function toggleWizardQuestionStatusAction(flow: WizardFlow, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "draft") as WizardQuestionStatus;
  if (!id) return;

  await wizardQuestionsStore.setStatus(id, nextStatus);
  revalidatePath(`/admin/wizard/${flow}`);
}

export async function moveWizardQuestionAction(flow: WizardFlow, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "up") as "up" | "down";
  if (!id) return;

  await wizardQuestionsStore.move(flow, id, direction);
  revalidatePath(`/admin/wizard/${flow}`);
}
