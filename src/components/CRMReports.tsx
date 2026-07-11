import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

type ReportData = {
  metrics: { monthlyIncome: number; pendingPayments: number; activeProjects: number; wonQuotes: number; incomeChange: number; projectsChange: number; quotesChange: number };
  monthlyIncome: { label: string; value: number }[];
  services: { label: string; value: number; color: string }[];
  managers: { label: string; value: number }[];
};

const fallback: ReportData = {
  metrics: { monthlyIncome: 48000, pendingPayments: 20150, activeProjects: 9, wonQuotes: 3, incomeChange: -43, projectsChange: 12, quotesChange: 8 },
  monthlyIncome: [{label:"Ago",value:58000},{label:"Sep",value:75000},{label:"Oct",value:68000},{label:"Nov",value:94000},{label:"Dic",value:85000},{label:"Ene",value:48000}],
  services: [{label:"Hosting",value:38,color:"#2f66e9"},{label:"Desarrollo",value:28,color:"#10b981"},{label:"Páginas web",value:22,color:"#8055e9"},{label:"Dominio",value:12,color:"#f59e0b"}],
  managers: [{label:"Carlos M.",value:85000},{label:"Sofía R.",value:57000},{label:"Marco H.",value:118000},{label:"Luis P.",value:48000}],
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function LineChart({ data }: { data: ReportData["monthlyIncome"] }) {
  const width = 1000, height = 190, max = 100000;
  const points = data.map((item, i) => `${i * (width / (data.length - 1))},${height - (item.value / max) * height}`).join(" ");
  const area = `0,${height} ${points} ${width},${height}`;
  return <div className="relative h-[205px] pl-12 pt-1">
    <div className="absolute inset-y-0 left-0 w-11 flex flex-col justify-between pb-5 text-[10px] text-[#91a0bd]"><span>$100k</span><span>$75k</span><span>$50k</span><span>$25k</span><span>$0k</span></div>
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-[175px] overflow-visible animate-chart-x">
      {[0,.25,.5,.75,1].map((n) => <line key={n} x1="0" x2={width} y1={n*height} y2={n*height} stroke="#e8edf5" strokeDasharray="3 4" />)}
      {data.map((_,i)=><line key={i} x1={i*(width/(data.length-1))} x2={i*(width/(data.length-1))} y1="0" y2={height} stroke="#edf1f7" strokeDasharray="3 4" />)}
      <polygon points={area} fill="#2f66e9" opacity=".08" />
      <polyline points={points} fill="none" stroke="#2463eb" strokeWidth="2.3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
    <div className="flex justify-between text-[10px] text-[#91a0bd] mt-1">{data.map(x=><span key={x.label}>{x.label}</span>)}</div>
  </div>;
}

export default function CRMReports() {
  const [report, setReport] = useState<ReportData>(fallback);
  useEffect(() => { apiFetch<ReportData>("/api/reports/summary", { headers: { Authorization: `Bearer ${localStorage.getItem("figma_session") || ""}` } }).then(setReport).catch(()=>{}); }, []);
  const gradient = useMemo(() => { let cursor=0; return `conic-gradient(${report.services.map(s=>{const start=cursor;cursor+=s.value;return `${s.color} ${start}% ${cursor}%`}).join(",")})`; }, [report.services]);
  const maxManager = Math.max(120000, ...report.managers.map(x=>x.value));
  return <div className="-mt-1 space-y-4 text-left animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {[
        ["INGRESOS MES", money(report.metrics.monthlyIncome), report.metrics.incomeChange, "text-emerald-500"],
        ["PAGOS PENDIENTES", money(report.metrics.pendingPayments), null, "text-amber-500"],
        ["PROYECTOS ACTIVOS", report.metrics.activeProjects, report.metrics.projectsChange, "text-blue-600"],
        ["COTIZACIONES GANADAS", report.metrics.wonQuotes, report.metrics.quotesChange, "text-violet-600"],
      ].map(([label,value,change,color])=><section key={String(label)} className="h-[89px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-bold text-[#58708f]">{label}</p><p className={`mt-1 text-lg leading-none font-bold ${color}`}>{value}</p>
        {change !== null && <p className={`mt-2 text-[10px] font-semibold ${Number(change)<0?"text-rose-500":"text-emerald-600"}`}>{Number(change)<0?"↘":"↗"} {Math.abs(Number(change))}% vs anterior</p>}
      </section>)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-3">
      <section className="h-[293px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-xs font-bold text-slate-900 mb-3">Ingresos mensuales</h2><LineChart data={report.monthlyIncome}/></section>
      <section className="h-[293px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-xs font-bold text-slate-900">Servicios más vendidos</h2>
        <div className="mx-auto mt-7 h-[120px] w-[120px] rounded-full border-2 border-white animate-chart-pie" style={{background:gradient}} />
        <div className="mt-3 space-y-1.5">{report.services.map(s=><div key={s.label} className="flex items-center text-[10px]"><i className="mr-2 h-2.5 w-2.5 rounded-full" style={{background:s.color}}/><span className="text-[#58708f]">{s.label}</span><b className="ml-auto text-slate-900">{s.value}%</b></div>)}</div>
      </section>
    </div>
    <section className="h-[248px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-xs font-bold text-slate-900">Desempeño por gerente</h2>
      <div className="relative mt-4 h-[180px] pl-12"><div className="absolute inset-y-0 left-0 flex w-10 flex-col justify-between pb-5 text-[10px] text-[#91a0bd]"><span>$120k</span><span>$90k</span><span>$60k</span><span>$30k</span><span>$0k</span></div>
        <div className="absolute inset-x-12 top-0 bottom-5 flex flex-col justify-between">{[0,1,2,3,4].map(x=><i key={x} className="border-t border-dashed border-[#e8edf5]"/>)}</div>
        <div className="relative z-10 flex h-full items-end justify-around gap-12 pb-5">{report.managers.map((m,index)=><div key={m.label} className="flex h-full flex-1 flex-col justify-end items-center"><div className="w-full max-w-[310px] rounded-t bg-[#2f66e9] animate-chart-bar" style={{height:`${(m.value/maxManager)*100}%`,animationDelay:`${index*130+160}ms`}}/><span className="absolute bottom-0 text-[10px] text-[#91a0bd]">{m.label}</span></div>)}</div>
      </div>
    </section>
  </div>;
}
