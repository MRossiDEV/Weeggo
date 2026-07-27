import "server-only"

import { supabasePublic } from "@/lib/supabase/public"
import type { ConditionalRule, QuestionCategory, QuestionStep, QuestionType, WizardOption } from "../types"

type QuestionRow = {
  id: string
  step_key: string
  title: string
  subtitle: string | null
  placeholder: string | null
  category: QuestionCategory
  question_type: QuestionType
  required: boolean
  condition_step_key: string | null
  condition_operator: ConditionalRule["operator"] | null
  condition_value: string | null
  sort_order: number
}

type OptionRow = {
  question_id: string
  value: string
  label: string
  sort_order: number
}

/**
 * The published, admin-managed questions for a wizard flow (see the admin
 * section at /admin/wizard) — spliced into the flow's static intro/summary/
 * processing/completion steps via withQuestions() (build-config.ts).
 */
export async function getWizardQuestions(flow: "buyer" | "seller"): Promise<QuestionStep[]> {
  const { data: questions, error } = await supabasePublic
    .from("weeggo_wizard_questions")
    .select(
      "id, step_key, title, subtitle, placeholder, category, question_type, required, condition_step_key, condition_operator, condition_value, sort_order"
    )
    .eq("flow", flow)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
  if (error) throw new Error(error.message)

  const questionRows = (questions ?? []) as QuestionRow[]
  const ids = questionRows.map((q) => q.id)

  const optionsByQuestion = new Map<string, WizardOption[]>()
  if (ids.length > 0) {
    const { data: options, error: optionsError } = await supabasePublic
      .from("weeggo_wizard_options")
      .select("question_id, value, label, sort_order")
      .in("question_id", ids)
      .order("sort_order", { ascending: true })
    if (optionsError) throw new Error(optionsError.message)

    for (const row of (options ?? []) as OptionRow[]) {
      const list = optionsByQuestion.get(row.question_id) ?? []
      list.push({ value: row.value, label: row.label })
      optionsByQuestion.set(row.question_id, list)
    }
  }

  return questionRows.map(
    (row): QuestionStep => ({
      id: row.step_key,
      type: "question",
      category: row.category,
      questionType: row.question_type,
      title: row.title,
      subtitle: row.subtitle ?? undefined,
      placeholder: row.placeholder ?? undefined,
      required: row.required,
      condition: row.condition_step_key
        ? {
            questionId: row.condition_step_key,
            operator: row.condition_operator ?? "equals",
            value: row.condition_value ?? "",
          }
        : undefined,
      options: optionsByQuestion.get(row.id),
    })
  )
}
