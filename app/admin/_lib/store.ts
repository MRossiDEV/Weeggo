import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  Agent,
  AgentRole,
  EmailLogEntry,
  EmailLogStatus,
  EmailTemplate,
  Lead,
  LeadContactMethod,
  LeadSource,
  LeadStatus,
  Partner,
  Property,
  PropertyStatus,
  PropertyType,
  SiteSettings,
  WizardAnswerValue,
  WizardConditionOperator,
  WizardFlow,
  WizardQuestion,
  WizardQuestionCategory,
  WizardQuestionStatus,
  WizardQuestionType,
} from "./types";

export type PropertyRow = {
  id: string;
  title: string;
  country: string;
  department: string | null;
  locality: string | null;
  city: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  badges: string[];
  tags: string[];
  cover_image_url: string;
  status: string;
  featured: boolean;
  property_type: string;
  rent_price: number | null;
  agent_id: string | null;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyImageRow = {
  property_id: string;
  url: string;
  sort_order: number;
};

type PartnerRow = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  contact_method: string;
  message: string | null;
  source: LeadSource;
  assessment: Record<string, WizardAnswerValue> | null;
  status: LeadStatus;
  assigned_agent_id: string | null;
  property_id: string | null;
  created_at: string;
};

export type AgentRow = {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string | null;
  role: AgentRole;
  avatar_url: string | null;
  bio: string | null;
  active: boolean;
  user_id: string | null;
  password_hash: string | null;
  created_at: string;
};

type EmailTemplateRow = {
  id: string;
  name: string;
  subject: string;
  body: string;
  updated_at: string;
};

type EmailLogRow = {
  id: string;
  template_id: string | null;
  recipient: string;
  subject: string;
  status: EmailLogStatus;
  sent_at: string | null;
  created_at: string;
};

type SettingsRow = {
  contact_email: string;
  whatsapp_number: string;
  instagram_url: string | null;
  facebook_url: string | null;
  default_seo_description: string | null;
};

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateSlug(title: string, fallback = "item"): string {
  const base = slugify(title) || fallback;
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

function toDbPropertyStatus(status: PropertyStatus): string {
  return status === "off-market" ? "off_market" : status;
}

function fromDbPropertyStatus(status: string): PropertyStatus {
  return status === "off_market" ? "off-market" : (status as PropertyStatus);
}

function fromDbContactMethod(method: string): LeadContactMethod {
  switch (method) {
    case "email":
      return "Email";
    case "llamada":
      return "Llamada";
    default:
      return "WhatsApp";
  }
}

export function mapProperty(row: PropertyRow, images: string[] = []): Property {
  return {
    id: row.id,
    title: row.title,
    country: row.country,
    department: row.department,
    locality: row.locality,
    city: row.city,
    description: row.description,
    price: Number(row.price),
    currency: "USD",
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaM2: Number(row.area_m2),
    badges: row.badges ?? [],
    tags: row.tags ?? [],
    image: row.cover_image_url,
    images,
    status: fromDbPropertyStatus(row.status),
    featured: row.featured,
    propertyType: row.property_type as PropertyType,
    rentPrice: row.rent_price === null ? null : Number(row.rent_price),
    agentId: row.agent_id,
    partnerId: row.partner_id,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function mapPartner(row: PartnerRow): Partner {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    country: row.country ?? undefined,
    city: row.city ?? undefined,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    active: row.active,
    hasAccount: row.password_hash !== null,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    contactMethod: fromDbContactMethod(row.contact_method),
    message: row.message ?? undefined,
    source: row.source,
    assessment: row.assessment ?? undefined,
    status: row.status,
    assignedAgentId: row.assigned_agent_id ?? undefined,
    propertyId: row.property_id ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function mapAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    role: row.role,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    active: row.active,
    // Was "linked to a Supabase Auth user" back when agents signed in via
    // magic-link; now that they're a direct password check against this
    // table, "has an account" means "has completed their invite" instead.
    hasAccount: row.password_hash !== null,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapTemplate(row: EmailTemplateRow): EmailTemplate {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    body: row.body,
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function mapLogEntry(row: EmailLogRow): EmailLogEntry {
  return {
    id: row.id,
    templateId: row.template_id ?? undefined,
    recipient: row.recipient,
    subject: row.subject,
    status: row.status,
    sentAt: new Date(row.sent_at ?? row.created_at).getTime(),
  };
}

function mapSettings(row: SettingsRow): SiteSettings {
  return {
    contactEmail: row.contact_email,
    whatsappNumber: row.whatsapp_number,
    instagramUrl: row.instagram_url ?? "",
    facebookUrl: row.facebook_url ?? "",
    defaultSeoDescription: row.default_seo_description ?? "",
  };
}

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/**
 * Full delete-then-reinsert of a property's gallery, keyed on display order.
 * Simple and correct for admin-form-scale writes (a handful of URLs at a
 * time) — no need to diff individual rows.
 */
async function replacePropertyImages(propertyId: string, urls: string[]): Promise<void> {
  const { error: deleteError } = await supabaseAdmin
    .from("weeggo_property_images")
    .delete()
    .eq("property_id", propertyId);
  assertNoError(deleteError);

  if (urls.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("weeggo_property_images").insert(
    urls.map((url, index) => ({
      property_id: propertyId,
      url,
      sort_order: index,
    }))
  );
  assertNoError(insertError);
}

export interface PropertyListFilters {
  status?: PropertyStatus;
  propertyType?: PropertyType;
  city?: string;
  locality?: string;
  department?: string;
  agentId?: string;
  partnerId?: string;
}

export const propertiesStore = {
  async list(filters?: PropertyListFilters): Promise<Property[]> {
    let query = supabaseAdmin
      .from("weeggo_properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.status) query = query.eq("status", toDbPropertyStatus(filters.status));
    if (filters?.propertyType) query = query.eq("property_type", filters.propertyType);
    if (filters?.city) query = query.eq("city", filters.city);
    if (filters?.locality) query = query.eq("locality", filters.locality);
    if (filters?.department) query = query.eq("department", filters.department);
    if (filters?.agentId) query = query.eq("agent_id", filters.agentId);
    if (filters?.partnerId) query = query.eq("partner_id", filters.partnerId);

    const { data, error } = await query;
    assertNoError(error);
    return (data as PropertyRow[]).map((row) => mapProperty(row));
  },

  async listByPartner(partnerId: string): Promise<Property[]> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_properties")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    assertNoError(error);
    return (data as PropertyRow[]).map((row) => mapProperty(row));
  },

  async listByAgent(agentId: string): Promise<Property[]> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_properties")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });
    assertNoError(error);
    return (data as PropertyRow[]).map((row) => mapProperty(row));
  },

  async get(id: string): Promise<Property | undefined> {
    const [{ data, error }, { data: imageRows, error: imagesError }] = await Promise.all([
      supabaseAdmin.from("weeggo_properties").select("*").eq("id", id).maybeSingle(),
      supabaseAdmin
        .from("weeggo_property_images")
        .select("property_id, url, sort_order")
        .eq("property_id", id)
        .order("sort_order", { ascending: true }),
    ]);
    assertNoError(error);
    assertNoError(imagesError);
    if (!data) return undefined;
    const images = ((imageRows ?? []) as PropertyImageRow[]).map((row) => row.url);
    return mapProperty(data as PropertyRow, images);
  },

  async create(data: Omit<Property, "id" | "createdAt" | "updatedAt">): Promise<Property> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_properties")
      .insert({
        slug: generateSlug(data.title, "propiedad"),
        title: data.title,
        country: data.country,
        department: data.department,
        locality: data.locality,
        city: data.city,
        description: data.description,
        price: data.price,
        currency: data.currency,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area_m2: data.areaM2,
        badges: data.badges,
        tags: data.tags,
        cover_image_url: data.image,
        status: toDbPropertyStatus(data.status),
        featured: data.featured,
        property_type: data.propertyType,
        rent_price: data.rentPrice,
        agent_id: data.agentId,
        partner_id: data.partnerId,
      })
      .select()
      .single();
    assertNoError(error);
    const property = row as PropertyRow;
    await replacePropertyImages(property.id, data.images);
    return mapProperty(property, data.images);
  },

  async update(
    id: string,
    data: Omit<Property, "id" | "createdAt" | "updatedAt">
  ): Promise<Property | undefined> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_properties")
      .update({
        title: data.title,
        country: data.country,
        department: data.department,
        locality: data.locality,
        city: data.city,
        description: data.description,
        price: data.price,
        currency: data.currency,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area_m2: data.areaM2,
        badges: data.badges,
        tags: data.tags,
        cover_image_url: data.image,
        status: toDbPropertyStatus(data.status),
        featured: data.featured,
        property_type: data.propertyType,
        rent_price: data.rentPrice,
        agent_id: data.agentId,
        partner_id: data.partnerId,
      })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    if (!row) return undefined;
    await replacePropertyImages(id, data.images);
    return mapProperty(row as PropertyRow, data.images);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("weeggo_properties").delete().eq("id", id);
    assertNoError(error);
  },
};

export const leadsStore = {
  async list(): Promise<Lead[]> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_leads")
      .select("*")
      .order("created_at", { ascending: false });
    assertNoError(error);
    return (data as LeadRow[]).map(mapLead);
  },

  async listByPropertyIds(propertyIds: string[]): Promise<Lead[]> {
    if (propertyIds.length === 0) return [];
    const { data, error } = await supabaseAdmin
      .from("weeggo_leads")
      .select("*")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });
    assertNoError(error);
    return (data as LeadRow[]).map(mapLead);
  },

  async get(id: string): Promise<Lead | undefined> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertNoError(error);
    return data ? mapLead(data as LeadRow) : undefined;
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_leads")
      .update({ status })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    return data ? mapLead(data as LeadRow) : undefined;
  },

  async assignAgent(id: string, agentId: string | null): Promise<Lead | undefined> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_leads")
      .update({ assigned_agent_id: agentId })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    return data ? mapLead(data as LeadRow) : undefined;
  },
};

export const agentsStore = {
  async list(): Promise<Agent[]> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_agents")
      .select("*")
      .order("name", { ascending: true });
    assertNoError(error);
    return (data as AgentRow[]).map(mapAgent);
  },

  async get(id: string): Promise<Agent | undefined> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_agents")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertNoError(error);
    return data ? mapAgent(data as AgentRow) : undefined;
  },

  async create(
    data: Omit<Agent, "id" | "slug" | "createdAt" | "hasAccount">
  ): Promise<Agent> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_agents")
      .insert({
        slug: generateSlug(data.name, "agente"),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        avatar_url: data.avatarUrl,
        active: data.active,
      })
      .select()
      .single();
    assertNoError(error);
    return mapAgent(row as AgentRow);
  },

  async update(
    id: string,
    data: Omit<Agent, "id" | "slug" | "createdAt" | "hasAccount">
  ): Promise<Agent | undefined> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_agents")
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        avatar_url: data.avatarUrl,
        active: data.active,
      })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    return row ? mapAgent(row as AgentRow) : undefined;
  },

  async updateProfile(
    id: string,
    data: { name: string; phone: string; avatarUrl?: string; bio?: string }
  ): Promise<Agent | undefined> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_agents")
      .update({
        name: data.name,
        phone: data.phone,
        avatar_url: data.avatarUrl || null,
        bio: data.bio || null,
      })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    return row ? mapAgent(row as AgentRow) : undefined;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("weeggo_agents").delete().eq("id", id);
    assertNoError(error);
  },
};

export const partnersStore = {
  async list(): Promise<Partner[]> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_partners")
      .select("*")
      .order("name", { ascending: true });
    assertNoError(error);
    return (data as PartnerRow[]).map(mapPartner);
  },

  async get(id: string): Promise<Partner | undefined> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_partners")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertNoError(error);
    return data ? mapPartner(data as PartnerRow) : undefined;
  },

  async create(data: Omit<Partner, "id" | "createdAt" | "updatedAt" | "hasAccount">): Promise<Partner> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_partners")
      .insert({
        name: data.name,
        contact_name: data.contactName || null,
        email: data.email || null,
        phone: data.phone || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
        notes: data.notes || null,
        active: data.active,
      })
      .select()
      .single();
    assertNoError(error);
    return mapPartner(row as PartnerRow);
  },

  async update(
    id: string,
    data: Omit<Partner, "id" | "createdAt" | "updatedAt" | "hasAccount">
  ): Promise<Partner | undefined> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_partners")
      .update({
        name: data.name,
        contact_name: data.contactName || null,
        email: data.email || null,
        phone: data.phone || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
        notes: data.notes || null,
        active: data.active,
      })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    return row ? mapPartner(row as PartnerRow) : undefined;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("weeggo_partners").delete().eq("id", id);
    assertNoError(error);
  },

  // Self-service subset for the partner portal's "Mi Perfil" — deliberately
  // excludes active/notes, which stay admin-only (a partner shouldn't be
  // able to reactivate their own deactivated account, and notes are an
  // internal admin record about them, not theirs to edit).
  async updateProfile(
    id: string,
    data: { name: string; contactName: string; phone: string; country: string; city: string; address: string }
  ): Promise<Partner | undefined> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_partners")
      .update({
        name: data.name,
        contact_name: data.contactName || null,
        phone: data.phone || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
      })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    return row ? mapPartner(row as PartnerRow) : undefined;
  },
};

export const emailTemplatesStore = {
  async list(): Promise<EmailTemplate[]> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_email_templates")
      .select("*")
      .order("name", { ascending: true });
    assertNoError(error);
    return (data as EmailTemplateRow[]).map(mapTemplate);
  },

  async get(id: string): Promise<EmailTemplate | undefined> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_email_templates")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    assertNoError(error);
    return data ? mapTemplate(data as EmailTemplateRow) : undefined;
  },

  async create(data: Omit<EmailTemplate, "id" | "updatedAt">): Promise<EmailTemplate> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_email_templates")
      .insert({ name: data.name, subject: data.subject, body: data.body })
      .select()
      .single();
    assertNoError(error);
    return mapTemplate(row as EmailTemplateRow);
  },

  async update(
    id: string,
    data: Omit<EmailTemplate, "id" | "updatedAt">
  ): Promise<EmailTemplate | undefined> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_email_templates")
      .update({ name: data.name, subject: data.subject, body: data.body })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    return row ? mapTemplate(row as EmailTemplateRow) : undefined;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("weeggo_email_templates").delete().eq("id", id);
    assertNoError(error);
  },
};

export const emailLogStore = {
  async list(): Promise<EmailLogEntry[]> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_email_log")
      .select("*")
      .order("created_at", { ascending: false });
    assertNoError(error);
    return (data as EmailLogRow[]).map(mapLogEntry);
  },
};

type WizardQuestionRow = {
  id: string;
  flow: WizardFlow;
  step_key: string;
  title: string;
  subtitle: string | null;
  placeholder: string | null;
  category: WizardQuestionCategory;
  question_type: WizardQuestionType;
  required: boolean;
  condition_step_key: string | null;
  condition_operator: WizardConditionOperator | null;
  condition_value: string | null;
  sort_order: number;
  status: WizardQuestionStatus;
  created_at: string;
  updated_at: string;
};

type WizardOptionRow = {
  id: string;
  question_id: string;
  value: string;
  label: string;
  sort_order: number;
};

function mapWizardQuestion(row: WizardQuestionRow, options: WizardOptionRow[]): WizardQuestion {
  return {
    id: row.id,
    flow: row.flow,
    stepKey: row.step_key,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    placeholder: row.placeholder ?? undefined,
    category: row.category,
    questionType: row.question_type,
    required: row.required,
    condition: row.condition_step_key
      ? {
          stepKey: row.condition_step_key,
          operator: row.condition_operator ?? "equals",
          value: row.condition_value ?? "",
        }
      : undefined,
    sortOrder: row.sort_order,
    status: row.status,
    options: options
      .filter((o) => o.question_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({ id: o.id, value: o.value, label: o.label })),
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export interface WizardQuestionInput {
  stepKey: string;
  title: string;
  subtitle: string | null;
  placeholder: string | null;
  category: WizardQuestionCategory;
  questionType: WizardQuestionType;
  required: boolean;
  status: WizardQuestionStatus;
  conditionStepKey: string | null;
  conditionOperator: WizardConditionOperator | null;
  conditionValue: string | null;
  options: { value: string; label: string }[];
}

async function replaceWizardOptions(questionId: string, options: { value: string; label: string }[]): Promise<void> {
  const { error: deleteError } = await supabaseAdmin
    .from("weeggo_wizard_options")
    .delete()
    .eq("question_id", questionId);
  assertNoError(deleteError);

  if (options.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("weeggo_wizard_options").insert(
    options.map((option, index) => ({
      question_id: questionId,
      value: option.value,
      label: option.label,
      sort_order: index,
    }))
  );
  assertNoError(insertError);
}

export const wizardQuestionsStore = {
  async list(flow: WizardFlow): Promise<WizardQuestion[]> {
    const { data: questions, error } = await supabaseAdmin
      .from("weeggo_wizard_questions")
      .select("*")
      .eq("flow", flow)
      .order("sort_order", { ascending: true });
    assertNoError(error);

    const questionRows = (questions ?? []) as WizardQuestionRow[];
    const ids = questionRows.map((q) => q.id);
    if (ids.length === 0) return [];

    const { data: options, error: optionsError } = await supabaseAdmin
      .from("weeggo_wizard_options")
      .select("*")
      .in("question_id", ids);
    assertNoError(optionsError);

    return questionRows.map((row) => mapWizardQuestion(row, (options ?? []) as WizardOptionRow[]));
  },

  async get(id: string): Promise<WizardQuestion | undefined> {
    const [{ data: question, error }, { data: options, error: optionsError }] = await Promise.all([
      supabaseAdmin.from("weeggo_wizard_questions").select("*").eq("id", id).maybeSingle(),
      supabaseAdmin.from("weeggo_wizard_options").select("*").eq("question_id", id),
    ]);
    assertNoError(error);
    assertNoError(optionsError);
    if (!question) return undefined;
    return mapWizardQuestion(question as WizardQuestionRow, (options ?? []) as WizardOptionRow[]);
  },

  async create(flow: WizardFlow, data: WizardQuestionInput): Promise<WizardQuestion> {
    const { data: existing, error: countError } = await supabaseAdmin
      .from("weeggo_wizard_questions")
      .select("sort_order")
      .eq("flow", flow)
      .order("sort_order", { ascending: false })
      .limit(1);
    assertNoError(countError);
    const nextSortOrder = existing && existing.length > 0 ? (existing[0] as { sort_order: number }).sort_order + 1 : 0;

    const { data: row, error } = await supabaseAdmin
      .from("weeggo_wizard_questions")
      .insert({
        flow,
        step_key: data.stepKey,
        title: data.title,
        subtitle: data.subtitle,
        placeholder: data.placeholder,
        category: data.category,
        question_type: data.questionType,
        required: data.required,
        status: data.status,
        condition_step_key: data.conditionStepKey,
        condition_operator: data.conditionOperator,
        condition_value: data.conditionValue,
        sort_order: nextSortOrder,
      })
      .select()
      .single();
    assertNoError(error);

    const question = row as WizardQuestionRow;
    await replaceWizardOptions(question.id, data.options);
    const created = await wizardQuestionsStore.get(question.id);
    if (!created) throw new Error("No se pudo crear la pregunta.");
    return created;
  },

  async update(id: string, data: WizardQuestionInput): Promise<WizardQuestion | undefined> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_wizard_questions")
      .update({
        step_key: data.stepKey,
        title: data.title,
        subtitle: data.subtitle,
        placeholder: data.placeholder,
        category: data.category,
        question_type: data.questionType,
        required: data.required,
        status: data.status,
        condition_step_key: data.conditionStepKey,
        condition_operator: data.conditionOperator,
        condition_value: data.conditionValue,
      })
      .eq("id", id)
      .select()
      .maybeSingle();
    assertNoError(error);
    if (!row) return undefined;

    await replaceWizardOptions(id, data.options);
    return wizardQuestionsStore.get(id);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("weeggo_wizard_questions").delete().eq("id", id);
    assertNoError(error);
  },

  async setStatus(id: string, status: WizardQuestionStatus): Promise<void> {
    const { error } = await supabaseAdmin.from("weeggo_wizard_questions").update({ status }).eq("id", id);
    assertNoError(error);
  },

  /** Swaps sort_order with the adjacent question (in the same flow) one step up or down — simple reordering, no drag-and-drop needed for a handful of questions per flow. */
  async move(flow: WizardFlow, id: string, direction: "up" | "down"): Promise<void> {
    const questions = await wizardQuestionsStore.list(flow);
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= questions.length) return;

    const current = questions[index];
    const swapWith = questions[swapIndex];

    await Promise.all([
      supabaseAdmin.from("weeggo_wizard_questions").update({ sort_order: swapWith.sortOrder }).eq("id", current.id),
      supabaseAdmin.from("weeggo_wizard_questions").update({ sort_order: current.sortOrder }).eq("id", swapWith.id),
    ]);
  },
};

export const settingsStore = {
  async get(): Promise<SiteSettings> {
    const { data, error } = await supabaseAdmin
      .from("weeggo_settings")
      .select("*")
      .eq("id", 1)
      .single();
    assertNoError(error);
    return mapSettings(data as SettingsRow);
  },

  async update(data: SiteSettings): Promise<SiteSettings> {
    const { data: row, error } = await supabaseAdmin
      .from("weeggo_settings")
      .update({
        contact_email: data.contactEmail,
        whatsapp_number: data.whatsappNumber,
        instagram_url: data.instagramUrl,
        facebook_url: data.facebookUrl,
        default_seo_description: data.defaultSeoDescription,
      })
      .eq("id", 1)
      .select()
      .single();
    assertNoError(error);
    return mapSettings(row as SettingsRow);
  },
};
