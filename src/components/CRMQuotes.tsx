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
  ,Pencil
  ,RotateCcw
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
  attention?: string;
  clientEmail?: string;
  clientPhone?: string;
  website?: string;
  requiresInvoice?: boolean;
  subtotal?: number;
  taxAmount?: number;
  items: Array<{ desc: string; qty: number; unit?: string; unitPrice: number }>;
}

type CRMQuotesProps={canCreate?:boolean;canEdit?:boolean;canDelete?:boolean;canExport?:boolean};
export default function CRMQuotes({canCreate=true,canEdit=true,canDelete=false,canExport=true}:CRMQuotesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<QuoteItem | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Form State
  const [newClient, setNewClient] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newAttention, setNewAttention] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [items, setItems] = useState<Array<{ desc: string; qty: number; unit: string; unitPrice: number }>>([
    { desc: "Diseño UI/UX en Figma", qty: 1, unit: "Servicio", unitPrice: 15000 }
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const taxAmount = requiresInvoice ? subtotal * 0.16 : 0;
  const quoteTotal = subtotal + taxAmount;

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
    setItems([...items, { desc: "", qty: 1, unit: "Servicio", unitPrice: 0 }]);
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
    if (!newClient.trim() || !newProject.trim() || !newAttention.trim() || !newEmail.trim() || !newPhone.trim() || !newWebsite.trim() || items.length === 0) {
      alert("Completa todos los datos del cliente para evitar campos vacíos en el PDF. Si no tiene sitio web, escribe 'No aplica'.");
      return;
    }

    const totalAmount = quoteTotal;
    const dateStr = new Date().toISOString().split('T')[0];
    const qNum = `COT-2026-${String(quotes.length + 1).padStart(3, "0")}`;

    if (editingQuoteId) {
      const updated = quotes.map((quote) => quote.id === editingQuoteId ? {
        ...quote,
        clientName: newClient.trim(),
        projectName: newProject.trim(),
        amount: totalAmount,
        expiryDate: newExpiry || quote.expiryDate,
        attention: newAttention.trim(),
        clientEmail: newEmail.trim(),
        clientPhone: newPhone.trim(),
        website: newWebsite.trim(),
        requiresInvoice,
        subtotal,
        taxAmount,
        items,
      } : quote);
      saveQuotes(updated);
      resetQuoteForm();
      setShowAddModal(false);
      return;
    }

    const newQuote: QuoteItem = {
      id: "quote_" + Date.now(),
      quoteNumber: qNum,
      clientName: newClient,
      projectName: newProject,
      amount: totalAmount,
      date: dateStr,
      expiryDate: newExpiry || dateStr,
      status: "Borrador",
      attention: newAttention.trim(),
      clientEmail: newEmail.trim(),
      clientPhone: newPhone.trim(),
      website: newWebsite.trim(),
      requiresInvoice,
      subtotal,
      taxAmount,
      items
    };

    const updated = [newQuote, ...quotes];
    saveQuotes(updated);

    resetQuoteForm();
    setShowAddModal(false);
  };

  const resetQuoteForm = () => {
    setNewClient("");
    setNewProject("");
    setNewExpiry("");
    setNewAttention("");
    setNewEmail("");
    setNewPhone("");
    setNewWebsite("");
    setRequiresInvoice(false);
    setItems([{ desc: "Diseño UI/UX en Figma", qty: 1, unit: "Servicio", unitPrice: 15000 }]);
    setEditingQuoteId(null);
  };

  const openEditQuote = (quote: QuoteItem) => {
    setEditingQuoteId(quote.id);
    setNewClient(quote.clientName);
    setNewProject(quote.projectName);
    setNewExpiry(quote.expiryDate);
    setNewAttention(quote.attention || "");
    setNewEmail(quote.clientEmail || "");
    setNewPhone(quote.clientPhone || "");
    setNewWebsite(quote.website || "");
    setRequiresInvoice(Boolean(quote.requiresInvoice));
    setItems(quote.items.map((item) => ({ ...item, unit: item.unit || "Servicio" })));
    setViewingQuote(null);
    setShowAddModal(true);
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

  const handleRevertAcceptance = (quote: QuoteItem) => {
    if (!window.confirm(`¿Revertir la autorización de ${quote.quoteNumber}? La cotización volverá al estado Enviada.`)) return false;
    handleUpdateStatus(quote.id, "Enviada");
    return true;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleSendQuote = (quote: QuoteItem) => {
    alert(`Enviando cotización ${quote.quoteNumber} a ${quote.clientName}...`);
    handleUpdateStatus(quote.id, "Enviada");
  };

  const handlePrintQuote = (quote: QuoteItem) => {
    const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] || char));
    const quoteSubtotal = quote.subtotal ?? quote.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const quoteTax = quote.taxAmount ?? 0;
    const rows = quote.items.map((item) => `<tr><td>${escape(item.qty)}</td><td>${escape(item.unit || "Servicio")}</td><td>${escape(item.desc)}</td><td>${escape(formatCurrency(item.unitPrice))}</td><td>${escape(formatCurrency(item.qty * item.unitPrice))}</td></tr>`).join("");
    const printWindow = window.open("", "_blank", "width=980,height=760");
    if (!printWindow) return alert("Permite las ventanas emergentes para generar el PDF.");
    printWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escape(quote.quoteNumber)}</title><style>@page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;font-size:12px}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1769aa;padding-bottom:14px}.brand{font-size:26px;font-weight:900;color:#1769aa}.contact{text-align:right;line-height:1.6;color:#526173}.folio{display:flex;justify-content:space-between;margin:20px 0}.folio strong{font-size:16px}.client{border:1px solid #b9c4d0;margin-bottom:18px}.client h2{margin:0;background:#1769aa;color:#fff;padding:8px 12px;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:0}.field{padding:9px 12px;border-bottom:1px solid #d9e0e7}.field:nth-child(odd){border-right:1px solid #d9e0e7}.label{display:block;color:#65758a;font-size:9px;font-weight:bold;text-transform:uppercase;margin-bottom:4px}table{width:100%;border-collapse:collapse}th{background:#1769aa;color:#fff;padding:9px 7px;text-align:left;font-size:10px}td{border:1px solid #cbd5df;padding:9px 7px}th:nth-child(1),td:nth-child(1){width:9%;text-align:center}th:nth-child(2),td:nth-child(2){width:14%;text-align:center}th:nth-child(4),td:nth-child(4),th:nth-child(5),td:nth-child(5){text-align:right;width:17%}.totals{width:310px;margin:14px 0 20px auto}.total-row{display:flex;justify-content:space-between;padding:7px 10px;border-bottom:1px solid #d9e0e7}.grand{background:#1769aa;color:#fff;font-size:15px;font-weight:bold}.notes{border-top:1px solid #aeb9c5;padding-top:12px;line-height:1.7;font-size:10px}.footer{margin-top:24px;text-align:center;color:#526173;border-top:1px solid #d9e0e7;padding-top:12px}@media print{button{display:none}}</style></head><body><div class="header"><div><div class="brand">DESIGNS GDL</div><div>Desarrollo Web y Móvil</div></div><div class="contact">www.desingsgdl.com.mx<br>Teléfono: 33 2839 4175<br>contacto@desingsgdl.com.mx</div></div><div class="folio"><strong>COTIZACIÓN No. ${escape(quote.quoteNumber)}</strong><div><b>FECHA:</b> ${escape(quote.date)}<br><b>VIGENCIA:</b> ${escape(quote.expiryDate)}</div></div><section class="client"><h2>INFORMACIÓN DEL CLIENTE</h2><div class="grid"><div class="field"><span class="label">Nombre o razón social</span>${escape(quote.clientName)}</div><div class="field"><span class="label">Atención</span>${escape(quote.attention || "—")}</div><div class="field"><span class="label">Email</span>${escape(quote.clientEmail || "—")}</div><div class="field"><span class="label">Teléfono</span>${escape(quote.clientPhone || "—")}</div><div class="field"><span class="label">Sitio web</span>${escape(quote.website || "—")}</div><div class="field"><span class="label">Proyecto</span>${escape(quote.projectName)}</div></div></section><table><thead><tr><th>Cantidad</th><th>Unidad</th><th>Concepto / descripción</th><th>P. unitario</th><th>Costo</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="total-row"><span>Subtotal</span><b>${escape(formatCurrency(quoteSubtotal))}</b></div><div class="total-row"><span>IVA ${quote.requiresInvoice ? "16%" : "(sin factura)"}</span><b>${escape(formatCurrency(quoteTax))}</b></div><div class="total-row grand"><span>Total</span><span>${escape(formatCurrency(quote.amount))}</span></div></div><div class="notes"><b>NOTA:</b><br>• Vigencia de la cotización según la fecha indicada.<br>• Algunos complementos pueden generar costo adicional.<br>• Se requiere del 50% de anticipo para comenzar a trabajar en el proyecto.<br>• En caso de no requerir factura, el costo es sin IVA.</div><div class="footer">Dirección: Calle Emilio Carranza 553, Colonial Tlaquepaque, 45570 San Pedro Tlaquepaque, Jal.</div><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);
    printWindow.document.close();
  };

  const handleTemplatePrintQuote = (quote: QuoteItem) => {
    const brandOrange = "#E8542E";
    const brandNavy = "#1E2A44";
    const brandBlue = "#0877BE";
    const totalBackground = "#181818";
    const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] || char));
    const displayDate = (value: string) => value?.split("-").reverse().join("/") || "";
    const quoteSubtotal = quote.subtotal ?? quote.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const quoteTax = quote.taxAmount ?? 0;
    const logoUrl = `${window.location.origin}/desingsgdl-logo.png`;
    const rows = quote.items.map((item) => `<tr><td>${escape(item.qty)}</td><td>${escape(item.unit || "Servicio")}</td><td>${escape(item.desc)}</td><td>${escape(formatCurrency(item.qty * item.unitPrice))}</td></tr>`).join("");
    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (!printWindow) return alert("Permite las ventanas emergentes para generar el PDF.");
    printWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escape(quote.quoteNumber)}</title><style>
      @page{size:A4 portrait;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}html,body{margin:0;background:#fff;color:#151515;font-family:Arial,sans-serif}.sheet{position:relative;width:210mm;height:297mm;margin:0 auto;padding:9mm 6mm 13mm;overflow:hidden;background:#fff;font-size:10px}.top{position:relative;height:39mm}.logo{width:61mm;height:20mm;object-fit:contain;object-position:left center}.folio{position:absolute;right:0;top:0;border-collapse:collapse;width:68mm;font-style:italic;font-size:15px}.folio td{height:11mm;padding:2mm 3mm;border:1px solid #c8c8c8}.folio .quote-label{background:${brandOrange}!important;box-shadow:inset 0 0 0 20mm ${brandOrange};color:#fff!important;border-color:${brandOrange};font-weight:bold;text-align:center}.folio .date-label{background:${brandNavy}!important;box-shadow:inset 0 0 0 20mm ${brandNavy};color:#fff!important;border-color:${brandNavy};font-weight:bold;text-align:center}.company{font-size:10px;line-height:1.65;margin-top:1mm}.company .row{display:flex;justify-content:space-between;gap:5mm}.client{position:relative;border:1px solid #34465d;height:20mm;padding:6mm 3mm 1mm}.client-title{position:absolute;top:-4mm;left:32%;width:40%;height:8mm;padding:2mm;background:${brandNavy}!important;box-shadow:inset 0 0 0 20mm ${brandNavy};color:#fff!important;text-align:center;font-size:11px}.client-line{display:grid;grid-template-columns:1.25fr .9fr;gap:5mm;line-height:6mm;white-space:nowrap}.client-line.second{grid-template-columns:.72fr 1fr .9fr}.client b{font-size:9px}.value{display:inline-block;min-width:35mm;border-bottom:1px solid #222;padding:0 1mm;height:5mm;overflow:hidden;vertical-align:bottom}.items{position:relative;margin-top:2mm;height:151mm;border:1px solid ${brandBlue};overflow:hidden}.watermark{position:absolute;left:12%;top:29%;width:76%;opacity:.13;z-index:0}.items table{position:relative;z-index:1;width:100%;height:100%;border-collapse:collapse;table-layout:fixed}.items thead{height:9mm;background:${brandBlue}!important;color:#fff!important;font-size:12px;font-style:italic}.items th{background:${brandBlue}!important;box-shadow:inset 0 0 0 20mm ${brandBlue};color:#fff!important;font-weight:normal;padding:2mm}.items th:nth-child(1){width:16%}.items th:nth-child(2){width:13%}.items th:nth-child(4){width:16%}.items td{height:10mm;padding:2mm;border-right:1px solid ${brandBlue};border-bottom:1px solid rgba(8,119,190,.18);vertical-align:top;background:rgba(255,255,255,.65)}.items td:first-child,.items td:nth-child(2){text-align:center}.items td:last-child{text-align:right;border-right:0}.summary{height:18mm;border-left:1px solid ${brandBlue};border-right:1px solid ${brandBlue}}.iva{display:grid;grid-template-columns:1fr 16%;height:9mm}.iva-label,.iva-value{padding:2mm;border-bottom:1px solid ${brandBlue}}.iva-label{text-align:right;font-style:italic}.iva-value{text-align:right}.total{display:grid;grid-template-columns:1fr 16%;height:9mm;background:${totalBackground}!important;box-shadow:inset 0 0 0 20mm ${totalBackground};color:#fff!important;font-style:italic}.total-label,.total-value{padding:2mm;text-align:right;color:#fff!important}.notes{margin-top:4mm;height:32mm;border:1px solid ${brandOrange}}.notes-title{height:9mm;padding:2mm 6mm;background:${brandOrange}!important;box-shadow:inset 0 0 0 20mm ${brandOrange};color:#fff!important;font-size:13px;font-style:italic}.notes-body{padding:2mm 3mm;font-size:8px;line-height:1.55}.footer{position:absolute;left:0;right:0;bottom:0;height:13mm;background:${brandNavy}!important;box-shadow:inset 0 0 0 20mm ${brandNavy};color:#fff!important;display:flex;align-items:center;justify-content:space-between;padding:0 6mm;font-size:8px}.footer span{color:#fff!important}@media screen{body{background:#e5e7eb}.sheet{box-shadow:0 2px 18px rgba(0,0,0,.18)}}@media print{html,body,.sheet{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.sheet{box-shadow:none}}
    </style></head><body><main class="sheet"><section class="top"><img class="logo" src="${escape(logoUrl)}" alt="Designs GDL"><table class="folio"><tr><td class="quote-label">COTIZACIÓN No.</td><td>${escape(quote.quoteNumber)}</td></tr><tr><td class="date-label">FECHA:</td><td>${escape(displayDate(quote.date))}</td></tr></table><div class="company"><div>Dirección: Calle Emilio Carranza 553, Colonial Tlaquepaque, 45570 San Pedro Tlaquepaque, Jal.</div><div class="row"><span>Tel. Asesor: 33 50 11 2598</span><span>contacto@desingsgdl.com.mx</span><span>www.desingsgdl.com.mx</span></div></div></section><section class="client"><div class="client-title">INFORMACIÓN DEL CLIENTE</div><div class="client-line"><span><b>NOMBRE O RAZÓN SOCIAL:</b><span class="value">${escape(quote.clientName || "No proporcionado")}</span></span><span><b>ATENCIÓN:</b><span class="value">${escape(quote.attention || quote.responsable || "No proporcionado")}</span></span></div><div class="client-line second"><span><b>TELÉFONO:</b><span class="value">${escape(quote.clientPhone || "No proporcionado")}</span></span><span><b>EMAIL:</b><span class="value">${escape(quote.clientEmail || "No proporcionado")}</span></span><span><b>SITIO WEB:</b><span class="value">${escape(quote.website || "No proporcionado")}</span></span></div></section><section class="items"><img class="watermark" src="${escape(logoUrl)}" alt=""><table><thead><tr><th>CANTIDAD</th><th>UNIDAD</th><th>CONCEPTO / DESCRIPCIÓN</th><th>COSTO</th></tr></thead><tbody>${rows}<tr><td></td><td></td><td></td><td></td></tr></tbody></table></section><section class="summary"><div class="iva"><div class="iva-label">SUBTOTAL:<br>IVA${quote.requiresInvoice ? " 16%" : ""}:</div><div class="iva-value">${escape(formatCurrency(quoteSubtotal))}<br>${escape(formatCurrency(quoteTax))}</div></div><div class="total"><div class="total-label">TOTAL:</div><div class="total-value">${escape(formatCurrency(quote.amount))}</div></div></section><section class="notes"><div class="notes-title">NOTA:</div><div class="notes-body">- EN CASO DE NO REQUERIR FACTURA EL COSTO ES SIN IVA<br>- ALGUNOS COMPLEMENTOS PUEDEN GENERAR COSTO ADICIONAL.<br>- VIGENCIA DE LA COTIZACIÓN 30 DÍAS<br>- SE REQUIERE DEL 50% DE ANTICIPO PARA COMENZAR A TRABAJAR EN EL PROYECTO</div></section><footer class="footer"><span>contacto@desingsgdl.com.mx</span><span>www.desingsgdl.com.mx</span><span>Teléfono 33 2839 4175</span></footer></main><script>window.onload=()=>setTimeout(()=>window.print(),500)<\/script></body></html>`);
    printWindow.document.close();
  };

  // Filter
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Todos" || q.status === filterStatus;
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
          {["Todos", "Borrador", "Enviada", "Aceptada", "Rechazada"].map((status) => (
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
        {canCreate && <div className="ml-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-500/10"
          >
            + Nueva cotización
          </button>
        </div>}
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

                      {canEdit && q.status !== "Aceptada" && q.status !== "Rechazada" && (
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

                      {canEdit && q.status === "Aceptada" && (
                        <button
                          onClick={() => handleRevertAcceptance(q)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg cursor-pointer transition-colors"
                          title="Revertir autorización y volver a Enviada"
                          aria-label={`Revertir autorización de ${q.quoteNumber}`}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}

                      {canExport && <button
                        onClick={() => {
                          handleTemplatePrintQuote(q);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                        title="Descargar"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>}

                      {canDelete && <button
                        onClick={() => handleDeleteQuote(q.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>}
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
                {viewingQuote.attention && <p className="text-slate-500 mt-1">Atención: {viewingQuote.attention}</p>}
                {viewingQuote.clientEmail && <p className="text-slate-500 mt-1">Email: {viewingQuote.clientEmail}</p>}
                {viewingQuote.clientPhone && <p className="text-slate-500 mt-1">Teléfono: {viewingQuote.clientPhone}</p>}
                {viewingQuote.website && <p className="text-slate-500 mt-1">Sitio web: {viewingQuote.website}</p>}
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
                    <th className="py-3 px-4 text-center">Unidad</th>
                    <th className="py-3 px-4 text-right">Precio Unitario</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {viewingQuote.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.desc}</td>
                      <td className="py-3.5 px-4 text-center">{item.qty}</td>
                      <td className="py-3.5 px-4 text-center text-slate-500">{item.unit || "Servicio"}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.qty * item.unitPrice)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 font-bold text-slate-700 border-t border-slate-200">
                    <td colSpan={4} className="py-2.5 px-4 text-right text-xs uppercase tracking-wider">Subtotal:</td>
                    <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(viewingQuote.subtotal ?? viewingQuote.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0))}</td>
                  </tr>
                  <tr className="bg-slate-50/50 font-bold text-slate-700">
                    <td colSpan={4} className="py-2.5 px-4 text-right text-xs uppercase tracking-wider">IVA {viewingQuote.requiresInvoice ? "(16%)" : "(sin factura)"}:</td>
                    <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(viewingQuote.taxAmount ?? 0)}</td>
                  </tr>
                  <tr className="bg-blue-50/60 font-black text-slate-900 border-t border-blue-100">
                    <td colSpan={4} className="py-4 px-4 text-right text-xs uppercase tracking-wider">Total cotizado:</td>
                    <td className="py-4 px-4 text-right text-base font-mono text-blue-600">{formatCurrency(viewingQuote.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              * Nota: Los precios están expresados en Moneda Nacional (MXN). Las cotizaciones tienen validez únicamente durante el periodo de vigencia indicado. Requiere el 50% de anticipo para el inicio del proyecto y el 50% restante al entregar la réplica en producción.
            </div>

            <div className="flex justify-end gap-2.5">
              {canEdit && viewingQuote.status === "Aceptada" && (
                <button
                  onClick={() => { if (handleRevertAcceptance(viewingQuote)) setViewingQuote(null); }}
                  className="px-4 py-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Revertir autorización
                </button>
              )}
              <button
                onClick={() => setViewingQuote(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer text-xs font-bold"
              >
                Cerrar vista
              </button>
              {canEdit && <button
                onClick={() => openEditQuote(viewingQuote)}
                className="px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar cotización
              </button>}
              {canExport && <button
                onClick={() => {
                  handleTemplatePrintQuote(viewingQuote);
                }}
                className="px-4 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Descargar PDF
              </button>}
            </div>
          </div>
        </div>
      )}

      {/* Add Estimate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto w-full shadow-2xl animate-scale-up text-left">
            <div className="p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                {editingQuoteId ? <Pencil className="w-5 h-5 text-[#1d63ff]" /> : <Plus className="w-5 h-5 text-[#1d63ff]" />} {editingQuoteId ? "Editar cotización" : "Crear Nueva Propuesta Comercial"}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); resetQuoteForm(); }}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5">Atención *</label>
                  <input required type="text" value={newAttention} onChange={(e) => setNewAttention(e.target.value)} placeholder="Nombre de la persona de contacto" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1d63ff] font-medium" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Email *</label>
                  <input required type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="contacto@empresa.com" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1d63ff] font-medium" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Teléfono *</label>
                  <input required type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="33 0000 0000" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1d63ff] font-medium" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Sitio web *</label>
                  <input required type="text" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} placeholder="www.empresa.com o No aplica" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1d63ff] font-medium" />
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
                    <div key={idx} className="grid grid-cols-[minmax(160px,1fr)_64px_88px_110px_34px] gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={item.desc}
                        onChange={(e) => handleItemChange(idx, "desc", e.target.value)}
                        placeholder="ej. Maquetación UI/UX Figma"
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                      <input
                        type="number"
                        required
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                        placeholder="Cant"
                        min="0.01"
                        step="0.01"
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono font-bold"
                      />
                      <input
                        type="text"
                        required
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                        placeholder="Unidad"
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-medium"
                      />
                      <input
                        type="number"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                        placeholder="Precio"
                        min="0"
                        step="0.01"
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-right"
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div><span className="block font-black text-slate-800">¿El cliente requiere factura?</span><span className="mt-1 block text-[10px] font-medium text-slate-500">Al activarlo se agrega automáticamente el 16% de IVA.</span></div>
                  <input type="checkbox" checked={requiresInvoice} onChange={(e) => setRequiresInvoice(e.target.checked)} className="h-5 w-5 accent-blue-600" />
                </label>
                <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 font-mono">
                  <div className="flex justify-between text-slate-500"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
                  <div className="flex justify-between text-slate-500"><span>IVA {requiresInvoice ? "16%" : ""}</span><strong>{formatCurrency(taxAmount)}</strong></div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm text-slate-900"><span className="font-sans font-black">Total</span><strong className="text-blue-600">{formatCurrency(quoteTotal)}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetQuoteForm(); }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white rounded-xl cursor-pointer font-bold shadow shadow-blue-500/15"
                >
                  {editingQuoteId ? "Guardar cambios" : "Crear Cotización"}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
