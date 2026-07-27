import type {
  WizardConfig
} from "../types"

// The actual question steps (property_type, property_location, ...) used to
// live here as a hardcoded array. They're now admin-editable rows in
// weeggo_wizard_questions (flow = 'seller') — see the admin section at
// /admin/wizard/seller and app/wizard/lib/load-questions.ts / build-config.ts,
// which fetch and splice them between this config's intro and summary/
// processing/completion steps at request time (see app/wizard/sell/page.tsx).

export const sellerOnboarding: WizardConfig = {

  id: "seller-onboarding",

  title:
    "Vendé tu propiedad",

  description:
    "Contanos sobre tu propiedad y tus datos de contacto — un agente de WEEGGO se pone en contacto para coordinar los próximos pasos.",


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
        "Vendamos tu propiedad",

      subtitle:
        "Contanos los detalles y un agente te contacta",

      description:
        "Excelente {{NAME}}! Si queres vender, voy a necesitar hacerte un par de preguntas rápidas sobre la propiedad y tus datos de contacto.",

      cta:
        "Comenzar"

    },


    {
      id:"summary",

      type:"summary",

      title:
        "Resumen"

    },


    {
      id:"processing",

      type:"processing",

      title:
        "Enviando tus datos"

    },


    {
      id:"completion",

      type:"completion",

      title:
        "Listo"

    }


  ]

}
