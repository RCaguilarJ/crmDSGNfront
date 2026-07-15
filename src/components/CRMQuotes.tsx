import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  DollarSign, 
  CheckCircle, 
  X, 
  Calendar,
  Eye,
  Send,
  FileSpreadsheet
} from "lucide-react";
import { useServerCollection } from "../lib/useServerCollection";

export interface QuoteItem {
  id: string;
  quoteNumber: string;
  clientName: string;
  projectName: string;
  amount: number;
  date: string;
  expiryDate: string;
  status: "Borrador" | "Enviada" | "Aceptada" | "Rechazada";
  responsable?: string;
  items: Array<{ desc: string; qty: number; unitPrice: number }>;
}

export default function CRMQuotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<QuoteItem | null>(null);

  // Form State
  const [newClient, setNewClient] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [items, setItems] = useState<Array<{ desc: string; qty: number; unitPrice: number }>>([
    { desc: "Diseño UI/UX en Figma", qty: 1, unitPrice: 15000 }
  ]);

  const [quotes, setQuotes] = useServerCollection<QuoteItem>("quotes", "crm_quotes", [
      { id: "q_1", quoteNumber: "COT-2026-001", clientName: "Distribuidora Central", projectName: "Desarrollo E-commerce con ERP", amount: 45000, date: "2025-01-08", expiryDate: "2025-01-23", status: "Enviada", responsable: "Daniela", items: [{ desc: "Desarrollo Frontend + Integración ERP", qty: 1, unitPrice: 45000 }] },
      { id: "q_2", quoteNumber: "COT-2026-002", clientName: "Constructora Pedraza", projectName: "Portal inmobiliario + módulo CRM", amount: 95000, date: "2025-01-05", expiryDate: "2025-01-20", status: "Enviada", responsable: "Carlos", items: [{ desc: "Portal inmobiliario completo", qty: 1, unitPrice: 95000 }] },
      { id: "q_3", quoteNumber: "COT-2026-003", clientName: "Escuela Montessori", projectName: "LMS + sitio web institucional", amount: 38000, date: "2025-01-04", expiryDate: "2025-01-19", status: "Borrador", responsable: "Sofia", items: [{ desc: "LMS y sitio institucional", qty: 1, unitPrice: 38000 }] },
      { id: "q_4", quoteNumber: "COT-2026-004", clientName: "Bufete Garza", projectName: "Sitio corporativo + SEO 6 meses", amount: 22000, date: "2024-12-20", expiryDate: "2025-01-04", status: "Aceptada", responsable: "Daniela", items: [{ desc: "Sitio corporativo + SEO", qty: 1, unitPrice: 22000 }] },
      { id: "q_5", quoteNumber: "COT-2026-005", clientName: "Restaurante La", projectName: "Landing page + redes sociales", amount: 8500, date: "2024-12-10", expiryDate: "2024-12-25", status: "Rechazada", responsable: "Daniela", items: [{ desc: "Landing + gestión redes", qty: 1, unitPrice: 8500 }] },
      { id: "q_6", quoteNumber: "COT-2026-006", clientName: "AutoPartes del", projectName: "E-commerce catálogo automotriz", amount: 55000, date: "2025-01-14", expiryDate: "2025-01-29", status: "Enviada", responsable: "Carlos", items: [{ desc: "E-commerce con catálogo y pasarela", qty: 1, unitPrice: 55000 }] }
    ]);

  const saveQuotes = (updated: QuoteItem[]) => {
    setQuotes(updated);
  };

  const handleAddItemRow = () => {
    setItems([...items, { desc: "", qty: 1, unitPrice: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const updated = items.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setItems(updated);
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newProject.trim() || items.length === 0) return;

    const totalAmount = items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
    const dateStr = new Date().toISOString().split('T')[0];
    const qNum = `COT-2026-00${quotes.length + 1}`;

    const newQuote: QuoteItem = {
      id: "quote_" + Date.now(),
      quoteNumber: qNum,
      clientName: newClient,
      projectName: newProject,
      amount: totalAmount,
      date: dateStr,
      expiryDate: newExpiry || dateStr,
      status: "Borrador",
      items
    };

    const updated = [newQuote, ...quotes];
    saveQuotes(updated);

    // Reset Form
    setNewClient("");
    setNewProject("");
    setNewExpiry("");
    setItems([{ desc: "Diseño UI/UX en Figma", qty: 1, unitPrice: 15000 }]);
    setShowAddModal(false);
  };

  const handleDeleteQuote = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta cotización?")) {
      const updated = quotes.filter(q => q.id !== id);
      saveQuotes(updated);
    }
  };

  const handleUpdateStatus = (id: string, status: QuoteItem["status"]) => {
    const updated = quotes.map(q => q.id === id ? { ...q, status } : q);
    saveQuotes(updated);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSendQuote = (quote: QuoteItem) => {
    alert(`Enviando cotización ${quote.quoteNumber} a ${quote.clientName}...`);
    handleUpdateStatus(quote.id, "Enviada");
  };

  // Filter
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen px-0 sm:px-2 lg:px-4 space-y-6 animate-fade-in text-left font-sans">
      
      {/* Top Title and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1d63ff]" /> Cotizaciones y Presupuestos
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Crea propuestas de valor, desglosa conceptos, estima costos y convierte prospectos en clientes activos de inmediato.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#1d63ff] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/15 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nueva Cotización
        </button>
      </div>

      {/* Stats Cards - replicando la vista del screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">TOTAL COTIZACIONES</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{quotes.length}</h3>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">MONTO ACEPTADO</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">
            {formatCurrency(quotes.filter(q => q.status === "Aceptada").reduce((acc, curr) => acc + curr.amount, 0))}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">EN PROCESO</span>
          <h3 className="text-2xl font-black text-amber-600 mt-2">{quotes.filter(q => q.status === "Enviada").length}</h3>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">MONTO TOTAL PIPELINE</span>
          <h3 className="text-2xl font-black text-violet-600 mt-2">{formatCurrency(quotes.reduce((acc, curr) => acc + curr.amount, 0))}</h3>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por cliente, proyecto o folio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none text-xs font-semibold text-slate-700 transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["All", "Borrador", "Enviada", "Aceptada", "Rechazada"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === status 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white hover:bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-500/10"
          >
            + Nueva cotización
          </button>
        </div>
      </div>

      {/* List layout */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden w-full">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-4 px-6">Folio</th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">Concepto</th>
                  <th className="py-4 px-6">Monto</th>
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6">Válida hasta</th>
                  <th className="py-4 px-6 text-center">Estado</th>
                  <th className="py-4 px-6">Responsable</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-extrabold text-[#1d63ff]">{q.quoteNumber}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">{q.clientName}</td>
                  <td className="py-4 px-6 text-slate-700">{q.projectName}</td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">{formatCurrency(q.amount)}</td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{q.date}</td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{q.expiryDate}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold border ${
                      q.status === "Aceptada" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      q.status === "Enviada" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      q.status === "Rechazada" ? "bg-rose-50 text-rose-700 border-rose-100" :
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{q.responsable || '-'}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => setViewingQuote(q)}
                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {q.status !== "Aceptada" && q.status !== "Rechazada" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(q.id, "Aceptada")}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg cursor-pointer"
                            title="Marcar Aceptada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendQuote(q)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer"
                            title="Enviar"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          // descargar o imprimir
                          alert('Descargando PDF...');
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                        title="Descargar"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuote(q.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold">No se encontraron cotizaciones.</p>
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quote Preview Modal */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 max-w-2xl w-full shadow-2xl animate-scale-up text-left font-sans">
            <div className="flex justify-between items-start pb-6 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">PROPUESTA DE SERVICIO</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Folio: {viewingQuote.quoteNumber}</h3>
              </div>
              <button 
                onClick={() => setViewingQuote(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quote details layout */}
            <div className="grid grid-cols-2 gap-6 mb-8 text-xs font-semibold">
              <div>
                <span className="text-slate-400 block mb-1">PREPARADO PARA:</span>
                <p className="text-sm font-black text-slate-800 leading-snug">{viewingQuote.clientName}</p>
                <p className="text-slate-500 mt-1">Proyecto: {viewingQuote.projectName}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block mb-1">EMITIDO POR:</span>
                <p className="text-sm font-black text-slate-800 leading-snug">Designs CRM Agency</p>
                <p className="text-slate-500 mt-1">Fecha: {viewingQuote.date} • Vence: {viewingQuote.expiryDate}</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200 font-extrabold text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Concepto / Descripción</th>
                    <th className="py-3 px-4 text-center">Cant</th>
                    <th className="py-3 px-4 text-right">Precio Unitario</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {viewingQuote.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.desc}</td>
                      <td className="py-3.5 px-4 text-center">{item.qty}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.qty * item.unitPrice)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 font-black text-slate-900 border-t border-slate-200">
                    <td colSpan={3} className="py-4 px-4 text-right text-xs uppercase tracking-wider">TOTAL COTIZADO:</td>
                    <td className="py-4 px-4 text-right text-base font-mono text-blue-600">{formatCurrency(viewingQuote.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              * Nota: Los precios están expresados en Moneda Nacional (MXN). Las cotizaciones tienen validez únicamente durante el periodo de vigencia indicado. Requiere el 50% de anticipo para el inicio del proyecto y el 50% restante al entregar la réplica en producción.
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setViewingQuote(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer text-xs font-bold"
              >
                Cerrar vista
              </button>
              <button
                onClick={() => {
                  alert("Imprimiendo en formato PDF corporativo...");
                }}
                className="px-4 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Estimate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 max-w-xl w-full shadow-2xl animate-scale-up text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#1d63ff]" /> Crear Nueva Propuesta Comercial
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuote} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5">Nombre del Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="ej. Nike México"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Nombre del Proyecto *</label>
                  <input
                    type="text"
                    required
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    placeholder="ej. Landing Page e-Commerce"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5">Vigencia hasta *</label>
                <input
                  type="date"
                  required
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff]"
                />
              </div>

              {/* Items Desglose */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-500">Desglose de Conceptos y Cotización *</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-[#1d63ff] font-bold hover:underline cursor-pointer"
                  >
                    + Añadir Concepto
                  </button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={item.desc}
                        onChange={(e) => handleItemChange(idx, "desc", e.target.value)}
                        placeholder="ej. Maquetación UI/UX Figma"
                        className="flex-1 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                      <input
                        type="number"
                        required
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                        placeholder="Cant"
                        className="w-12 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono font-bold"
                      />
                      <input
                        type="number"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                        placeholder="Precio"
                        className="w-24 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-right"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white rounded-xl cursor-pointer font-bold shadow shadow-blue-500/15"
                >
                  Crear Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
