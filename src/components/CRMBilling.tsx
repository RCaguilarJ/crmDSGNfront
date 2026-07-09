import React, { useState } from "react";
import {
  CheckCircle,
  CircleCheck,
  Calendar,
  DollarSign,
  Download,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: "Pagado" | "Pendiente" | "Vencido";
  dueDate: string;
  description: string;
}

interface CRMBillingProps {
  invoices: Invoice[];
  clients: Array<{ companyName: string }>;
  onAddInvoice: (inv: Omit<Invoice, "id">) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
}

type BillingViewStatus = Invoice["status"] | "Parcial";

const PAYMENT_METHOD_PATTERN = [
  "Transferencia",
  "—",
  "Transferencia",
  "—",
  "—",
  "Efectivo",
  "Transferencia",
  "—",
  "Tarjeta",
  "—",
] as const;

const FACTURADO_PATTERN = [true, false, true, false, false, true, true, false, false, false] as const;
const PAID_OFFSET_PATTERN = [5, 0, 2, 0, 0, 3, 35, 0, 2, 0] as const;

function subtractDays(dateString: string, days: number) {
  if (!dateString || days <= 0) {
    return dateString || "—";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() - days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function CRMBilling({
  invoices,
  clients,
  onAddInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus,
}: CRMBillingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | BillingViewStatus>("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvClient, setNewInvClient] = useState("");
  const [newInvAmount, setNewInvAmount] = useState("");
  const [newInvStatus, setNewInvStatus] = useState<Invoice["status"]>("Pendiente");
  const [newInvDueDate, setNewInvDueDate] = useState("");
  const [newInvDesc, setNewInvDesc] = useState("");

  const [activePdfInvoice, setActivePdfInvoice] = useState<Invoice | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newInvClient || !newInvAmount) {
      alert("Por favor selecciona un cliente e introduce el monto.");
      return;
    }

    onAddInvoice({
      clientName: newInvClient,
      amount: Number(newInvAmount),
      status: newInvStatus,
      dueDate: newInvDueDate || new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split("T")[0],
      description: newInvDesc || "Servicio de diseño y réplica a código de componentes React + Tailwind.",
    });

    setNewInvClient("");
    setNewInvAmount("");
    setNewInvStatus("Pendiente");
    setNewInvDueDate("");
    setNewInvDesc("");
    setShowAddModal(false);
  };

  const rows = invoices.map((inv, index) => {
    const rawStatus = inv.status as string;
    const viewStatus: BillingViewStatus = rawStatus === "Parcial" ? "Parcial" : inv.status;
    const paidOffset = PAID_OFFSET_PATTERN[index % PAID_OFFSET_PATTERN.length];

    return {
      ...inv,
      viewStatus,
      paymentDate: viewStatus === "Pagado" ? subtractDays(inv.dueDate, paidOffset || 3) : "—",
      paymentMethod:
        viewStatus === "Pagado" || viewStatus === "Parcial"
          ? PAYMENT_METHOD_PATTERN[index % PAYMENT_METHOD_PATTERN.length]
          : "—",
      isFacturado: FACTURADO_PATTERN[index % FACTURADO_PATTERN.length],
    };
  });

  const filteredInvoices = rows.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "All" || inv.viewStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPaid = rows
    .filter((invoice) => invoice.viewStatus === "Pagado")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = rows
    .filter((invoice) => invoice.viewStatus === "Pendiente")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = rows
    .filter((invoice) => invoice.viewStatus === "Vencido")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPartial = rows
    .filter((invoice) => invoice.viewStatus === "Parcial")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">TOTAL COBRADO</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-emerald-500">{formatCurrency(totalPaid)}</p>
          <p className="mt-2 flex items-center gap-1 text-[12px] font-medium text-slate-400">
            <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
            {rows.filter((invoice) => invoice.viewStatus === "Pagado").length} pagos
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">PENDIENTE</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-amber-500">{formatCurrency(totalPending)}</p>
          <p className="mt-2 flex items-center gap-1 text-[12px] font-medium text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            {rows.filter((invoice) => invoice.viewStatus === "Pendiente").length} pagos
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">VENCIDO</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-rose-500">{formatCurrency(totalOverdue)}</p>
          <p className="mt-2 flex items-center gap-1 text-[12px] font-medium text-slate-400">
            <X className="h-3.5 w-3.5 text-rose-400" />
            {rows.filter((invoice) => invoice.viewStatus === "Vencido").length} pagos
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.03em] text-slate-500">PARCIAL</p>
          <p className="mt-1.5 text-[17px] font-extrabold leading-none text-blue-500">{formatCurrency(totalPartial)}</p>
          <p className="mt-2 flex items-center gap-1 text-[12px] font-medium text-slate-400">
            <DollarSign className="h-3.5 w-3.5 text-blue-400" />
            {rows.filter((invoice) => invoice.viewStatus === "Parcial").length} pagos
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block w-full max-w-[420px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente o concepto..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-[14px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {(["All", "Pagado", "Pendiente", "Vencido", "Parcial"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`inline-flex h-9 items-center justify-center rounded-xl border px-3.5 text-[12px] font-bold transition-all ${
                  filterStatus === status
                    ? "border-blue-600 bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                {status === "All" ? "Todos" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (filteredInvoices[0]) {
                setActivePdfInvoice(filteredInvoices[0]);
              }
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nuevo pago
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_22px_rgba(148,163,184,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1220px] w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                {["CLIENTE", "CONCEPTO", "MONTO", "FECHA LÍMITE", "FECHA PAGO", "MÉTODO", "ESTADO", "FACTURADO", "ACCIONES"].map((header) => (
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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-sm font-medium text-slate-400">
                    No se encontraron pagos registrados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-5 py-4 text-[15px] font-bold text-slate-700">{inv.clientName}</td>
                    <td className="px-4 py-4 text-[14px] font-medium text-slate-500">{inv.description}</td>
                    <td className="px-4 py-4 text-[15px] font-extrabold text-slate-700">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-4 text-[14px] font-medium text-slate-500">{inv.dueDate}</td>
                    <td className="px-4 py-4 text-[14px] font-medium text-slate-400">{inv.paymentDate}</td>
                    <td className="px-4 py-4 text-[14px] font-medium text-slate-500">{inv.paymentMethod}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-0.5 text-[13px] font-medium leading-none ${
                          inv.viewStatus === "Pagado"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : inv.viewStatus === "Pendiente"
                              ? "border-amber-300 bg-amber-50 text-amber-600"
                              : inv.viewStatus === "Parcial"
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "border-rose-200 bg-rose-50 text-rose-500"
                        }`}
                      >
                        {inv.viewStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[14px] font-medium ${
                          inv.isFacturado ? "text-emerald-600" : "text-slate-300"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {inv.isFacturado ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {inv.viewStatus !== "Pagado" && inv.viewStatus !== "Parcial" && (
                          <button
                            type="button"
                            onClick={() => onUpdateInvoiceStatus(inv.id, "Pagado")}
                            className="inline-flex items-center rounded-md bg-emerald-600 px-2.5 py-1 text-[12px] font-bold text-white transition hover:bg-emerald-700"
                          >
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Pagado
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="text-rose-400 transition hover:text-rose-600"
                          title="Eliminar Registro"
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
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-stone-150 bg-stone-50 px-6 py-5">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-stone-950">Emitir Nueva Factura</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer rounded-xl p-1.5 transition-all hover:bg-stone-200/60"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs font-semibold">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-1.5 block text-stone-600">Cliente Destinatario</label>
                  <select
                    required
                    value={newInvClient}
                    onChange={(e) => setNewInvClient(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Selecciona --</option>
                    {clients.map((c, i) => (
                      <option key={i} value={c.companyName}>
                        {c.companyName}
                      </option>
                    ))}
                    <option value="Nike México">Nike México</option>
                    <option value="Google Latam">Google Latam</option>
                    <option value="Netflix Inc">Netflix Inc</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-stone-600">Monto de Facturación ($ MXN)</label>
                    <input
                      type="number"
                      required
                      value={newInvAmount}
                      onChange={(e) => setNewInvAmount(e.target.value)}
                      placeholder="18500"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-stone-600">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={newInvDueDate}
                      onChange={(e) => setNewInvDueDate(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-stone-600">Estado de Pago</label>
                  <select
                    value={newInvStatus}
                    onChange={(e) => setNewInvStatus(e.target.value as Invoice["status"])}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-stone-600">Descripción de Servicios</label>
                  <textarea
                    value={newInvDesc}
                    onChange={(e) => setNewInvDesc(e.target.value)}
                    placeholder="ej. Entrega de componentes y sandbox responsivo de figma a React."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2.5 border-t border-stone-150 pt-4">
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-xl bg-indigo-600 py-3 font-bold text-white shadow transition-all hover:bg-indigo-700"
                >
                  Generar Transacción
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-3 font-bold text-stone-700 transition-all hover:bg-stone-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePdfInvoice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-stone-200 bg-white text-left shadow-2xl animate-scale-up">
            <div className="flex items-start justify-between border-b border-stone-150 p-8">
              <div>
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  Agencia Pixel Perfect S.A.
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-stone-900">Factura Oficial</h3>
                <p className="mt-1 font-mono text-xs text-stone-400">ID: {activePdfInvoice.id.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setActivePdfInvoice(null)}
                className="cursor-pointer rounded-xl p-1.5 transition-all hover:bg-stone-100"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-8 text-xs font-semibold">
              <div>
                <span className="mb-1 block text-[10px] font-bold uppercase text-stone-400">EMITIDO POR</span>
                <p className="font-extrabold text-stone-900">Pixel Perfect Design S.A. de C.V.</p>
                <p className="mt-1 font-medium text-stone-500">
                  Av. Paseo de la Reforma 402
                  <br />
                  Ciudad de México, México
                </p>
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold uppercase text-stone-400">FACTURADO A</span>
                <p className="font-extrabold text-indigo-600">{activePdfInvoice.clientName}</p>
                <p className="mt-1 font-medium text-stone-500">
                  RFC / Identificación del Cliente
                  <br />
                  Vence: {activePdfInvoice.dueDate}
                </p>
              </div>
            </div>

            <div className="px-8 py-4">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] font-bold uppercase text-stone-400">
                    <th className="py-2">Concepto de Servicio</th>
                    <th className="py-2 text-right">Monto Neto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-100">
                    <td className="py-4 font-semibold text-stone-900">{activePdfInvoice.description}</td>
                    <td className="py-4 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(activePdfInvoice.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end gap-2 border-t border-stone-150 bg-stone-50 p-8 text-xs font-semibold">
              <div className="flex w-64 justify-between text-stone-500">
                <span>Subtotal (Neto):</span>
                <span className="font-mono">{formatCurrency(activePdfInvoice.amount)}</span>
              </div>
              <div className="flex w-64 justify-between text-stone-500">
                <span>I.V.A (16% Retenido):</span>
                <span className="font-mono">{formatCurrency(0)}</span>
              </div>
              <div className="flex w-64 justify-between border-t border-stone-200 pt-2 text-sm font-extrabold text-stone-900">
                <span>Total a Liquidar:</span>
                <span className="font-mono text-indigo-600">{formatCurrency(activePdfInvoice.amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-150 px-8 py-4 text-xs">
              <span className="font-mono text-[10px] text-stone-400">
                Estado de Liquidación: <strong>{activePdfInvoice.status}</strong>
              </span>
              <button
                onClick={() => {
                  alert("Descargando archivo PDF de la Factura de forma simulada...");
                  setActivePdfInvoice(null);
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow transition-all hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" /> Guardar como PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
