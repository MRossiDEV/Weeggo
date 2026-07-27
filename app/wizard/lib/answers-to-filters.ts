import { createEmptyFilters, type Filters, type Mode } from "@/lib/discover/types";
import type { PropertyType } from "@/app/admin/_lib/types";
import type { WizardAnswer } from "../types";

const VALID_PROPERTY_TYPES: PropertyType[] = ["apartment", "house", "ph", "loft"];

function multiValue(answers: Record<string, WizardAnswer>, id: string): string[] {
  const value = answers[id]?.value;
  return Array.isArray(value) ? value : [];
}

/**
 * Translates buyerAssessment.ts answers into the same Mode/Filters shape the
 * Discover deck and Selection screen already know how to curate against —
 * the wizard's option values are deliberately the exact strings used
 * elsewhere (lib/discover/constants.ts), so this is mostly direct pass-
 * through rather than a lookup table.
 */
export function mapWizardAnswersToFilters(
  answers: Record<string, WizardAnswer>
): { mode: Mode; filters: Filters } {
  const intent = answers.intent?.value as string | undefined;
  const mode: Mode = intent === "rent" ? "rent" : intent === "invest" ? "invest" : "buy";

  const propertyTypes = multiValue(answers, "property_type").filter((t): t is PropertyType =>
    VALID_PROPERTY_TYPES.includes(t as PropertyType)
  );

  const bedsAnswer = answers.bedrooms?.value as string | undefined;
  const minBeds = bedsAnswer ? Number(bedsAnswer) || 0 : 0;

  // Budget is asked as one of two mutually-exclusive conditional steps
  // (only one shows, based on intent — see weeggo_wizard_questions'
  // condition_step_key) — both report the USD max directly as the option's
  // value (an admin-editable row, not a hardcoded bucket lookup).
  const purchaseBucket = answers.budget_purchase?.value as string | undefined;
  const rentBucket = answers.budget_rent?.value as string | undefined;
  const budgetMax =
    mode === "rent"
      ? rentBucket
        ? Number(rentBucket) || null
        : null
      : purchaseBucket
        ? Number(purchaseBucket) || null
        : null;

  const targetYieldAnswer = answers.target_yield?.value as string | undefined;
  const targetYield = targetYieldAnswer ? Number(targetYieldAnswer) || 0 : 0;

  const parkingAnswer = answers.parking?.value as string | undefined;

  return {
    mode,
    filters: {
      ...createEmptyFilters(),
      lifestyles: multiValue(answers, "lifestyle"),
      hoods: multiValue(answers, "preferred_locations"),
      propertyTypes,
      minBeds,
      budgetMax,
      targetYield,
      amenities: multiValue(answers, "amenities"),
      parkingRequired: parkingAnswer === "yes",
      parkingPreferred: parkingAnswer === "preferred",
    },
  };
}
