export type PropertyStatus = "draft" | "published" | "off-market";

export type PropertyType = "apartment" | "house" | "ph" | "loft";

export interface Property {
  id: string;
  title: string;
  country: string;
  /** Uruguayan department (Montevideo, Canelones, Maldonado, etc). Null if not set. */
  department: string | null;
  /** City/locality (Montevideo, Punta del Este, Colonia del Sacramento, etc). Null if not set. */
  locality: string | null;
  /** Despite the name, this is the neighborhood (Pocitos, Carrasco, etc), not the city — see `locality`. */
  city: string;
  description: string;
  price: number;
  currency: "USD";
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  /** Marketing labels picked from a fixed list (see lib/discover/constants.ts BADGES). */
  badges: string[];
  tags: string[];
  image: string;
  /** Additional gallery photos beyond `image` (the cover), in display order. */
  images: string[];
  status: PropertyStatus;
  featured: boolean;
  propertyType: PropertyType;
  /** Monthly rent estimate. Null when the property has no rental figure. */
  rentPrice: number | null;
  /** Listing agent (WEEGGO staff). Null when unassigned. */
  agentId: string | null;
  /** External realtor/agency this listing came from. Null when direct/self-submitted. */
  partnerId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type LeadStatus = "new" | "contacted" | "closed";
export type LeadSource = "wizard" | "contact" | "sell";
export type LeadContactMethod = "WhatsApp" | "Email" | "Llamada";

export type WizardAnswerValue = string | string[] | number;

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  contactMethod: LeadContactMethod;
  message?: string;
  source: LeadSource;
  assessment?: Record<string, WizardAnswerValue>;
  status: LeadStatus;
  assignedAgentId?: string;
  propertyId?: string;
  createdAt: number;
}

export type AgentRole = "admin" | "agent";

export interface Agent {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  role: AgentRole;
  avatarUrl?: string;
  bio?: string;
  active: boolean;
  hasAccount: boolean;
  createdAt: number;
}

export interface Partner {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  /** Where the partner agency is based — informational only. Defaults to "Uruguay". */
  country?: string;
  city?: string;
  address?: string;
  notes?: string;
  active: boolean;
  /** Has completed their invite (set a password) and can actually log in to the partner portal. */
  hasAccount: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: number;
}

export type EmailLogStatus = "sent" | "failed" | "queued";

export interface EmailLogEntry {
  id: string;
  templateId?: string;
  recipient: string;
  subject: string;
  status: EmailLogStatus;
  sentAt: number;
}

export interface SiteSettings {
  contactEmail: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  defaultSeoDescription: string;
}

export type WizardFlow = "buyer" | "seller";

export type WizardQuestionType =
  | "single"
  | "multiple"
  | "text"
  | "email"
  | "phone"
  | "number"
  | "range"
  | "select"
  | "location"
  | "currency";

export type WizardQuestionCategory =
  | "profile"
  | "contact"
  | "situation"
  | "property"
  | "lifestyle"
  | "location"
  | "financial"
  | "timeline"
  | "additional";

export type WizardConditionOperator = "equals" | "not_equals" | "contains" | "greater_than" | "less_than";

export type WizardQuestionStatus = "draft" | "published";

export interface WizardQuestionOption {
  id: string;
  value: string;
  label: string;
}

export interface WizardQuestionCondition {
  stepKey: string;
  operator: WizardConditionOperator;
  value: string;
}

/** An admin-editable question in the buyer or seller wizard assistant — see app/wizard/lib/load-questions.ts for the public-facing read path. */
export interface WizardQuestion {
  id: string;
  flow: WizardFlow;
  /** Stable id the rest of the app reads by (filter mapping, lead mapping, conditions) — see the migration's comment on weeggo_wizard_questions.step_key. */
  stepKey: string;
  title: string;
  subtitle?: string;
  placeholder?: string;
  category: WizardQuestionCategory;
  questionType: WizardQuestionType;
  required: boolean;
  condition?: WizardQuestionCondition;
  sortOrder: number;
  status: WizardQuestionStatus;
  options: WizardQuestionOption[];
  createdAt: number;
  updatedAt: number;
}
