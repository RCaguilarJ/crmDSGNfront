import React from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Percent,
  ChevronRight,
  Download,
  Calendar
} from "lucide-react";

export default function FinancialDashboard() {
  const stats = [
    { 
      label: "Ingresos Totales", 
      value: "$48,259.00", 
      change: "+12.5%", 
      isPositive: true, 
      icon: DollarSign, 
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20" 
    },
    { 
      label: "Usuarios Activos", 
      value: "10,249", 
      change: "+4.3%", 
      isPositive: true, 
      icon: Users, 
      color: "from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/20" 
    },
    { 
      label: "Pedidos Nuevos", 
      value: "3,102", 
      change: "-2.1%", 
      isPositive: false, 
      icon: ShoppingBag, 
      color: "from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20" 
    },
    { 
      label: "Tasa de Conversión", 
      value: "24.15%", 
      change: "+0.8%", 
      isPositive: true, 
      icon: Percent, 
      color: "from-violet-500/10 to-purple-500/10 text-violet-400 border-violet-500/20" 
    }
  ];

  const recentTransactions = [
    { name: "Adrián Silva", email: "adrian@agency.com", amount: "+$1,250.00", type: "Cobro completado", time: "Hace 5 min", status: "success" },
    { name: "Lucía Torres", email: "lucia.t@design.io", amount: "-$450.00", type: "Pago Figma Pro", time: "Hace 1 hora", status: "pending" },
    { name: "Roberto Aguilar", email: "roberto@uam.mx", amount: "+$3,400.00", type: "Membresía Anual", time: "Hace 2 horas", status: "success" },
  ];

  return (
    <div className="w-full bg-slate-950 text-slate-100 p-5 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl font-sans text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            Figma Frame #1203
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2 text-white">Resumen Financiero</h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button className="px-3.5 py-1.5 font-bold rounded-lg bg-indigo-600 text-white shadow transition-all">Mensual</button>
          <button className="px-3.5 py-1.5 font-medium text-slate-400 hover:text-white transition-all">Trimestral</button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2 rounded-xl border bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  stat.isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
                <span className="text-[10px] text-slate-500">vs mes anterior</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Data Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart mockup area */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Análisis de Desempeño</h3>
              <p className="text-xs text-slate-400 mt-0.5">Fluctuación de capital del presente trimestre.</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" /> Tendencia Alcista
            </span>
          </div>

          {/* Simulated clean chart using Tailwind divs */}
          <div className="h-44 flex items-end gap-2.5 pt-4 border-b border-slate-800">
            {[40, 55, 48, 65, 58, 80, 72, 90, 85, 105, 98, 115].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-600/80 to-indigo-400 rounded-t-lg group-hover:from-indigo-400 group-hover:to-cyan-400 transition-all duration-300" 
                  style={{ height: `${(val / 120) * 100}%` }}
                />
                <span className="text-[9px] text-slate-500 font-mono group-hover:text-slate-300 transition-all">
                  {['E','F','M','A','M','J','J','A','S','O','N','D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent logs */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Actividad Reciente</h3>
            <p className="text-xs text-slate-400 mb-4">Últimos cobros registrados.</p>
          </div>

          <div className="space-y-3 flex-1">
            {recentTransactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-white">{tx.name}</h4>
                  <p className="text-[10px] text-slate-400">{tx.type} • {tx.time}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold ${tx.amount.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                    {tx.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all">
            Descargar Reporte Completo <Download className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
