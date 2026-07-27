import type { WizardFlow } from "./types";

/**
 * Step keys the rest of the app depends on structurally, not just as filter/
 * lead data — deleting these would silently break a real code path rather
 * than just collecting one less data point:
 *  - buyer "intent": drives the mode (buy/rent/invest) AND the "Vender"
 *    redirect to /wizard/sell (see Wizard.tsx's handleAnswerSubmit).
 *  - seller "full_name"/"email": weeggo_leads requires both not-null —
 *    without them, submitSellerLead would insert a lead with empty strings.
 * Everything else can be freely added/removed from the admin section.
 */
export const PROTECTED_STEP_KEYS: Record<WizardFlow, string[]> = {
  buyer: ["intent"],
  seller: ["full_name", "email"],
};

export const WIZARD_FLOWS: { value: WizardFlow; label: string }[] = [
  { value: "buyer", label: "Asistente de búsqueda" },
  { value: "seller", label: "Asistente de venta" },
];

export function isWizardFlow(value: string): value is WizardFlow {
  return value === "buyer" || value === "seller";
}
