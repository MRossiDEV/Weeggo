import type {
  WizardConfig
} from "../types"

// This flow is intentionally short and practical — it exists to build a real
// curated deck for an everyday buyer/renter, not to qualify a luxury lead.
// No contact info is collected here; that only happens later, once a listing
// actually gets a strong match (see MatchCelebration/ViewingForm), so nobody
// has to hand over their details just to start browsing.
//
// The actual question steps (intent, lifestyle, preferred_locations, ...)
// used to live here as a hardcoded array. They're now admin-editable rows in
// weeggo_wizard_questions (flow = 'buyer') — see the admin section at
// /admin/wizard/buyer and app/wizard/lib/load-questions.ts, which fetches
// them and app/wizard/lib/build-config.ts's withQuestions(), which splices
// them between this config's intro and summary/processing/completion steps
// at request time (see app/wizard/page.tsx). This file only keeps the parts
// of the flow that aren't questions — the config still needs to typecheck as
// a complete WizardConfig, but `steps` here is just the shell.

export const buyerAssessment: WizardConfig = {

  id: "buyer-assessment",

  title:
    "Encontrá tu próximo lugar",

  description:
    "Contanos qué estás buscando y armamos una selección hecha a tu medida.",


  settings: {

    showProgress: true,

    allowBack: true,

    saveProgress: true,

    autoSave: true,

    showStepCounter: true,

    mobileAppMode: true

  },


  steps: [

    {
      id: "welcome",

      type: "intro",

      title:
        "Asistente de búsqueda",

      subtitle:
        "Encontrá tu próximo lugar en Uruguay",

      description:
        "Por favor responde unas preguntas rápidas para entender qué estás buscando y preparar una selección a tu medida.",

      cta:
        "Comenzar"

    },


    {
      id:"summary",

      type:"summary",

      title:
        "Resumen de tu búsqueda"

    },


    {
      id:"processing",

      type:"processing",

      title:
        "Preparando tu selección"

    },


    {
      id:"completion",

      type:"completion",

      title:
        "Todo listo"

    }


  ]

}
