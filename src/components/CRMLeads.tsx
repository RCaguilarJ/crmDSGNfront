import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

type LeadStage =
  | "Nuevo"
  | "Contactado"
  | "Reunión agendada"
  | "Cotización enviada"
  | "Seguimiento"
  | "Ganado"
  | "Perdido";

type LeadPriority = "Media" | "Alta";
type AvatarTone = "emerald" | "sky" | "amber" | "rose" | "orange" | "violet";

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  budget: number;
  stage: LeadStage;
  priority: LeadPriority;
  service: string;
  source: string;
  owner: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  initials: string;
  avatarTone: AvatarTone;
}

type LeadFormState = {
  companyName: string;
  contactName: string;
  budget: string;
  stage: LeadStage;
  priority: LeadPriority;
  service: string;
  source: string;
  owner: string;
  email: string;
  phone: string;
  notes: string;
};

const STAGES: LeadStage[] = [
  "Nuevo",
  "Contactado",
  "Reunión agendada",
  "Cotización enviada",
  "Seguimiento",
  "Ganado",
  "Perdido",
];

const STAGE_META: Record<
  LeadStage,
  {
    headerClass: string;
    amountClass: string;
    countClass: string;
    addClass: string;
  }
> = {
  Nuevo: {
    headerClass: "border-slate-200 bg-slate-50/80 text-slate-700",
    amountClass: "text-slate-400",
    countClass: "text-slate-600",
    addClass: "border-slate-200 text-slate-300 hover:text-slate-400 hover:border-slate-300",
  },
  Contactado: {
    headerClass: "border-blue-200 bg-blue-50/70 text-[#3971ff]",
    amountClass: "text-slate-400",
    countClass: "text-[#3971ff]",
    addClass: "border-blue-200/70 text-blue-200 hover:text-blue-300 hover:border-blue-300",
  },
  "Reunión agendada": {
    headerClass: "border-violet-200 bg-violet-50/70 text-violet-600",
    amountClass: "text-slate-400",
    countClass: "text-violet-600",
    addClass: "border-violet-200/70 text-violet-200 hover:text-violet-300 hover:border-violet-300",
  },
  "Cotización enviada": {
    headerClass: "border-amber-200 bg-amber-50/70 text-amber-600",
    amountClass: "text-slate-400",
    countClass: "text-amber-600",
    addClass: "border-amber-200/70 text-amber-200 hover:text-amber-300 hover:border-amber-300",
  },
  Seguimiento: {
    headerClass: "border-orange-200 bg-orange-50/70 text-orange-600",
    amountClass: "text-slate-400",
    countClass: "text-orange-600",
    addClass: "border-orange-200/70 text-orange-200 hover:text-orange-300 hover:border-orange-300",
  },
  Ganado: {
    headerClass: "border-emerald-200 bg-emerald-50/70 text-emerald-600",
    amountClass: "text-slate-400",
    countClass: "text-emerald-600",
    addClass: "border-emerald-200/70 text-emerald-200 hover:text-emerald-300 hover:border-emerald-300",
  },
  Perdido: {
    headerClass: "border-rose-200 bg-rose-50/70 text-rose-600",
    amountClass: "text-slate-400",
    countClass: "text-rose-600",
    addClass: "border-rose-200/70 text-rose-200 hover:text-rose-300 hover:border-rose-300",
  },
};

const AVATAR_TONE_CLASS: Record<AvatarTone, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  orange: "bg-orange-500",
  violet: "bg-violet-500",
};

const PRIORITY_CLASS: Record<LeadPriority, string> = {
  Media: "border-blue-200 bg-blue-50 text-[#4b7cff]",
  Alta: "border-amber-200 bg-amber-50 text-amber-600",
};

const DEFAULT_LEADS: Lead[] = [
  {
    id: "lead_1",
    companyName: "AutoPartes del Norte",
    contactName: "Ing. Pablo Mora",
    budget: 55000,
    stage: "Nuevo",
    priority: "Media",
    service: "E-commerce",
    source: "Página web",
    owner: "Daniela",
    email: "pablo.mora@autopartesnorte.mx",
    phone: "664-555-1101",
    notes: "Busca renovar su tienda digital y mejorar conversiones.",
    createdAt: "2026-07-02",
    initials: "Au",
    avatarTone: "emerald",
  },
  {
    id: "lead_2",
    companyName: "Escuela Montessori Norte",
    contactName: "Mtra. Lucia Vargas",
    budget: 38000,
    stage: "Contactado",
    priority: "Media",
    service: "LMS + Web",
    source: "Google Ads",
    owner: "Sofia",
    email: "lucia@montessorinorte.edu.mx",
    phone: "664-555-1102",
    notes: "Quiere un sitio institucional con área privada para padres.",
    createdAt: "2026-07-03",
    initials: "Es",
    avatarTone: "sky",
  },
  {
    id: "lead_3",
    companyName: "Clinica Dental Sonora",
    contactName: "Dra. Carmen Rios",
    budget: 12000,
    stage: "Reunión agendada",
    priority: "Media",
    service: "Landing Page",
    source: "Facebook Ads",
    owner: "Daniela",
    email: "carmen.rios@clinicadentalsonora.mx",
    phone: "662-555-1103",
    notes: "Agendada demo para explicar alcance de campaña y página.",
    createdAt: "2026-07-04",
    initials: "Cl",
    avatarTone: "amber",
  },
  {
    id: "lead_4",
    companyName: "Distribuidora Central MX",
    contactName: "Lic. Raul Gutierrez",
    budget: 45000,
    stage: "Cotización enviada",
    priority: "Alta",
    service: "E-commerce",
    source: "Referido",
    owner: "Daniela",
    email: "raul@distribuidoracentral.mx",
    phone: "664-555-1104",
    notes: "Esperando respuesta sobre propuesta final y tiempos.",
    createdAt: "2026-07-01",
    initials: "Di",
    avatarTone: "rose",
  },
  {
    id: "lead_5",
    companyName: "Constructora Pedraza",
    contactName: "Ing. Fernando Pedraza",
    budget: 95000,
    stage: "Seguimiento",
    priority: "Alta",
    service: "Portal + CRM",
    source: "LinkedIn",
    owner: "Carlos",
    email: "fernando@constructorapedraza.mx",
    phone: "664-555-1105",
    notes: "Revisando alcance de portal de clientes con automatizaciones.",
    createdAt: "2026-06-29",
    initials: "Co",
    avatarTone: "orange",
  },
  {
    id: "lead_6",
    companyName: "Bufete Garza & Asociados",
    contactName: "Lic. Rodrigo Garza",
    budget: 22000,
    stage: "Ganado",
    priority: "Alta",
    service: "Sitio corporativo",
    source: "Referido",
    owner: "Daniela",
    email: "rodrigo@bufetegarza.mx",
    phone: "664-555-1106",
    notes: "Proyecto cerrado y pendiente de arranque con diseño.",
    createdAt: "2026-06-27",
    initials: "Bu",
    avatarTone: "violet",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(companyName: string) {
  const cleaned = companyName.trim();
  if (!cleaned) {
    return "PR";
  }

  const firstWord = cleaned.split(/\s+/)[0] ?? cleaned;
  return firstWord.slice(0, 2);
}

function getAvatarTone(seed: string): AvatarTone {
  const tones: AvatarTone[] = ["emerald", "sky", "amber", "rose", "orange", "violet"];
  const sum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[sum % tones.length];
}

function normalizeLegacyStage(input: unknown): LeadStage {
  switch (input) {
    case "Nuevo":
      return "Nuevo";
    case "Contacto":
    case "Contactado":
      return "Contactado";
    case "Reunión agendada":
      return "Reunión agendada";
    case "Propuesta":
    case "Cotización enviada":
      return "Cotización enviada";
    case "Negociación":
    case "Seguimiento":
      return "Seguimiento";
    case "Ganado":
      return "Ganado";
    case "Perdido":
      return "Perdido";
    default:
      return "Nuevo";
  }
}

function normalizeLead(raw: any): Lead {
  const companyName = String(raw.companyName ?? raw.company ?? "Prospecto nuevo");
  const contactName = String(raw.contactName ?? raw.name ?? "Sin contacto");
  const budget = Number(raw.budget ?? 0);

  return {
    id: String(raw.id ?? `lead_${Date.now()}`),
    companyName,
    contactName,
    budget,
    stage: normalizeLegacyStage(raw.stage ?? raw.phase),
    priority: raw.priority === "Alta" ? "Alta" : budget >= 40000 ? "Alta" : "Media",
    service: String(raw.service ?? raw.interest ?? "Sitio corporativo"),
    source: String(raw.source ?? "Página web"),
    owner: String(raw.owner ?? "Daniela"),
    email: String(raw.email ?? "contacto@empresa.com"),
    phone: String(raw.phone ?? "664-000-0000"),
    notes: String(raw.notes ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString().split("T")[0]),
    initials: String(raw.initials ?? getInitials(companyName)),
    avatarTone: raw.avatarTone ?? getAvatarTone(companyName),
  };
}

function createEmptyForm(stage: LeadStage): LeadFormState {
  return {
    companyName: "",
    contactName: "",
    budget: "",
    stage,
    priority: "Media",
    service: "",
    source: "Página web",
    owner: "Daniela",
    email: "",
    phone: "",
    notes: "",
  };
}

export default function CRMLeads() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const cached = localStorage.getItem("crm_leads");

    if (!cached) {
      return DEFAULT_LEADS;
    }

    try {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed.map(normalizeLead) : DEFAULT_LEADS;
    } catch {
      return DEFAULT_LEADS;
    }
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [formState, setFormState] = useState<LeadFormState>(() => createEmptyForm("Nuevo"));

  const saveLeads = (nextLeads: Lead[]) => {
    setLeads(nextLeads);
    localStorage.setItem("crm_leads", JSON.stringify(nextLeads));
  };

  const stageColumns = useMemo(
    () =>
      STAGES.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.stage === stage);
        return {
          stage,
          leads: stageLeads,
          totalBudget: stageLeads.reduce((sum, lead) => sum + lead.budget, 0),
          count: stageLeads.length,
        };
      }),
    [leads],
  );

  const openCreateModal = (stage: LeadStage) => {
    setEditingLeadId(null);
    setFormState(createEmptyForm(stage));
    setShowFormModal(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setFormState({
      companyName: lead.companyName,
      contactName: lead.contactName,
      budget: String(lead.budget),
      stage: lead.stage,
      priority: lead.priority,
      service: lead.service,
      source: lead.source,
      owner: lead.owner,
      email: lead.email,
      phone: lead.phone,
      notes: lead.notes,
    });
    setShowFormModal(true);
  };

  const openViewModal = (lead: Lead) => {
    setViewingLead(lead);
    setShowViewModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingLeadId(null);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.companyName.trim() || !formState.contactName.trim()) {
      return;
    }

    const normalizedLead: Lead = {
      id: editingLeadId ?? `lead_${Date.now()}`,
      companyName: formState.companyName.trim(),
      contactName: formState.contactName.trim(),
      budget: Number(formState.budget) || 0,
      stage: formState.stage,
      priority: formState.priority,
      service: formState.service.trim() || "Sitio corporativo",
      source: formState.source.trim() || "Página web",
      owner: formState.owner.trim() || "Daniela",
      email: formState.email.trim() || "contacto@empresa.com",
      phone: formState.phone.trim() || "664-000-0000",
      notes: formState.notes.trim(),
      createdAt:
        leads.find((lead) => lead.id === editingLeadId)?.createdAt ??
        new Date().toISOString().split("T")[0],
      initials: getInitials(formState.companyName),
      avatarTone:
        leads.find((lead) => lead.id === editingLeadId)?.avatarTone ??
        getAvatarTone(formState.companyName),
    };

    const nextLeads = editingLeadId
      ? leads.map((lead) => (lead.id === editingLeadId ? normalizedLead : lead))
      : [...leads, normalizedLead];

    saveLeads(nextLeads);
    closeFormModal();
  };

  const handleDeleteLead = (leadId: string) => {
    if (!confirm("Eliminar este prospecto del tablero?")) {
      return;
    }

    saveLeads(leads.filter((lead) => lead.id !== leadId));
  };

  const handleMoveLead = (leadId: string, direction: "prev" | "next") => {
    saveLeads(
      leads.map((lead) => {
        if (lead.id !== leadId) {
          return lead;
        }

        const stageIndex = STAGES.indexOf(lead.stage);
        const nextIndex =
          direction === "prev"
            ? Math.max(stageIndex - 1, 0)
            : Math.min(stageIndex + 1, STAGES.length - 1);

        return {
          ...lead,
          stage: STAGES[nextIndex],
        };
      }),
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="overflow-x-auto pb-3">
        <div className="grid w-full min-w-[1540px] grid-cols-7 gap-2.5">
          {stageColumns.map(({ stage, leads: stageLeads, totalBudget, count }) => {
            const stageMeta = STAGE_META[stage];

            return (
              <div key={stage} className="space-y-4">
                <div
                  className={`rounded-2xl border px-[14px] py-3 shadow-[0_6px_16px_rgba(148,163,184,0.08)] ${stageMeta.headerClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-bold leading-none">{stage}</p>
                      <p className={`mt-1 text-[13px] font-semibold ${stageMeta.amountClass}`}>
                        {formatCurrency(totalBudget)}
                      </p>
                    </div>
                    <span className={`text-[13px] font-bold leading-none ${stageMeta.countClass}`}>{count}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <article
                      key={lead.id}
                      className="rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_26px_rgba(148,163,184,0.14)]"
                    >
                      <div className="px-4 pb-4 pt-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${AVATAR_TONE_CLASS[lead.avatarTone]}`}
                            >
                              {lead.initials}
                            </span>
                            <p className="truncate text-[14px] font-bold text-slate-700">{lead.companyName}</p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-[13px] font-semibold leading-none ${PRIORITY_CLASS[lead.priority]}`}
                          >
                            {lead.priority}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-[14px] text-slate-400">
                          <p className="truncate font-medium">{lead.contactName}</p>
                          <p className="truncate font-medium">{lead.service}</p>
                        </div>

                        <p className="mt-3 text-[15px] font-extrabold text-slate-700">{formatCurrency(lead.budget)}</p>

                        <div className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-slate-300">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {lead.source} - {lead.owner}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-slate-300">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveLead(lead.id, "prev")}
                            className="rounded-md p-1 transition-colors hover:bg-slate-50 hover:text-slate-500"
                            title="Mover a la etapa anterior"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLead(lead.id, "next")}
                            className="rounded-md p-1 transition-colors hover:bg-slate-50 hover:text-slate-500"
                            title="Mover a la siguiente etapa"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openViewModal(lead)}
                            className="rounded-md p-1 transition-colors hover:bg-slate-50 hover:text-[#4b7cff]"
                            title="Ver prospecto"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(lead)}
                            className="rounded-md p-1 transition-colors hover:bg-slate-50 hover:text-slate-500"
                            title="Editar prospecto"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="rounded-md p-1 transition-colors hover:bg-rose-50 hover:text-rose-400"
                            title="Eliminar prospecto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}

                  <button
                    type="button"
                    onClick={() => openCreateModal(stage)}
                    className={`flex h-11 w-full items-center justify-center rounded-[18px] border border-dashed bg-white/35 text-[14px] font-semibold transition-colors ${stageMeta.addClass}`}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Agregar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-blue-50 p-2 text-[#1d63ff]">
                  <UserPlus className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingLeadId ? "Editar prospecto" : "Nuevo prospecto"}
                  </h3>
                  <p className="text-xs font-medium text-slate-400">Actualiza los datos visibles del tablero.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Empresa</span>
                  <input
                    type="text"
                    required
                    value={formState.companyName}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, companyName: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Contacto</span>
                  <input
                    type="text"
                    required
                    value={formState.contactName}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, contactName: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Presupuesto</span>
                  <input
                    type="number"
                    min="0"
                    value={formState.budget}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, budget: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Etapa</span>
                  <select
                    value={formState.stage}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, stage: event.target.value as LeadStage }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Prioridad</span>
                  <select
                    value={formState.priority}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        priority: event.target.value as LeadPriority,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Servicio</span>
                  <input
                    type="text"
                    value={formState.service}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, service: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Origen</span>
                  <input
                    type="text"
                    value={formState.source}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, source: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Responsable</span>
                  <input
                    type="text"
                    value={formState.owner}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, owner: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Email</span>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, email: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Telefono</span>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <label className="block text-left">
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">Notas</span>
                <textarea
                  rows={3}
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, notes: event.target.value }))
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1d63ff] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-600"
                >
                  {editingLeadId ? "Guardar cambios" : "Crear prospecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${AVATAR_TONE_CLASS[viewingLead.avatarTone]}`}
                >
                  {viewingLead.initials}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900">{viewingLead.companyName}</h3>
                  <p className="text-xs font-medium text-slate-400">{viewingLead.stage}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Contacto</p>
                <p className="mt-2 text-sm font-bold text-slate-800">{viewingLead.contactName}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{viewingLead.email}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{viewingLead.phone}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Negocio</p>
                <p className="mt-2 text-sm font-bold text-slate-800">{viewingLead.service}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {viewingLead.source} - {viewingLead.owner}
                </p>
                <p className="mt-1 text-sm font-extrabold text-slate-700">{formatCurrency(viewingLead.budget)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Notas</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                {viewingLead.notes || "Sin notas registradas."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
