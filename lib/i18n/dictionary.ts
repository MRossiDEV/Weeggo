import type { Locale } from "@/lib/discover/filters-context";

/**
 * Shared vocabulary across the public app (landing, wizard, swipe deck,
 * profile, etc.) — the admin/agent CRM is intentionally out of scope and
 * stays Spanish-only, since it's internal/staff-facing.
 *
 * `es` is the source of truth (Uruguay market, default locale); `en` must
 * match its shape exactly, which TypeScript enforces via the Dictionary type
 * below — a missing translation is a compile error, not a silent fallback.
 */
export interface Dictionary {
  common: {
    buy: string;
    rent: string;
    invest: string;
    continue: string;
    start: string;
    back: string;
    send: string;
    skip: string;
    close: string;
  };

  nav: {
    discover: string;
    shortlist: string;
    wizard: string;
    alerts: string;
    profile: string;
  };

  landing: {
    welcomeTo: string;
    headlineReturning: string;
    headline: string;
    tagline: string;
    badgeBuy: string;
    badgeRent: string;
    badgeSell: string;
    badgeInvest: string;
    ctaStart: string;
    ctaSkip: string;
  };

  wizard: {
    assistantName: string;
    online: string;
    namePlaceholder: string;
    skipAssistant: string;
    textInputPlaceholder: string;
    summaryReady: string;
    summaryReadyGeneric: string;
    viewSelection: string;
    startOver: string;
    completionHeading: string;
    completionHeadingGeneric: string;
    completionBody: string;
    processingLead: string;
    processingLeadGeneric: string;
    anywhere: string;
    inLocation: string;
    and: string;
    andMore: string;
    propertyTypesPlural: string;
    apartmentsPlural: string;
    housesPlural: string;
    phsPlural: string;
    loftsPlural: string;
  };

  sell: {
    progressLabel: string;
    sendingWithName: string;
    sendingGeneric: string;
    errorToast: string;
    thankYouWithName: string;
    thankYouGeneric: string;
    completionBody: string;
    backToHome: string;
  };

  discover: {
    filters: string;
    widenedSearch: string;
    emptyTitle: string;
    emptyBody1: string;
    emptyBody2: string;
    adjustFilters: string;
    resetSeen: string;
    passAria: string;
    topPickAria: string;
    shortlistAria: string;
    stampShortlist: string;
    stampPass: string;
    stampTopPick: string;
    yieldNa: string;
    yieldLabel: string;
    grossYieldLabel: string;
    bedsLabel: string;
    bathsLabel: string;
    matchLabel: string;
    rentOnRequest: string;
    perMonth: string;
    requestViewing: string;
    bookViewing: string;
    keepSwiping: string;
    matchHeading: string;
    matchBody: string;
    dismissAria: string;
    typeApartment: string;
    typeHouse: string;
    typePh: string;
    typeLoft: string;
    compareTitle: string;
    placesSideBySide: string;
    removeFromCompare: string;
    addToCompare: string;
    yourShortlist: string;
    shortlistEmpty: string;
    shortlistHint: string;
    nSelected: string;
    compareCta: string;
    selectionForName: string;
    selectionGeneric: string;
    selectionCount: string;
    skipToExplore: string;
  };

  filterPanel: {
    title: string;
    subtitle: string;
    neighborhoods: string;
    propertyType: string;
    budgetBuy: string;
    budgetRent: string;
    noLimit: string;
    minBeds: string;
    minBaths: string;
    any: string;
    amenities: string;
    amenitiesRequiredLabel: string;
    parking: string;
    parkingAny: string;
    parkingPreferred: string;
    parkingRequired: string;
    targetYield: string;
    targetYieldAny: string;
    clear: string;
    applyLabel: string;
    saveSearch: string;
  };

  saveSearch: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    pushLabel: string;
    save: string;
    saving: string;
    success: string;
    error: string;
  };

  matches: {
    title: string;
    subtitle: string;
    doneTitle: string;
    doneBody: string;
    backToDiscover: string;
  };

  alerts: {
    title: string;
    pushToggle: string;
    pushDenied: string;
    noSearches: string;
    searchActive: string;
    deleteSearch: string;
    categoriesTitle: string;
    categoryNewMatch: string;
    categoryPriceDrop: string;
    categoryStatusChange: string;
    categoryDigest: string;
  };

  viewingForm: {
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    contactWhatsApp: string;
    contactEmail: string;
    contactCall: string;
    validationError: string;
    sendError: string;
    successToast: string;
    notificationMessage: string;
    sending: string;
    confirmRequest: string;
  };

  notifications: {
    title: string;
    subtitle: string;
    emptyBody: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };

  profile: {
    modeBuying: string;
    modeRenting: string;
    modeInvesting: string;
    guestExplorer: string;
    yourFilters: string;
    priorities: string;
    neighborhoods: string;
    budget: string;
    typeAndSize: string;
    amenities: string;
    noPreference: string;
    anywhere: string;
    noLimit: string;
    none: string;
    required: string;
    anyType: string;
    bedsSuffix: string;
    anyBeds: string;
    bathsSuffix: string;
    anyBath: string;
    editFilters: string;
    activity: string;
    shortlisted: string;
    passed: string;
    startOver: string;
  };

  error: {
    title: string;
    body: string;
    retry: string;
  };
}

const es: Dictionary = {
  common: {
    buy: "Comprar",
    rent: "Alquilar",
    invest: "Invertir",
    continue: "Continuar",
    start: "Comenzar",
    back: "Volver",
    send: "Enviar",
    skip: "Saltar",
    close: "Cerrar",
  },

  nav: {
    discover: "Explorar",
    shortlist: "Favoritos",
    wizard: "Asistente",
    alerts: "Alertas",
    profile: "Perfil",
  },

  landing: {
    welcomeTo: "BIENVENIDOS A",
    headlineReturning: "Hola de nuevo, {name}",
    headline: "Una nueva forma de encontrar lo que buscas",
    tagline:
      "Deslizá entre propiedades exclusivas en Uruguay. Contanos qué estás buscando y te armamos una selección.",
    badgeBuy: "Comprar",
    badgeRent: "Alquilar",
    badgeSell: "Vender",
    badgeInvest: "Invertir",
    ctaStart: "Comenzar",
    ctaSkip: "Saltate el asistente",
  },

  wizard: {
    assistantName: "Wee (Asistente WEEGGO)",
    online: "Online",
    namePlaceholder: "¿Cómo te llamas?",
    skipAssistant: "Saltar al asistente",
    textInputPlaceholder: "Escribime lo que necesitás...",
    summaryReady: "¡Buenísimo, {name}! Ya tengo todo lo que necesito.",
    summaryReadyGeneric: "¡Buenísimo! Ya tengo todo lo que necesito.",
    viewSelection: "Ver mi selección",
    startOver: "Volver a empezar",
    completionHeading: "¡Listo, {name}!",
    completionHeadingGeneric: "¡Listo!",
    completionBody:
      "Armamos una selección curada{hoods} según lo que nos contaste. Cuando encuentres algo que te encante, coordinamos la visita con un asesor.",
    processingLead: "{name}, buscando",
    processingLeadGeneric: "Buscando",
    anywhere: "Uruguay",
    inLocation: "en",
    and: "y",
    andMore: "y más",
    propertyTypesPlural: "propiedades",
    apartmentsPlural: "apartamentos",
    housesPlural: "casas",
    phsPlural: "PHs",
    loftsPlural: "lofts",
  },

  sell: {
    progressLabel: "Tu propiedad",
    sendingWithName: "Enviando tus datos, {name}...",
    sendingGeneric: "Enviando tus datos...",
    errorToast: "No pudimos enviar tu información. Un agente igual puede contactarte si volvés a intentarlo.",
    thankYouWithName: "¡Gracias, {name}!",
    thankYouGeneric: "¡Gracias!",
    completionBody:
      "Un agente de WEEGGO va a revisar los datos de tu propiedad y se va a poner en contacto para coordinar los próximos pasos.",
    backToHome: "Volver al inicio",
  },

  discover: {
    filters: "Filtros",
    widenedSearch: "Nada encajaba justo — ampliamos tu búsqueda",
    emptyTitle: "Eso es todo por ahora",
    emptyBody1: "Ya viste todas las propiedades que tenemos — incluso fuera de tus filtros.",
    emptyBody2: "Mirá tus favoritos o volvé más tarde por nuevas propiedades.",
    adjustFilters: "Ajustar filtros",
    resetSeen: "Ver todo de nuevo",
    passAria: "Descartar",
    topPickAria: "Favorito top",
    shortlistAria: "Favoritos",
    stampShortlist: "Favorito",
    stampPass: "Paso",
    stampTopPick: "Top",
    yieldNa: "Rentabilidad N/D",
    yieldLabel: "{pct}% rentab.",
    grossYieldLabel: "{pct}% rentab. bruta",
    bedsLabel: "{n} dorm.",
    bathsLabel: "{n} baños",
    matchLabel: "{pct}% afinidad",
    rentOnRequest: "Alquiler a consultar",
    perMonth: "/mes",
    requestViewing: "Solicitar una visita",
    bookViewing: "Coordinar una visita",
    keepSwiping: "Seguir viendo",
    matchHeading: "¡Es un match!",
    matchBody: "Esta propiedad encaja con lo que buscás mejor que casi todo lo demás en tu selección.",
    dismissAria: "Cerrar",
    typeApartment: "Apartamento",
    typeHouse: "Casa",
    typePh: "PH",
    typeLoft: "Loft",
    compareTitle: "Comparar",
    placesSideBySide: "{n} propiedades lado a lado",
    removeFromCompare: "Quitar de la comparación",
    addToCompare: "Agregar a la comparación",
    yourShortlist: "Tus favoritos",
    shortlistEmpty: "Todavía nada — deslizá a la derecha las propiedades que te gusten en Explorar.",
    shortlistHint: "Propiedades que te gustaron. Tocá hasta 3 para comparar.",
    nSelected: "{n} seleccionadas",
    compareCta: "Comparar →",
    selectionForName: "La selección de {name}",
    selectionGeneric: "Tu selección curada",
    selectionCount: "{count} de {total}",
    skipToExplore: "Saltar a explorar todo",
  },

  filterPanel: {
    title: "Filtros",
    subtitle: "Ajustá tu búsqueda cuando quieras — sin pasar por el asistente de nuevo.",
    neighborhoods: "Barrios",
    propertyType: "Tipo de propiedad",
    budgetBuy: "Precio máximo",
    budgetRent: "Alquiler máximo",
    noLimit: "Sin límite",
    minBeds: "Dormitorios mínimos",
    minBaths: "Baños mínimos",
    any: "Cualquiera",
    amenities: "Comodidades",
    amenitiesRequiredLabel: "Deben tener todas",
    parking: "Cochera",
    parkingAny: "No importa",
    parkingPreferred: "Preferida",
    parkingRequired: "Imprescindible",
    targetYield: "Rentabilidad mínima",
    targetYieldAny: "Sin mínimo",
    clear: "Limpiar filtros",
    applyLabel: "Ver {n} propiedades",
    saveSearch: "Guardar búsqueda y recibir alertas",
  },

  saveSearch: {
    title: "Guardar esta búsqueda",
    subtitle: "Te avisamos cuando aparezca una propiedad nueva que coincida con estos filtros.",
    emailLabel: "Email (opcional)",
    emailPlaceholder: "tu@email.com",
    pushLabel: "Avisarme también con notificaciones push",
    save: "Guardar búsqueda",
    saving: "Guardando…",
    success: "¡Listo! Te avisamos ante nuevos matches.",
    error: "No pudimos guardar tu búsqueda — intentá de nuevo.",
  },

  matches: {
    title: "Nuevos matches",
    subtitle: "Propiedades nuevas que coinciden con tu búsqueda guardada.",
    doneTitle: "¡Eso es todo!",
    doneBody: "Ya viste los nuevos matches de esta alerta.",
    backToDiscover: "Volver a explorar",
  },

  alerts: {
    title: "Alertas",
    pushToggle: "Notificaciones push en este dispositivo",
    pushDenied: "No pudimos activar las notificaciones — revisá los permisos del navegador.",
    noSearches: "Todavía no guardaste ninguna búsqueda. Guardá una desde los filtros para recibir alertas.",
    searchActive: "Activa",
    deleteSearch: "Eliminar búsqueda guardada",
    categoriesTitle: "Qué querés recibir",
    categoryNewMatch: "Nuevos matches",
    categoryPriceDrop: "Bajas de precio en favoritos",
    categoryStatusChange: "Cambios de estado en favoritos",
    categoryDigest: "Resumen semanal",
  },

  viewingForm: {
    fullNamePlaceholder: "Nombre completo",
    emailPlaceholder: "Email",
    phonePlaceholder: "Teléfono / WhatsApp",
    contactWhatsApp: "WhatsApp",
    contactEmail: "Email",
    contactCall: "Llamada",
    validationError: "Completá tu nombre, email y teléfono para continuar.",
    sendError: "No pudimos enviar tu solicitud — intentá de nuevo.",
    successToast: "Visita solicitada — el agente te confirma en breve",
    notificationMessage: "Visita solicitada para {title} · {city}",
    sending: "Enviando…",
    confirmRequest: "Confirmar solicitud",
  },

  notifications: {
    title: "Notificaciones",
    subtitle: "Acá vas a ver las confirmaciones de visitas y novedades de tus favoritos.",
    emptyBody: "Todavía nada. Solicitá una visita a una propiedad y te confirmamos acá.",
    justNow: "recién",
    minutesAgo: "hace {n}m",
    hoursAgo: "hace {n}h",
    daysAgo: "hace {n}d",
  },

  profile: {
    modeBuying: "Comprando",
    modeRenting: "Alquilando",
    modeInvesting: "Invirtiendo",
    guestExplorer: "Visitante",
    yourFilters: "Tus filtros",
    priorities: "Prioridades",
    neighborhoods: "Barrios",
    budget: "Presupuesto",
    typeAndSize: "Tipo y tamaño",
    amenities: "Comodidades",
    noPreference: "Sin preferencia",
    anywhere: "Cualquier zona",
    noLimit: "Sin límite",
    none: "Ninguna seleccionada",
    required: "(requeridas)",
    anyType: "Cualquiera",
    bedsSuffix: "{n}+ dorm.",
    anyBeds: "Cualquier cant. de dormitorios",
    bathsSuffix: "{n}+ baño",
    anyBath: "Cualquier cant. de baños",
    editFilters: "Editar filtros",
    activity: "Actividad",
    shortlisted: "Favoritos",
    passed: "Descartadas",
    startOver: "Volver a empezar desde cero",
  },

  error: {
    title: "Algo salió mal",
    body: "No pudimos cargar esta pantalla. Probá de nuevo en un momento.",
    retry: "Intentar de nuevo",
  },
};

const en: Dictionary = {
  common: {
    buy: "Buy",
    rent: "Rent",
    invest: "Invest",
    continue: "Continue",
    start: "Start",
    back: "Back",
    send: "Send",
    skip: "Skip",
    close: "Close",
  },

  nav: {
    discover: "Discover",
    shortlist: "Shortlist",
    wizard: "Assistant",
    alerts: "Alerts",
    profile: "Profile",
  },

  landing: {
    welcomeTo: "WELCOME TO",
    headlineReturning: "Welcome back, {name}",
    headline: "A new way to find your next place",
    tagline:
      "Swipe through exclusive properties in Uruguay. Tell us what you're after and we'll curate your deck.",
    badgeBuy: "Buy",
    badgeRent: "Rent",
    badgeSell: "Sell",
    badgeInvest: "Invest",
    ctaStart: "Get started",
    ctaSkip: "Skip the assistant",
  },

  wizard: {
    assistantName: "Wee (WEEGGO Assistant)",
    online: "Online",
    namePlaceholder: "What's your name?",
    skipAssistant: "Skip the assistant",
    textInputPlaceholder: "Type what you need...",
    summaryReady: "Awesome, {name}! I've got everything I need.",
    summaryReadyGeneric: "Awesome! I've got everything I need.",
    viewSelection: "See my selection",
    startOver: "Start over",
    completionHeading: "All set, {name}!",
    completionHeadingGeneric: "All set!",
    completionBody:
      "We put together a curated selection{hoods} based on what you told us. Once you find something you love, we'll set up a visit with an agent.",
    processingLead: "{name}, looking for",
    processingLeadGeneric: "Looking for",
    anywhere: "Uruguay",
    inLocation: "in",
    and: "and",
    andMore: "and more",
    propertyTypesPlural: "properties",
    apartmentsPlural: "apartments",
    housesPlural: "houses",
    phsPlural: "PHs",
    loftsPlural: "lofts",
  },

  sell: {
    progressLabel: "Your property",
    sendingWithName: "Sending your details, {name}...",
    sendingGeneric: "Sending your details...",
    errorToast: "We couldn't send your information. An agent can still reach out if you try again.",
    thankYouWithName: "Thanks, {name}!",
    thankYouGeneric: "Thanks!",
    completionBody: "A WEEGGO agent will review your property details and reach out to coordinate next steps.",
    backToHome: "Back to home",
  },

  discover: {
    filters: "Filters",
    widenedSearch: "Nothing fit exactly — widened your search",
    emptyTitle: "That's everyone for now",
    emptyBody1: "You've seen every place we have — even outside your filters.",
    emptyBody2: "Check your shortlist or come back later for new listings.",
    adjustFilters: "Adjust filters",
    resetSeen: "See everything again",
    passAria: "Pass",
    topPickAria: "Top pick",
    shortlistAria: "Shortlist",
    stampShortlist: "Shortlist",
    stampPass: "Pass",
    stampTopPick: "Top pick",
    yieldNa: "Yield n/a",
    yieldLabel: "{pct}% yield",
    grossYieldLabel: "{pct}% gross yield",
    bedsLabel: "{n} bed",
    bathsLabel: "{n} bath",
    matchLabel: "{pct}% match",
    rentOnRequest: "Rent on request",
    perMonth: "/mo",
    requestViewing: "Request a viewing",
    bookViewing: "Book a viewing",
    keepSwiping: "Keep swiping",
    matchHeading: "It's a match!",
    matchBody: "This one lines up with what you're after better than almost anything else in your deck.",
    dismissAria: "Dismiss",
    typeApartment: "Apartment",
    typeHouse: "House",
    typePh: "PH",
    typeLoft: "Loft",
    compareTitle: "Compare",
    placesSideBySide: "{n} places side by side",
    removeFromCompare: "Remove from compare",
    addToCompare: "Add to compare",
    yourShortlist: "Your shortlist",
    shortlistEmpty: "Nothing yet — swipe right on places you like in Discover.",
    shortlistHint: "Places you've liked. Tap up to 3 to compare.",
    nSelected: "{n} selected",
    compareCta: "Compare →",
    selectionForName: "{name}'s selection",
    selectionGeneric: "Your curated selection",
    selectionCount: "{count} of {total}",
    skipToExplore: "Skip to explore everything",
  },

  filterPanel: {
    title: "Filters",
    subtitle: "Adjust your search anytime — no need to go through the assistant again.",
    neighborhoods: "Neighborhoods",
    propertyType: "Property type",
    budgetBuy: "Max price",
    budgetRent: "Max rent",
    noLimit: "No limit",
    minBeds: "Min bedrooms",
    minBaths: "Min bathrooms",
    any: "Any",
    amenities: "Amenities",
    amenitiesRequiredLabel: "Must have all",
    parking: "Parking",
    parkingAny: "No preference",
    parkingPreferred: "Preferred",
    parkingRequired: "Required",
    targetYield: "Min yield",
    targetYieldAny: "No minimum",
    clear: "Clear filters",
    applyLabel: "Show {n} properties",
    saveSearch: "Save this search & get alerts",
  },

  saveSearch: {
    title: "Save this search",
    subtitle: "We'll let you know when a new property matches these filters.",
    emailLabel: "Email (optional)",
    emailPlaceholder: "you@email.com",
    pushLabel: "Also notify me with push notifications",
    save: "Save search",
    saving: "Saving…",
    success: "Done! We'll alert you on new matches.",
    error: "Couldn't save your search — try again.",
  },

  matches: {
    title: "New matches",
    subtitle: "New properties that match your saved search.",
    doneTitle: "That's everything!",
    doneBody: "You've seen every new match from this alert.",
    backToDiscover: "Back to Discover",
  },

  alerts: {
    title: "Alerts",
    pushToggle: "Push notifications on this device",
    pushDenied: "We couldn't enable notifications — check your browser permissions.",
    noSearches: "You haven't saved a search yet. Save one from the filters to start getting alerts.",
    searchActive: "Active",
    deleteSearch: "Delete saved search",
    categoriesTitle: "What you want to hear about",
    categoryNewMatch: "New matches",
    categoryPriceDrop: "Price drops on favorites",
    categoryStatusChange: "Status changes on favorites",
    categoryDigest: "Weekly digest",
  },

  viewingForm: {
    fullNamePlaceholder: "Full name",
    emailPlaceholder: "Email",
    phonePlaceholder: "Phone / WhatsApp",
    contactWhatsApp: "WhatsApp",
    contactEmail: "Email",
    contactCall: "Call",
    validationError: "Fill in your name, email, and phone to continue.",
    sendError: "Couldn't send your request — try again.",
    successToast: "Viewing requested — the agent will confirm shortly",
    notificationMessage: "Viewing requested for {title} · {city}",
    sending: "Sending…",
    confirmRequest: "Confirm request",
  },

  notifications: {
    title: "Notifications",
    subtitle: "Viewing confirmations and updates on your shortlist show up here.",
    emptyBody: "Nothing yet. Request a viewing on a listing and we'll confirm it here.",
    justNow: "just now",
    minutesAgo: "{n}m ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
  },

  profile: {
    modeBuying: "Buying",
    modeRenting: "Renting",
    modeInvesting: "Investing",
    guestExplorer: "Guest explorer",
    yourFilters: "Your filters",
    priorities: "Priorities",
    neighborhoods: "Neighborhoods",
    budget: "Budget",
    typeAndSize: "Type & size",
    amenities: "Amenities",
    noPreference: "No preference",
    anywhere: "Anywhere",
    noLimit: "No limit",
    none: "None selected",
    required: "(required)",
    anyType: "Any",
    bedsSuffix: "{n}+ bed",
    anyBeds: "Any beds",
    bathsSuffix: "{n}+ bath",
    anyBath: "Any bath",
    editFilters: "Edit filters",
    activity: "Activity",
    shortlisted: "Shortlisted",
    passed: "Passed",
    startOver: "Start over from the beginning",
  },

  error: {
    title: "Something went wrong",
    body: "We couldn't load this screen. Try again in a moment.",
    retry: "Try again",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { es, en };
