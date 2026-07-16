import React, { useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useServerCollection } from "../lib/useServerCollection";

export interface RenewalItem {
  id: string;
  clientName: string;
  serviceName: string;
  amount: number;
  expiryDate: string;
  daysRemaining: number;
  status: "Paid" | "Warning" | "Overdue";
  notes: string;
}

type RenewalView = "calendar" | "list";

const REFERENCE_DATE = new Date("2025-01-03T00:00:00");
const CALENDAR_YEAR = 2025;
const CALENDAR_MONTH_INDEX = 0;
const DEFAULT_SELECTED_DATE = "2025-01-03";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const DEFAULT_RENEWALS: RenewalItem[] = [
  {
    id: "ren_1",
    clientName: "Farmacia",
    serviceName: "Renovación dominio + correo",
    amount: 380,
    expiryDate: "2025-01-20",
    daysRemaining: -2,
    status: "Overdue",
    notes: "Pago pendiente desde hace dos días.",
  },
  {
    id: "ren_2",
    clientName: "Constructora",
    serviceName: "Hosting VPS + SSL wildcard",
    amount: 2400,
    expiryDate: "2025-01-25",
    daysRemaining: 6,
    status: "Warning",
    notes: "Próximo a vencer esta semana.",
  },
  {
    id: "ren_3",
    clientName: "Grupo",
    serviceName: "Hosting empresarial",
    amount: 1800,
    expiryDate: "2025-01-31",
    daysRemaining: 14,
    status: "Warning",
    notes: "Renovación programada para fin de mes.",
  },
  {
    id: "ren_4",
    clientName: "Academia",
    serviceName: "Licencia educativa",
    amount: 1200,
    expiryDate: "2025-01-31",
    daysRemaining: 18,
    status: "Warning",
    notes: "Segunda renovación de enero.",
  },
  {
    id: "ren_5",
    clientName: "Hotel",
    serviceName: "Mantenimiento mensual",
    amount: 3200,
    expiryDate: "2025-01-17",
    daysRemaining: 30,
    status: "Paid",
    notes: "Activo y cubierto para este periodo.",
  },
  {
    id: "ren_6",
    clientName: "Clínica",
    serviceName: "Certificado SSL",
    amount: 950,
    expiryDate: "2025-02-12",
    daysRemaining: 42,
    status: "Paid",
    notes: "Activo con pago reciente.",
  },
  {
    id: "ren_7",
    clientName: "Despacho",
    serviceName: "Suscripción Workspace",
    amount: 1450,
    expiryDate: "2025-02-18",
    daysRemaining: 48,
    status: "Paid",
    notes: "Activo y al corriente.",
  },
  {
    id: "ren_8",
    clientName: "Taller",
    serviceName: "Hosting básico",
    amount: 480,
    expiryDate: "2025-01-08",
    daysRemaining: -4,
    status: "Overdue",
    notes: "Sin respuesta al último recordatorio.",
  },
];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(val);
}

function getStatusLabel(status: RenewalItem["status"]) {
  if (status === "Paid") return "Activo";
  if (status === "Warning") return "Próximo";
  return "Vencido";
}

function getStatusClasses(status: RenewalItem["status"]) {
  if (status === "Paid") {
    return "bg-blue-50 text-blue-600 border-blue-200";
  }
  if (status === "Warning") {
    return "bg-amber-50 text-amber-600 border-amber-200";
  }
  return "bg-rose-50 text-rose-500 border-rose-200";
}

function getEventClasses(status: RenewalItem["status"]) {
  if (status === "Paid") {
    return "bg-blue-500 text-white";
  }
  if (status === "Warning") {
    return "bg-amber-400 text-white";
  }
  return "bg-rose-400 text-white";
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatSelectedDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export default function CRMRenewals() {
  const [view, setView] = useState<RenewalView>("calendar");
  const [selectedDate, setSelectedDate] = useState(DEFAULT_SELECTED_DATE);
  const [calendarMonth, setCalendarMonth] = useState(new Date(CALENDAR_YEAR, CALENDAR_MONTH_INDEX, 1));
  const [showAddModal, setShowAddModal] = useState(false);

  const [newClient, setNewClient] = useState("");
  const [newService, setNewService] = useState("Hosting Servidor VPS");
  const [newAmount, setNewAmount] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [renewals, setRenewals] = useServerCollection<RenewalItem>("renewals", "crm_renewals", DEFAULT_RENEWALS);

  const saveRenewals = (updated: RenewalItem[]) => {
    setRenewals(updated);
  };

  const handleAddRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newAmount || !newExpiry) return;

    const expDate = new Date(`${newExpiry}T00:00:00`);
    const diffTime = expDate.getTime() - REFERENCE_DATE.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: RenewalItem["status"] = "Paid";
    if (diffDays < 0) status = "Overdue";
    else if (diffDays <= 30) status = "Warning";

    const nextRenewal: RenewalItem = {
      id: `ren_${Date.now()}`,
      clientName: newClient,
      serviceName: newService,
      amount: Number(newAmount),
      expiryDate: newExpiry,
      daysRemaining: diffDays,
      status,
      notes: newNotes,
    };

    saveRenewals([nextRenewal, ...renewals]);

    setNewClient("");
    setNewService("Hosting Servidor VPS");
    setNewAmount("");
    setNewExpiry("");
    setNewNotes("");
    setShowAddModal(false);
  };

  const handleDeleteRenewal = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este registro de renovación?")) {
      saveRenewals(renewals.filter((item) => item.id !== id));
    }
  };

  const handleTogglePaid = (id: string) => {
    const updated: RenewalItem[] = renewals.map((item) => {
      if (item.id !== id) return item;

      if (item.status === "Paid") {
        return { ...item, status: "Warning", daysRemaining: 7 };
      }

      return { ...item, status: "Paid", daysRemaining: 30 };
    });

    saveRenewals(updated);
  };

  const handleSendReminder = (ren: RenewalItem) => {
    const text = `Hola, te saludamos de Desings Agency. Te recordamos que tu servicio de "${ren.serviceName}" por un monto de ${formatCurrency(ren.amount)} expira el día ${ren.expiryDate} (${ren.daysRemaining} días restantes).`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const stats = useMemo(
    () => ({
      dueThisWeek: renewals.filter((item) => item.status === "Warning" && item.daysRemaining <= 7).length,
      dueThisMonth: renewals.filter((item) => item.status === "Warning").length,
      overdue: renewals.filter((item) => item.status === "Overdue").length,
      active: renewals.filter((item) => item.status === "Paid").length,
    }),
    [renewals],
  );

  const calendarItemsByDay = useMemo(() => {
    const map = new Map<string, RenewalItem[]>();

    renewals.forEach((item) => {
      const current = map.get(item.expiryDate) ?? [];
      current.push(item);
      map.set(item.expiryDate, current);
    });

    return map;
  }, [renewals]);

  const selectedDayRenewals = calendarItemsByDay.get(selectedDate) ?? [];

  const calendarCells = useMemo(() => {
    const calendarYear = calendarMonth.getFullYear();
    const calendarMonthIndex = calendarMonth.getMonth();
    const firstOfMonth = new Date(calendarYear, calendarMonthIndex, 1);
    const startDay = firstOfMonth.getDay();
    const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonthIndex, 0).getDate();
    const totalCells = startDay + daysInMonth > 35 ? 42 : 35;

    return Array.from({ length: totalCells }, (_, index) => {
      const dateOffset = index - startDay + 1;

      if (dateOffset <= 0) {
        const day = daysInPrevMonth + dateOffset;
        return {
          key: `prev-${day}`,
          day,
          isCurrentMonth: false,
          isoDate: toIsoDate(calendarYear, calendarMonthIndex - 1, day),
        };
      }

      if (dateOffset > daysInMonth) {
        const day = dateOffset - daysInMonth;
        return {
          key: `next-${day}`,
          day,
          isCurrentMonth: false,
          isoDate: toIsoDate(calendarYear, calendarMonthIndex + 1, day),
        };
      }

      return {
        key: `current-${dateOffset}`,
        day: dateOffset,
        isCurrentMonth: true,
        isoDate: toIsoDate(calendarYear, calendarMonthIndex, dateOffset),
      };
    });
  }, [calendarMonth]);

  const monthLabel = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(calendarMonth);
  const moveMonth = (offset: number) => {
    setCalendarMonth(current => {
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      setSelectedDate(toIsoDate(next.getFullYear(), next.getMonth(), 1));
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-rose-500">VENCEN ESTA SEMANA</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-red-500">{stats.dueThisWeek}</p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-amber-500">VENCEN ESTE MES</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-amber-500">{stats.dueThisMonth}</p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-rose-500">VENCIDAS</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-red-500">{stats.overdue}</p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-emerald-500">ACTIVAS</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-emerald-600">{stats.active}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={`inline-flex h-10 items-center rounded-l-xl rounded-r-none border px-4 text-[13px] font-bold transition-all ${
            view === "calendar"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          <Calendar className="mr-1.5 h-4 w-4" />
          Calendario
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          className={`inline-flex h-10 items-center rounded-r-xl rounded-l-none border border-l-0 px-4 text-[13px] font-bold transition-all ${
            view === "list"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          <List className="mr-1.5 h-4 w-4" />
          Lista
        </button>
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_252px]">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_22px_rgba(148,163,184,0.12)] md:px-5 md:py-5">
            <div className="mb-5 flex items-center justify-between px-2">
              <button type="button" onClick={() => moveMonth(-1)} aria-label="Mes anterior" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="text-[20px] font-bold capitalize text-slate-800">{monthLabel}</h3>
              <button type="button" onClick={() => moveMonth(1)} aria-label="Mes siguiente" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {DAY_LABELS.map((label) => (
                <div key={label} className="px-3 py-2 text-center text-[12px] font-bold text-slate-400">
                  {label}
                </div>
              ))}

              {calendarCells.map((cell) => {
                const cellItems = calendarItemsByDay.get(cell.isoDate) ?? [];
                const primaryItem = cellItems[0];
                const isSelected = selectedDate === cell.isoDate;
                const isActiveMarker = cell.isoDate === "2025-01-17";

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDate(cell.isoDate)}
                    className={`relative min-h-[92px] rounded-xl border px-3 py-3 text-left transition ${
                      cell.isCurrentMonth
                        ? "border-transparent bg-white hover:bg-slate-50"
                        : "border-transparent bg-slate-50/50 text-slate-300"
                    } ${isSelected ? "border-blue-400 bg-blue-50/40" : ""}`}
                  >
                    <div className={`text-[13px] font-medium ${cell.isCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                      {isActiveMarker ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                          {cell.day}
                        </span>
                      ) : (
                        cell.day
                      )}
                    </div>

                    {primaryItem && cell.isCurrentMonth && (
                      <div className={`mt-3 truncate rounded-md px-2 py-1 text-[12px] font-medium ${getEventClasses(primaryItem.status)}`}>
                        {primaryItem.clientName}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-5 border-t border-slate-100 px-2 pt-5 text-[13px]">
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                Vencido
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                Próximo (≤14d)
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                Activo
              </span>
            </div>
          </div>

          <aside className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_22px_rgba(148,163,184,0.12)]">
            <h4 className="text-[15px] font-bold capitalize text-slate-800">{formatSelectedDate(selectedDate)}</h4>
            <p className="mt-2 text-[13px] text-slate-400">{selectedDayRenewals.length} renovaciones</p>

            {selectedDayRenewals.length === 0 ? (
              <p className="mt-6 text-[14px] font-medium text-slate-400">Sin renovaciones este día</p>
            ) : (
              <div className="mt-5 space-y-3">
                {selectedDayRenewals.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-[14px] font-bold text-slate-700">{item.clientName}</p>
                    <p className="mt-1 text-[13px] text-slate-500">{item.serviceName}</p>
                    <p className="mt-2 text-[13px] font-semibold text-slate-700">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_22px_rgba(148,163,184,0.12)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  {["CLIENTE", "SERVICIO", "MONTO", "FECHA", "DÍAS", "ESTADO", "ACCIONES"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-slate-500 first:px-5 last:px-5"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renewals.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-5 py-4 text-[15px] font-bold text-slate-700">{item.clientName}</td>
                    <td className="px-4 py-4 text-[14px] font-medium text-slate-500">{item.serviceName}</td>
                    <td className="px-4 py-4 text-[15px] font-extrabold text-slate-700">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-4 text-[14px] font-medium text-slate-500">{item.expiryDate}</td>
                    <td className="px-4 py-4 text-[14px] font-medium text-slate-500">{item.daysRemaining} días</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-0.5 text-[13px] font-medium ${getStatusClasses(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePaid(item.id)}
                          className={`rounded-md px-2.5 py-1 text-[12px] font-bold transition ${
                            item.status === "Paid"
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {item.status === "Paid" ? "Deshacer" : "Renovar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReminder(item)}
                          className="text-blue-500 transition hover:text-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRenewal(item.id)}
                          className="text-rose-400 transition hover:text-rose-600"
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
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-2xl animate-scale-up">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900">
                <Plus className="h-5 w-5 text-[#1d63ff]" /> Programar Alerta de Renovación
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRenewal} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="mb-1.5 block text-slate-500">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="ej. Google Latam"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-slate-500">Servicio a Renovar *</label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff]"
                >
                  <option value="Hosting Servidor VPS Dedicado">Hosting Servidor VPS Dedicado</option>
                  <option value="Dominio corporativo .com / .mx">Dominio corporativo .com / .mx</option>
                  <option value="Certificado de Seguridad SSL">Certificado de Seguridad SSL</option>
                  <option value="Mantenimiento Web Mensual">Mantenimiento Web Mensual</option>
                  <option value="Suscripción Google Workspace">Suscripción Google Workspace</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-slate-500">Monto de Renovación (MXN) *</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="8500"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-slate-500">Fecha de Expiración *</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-slate-500">Notas / Detalles del Servidor</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ej. VPS en Amazon Web Services, clave de acceso registrada en Credenciales..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-slate-500 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-[#1d63ff] px-4 py-2 font-bold text-white shadow shadow-blue-500/15 transition hover:bg-blue-600"
                >
                  Programar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
