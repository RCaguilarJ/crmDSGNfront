import React, { useState } from "react";
import { FigmaNodeInfo } from "../types";
import { 
  Figma, 
  Eye, 
  Layers, 
  Hash, 
  Info, 
  Sliders, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Tablet, 
  Monitor,
  LayoutGrid,
  ChevronRight,
  Code
} from "lucide-react";
import FinancialDashboard from "./FinancialDashboard";
import BentoHeroSection from "./BentoHeroSection";

// Let's declare our static prebuilt components to be rendered inside the Inspect panel
export default function FigmaInspectMode() {
  const [activeDesign, setActiveDesign] = useState<"dashboard" | "hero">("dashboard");
  const [inspectMode, setInspectMode] = useState(true);
  const [previewSize, setPreviewSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [copied, setCopied] = useState(false);

  // Simulated selected Figma Node states
  const [selectedNode, setSelectedNode] = useState<FigmaNodeInfo>({
    id: "#1203:402",
    name: "Dashboard Card Container",
    type: "FRAME",
    color: "bg-slate-900/40",
    spacing: "p-5",
    borderRadius: "rounded-2xl",
    shadow: "shadow-md",
    fontSize: "text-2xl font-bold"
  });

  const [customClasses, setCustomClasses] = useState("bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all");

  const nodesMap = {
    dashboard: [
      {
        id: "#1203:402",
        name: "Dashboard Card Container",
        type: "FRAME",
        color: "bg-slate-900/40",
        spacing: "p-5",
        borderRadius: "rounded-2xl",
        shadow: "shadow-md",
        fontSize: "text-2xl font-bold",
        classes: "bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all"
      },
      {
        id: "#1203:410",
        name: "Header Wrapper",
        type: "AUTO LAYOUT",
        color: "bg-slate-950",
        spacing: "p-6 md:p-8 mb-8",
        borderRadius: "rounded-t-3xl",
        shadow: "shadow-none",
        fontSize: "text-3xl font-bold mt-1",
        classes: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      },
      {
        id: "#1203:430",
        name: "KPI Numeric Metric",
        type: "TEXT",
        color: "text-white",
        spacing: "mt-4",
        borderRadius: "rounded-none",
        shadow: "shadow-none",
        fontSize: "text-2xl font-bold tracking-tight",
        classes: "text-2xl font-bold text-white tracking-tight mt-4"
      }
    ],
    hero: [
      {
        id: "#88:210",
        name: "Bento Hero Wrapper",
        type: "FRAME",
        color: "bg-stone-50",
        spacing: "py-16 px-6 md:px-12",
        borderRadius: "rounded-3xl",
        shadow: "shadow-xl",
        fontSize: "text-4xl md:text-6xl font-extrabold",
        classes: "w-full bg-stone-50 text-stone-900 py-16 px-6 md:px-12 rounded-3xl border border-stone-200 shadow-xl font-sans"
      },
      {
        id: "#88:215",
        name: "Figma Badge Indicator",
        type: "AUTO LAYOUT",
        color: "bg-stone-100 border-stone-200",
        spacing: "px-3.5 py-1.5 mb-6",
        borderRadius: "rounded-full",
        shadow: "shadow-sm",
        fontSize: "text-xs font-semibold",
        classes: "inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 tracking-wide uppercase mb-6 shadow-sm"
      },
      {
        id: "#88:220",
        name: "Primary CTA Button",
        type: "AUTO LAYOUT",
        color: "bg-stone-900 text-white",
        spacing: "px-6 py-3 mt-8",
        borderRadius: "rounded-xl",
        shadow: "shadow-md",
        fontSize: "text-sm font-semibold",
        classes: "px-6 py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-md"
      }
    ]
  };

  const selectSimulatedNode = (node: typeof nodesMap.dashboard[0]) => {
    setSelectedNode(node);
    setCustomClasses(node.classes);
  };

  const handleCopyClasses = () => {
    navigator.clipboard.writeText(customClasses);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="figma-inspect-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* Design spec inspect Sidebar */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-5 flex flex-col h-full max-h-[750px] overflow-y-auto shadow-sm">
        
        {/* Module Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
            <Figma className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Propiedades de Diseño</h3>
            <p className="text-xs text-stone-500">Inspecciona y edita los valores del nodo.</p>
          </div>
        </div>

        {/* Selected Node Header */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/50 mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
              {selectedNode.type}
            </span>
            <span className="text-[10px] font-mono text-stone-400 font-bold">{selectedNode.id}</span>
          </div>
          <h4 className="text-xs font-bold text-stone-900">{selectedNode.name}</h4>
        </div>

        {/* Figma Panel Tabs (Inspect panels) */}
        <div className="space-y-4 flex-1">
          {/* Layout dimensions */}
          <div>
            <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Estructura y Layout (Auto Layout)
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50/55 p-2 rounded-lg border border-stone-150">
                <span className="block text-[10px] text-stone-400 font-medium">Padding (Relleno)</span>
                <span className="font-mono font-semibold text-stone-800">{selectedNode.spacing || "None"}</span>
              </div>
              <div className="bg-stone-50/55 p-2 rounded-lg border border-stone-150">
                <span className="block text-[10px] text-stone-400 font-medium">Borde (Corner Radius)</span>
                <span className="font-mono font-semibold text-stone-800">{selectedNode.borderRadius || "0px"}</span>
              </div>
            </div>
          </div>

          {/* Styling & Fill properties */}
          <div>
            <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Apariencia (Figma Fill & Effects)
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50/55 p-2 rounded-lg border border-stone-150">
                <span className="block text-[10px] text-stone-400 font-medium">Fondo (Fill)</span>
                <span className="font-mono font-semibold text-stone-800 truncate block">{selectedNode.color}</span>
              </div>
              <div className="bg-stone-50/55 p-2 rounded-lg border border-stone-150">
                <span className="block text-[10px] text-stone-400 font-medium">Sombra (Effects)</span>
                <span className="font-mono font-semibold text-stone-800 truncate block">{selectedNode.shadow || "None"}</span>
              </div>
            </div>
          </div>

          {/* Class edit pane */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Code className="w-3.5 h-3.5" /> Clases de Tailwind CSS
              </h5>
              <button
                onClick={handleCopyClasses}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold transition-all"
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <textarea
              value={customClasses}
              onChange={(e) => setCustomClasses(e.target.value)}
              rows={4}
              className="w-full text-[11px] p-2.5 border border-stone-200 rounded-xl bg-stone-50 font-mono text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
            />
          </div>

          {/* Layers Navigator */}
          <div>
            <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" /> Capas de Figma Replicables
            </h5>
            <div className="space-y-1.5">
              {nodesMap[activeDesign].map((node) => (
                <button
                  key={node.id}
                  onClick={() => selectSimulatedNode(node)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    selectedNode.id === node.id
                      ? "border-indigo-500 bg-indigo-50/45 font-semibold text-indigo-950 shadow-sm"
                      : "border-stone-150 hover:bg-stone-50 text-stone-600"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-xs truncate">{node.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tip panel */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex gap-2 text-[11px] text-stone-500">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Puedes alternar entre el **Dashboard Financiero** y el **Bento Hero** para analizar cómo se tradujeron las especificaciones del diseño original.
          </p>
        </div>

      </div>

      {/* Main Canvas Area */}
      <div className="lg:col-span-8 flex flex-col gap-5 h-full">
        
        {/* Workspace Toolbar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-3.5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveDesign("dashboard");
                selectSimulatedNode(nodesMap.dashboard[0]);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeDesign === "dashboard"
                  ? "bg-white text-stone-900 shadow-sm font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Dashboard Financiero
            </button>
            <button
              onClick={() => {
                setActiveDesign("hero");
                selectSimulatedNode(nodesMap.hero[0]);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeDesign === "hero"
                  ? "bg-white text-stone-900 shadow-sm font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Bento Hero Section
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setInspectMode(!inspectMode)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all ${
                inspectMode 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> {inspectMode ? "Inspector Activo" : "Vista Limpia"}
            </button>

            {/* Viewport Sizer */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-stone-500">
              <button
                onClick={() => setPreviewSize("mobile")}
                className={`p-1.5 rounded-lg hover:text-stone-900 transition-all ${previewSize === "mobile" ? "bg-white text-stone-950 shadow-sm" : ""}`}
                title="Smartphone (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewSize("tablet")}
                className={`p-1.5 rounded-lg hover:text-stone-900 transition-all ${previewSize === "tablet" ? "bg-white text-stone-950 shadow-sm" : ""}`}
                title="Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewSize("desktop")}
                className={`p-1.5 rounded-lg hover:text-stone-900 transition-all ${previewSize === "desktop" ? "bg-white text-stone-950 shadow-sm" : ""}`}
                title="Escritorio Completo"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Canvas Stage */}
        <div className="flex-1 bg-stone-100 rounded-3xl p-6 border border-stone-200 shadow-inner flex justify-center items-center relative overflow-auto min-h-[500px]">
          {/* Simulated Figma grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e5e0_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />

          <div 
            className={`transition-all duration-300 z-10 w-full flex justify-center ${
              previewSize === "mobile" ? "max-w-[360px]" :
              previewSize === "tablet" ? "max-w-[700px]" :
              "max-w-full"
            }`}
          >
            {activeDesign === "dashboard" ? (
              <FinancialDashboard />
            ) : (
              <BentoHeroSection />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
