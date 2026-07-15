import React from "react";
import { 
  Users, 
  Layers, 
  FolderGit, 
  DollarSign, 
  Clock, 
  AlertCircle,
  FileCode2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Code2,
  HelpCircle
} from "lucide-react";

interface CRMDashboardProps {
  stats?: {
    totalClients: number;
    activeProjects: number;
    pendingDesigns: number;
    totalRevenue: number;
    revenueGrowth: string;
  };
  recentProjects?: Array<{
    id: string;
    name: string;
    clientName: string;
    status: string;
    dueDate: string;
    budget: string | number;
  }>;
  onNavigateToView: (view: string) => void;
}

export default function CRMDashboard({ stats, recentProjects, onNavigateToView }: CRMDashboardProps) {
  
  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(val);
  };

  // KPI Cards configuration matching the image exactly
  const kpiCards = [
    {
      id: "clients",
      icon: Users,
      iconBg: "bg-blue-50/70 border-blue-100/60 text-blue-500",
      number: "8",
      label: "Clientes activos",
      trend: "↗ 12%",
      trendColor: "text-emerald-500",
      targetView: "clients"
    },
    {
      id: "pending_payments",
      icon: Clock,
      iconBg: "bg-amber-50/70 border-amber-100/60 text-amber-500",
      number: "3",
      label: "Pagos pendientes",
      subtext: "$20,150",
      trend: "↘ 5%",
      trendColor: "text-rose-500",
      targetView: "billing"
    },
    {
      id: "overdue_payments",
      icon: AlertTriangle,
      iconBg: "bg-rose-50/70 border-rose-100/60 text-rose-500",
      number: "2",
      label: "Pagos vencidos",
      subtext: "$15,700",
      targetView: "billing"
    },
    {
      id: "renewals",
      icon: Clock, // Circular indicator matches the orange clock
      iconBg: "bg-amber-50/70 border-amber-100/60 text-amber-500",
      number: "5",
      label: "Renovaciones próximas",
      subtext: "en 30 días",
      targetView: "renewals"
    },
    {
      id: "dev_projects",
      icon: Code2,
      iconBg: "bg-purple-50/70 border-purple-100/60 text-purple-500",
      number: "5",
      label: "Proyectos Dev activos",
      trend: "↗ 8%",
      trendColor: "text-emerald-500",
      targetView: "projects"
    },
    {
      id: "web_projects",
      icon: Globe,
      iconBg: "bg-cyan-50/70 border-cyan-100/60 text-cyan-500",
      number: "4",
      label: "Proyectos Web activos",
      trend: "↗ 3%",
      trendColor: "text-emerald-500",
      targetView: "projects"
    },
    {
      id: "monthly_revenue",
      icon: DollarSign,
      iconBg: "bg-emerald-50/70 border-emerald-100/60 text-emerald-500",
      number: "$48,000",
      label: "Ingresos del mes",
      subtext: "meta: $85,000",
      trend: "↘ 43%",
      trendColor: "text-rose-500",
      targetView: "billing"
    },
    {
      id: "staff",
      icon: Briefcase,
      iconBg: "bg-lime-50/70 border-lime-100/60 text-lime-500",
      number: "8",
      label: "Personal activo",
      trend: "↗ 0%",
      trendColor: "text-emerald-500",
      targetView: "staff"
    }
  ];

  // Upcoming renewals data (Left Column bottom block)
  const renewals = [
    {
      id: 1,
      clientName: "Constructora Murillo",
      service: "Hosting Pro — cPanel",
      daysLeft: "8d",
      daysColor: "text-amber-500",
      budget: "$1,200",
      borderColor: "border-l-amber-500"
    },
    {
      id: 2,
      clientName: "Farmacia San",
      service: "Dominio farmsanpablo.mx",
      daysLeft: "3d",
      daysColor: "text-rose-500",
      budget: "$380",
      borderColor: "border-l-rose-500"
    },
    {
      id: 3,
      clientName: "Grupo Inmobiliario",
      service: "Hosting Empresarial + SSL",
      daysLeft: "14d",
      daysColor: "text-yellow-500",
      budget: "$2,400",
      borderColor: "border-l-yellow-400"
    }
  ];

  // Projects in review data (Center Column bottom block)
  const projectsInReview = [
    {
      id: 1,
      name: "Sistema de Reservas Riviera Maya",
      badge: "Pruebas",
      badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
      progress: 98
    },
    {
      id: 2,
      name: "CRM Interno Distribuidora",
      badge: "Revisión cliente",
      badgeStyle: "bg-stone-100 text-stone-600 border-stone-200",
      progress: 95
    },
    {
      id: 3,
      name: "Sitio Web Clínica Médica",
      badge: "Revisión cliente",
      badgeStyle: "bg-stone-100 text-stone-600 border-stone-200",
      progress: 95
    }
  ];

  // Important alerts data (Right Column bottom block)
  const importantAlerts = [
    {
      id: 1,
      title: "2 pagos vencidos",
      subtitle: "Montoya & Noroeste Express",
      icon: XCircle,
      iconStyle: "bg-rose-500 text-white",
      bgStyle: "bg-rose-50/70 border-rose-100/60"
    },
    {
      id: 2,
      title: "Dominio vence en 3 días",
      subtitle: "farmsanpablo.mx",
      icon: AlertTriangle,
      iconStyle: "bg-amber-500 text-white",
      bgStyle: "bg-amber-50/70 border-amber-100/60"
    },
    {
      id: 3,
      title: "Entrega urgente",
      subtitle: "Sistema Reservas – Riviera Maya",
      icon: AlertTriangle,
      iconStyle: "bg-amber-500 text-white",
      bgStyle: "bg-amber-50/70 border-amber-100/60"
    },
    {
      id: 4,
      title: "Nuevo pago recibido",
      subtitle: "Grupo Arenas – $32,000",
      icon: CheckCircle,
      iconStyle: "bg-blue-500 text-white",
      bgStyle: "bg-blue-50/70 border-blue-100/60"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* 2. Top KPI Grid (8 Cards matching the screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div 
              key={idx} 
              id={`kpi-card-${card.id}`}
              onClick={() => onNavigateToView(card.targetView)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group h-[135px]"
            >
              <div className="flex justify-between items-start w-full">
                <div className={`p-2 rounded-xl border ${card.iconBg} transition-all group-hover:scale-105 shrink-0`}>
                  <CardIcon className="w-4 h-4" />
                </div>
                {card.trend && (
                  <span className={`text-[10px] font-extrabold font-mono tracking-tight px-2 py-0.5 rounded-full ${card.trendColor}`}>
                    {card.trend}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {card.number}
                </h3>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-[11px] font-semibold text-slate-500">{card.label}</span>
                  {card.subtext && (
                    <span className="text-[10px] font-mono font-bold text-slate-400">{card.subtext}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Mid Grid: Income Wave Line Chart + Payments Status Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Block: Ingresos mensuales (8 columns) */}
        <div id="monthly-incomes-card" className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">Ingresos mensuales</h3>
              <span className="text-xs font-semibold text-slate-400">Ago – Ene 2025</span>
            </div>

            {/* Premium Responsive SVG Chart */}
            <div className="relative w-full h-56 mt-4">
              <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                {/* Horizontal Guide Lines */}
                <g className="opacity-40">
                  <line x1="45" y1="20" x2="570" y2="20" stroke="#f1f1e9" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="45" y1="60" x2="570" y2="60" stroke="#f1f1e9" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="45" y1="100" x2="570" y2="100" stroke="#f1f1e9" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="45" y1="140" x2="570" y2="140" stroke="#f1f1e9" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="45" y1="180" x2="570" y2="180" stroke="#f1f1e9" strokeWidth="1" strokeDasharray="3,3" />
                </g>
                
                {/* Y-axis labels */}
                <g className="text-[10px] font-mono text-slate-400 font-bold" textAnchor="end">
                  <text x="35" y="24">$100k</text>
                  <text x="35" y="64">$75k</text>
                  <text x="35" y="104">$50k</text>
                  <text x="35" y="144">$25k</text>
                  <text x="35" y="184">$0k</text>
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d63ff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#1d63ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Light Grey dashed budget baseline curve */}
                <path 
                  d="M 60 120 Q 200 100, 310 90 T 550 65" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="1.5" 
                  strokeDasharray="4,4" 
                />

                {/* Area under the main curve */}
                <path 
                  d="M 60 120 C 120 100, 160 90, 200 95 C 240 100, 280 110, 320 80 C 370 45, 410 40, 460 55 C 500 70, 520 90, 550 110 L 550 180 L 60 180 Z" 
                  fill="url(#chartGradient)" 
                />

                {/* Main Blue Curve */}
                <path 
                  d="M 60 120 C 120 100, 160 90, 200 95 C 240 100, 280 110, 320 80 C 370 45, 410 40, 460 55 C 500 70, 520 90, 550 110" 
                  fill="none" 
                  stroke="#1d63ff" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                {/* Highlight circles on the curve (just like the image!) */}
                <circle cx="60" cy="120" r="4" fill="#1d63ff" stroke="#ffffff" strokeWidth="2" />
                <circle cx="200" cy="95" r="4" fill="#1d63ff" stroke="#ffffff" strokeWidth="2" />
                <circle cx="320" cy="80" r="4" fill="#1d63ff" stroke="#ffffff" strokeWidth="2" />
                <circle cx="460" cy="55" r="4" fill="#1d63ff" stroke="#ffffff" strokeWidth="2" />
                <circle cx="550" cy="110" r="4" fill="#1d63ff" stroke="#ffffff" strokeWidth="2" />

                {/* X-axis labels centered under points */}
                <g className="text-[11px] font-semibold text-slate-400" textAnchor="middle">
                  <text x="60" y="205">Ago</text>
                  <text x="160" y="205">Sep</text>
                  <text x="260" y="205">Oct</text>
                  <text x="360" y="205">Nov</text>
                  <text x="460" y="205">Dic</text>
                  <text x="550" y="205">Ene</text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Block: Pagos por estado (4 columns) */}
        <div id="payments-status-card" className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">Pagos por estado</h3>
            </div>

            {/* Ring / Donut SVG with exact gaps matching the design */}
            <div className="flex items-center justify-center py-4 relative">
              <svg viewBox="0 0 160 160" className="w-36 h-36">
                <g transform="rotate(-90 80 80)">
                  {/* Segment 1: Pagados (Green) - ~71.8% */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="50" 
                    fill="none" 
                    stroke="#00b289" 
                    strokeWidth="16" 
                    strokeDasharray="214.1 314.16" 
                    strokeDashoffset="0" 
                    strokeLinecap="butt" 
                  />
                  {/* Segment 2: Pendiente (Yellow) - ~9.8% */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="50" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="16" 
                    strokeDasharray="29.2 314.16" 
                    strokeDashoffset="-218.1" 
                    strokeLinecap="butt" 
                  />
                  {/* Segment 3: Vencidos (Red) - ~7.6% */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="50" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="16" 
                    strokeDasharray="22.7 314.16" 
                    strokeDashoffset="-251.3" 
                    strokeLinecap="butt" 
                  />
                  {/* Segment 4: Parcial (Blue) - ~10.7% */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="50" 
                    fill="none" 
                    stroke="#1d63ff" 
                    strokeWidth="16" 
                    strokeDasharray="31.9 314.16" 
                    strokeDashoffset="-278.0" 
                    strokeLinecap="butt" 
                  />
                </g>
              </svg>
            </div>

            {/* Custom styled Legend rows matching screenshot exactly */}
            <div className="space-y-2 mt-4 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00b289]" />
                  <span className="text-slate-500">Pagados</span>
                </div>
                <span className="text-slate-900 font-extrabold">$147,500</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-slate-500">Pendiente</span>
                </div>
                <span className="text-slate-900 font-extrabold">$20,150</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-slate-500">Vencidos</span>
                </div>
                <span className="text-slate-900 font-extrabold">$15,700</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1d63ff]" />
                  <span className="text-slate-500">Parcial</span>
                </div>
                <span className="text-slate-900 font-extrabold">$22,000</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Bottom Grid: 3 Columns (Renovaciones, Revisión, Alertas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Renovaciones próximas */}
        <div id="renewals-card" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase mb-5">Renovaciones próximas</h3>
            
            <div className="space-y-3">
              {renewals.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onNavigateToView("renewals")}
                  className={`border-l-4 ${item.borderColor} pl-3.5 py-2.5 bg-slate-50/50 rounded-r-xl border-t border-r border-b border-slate-200/40 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer`}
                >
                  <div className="truncate pr-2">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{item.clientName}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{item.service}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-bold ${item.daysColor} block`}>{item.daysLeft}</span>
                    <span className="text-[11px] font-extrabold text-slate-500 block mt-0.5">{item.budget}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Proyectos en revisión */}
        <div id="projects-review-card" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase mb-5">Proyectos en revisión</h3>
            
            <div className="space-y-4">
              {projectsInReview.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onNavigateToView("projects")}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] text-slate-900 truncate max-w-[170px] group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border shrink-0 ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 mb-1">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Avance</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00b289] rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alertas importantes */}
        <div id="alerts-card" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase mb-4">Alertas importantes</h3>
            
            <div className="space-y-3">
              {importantAlerts.map((alert) => {
                const AlertIcon = alert.icon;
                return (
                  <div 
                    key={alert.id}
                    className={`flex items-center gap-3 border border-slate-100 p-3 rounded-2xl ${alert.bgStyle}`}
                  >
                    <div className={`w-7 h-7 rounded-full ${alert.iconStyle} flex items-center justify-center shrink-0`}>
                      <AlertIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">
                        {alert.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate leading-tight">
                        {alert.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
