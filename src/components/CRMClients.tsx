import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import type { Client, ClientDraft, ClientStatus } from "../types";

interface CRMClientsProps {
  clients?: Client[];
  onClientsLoaded?: (clients: Client[]) => void;
  onClientSaved?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
  onSelectClient?: (client: Client) => void;
}

const STATUS_OPTIONS: ClientStatus[] = ["Activo", "Próximo a vencer", "Vencido", "Suspendido"];
const AVATAR_COLORS = [
  "bg-[#f59e0b]",
  "bg-[#ec4899]",
  "bg-[#eab308]",
  "bg-[#84cc16]",
  "bg-[#a855f7]",
  "bg-[#10b981]",
  "bg-[#ef4444]",
  "bg-[#1d63ff]",
  "bg-[#6366f1]",
];

const EMPTY_CLIENT_FORM: ClientDraft = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  status: "Activo",
  services: 1,
  responsible: "",
  nextRenewal: "",
  avatarInitials: "CL",
  avatarBg: "bg-[#1d63ff]",
};

function getInitials(companyName: string) {
  const parts = companyName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return companyName.trim().slice(0, 2).toUpperCase() || "CL";
}

function getRandomAvatarBg() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function normalizeClientDraft(draft: ClientDraft): ClientDraft {
  const companyName = draft.companyName.trim();
  const contactName = draft.contactName.trim();
  const email =
    draft.email.trim() ||
    `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "cliente"}@contacto.mx`;

  return {
    companyName,
    contactName,
    email,
    phone: draft.phone?.trim() || null,
    status: draft.status,
    services: Math.max(1, Number(draft.services) || 1),
    responsible: draft.responsible?.trim() || null,
    nextRenewal: draft.nextRenewal?.trim() || null,
    avatarInitials: getInitials(companyName),
    avatarBg: draft.avatarBg || getRandomAvatarBg(),
  };
}

function toClientDraft(client: Client): ClientDraft {
  return {
    companyName: client.companyName,
    contactName: client.contactName,
    email: client.email,
    phone: client.phone || "",
    status: client.status,
    services: client.services,
    responsible: client.responsible || "",
    nextRenewal: client.nextRenewal || "",
    avatarInitials: client.avatarInitials,
    avatarBg: client.avatarBg,
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return value.slice(0, 10);
}

function getStatusClasses(status: ClientStatus) {
  if (status === "Activo") {
    return "bg-[#eafaf1] text-[#00b289] border-[#d2f6e4]";
  }

  if (status === "Próximo a vencer") {
    return "bg-[#fff8eb] text-[#f59e0b] border-[#ffe9cc]";
  }

  if (status === "Vencido") {
    return "bg-[#fef2f2] text-[#ef4444] border-[#fee2e2]";
  }

  return "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]";
}

export default function CRMClients({
  clients: initialClients = [],
  onClientsLoaded,
  onClientSaved,
  onDeleteClient,
  onSelectClient,
}: CRMClientsProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"Todos" | ClientStatus>("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientDraft>(EMPTY_CLIENT_FORM);

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      setLoading(true);
      setError("");

      try {
        const data = await api.clients.list();
        if (cancelled) {
          return;
        }

        setClients(data.clients);
        onClientsLoaded?.(data.clients);
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message = err instanceof Error ? err.message : "No se pudieron cargar los clientes.";
        setError(message);
        setClients(initialClients);
        onClientsLoaded?.(initialClients);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) || null,
    [clients, selectedClientId],
  );

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        client.companyName.toLowerCase().includes(normalizedSearch) ||
        client.contactName.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch) ||
        (client.phone || "").toLowerCase().includes(normalizedSearch) ||
        (client.responsible || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus = filterStatus === "Todos" || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [clients, filterStatus, searchTerm]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function resetForm() {
    setForm(EMPTY_CLIENT_FORM);
    setEditingClientId(null);
    setIsModalOpen(false);
  }

  function openCreateModal() {
    setEditingClientId(null);
    setForm({
      ...EMPTY_CLIENT_FORM,
      avatarBg: getRandomAvatarBg(),
    });
    setIsModalOpen(true);
  }

  function openEditModal(client: Client) {
    setEditingClientId(client.id);
    setForm(toClientDraft(client));
    setIsModalOpen(true);
  }

  function handleFormChange<K extends keyof ClientDraft>(field: K, value: ClientDraft[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.companyName.trim() || !form.contactName.trim()) {
      setError("Empresa y contacto son obligatorios.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = normalizeClientDraft(form);

      if (editingClientId) {
        const response = await api.clients.update(editingClientId, payload);
        setClients((current) => current.map((client) => (client.id === editingClientId ? response.client : client)));
        onClientSaved?.(response.client);
      } else {
        const response = await api.clients.create(payload);
        setClients((current) => [response.client, ...current]);
        onClientSaved?.(response.client);
        setSelectedClientId(response.client.id);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el cliente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Deseas eliminar este cliente?")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.clients.remove(id);
      setClients((current) => current.filter((client) => client.id !== id));
      onDeleteClient?.(id);

      if (selectedClientId === id) {
        setSelectedClientId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el cliente.");
    } finally {
      setSaving(false);
    }
  }

  function handleSelectClient(client: Client) {
    setSelectedClientId(client.id);
    onSelectClient?.(client);
  }

  if (selectedClient) {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setSelectedClientId(null)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al listado de clientes
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(selectedClient)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 transition-all hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
            <button
              onClick={() => void handleDelete(selectedClient.id)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-extrabold text-rose-600 transition-all hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-5">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${selectedClient.avatarBg} text-2xl font-extrabold uppercase text-white shadow-md`}>
              {selectedClient.avatarInitials}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-black leading-none tracking-tight text-slate-800 md:text-2xl">
                  {selectedClient.companyName}
                </h1>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClasses(selectedClient.status)}`}>
                  {selectedClient.status}
                </span>
              </div>
              <p className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Contacto principal: <span className="text-slate-800">{selectedClient.contactName}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Servicios Activos</span>
              <span className="mt-1 flex items-center gap-1.5 text-xl font-black text-slate-800">
                <Layers className="h-4 w-4 text-[#1d63ff]" />
                {selectedClient.services} contratados
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Próxima Renovación</span>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-xl font-black text-slate-800">
                <Calendar className="h-4 w-4 text-[#f59e0b]" />
                {formatDate(selectedClient.nextRenewal)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-4 border-b border-slate-100 pb-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Información General
              </h3>

              <div className="space-y-4 text-xs font-semibold text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-50 p-2 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black uppercase text-slate-400">Correo</span>
                    <a href={`mailto:${selectedClient.email}`} className="mt-0.5 block truncate font-mono text-slate-800 hover:text-[#1d63ff]">
                      {selectedClient.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-50 p-2 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-400">Teléfono</span>
                    <span className="mt-0.5 block font-mono text-slate-800">{selectedClient.phone || "Sin teléfono"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-50 p-2 text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-400">Responsable</span>
                    <span className="mt-0.5 block font-black text-[#1d63ff]">{selectedClient.responsible || "Sin asignar"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-50 p-2 text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-400">Registro</span>
                    <span className="mt-0.5 block font-mono text-slate-800">{formatDate(selectedClient.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Notas de Bitácora</h3>
                <span className="text-[10px] font-mono text-slate-400">Mock sincronizable</span>
              </div>
              <textarea
                className="h-32 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-[#1d63ff]/5"
                placeholder="Agregar notas internas del cliente..."
                defaultValue={`Cliente sincronizado desde MySQL. Responsable actual: ${selectedClient.responsible || "Sin asignar"}.`}
              />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Servicios Contratados ({selectedClient.services})
                  </h3>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-400">Referencia visual alimentada con el contrato real del backend.</p>
                </div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: selectedClient.services }).map((_, index) => (
                  <div
                    key={`${selectedClient.id}-service-${index}`}
                    className="flex items-start justify-between rounded-2xl border border-slate-200/30 bg-slate-50/70 p-3.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-800">Servicio #{index + 1}</span>
                        <span className="rounded-md border border-slate-100 bg-white px-2 py-0.5 text-[9px] font-black uppercase text-slate-400">
                          Activo
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">
                        Seguimiento comercial y operativo del cliente en AsociaCRM.
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-black text-[#00b289]">Sincronizado</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <ClientModal
            form={form}
            saving={saving}
            title={editingClientId ? "Editar Cliente" : "Registrar Nuevo Cliente"}
            onClose={resetForm}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in text-left">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800">
            <Users className="h-5 w-5 text-[#1d63ff]" />
            Clientes en Sistema
          </h2>
          <p className="text-xs text-slate-500">Listado conectado al backend Express + MySQL.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-xl bg-[#1d63ff] px-4 py-2 text-xs font-black text-white shadow-md shadow-[#1d63ff]/10 transition-all hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Registrar Cliente
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong className="font-black">Atención:</strong> {error}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar cliente..."
            className="w-full rounded-xl border border-slate-200/80 bg-white py-2 pr-4 pl-9 text-[11px] font-semibold text-slate-700 shadow-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/5"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(event) => {
              setFilterStatus(event.target.value as "Todos" | ClientStatus);
              setCurrentPage(1);
            }}
            className="min-w-[110px] appearance-none rounded-xl border border-slate-200/80 bg-white py-2 pr-8 pl-3.5 text-[11px] font-black text-slate-700 shadow-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/5"
          >
            <option value="Todos">Todos</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[10px] text-slate-400">▼</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-xs font-semibold">
            <thead className="border-b border-slate-200/60 bg-slate-50/75">
              <tr>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Cliente</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Contacto</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Teléfono</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Correo</th>
                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Servicios</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Responsable</th>
                <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Estado</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Próx. Renovación</th>
                <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <LoaderCircle className="h-6 w-6 animate-spin text-[#1d63ff]" />
                      <span className="text-xs font-bold">Cargando clientes desde la API...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-xs font-bold text-slate-400">
                    No hay clientes que coincidan con la búsqueda actual.
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${client.avatarBg} text-xs font-black uppercase text-white`}>
                          {client.avatarInitials}
                        </div>
                        <div>
                          <div className="font-black text-slate-800">{client.companyName}</div>
                          <div className="font-mono text-[11px] text-slate-400">{client.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{client.contactName}</td>
                    <td className="px-4 py-4 font-mono text-slate-600">{client.phone || "Sin teléfono"}</td>
                    <td className="px-4 py-4 font-mono text-slate-600">{client.email}</td>
                    <td className="px-4 py-4 text-center font-black text-slate-800">{client.services}</td>
                    <td className="px-4 py-4 text-slate-700">{client.responsible || "Sin asignar"}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClasses(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-600">{formatDate(client.nextRenewal)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSelectClient(client)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-[#1d63ff]"
                          title="Ver cliente"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
                          title="Editar cliente"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleDelete(client.id)}
                          disabled={saving}
                          className="rounded-xl border border-rose-200 p-2 text-rose-500 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold">{filteredClients.length} clientes en total</span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[90px] text-center font-black text-slate-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ClientModal
          form={form}
          saving={saving}
          title={editingClientId ? "Editar Cliente" : "Registrar Nuevo Cliente"}
          onClose={resetForm}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

interface ClientModalProps {
  form: ClientDraft;
  saving: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof ClientDraft>(field: K, value: ClientDraft[K]) => void;
}

function ClientModal({ form, saving, title, onClose, onSubmit, onChange }: ClientModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1d63ff]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 transition-all hover:bg-slate-200/60">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6 text-xs font-semibold">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-slate-500">Empresa *</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(event) => onChange("companyName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-slate-500">Contacto Principal *</label>
              <input
                type="text"
                required
                value={form.contactName}
                onChange={(event) => onChange("contactName", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-slate-500">Correo Electrónico *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-slate-500">Teléfono</label>
              <input
                type="text"
                value={form.phone || ""}
                onChange={(event) => onChange("phone", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-slate-500">Responsable</label>
              <input
                type="text"
                value={form.responsible || ""}
                onChange={(event) => onChange("responsible", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-slate-500">Próxima Renovación</label>
              <input
                type="date"
                value={form.nextRenewal || ""}
                onChange={(event) => onChange("nextRenewal", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-slate-500">Servicios Contratados</label>
              <input
                type="number"
                min="1"
                value={form.services}
                onChange={(event) => onChange("services", Number(event.target.value) || 1)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-slate-500">Estado</label>
              <select
                value={form.status}
                onChange={(event) => onChange("status", event.target.value as ClientStatus)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1d63ff] py-3 font-extrabold text-white shadow-lg shadow-[#1d63ff]/10 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 font-extrabold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
