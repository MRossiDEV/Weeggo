import type { QuestionStep, WizardConfig } from "../types"

/**
 * Splices admin-managed questions (see load-questions.ts) between a config's
 * fixed intro step and its fixed summary/processing/completion steps — the
 * two static configs (buyerAssessment.ts, sellerOnboarding.ts) now only
 * define that surrounding shell, not the actual question steps.
 */
export function withQuestions(config: WizardConfig, questions: QuestionStep[]): WizardConfig {
  const before = config.steps.filter((step) => step.type === "intro")
  const after = config.steps.filter(
    (step) => step.type === "summary" || step.type === "processing" || step.type === "completion"
  )
  return { ...config, steps: [...before, ...questions, ...after] }
}
