import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FolderGit, 
  Layers, 
  Calendar, 
  Clock, 
  FileText,
  Percent
} from "lucide-react";

export default function CRMReports() {
  const [selectedYear, setSelectedYear] = useState("2026");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1d63ff]" /> Analíticas, Rendimiento y Reportes
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Monitorea los KPIs corporativos, el volumen de facturación cobrado, y la rentabilidad del equipo de diseño.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
          <button 
            onClick={() => setSelectedYear("2025")}
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedYear === "2025" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Año 2025
          </button>
          <button 
            onClick={() => setSelectedYear("2026")}
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedYear === "2026" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Año 2026
          </button>
        </div>
      </div>

      {/* KPI metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">INGRESOS NETOS {selectedYear}</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(selectedYear === "2026" ? 385000 : 290000)}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
            <TrendingUp className="w-3 h-3" /> +15.4% de incremento anual
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">TICKETS PROMEDIO</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(selectedYear === "2026" ? 42500 : 38000)}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
            <TrendingUp className="w-3 h-3" /> +8.2% de incremento
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">TIEMPO PROMEDIO ENTREGA</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedYear === "2026" ? "4.2 días" : "5.8 días"}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
            <TrendingUp className="w-3 h-3" /> Reducción del 27% en plazos (¡Figma AI!)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">EFICIENCIA DE REPLICA</span>
          <h3 className="text-2xl font-black text-blue-600 mt-2">{selectedYear === "2026" ? "98.5%" : "91.2%"}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
            <Percent className="w-3 h-3" /> Código limpio libre de bugs
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Income Distribution SVG Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Histórico de Facturación vs. Meta Mensual</h4>
                <p className="text-xs text-slate-500 mt-0.5">Reporte consolidado del total facturado y cobrado en {selectedYear}.</p>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-xl">
                Meta: {formatCurrency(85000)} / mes
              </span>
            </div>

            {/* SVG bar chart */}
            <div className="relative w-full h-64 mt-4">
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                {/* Horizontal guide lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f3f7" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f3f7" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f3f7" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Bar components group (Month 1 to 6) */}
                {/* Jan */}
                <rect x="35" y="60" width="16" height="90" rx="3" fill="#1d63ff" className="hover:opacity-85 transition-opacity" />
                <rect x="53" y="45" width="16" height="105" rx="3" fill="#93c5fd" className="hover:opacity-85 transition-opacity" />
                <text x="35" y="170" fill="#94a3b8" className="text-[9px] font-mono font-bold">Ene</text>

                {/* Feb */}
                <rect x="110" y="80" width="16" height="70" rx="3" fill="#1d63ff" />
                <rect x="128" y="70" width="16" height="80" rx="3" fill="#93c5fd" />
                <text x="110" y="170" fill="#94a3b8" className="text-[9px] font-mono font-bold">Feb</text>

                {/* Mar */}
                <rect x="185" y="50" width="16" height="100" rx="3" fill="#1d63ff" />
                <rect x="203" y="30" width="16" height="120" rx="3" fill="#93c5fd" />
                <text x="185" y="170" fill="#94a3b8" className="text-[9px] font-mono font-bold">Mar</text>

                {/* Apr */}
                <rect x="260" y="90" width="16" height="60" rx="3" fill="#1d63ff" />
                <rect x="278" y="70" width="16" height="80" rx="3" fill="#93c5fd" />
                <text x="260" y="170" fill="#94a3b8" className="text-[9px] font-mono font-bold">Abr</text>

                {/* May */}
                <rect x="335" y="40" width="16" height="110" rx="3" fill="#1d63ff" />
                <rect x="353" y="35" width="16" height="115" rx="3" fill="#93c5fd" />
                <text x="335" y="170" fill="#94a3b8" className="text-[9px] font-mono font-bold">May</text>

                {/* Jun */}
                <rect x="410" y="30" width="16" height="120" rx="3" fill="#1d63ff" />
                <rect x="428" y="20" width="16" height="130" rx="3" fill="#93c5fd" />
                <text x="410" y="170" fill="#94a3b8" className="text-[9px] font-mono font-bold">Jun</text>

                <line x1="0" y1="150" x2="500" y2="150" stroke="#cbd5e1" strokeWidth="1" />
              </svg>
            </div>

            <div className="flex gap-4 items-center justify-center text-[10px] font-bold mt-4">
              <div className="flex items-center gap-1.5 text-[#1d63ff]">
                <span className="w-2.5 h-2.5 rounded bg-[#1d63ff]" /> Facturado Cobrado
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded bg-blue-300" /> Proyección / Meta Estimada
              </div>
            </div>
          </div>
        </div>

        {/* Categories donut & logs (4 columns) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Distribución por Tipo de Servicio</h4>
            <p className="text-xs text-slate-500 mb-6">Proporción de ingresos del total facturado.</p>

            {/* Custom donut chart */}
            <div className="relative flex justify-center items-center py-6">
              {/* Simple beautiful representation of the circular chart */}
              <div className="relative w-28 h-28 rounded-full border-8 border-emerald-500 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 border-l-amber-500 transform rotate-45 pointer-events-none" />
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase">PRINCIPAL</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">React Dev</p>
                </div>
              </div>
            </div>

            {/* Categories breakdown */}
            <div className="space-y-2 text-xs font-semibold mt-4">
              <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Proyectos Web React</span>
                </div>
                <span className="font-mono font-bold text-slate-900">45%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Diseño UI/UX (Figma)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">30%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Soporte & Hosting</span>
                </div>
                <span className="font-mono font-bold text-slate-900">25%</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert("Exportando datos contables en formato XLSX...")}
            className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer text-center"
          >
            Exportar Reporte Contable (.xlsx)
          </button>
        </div>

      </div>

    </div>
  );
}
