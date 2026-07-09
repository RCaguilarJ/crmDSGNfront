import React, { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

type BillingPeriod = "Mensual" | "Anual";
type ServiceStatus = "Activo" | "Próximo a vencer" | "Urgente" | "Vencido" | "Suspendido";

export interface ServiceItem {
  id: string;
  clientName: string;
  serviceName: string;
  billingPeriod: BillingPeriod;
  price: number;
  startDate: string;
  renewalDate: string;
  status: ServiceStatus;
  owner: string;
}

type ServiceFormState = {
  clientName: string;
  serviceName: string;
  billingPeriod: BillingPeriod;
  price: string;
  startDate: string;
  renewalDate: string;
  status: ServiceStatus;
  owner: string;
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "srv_1",
    clientName: "Constructora Murillo",
    serviceName: "Hosting Pro cPanel",
    billingPeriod: "Anual",
    price: 1200,
    startDate: "2024-02-15",
    renewalDate: "2025-02-15",
    status: "Activo",
    owner: "Carlos",
  },
  {
    id: "srv_2",
    clientName: "Constructora Murillo",
    serviceName: "Dominio constructoramurillo.mx",
    billingPeriod: "Anual",
    price: 380,
    startDate: "2024-02-15",
    renewalDate: "2025-02-15",
    status: "Activo",
    owner: "Carlos",
  },
  {
    id: "srv_3",
    clientName: "Constructora Murillo",
    serviceName: "Mantenimiento web mensual",
    billingPeriod: "Mensual",
    price: 800,
    startDate: "2024-02-15",
    renewalDate: "2025-02-01",
    status: "Activo",
    owner: "Carlos",
  },
  {
    id: "srv_4",
    clientName: "Farmacia San",
    serviceName: "Hosting Empresarial + SSL",
    billingPeriod: "Anual",
    price: 1800,
    startDate: "2024-01-20",
    renewalDate: "2025-01-20",
    status: "Próximo a vencer",
    owner: "Sofia",
  },
  {
    id: "srv_5",
    clientName: "Farmacia San",
    serviceName: "Dominio farmsanpablo.mx",
    billingPeriod: "Anual",
    price: 380,
    startDate: "2024-01-20",
    renewalDate: "2025-01-20",
    status: "Urgente",
    owner: "Sofia",
  },
  {
    id: "srv_6",
    clientName: "Grupo Inmobiliario",
    serviceName: "Hosting VPS + SSL Wildcard",
    billingPeriod: "Anual",
    price: 2400,
    startDate: "2024-01-31",
    renewalDate: "2025-01-31",
    status: "Próximo a vencer",
    owner: "Marco",
  },
  {
    id: "srv_7",
    clientName: "Hotel Boutique",
    serviceName: "Hosting + CDN Cloudflare",
    billingPeriod: "Anual",
    price: 3200,
    startDate: "2024-05-15",
    renewalDate: "2025-05-15",
    status: "Activo",
    owner: "Valeria",
  },
  {
    id: "srv_8",
    clientName: "Despacho Juridico",
    serviceName: "Hosting basico + correos",
    billingPeriod: "Anual",
    price: 880,
    startDate: "2024-01-12",
    renewalDate: "2025-01-12",
    status: "Vencido",
    owner: "Carlos",
  },
  {
    id: "srv_9",
    clientName: "Academia de",
    serviceName: "Hosting educativo + LMS",
    billingPeriod: "Anual",
    price: 1800,
    startDate: "2024-02-28",
    renewalDate: "2025-02-28",
    status: "Activo",
    owner: "Luis",
  },
  {
    id: "srv_10",
    clientName: "Taller Automotriz",
    serviceName: "Hosting basico",
    billingPeriod: "Anual",
    price: 480,
    startDate: "2024-06-01",
    renewalDate: "2025-06-01",
    status: "Suspendido",
    owner: "Luis",
  },
];

const STATUS_OPTIONS: Array<"Todos" | ServiceStatus> = [
  "Todos",
  "Activo",
  "Próximo a vencer",
  "Urgente",
  "Vencido",
  "Suspendido",
];

const STATUS_STYLES: Record<ServiceStatus, string> = {
  Activo: "border-emerald-200 bg-emerald-50 text-emerald-600",
  "Próximo a vencer": "border-amber-300 bg-amber-50 text-amber-600",
  Urgente: "border-amber-300 bg-amber-50 text-amber-600",
  Vencido: "border-rose-200 bg-rose-50 text-rose-500",
  Suspendido: "border-slate-200 bg-slate-100 text-slate-500",
};

function createEmptyForm(): ServiceFormState {
  return {
    clientName: "",
    serviceName: "",
    billingPeriod: "Anual",
    price: "",
    startDate: "",
    renewalDate: "",
    status: "Activo",
    owner: "",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTableDate(date: string) {
  if (!date) {
    return "-";
  }

  return date;
}

function normalizeStatus(input: unknown): ServiceStatus {
  switch (input) {
    case "Activo":
      return "Activo";
    case "Próximo a vencer":
    case "Proximo a vencer":
      return "Próximo a vencer";
    case "Urgente":
      return "Urgente";
    case "Vencido":
      return "Vencido";
    case "Suspendido":
      return "Suspendido";
    default:
      return "Activo";
  }
}

function normalizeBillingPeriod(input: unknown): BillingPeriod {
  return input === "Mensual" ? "Mensual" : "Anual";
}

function normalizeService(raw: any): ServiceItem {
  return {
    id: String(raw.id ?? `srv_${Date.now()}`),
    clientName: String(raw.clientName ?? raw.client ?? "Cliente"),
    serviceName: String(raw.serviceName ?? raw.name ?? "Servicio"),
    billingPeriod: normalizeBillingPeriod(raw.billingPeriod),
    price: Number(raw.price ?? 0),
    startDate: String(raw.startDate ?? "2024-01-01"),
    renewalDate: String(raw.renewalDate ?? "2025-01-01"),
    status: normalizeStatus(raw.status),
    owner: String(raw.owner ?? "Sin responsable"),
  };
}

function addPeriod(dateString: string, period: BillingPeriod) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);

  if (period === "Mensual") {
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 1);
  }

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export default function CRMServices() {
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const cached = localStorage.getItem("crm_services");

    if (!cached) {
      return DEFAULT_SERVICES;
    }

    try {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed.map(normalizeService) : DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | ServiceStatus>("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ServiceFormState>(createEmptyForm());

  const saveServices = (nextServices: ServiceItem[]) => {
    setServices(nextServices);
    localStorage.setItem("crm_services", JSON.stringify(nextServices));
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "Todos" || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, services, statusFilter]);

  const metrics = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter((service) => service.status === "Activo").length;
    const urgentServices = services.filter((service) =>
      service.status === "Próximo a vencer" || service.status === "Urgente",
    ).length;
    const annualBilling = services.reduce((sum, service) => sum + service.price, 0);

    return {
      totalServices,
      activeServices,
      urgentServices,
      annualBilling,
    };
  }, [services]);

  const openCreateModal = () => {
    setEditingServiceId(null);
    setFormState(createEmptyForm());
    setShowModal(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setFormState({
      clientName: service.clientName,
      serviceName: service.serviceName,
      billingPeriod: service.billingPeriod,
      price: String(service.price),
      startDate: service.startDate,
      renewalDate: service.renewalDate,
      status: service.status,
      owner: service.owner,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingServiceId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.clientName.trim() || !formState.serviceName.trim() || !formState.price.trim()) {
      return;
    }

    const normalized: ServiceItem = {
      id: editingServiceId ?? `srv_${Date.now()}`,
      clientName: formState.clientName.trim(),
      serviceName: formState.serviceName.trim(),
      billingPeriod: formState.billingPeriod,
      price: Number(formState.price) || 0,
      startDate: formState.startDate || "2024-01-01",
      renewalDate: formState.renewalDate || "2025-01-01",
      status: formState.status,
      owner: formState.owner.trim() || "Sin responsable",
    };

    const nextServices = editingServiceId
      ? services.map((service) => (service.id === editingServiceId ? normalized : service))
      : [...services, normalized];

    saveServices(nextServices);
    closeModal();
  };

  const handleDeleteService = (serviceId: string) => {
    if (!confirm("Eliminar este servicio?")) {
      return;
    }

    saveServices(services.filter((service) => service.id !== serviceId));
  };

  const handleRenewService = (serviceId: string) => {
    saveServices(
      services.map((service) => {
        if (service.id !== serviceId) {
          return service;
        }

        const nextStartDate = service.renewalDate;
        const nextRenewalDate = addPeriod(service.renewalDate, service.billingPeriod);

        return {
          ...service,
          startDate: nextStartDate,
          renewalDate: nextRenewalDate,
          status: "Activo",
        };
      }),
    );
  };

  return (
    <div className="animate-fade-in space-y-6 text-left">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">TOTAL SERVICIOS</p>
          <p className="mt-2.5 text-[24px] font-extrabold leading-none text-blue-600">{metrics.totalServices}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">ACTIVOS</p>
          <p className="mt-2.5 text-[24px] font-extrabold leading-none text-emerald-500">{metrics.activeServices}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">PRÓXIMOS/URGENTES</p>
          <p className="mt-2.5 text-[24px] font-extrabold leading-none text-amber-500">{metrics.urgentServices}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">FACTURACIÓN ANUAL</p>
          <p className="mt-2.5 text-[24px] font-extrabold leading-none text-violet-500">
            {formatCurrency(metrics.annualBilling)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          <label className="relative block w-full max-w-[420px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "Todos" | ServiceStatus)}
            className="h-12 w-full max-w-[208px] rounded-2xl border border-slate-200 bg-white px-5 text-[15px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "Todos" ? "Todos" : status}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nuevo servicio
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_22px_rgba(148,163,184,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1160px] w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {["CLIENTE", "SERVICIO", "PERIODICIDAD", "PRECIO", "INICIO", "RENOVACIÓN", "ESTADO", "RESPONSABLE", "ACCIONES"].map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-5 py-3 text-[15px] font-bold text-slate-700">{service.clientName}</td>
                  <td className="px-5 py-3 text-[15px] font-medium leading-[1.25] text-slate-500">
                    {service.serviceName}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-0.5 text-[13px] font-medium text-slate-500">
                      {service.billingPeriod}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[15px] font-extrabold text-slate-700">
                    {formatCurrency(service.price)}
                  </td>
                  <td className="px-5 py-3 text-[15px] font-medium leading-[1.25] text-slate-400">
                    {formatTableDate(service.startDate)}
                  </td>
                  <td className="px-5 py-3 text-[15px] font-medium text-slate-400">
                    {formatTableDate(service.renewalDate)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-0.5 text-[13px] font-medium leading-none ${STATUS_STYLES[service.status]}`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[15px] font-medium text-slate-500">{service.owner}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="text-blue-500 transition hover:text-blue-700"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {(service.status === "Próximo a vencer" ||
                        service.status === "Urgente" ||
                        service.status === "Vencido") && (
                        <button
                          type="button"
                          onClick={() => handleRenewService(service.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[13px] font-bold text-white transition hover:bg-emerald-700"
                        >
                          Renovar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-rose-400 transition hover:text-rose-600"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingServiceId ? "Editar servicio" : "Nuevo servicio"}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Configura cliente, fechas, renovación y responsable.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Cliente</span>
                  <input
                    type="text"
                    required
                    value={formState.clientName}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, clientName: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Servicio</span>
                  <input
                    type="text"
                    required
                    value={formState.serviceName}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, serviceName: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Periodicidad</span>
                  <select
                    value={formState.billingPeriod}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        billingPeriod: event.target.value as BillingPeriod,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="Anual">Anual</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                </label>
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Precio</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formState.price}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, price: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Inicio</span>
                  <input
                    type="date"
                    value={formState.startDate}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, startDate: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Renovación</span>
                  <input
                    type="date"
                    value={formState.renewalDate}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, renewalDate: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-left">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Estado</span>
                  <select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        status: event.target.value as ServiceStatus,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Próximo a vencer">Próximo a vencer</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </label>
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
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-700"
                >
                  {editingServiceId ? "Guardar cambios" : "Guardar servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
