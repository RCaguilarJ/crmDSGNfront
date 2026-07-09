import React, { useState, useEffect } from "react";
import { PlaygroundConfig } from "../types";
import { 
  Sliders, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Heart, 
  Maximize2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Layout, 
  Save, 
  Activity,
  ArrowRight
} from "lucide-react";

interface ComponentPlaygroundProps {
  onSaveToDatabase: (project: {
    name: string;
    description: string;
    componentCode: string;
    figmaNode: string;
  }) => Promise<void>;
  isLoggedIn: boolean;
}

export default function ComponentPlayground({ onSaveToDatabase, isLoggedIn }: ComponentPlaygroundProps) {
  const [activeTab, setActiveTab] = useState<"button" | "badge" | "card" | "alert">("button");
  const [previewSize, setPreviewSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Styling configurations state
  const [config, setConfig] = useState<PlaygroundConfig>({
    paddingX: "px-6",
    paddingY: "py-3",
    bgColor: "bg-indigo-600",
    textColor: "text-white",
    borderRadius: "rounded-xl",
    shadow: "shadow-md hover:shadow-lg",
    borderWidth: "border-0",
    borderColor: "border-transparent",
    hasIcon: true,
    isAnimated: true,
    fontSize: "text-sm"
  });

  // Derived button text or card properties
  const [componentText, setComponentText] = useState("Acción Principal");

  // Options for styling configuration
  const bgColors = [
    { name: "Indigo", class: "bg-indigo-600 hover:bg-indigo-700", textClass: "text-white" },
    { name: "Emerald", class: "bg-emerald-600 hover:bg-emerald-700", textClass: "text-white" },
    { name: "Rose", class: "bg-rose-600 hover:bg-rose-700", textClass: "text-white" },
    { name: "Amber", class: "bg-amber-500 hover:bg-amber-600", textClass: "text-slate-900" },
    { name: "Dark Slate", class: "bg-slate-900 hover:bg-slate-800", textClass: "text-white" },
    { name: "Pure White", class: "bg-white hover:bg-stone-50 border border-stone-200", textClass: "text-stone-900" },
  ];

  const borderRadii = [
    { name: "Recto", class: "rounded-none" },
    { name: "Pequeño", class: "rounded-md" },
    { name: "Mediano", class: "rounded-lg" },
    { name: "Grande", class: "rounded-xl" },
    { name: "Doble Grande", class: "rounded-2xl" },
    { name: "Completo", class: "rounded-full" },
  ];

  const shadows = [
    { name: "Ninguna", class: "shadow-none" },
    { name: "Pequeña", class: "shadow-sm hover:shadow" },
    { name: "Normal", class: "shadow hover:shadow-md" },
    { name: "Grande", class: "shadow-md hover:shadow-lg" },
    { name: "Elevada", class: "shadow-lg hover:shadow-xl" },
    { name: "Extra Grande", class: "shadow-2xl" },
  ];

  const fontSizes = [
    { name: "Micro", class: "text-xs" },
    { name: "Normal", class: "text-sm" },
    { name: "Base", class: "text-base" },
    { name: "Destacado", class: "text-lg" },
  ];

  const paddingsX = [
    { name: "Estrecho", class: "px-3" },
    { name: "Medio", class: "px-5" },
    { name: "Generoso", class: "px-7" },
    { name: "Amplio", class: "px-9" },
  ];

  const paddingsY = [
    { name: "Compacto", class: "py-1.5" },
    { name: "Cómodo", class: "py-3" },
    { name: "Espacioso", class: "py-4" },
  ];

  // Adjust placeholder texts based on active tab
  useEffect(() => {
    if (activeTab === "button") setComponentText("Acción Principal");
    if (activeTab === "badge") setComponentText("Novedad");
    if (activeTab === "alert") setComponentText("¡Operación completada con éxito!");
    if (activeTab === "card") setComponentText("Análisis Mensual");
  }, [activeTab]);

  // Construct JSX Code Output
  const generateJSXCode = (): string => {
    const animationClass = config.isAnimated ? " transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0" : "";
    const coreClasses = `${config.bgColor} ${config.textColor} ${config.paddingX} ${config.paddingY} ${config.borderRadius} ${config.shadow} ${config.fontSize} ${config.borderWidth} ${config.borderColor}${animationClass}`.trim();

    if (activeTab === "button") {
      return `import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ReplicatedButton() {
  return (
    <button className="${coreClasses} inline-flex items-center justify-center gap-2 font-medium">
      <span>${componentText}</span>
      ${config.hasIcon ? `<ArrowRight className="w-4 h-4" />` : ""}
    </button>
  );
}`;
    }

    if (activeTab === "badge") {
      return `import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ReplicatedBadge() {
  return (
    <span className="${coreClasses} inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[11px]">
      ${config.hasIcon ? `<Sparkles className="w-3 h-3" />` : ""}
      <span>${componentText}</span>
    </span>
  );
}`;
    }

    if (activeTab === "alert") {
      return `import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ReplicatedAlert() {
  return (
    <div className="${coreClasses} flex items-center gap-3 p-4 border w-full max-w-lg">
      ${config.hasIcon ? `<AlertCircle className="w-5 h-5 shrink-0" />` : ""}
      <div className="flex-1">
        <p className="font-semibold text-xs uppercase tracking-wide opacity-90">Aviso del Sistema</p>
        <p className="text-xs font-medium mt-0.5">${componentText}</p>
      </div>
    </div>
  );
}`;
    }

    // Default: Card component
    return `import React from 'react';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

export default function ReplicatedCard() {
  return (
    <div className="w-full max-w-sm bg-white border border-stone-200 ${config.borderRadius} ${config.shadow} p-6 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="${config.bgColor} ${config.textColor} ${config.borderRadius} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          ${componentText}
        </span>
        <span className="text-[11px] font-mono text-stone-400">#8291:203</span>
      </div>
      
      <h3 className="text-lg font-bold text-stone-900 tracking-tight">Tarjeta Replicada de Figma</h3>
      <p className="text-xs text-stone-500 leading-relaxed mt-2">
        Alineación de bordes pixel-perfect, espaciado rítmico y sombras adaptadas para encajar en cualquier diseño responsivo de alto rendimiento.
      </p>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
        <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> 6 de Julio
        </span>
        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
          Explorar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateJSXCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveComponent = async () => {
    if (!isLoggedIn) {
      alert("Por favor inicia sesión con la cuenta de demostración para guardar el componente.");
      return;
    }
    try {
      const code = generateJSXCode();
      const nodeName = `Playground ${activeTab.toUpperCase()}`;
      await onSaveToDatabase({
        name: `${nodeName} Replicado`,
        description: `Componente ${activeTab} diseñado visualmente en el Sandbox con Tailwind CSS.`,
        figmaNode: `Node: #PG_${activeTab.toUpperCase()}`,
        componentCode: code
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="component-playground-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* Sidebar: Controls */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col h-full overflow-y-auto max-h-[750px] shadow-sm">
        
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Configuración de Estilo Figma</h3>
            <p className="text-xs text-stone-500">Modifica espaciados, bordes y colores rítmicamente.</p>
          </div>
        </div>

        {/* Component Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl mb-6 text-xs font-medium">
          {(["button", "badge", "card", "alert"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 rounded-lg text-center capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-stone-950 shadow-sm font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {tab === "button" ? "Botón" : tab === "badge" ? "Badge" : tab === "alert" ? "Alerta" : "Tarjeta"}
            </button>
          ))}
        </div>

        {/* Control sections */}
        <div className="space-y-5 flex-1">
          
          {/* Label text input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
              Texto del Componente
            </label>
            <input
              type="text"
              value={componentText}
              onChange={(e) => setComponentText(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
              Tema y Color (Figma Fill)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {bgColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setConfig({ 
                    ...config, 
                    bgColor: color.class, 
                    textColor: color.textClass,
                    borderWidth: color.name === "Pure White" ? "border" : "border-0",
                    borderColor: color.name === "Pure White" ? "border-stone-200" : "border-transparent"
                  })}
                  className={`px-3 py-2 text-[11px] font-semibold rounded-xl text-center border transition-all ${
                    config.bgColor === color.class
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-stone-50"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Borders */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
              Borde Redondeado (Corner Radius)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {borderRadii.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => setConfig({ ...config, borderRadius: r.class })}
                  className={`px-3 py-2 text-[11px] font-medium rounded-xl text-center border transition-all ${
                    config.borderRadius === r.class
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-stone-50 font-bold"
                      : "border-stone-200 hover:bg-stone-50 text-stone-600"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Shadows */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
              Efecto de Sombra (Figma DropShadow)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shadows.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setConfig({ ...config, shadow: s.class })}
                  className={`px-3 py-2 text-[11px] font-medium rounded-xl text-center border transition-all ${
                    config.shadow === s.class
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-stone-50 font-bold"
                      : "border-stone-200 hover:bg-stone-50 text-stone-600"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizing & Padding sliders (Only for button / badge) */}
          {(activeTab === "button" || activeTab === "badge") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                  Relleno Horizontal
                </label>
                <div className="space-y-1.5">
                  {paddingsX.map((px) => (
                    <button
                      key={px.class}
                      onClick={() => setConfig({ ...config, paddingX: px.class })}
                      className={`w-full py-1.5 px-3 text-[10px] rounded-lg text-left border transition-all ${
                        config.paddingX === px.class
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {px.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                  Relleno Vertical
                </label>
                <div className="space-y-1.5">
                  {paddingsY.map((py) => (
                    <button
                      key={py.class}
                      onClick={() => setConfig({ ...config, paddingY: py.class })}
                      className={`w-full py-1.5 px-3 text-[10px] rounded-lg text-left border transition-all ${
                        config.paddingY === py.class
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {py.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Font Sizes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
              Tamaño de Fuente (Font Size)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {fontSizes.map((sz) => (
                <button
                  key={sz.class}
                  onClick={() => setConfig({ ...config, fontSize: sz.class })}
                  className={`py-1.5 text-[10px] font-medium rounded-lg text-center border transition-all ${
                    config.fontSize === sz.class
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {sz.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="bg-stone-50 p-4 rounded-xl space-y-3 border border-stone-200/55">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Incluir Icono Vectorial</span>
              <input
                type="checkbox"
                checked={config.hasIcon}
                onChange={(e) => setConfig({ ...config, hasIcon: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-stone-300"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Animación al hacer Hover</span>
              <input
                type="checkbox"
                checked={config.isAnimated}
                onChange={(e) => setConfig({ ...config, isAnimated: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex gap-2.5">
          <button
            onClick={handleSaveComponent}
            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              saveSuccess 
                ? "bg-emerald-600 text-white" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" /> ¡Réplica Guardada!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Guardar en DB
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Column: Interactive Canvas & Generated Code */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Canvas Area */}
        <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 shadow-inner flex flex-col justify-between h-[360px] relative overflow-hidden">
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

          {/* Breakpoint Viewport controls */}
          <div className="flex justify-between items-center z-10">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-full border border-stone-700">
              <Layout className="w-3 h-3 text-indigo-400" /> Lienzo de Visualización
            </span>

            <div className="flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700 text-stone-400">
              <button
                onClick={() => setPreviewSize("mobile")}
                className={`p-1.5 rounded-lg hover:text-white transition-all ${previewSize === "mobile" ? "bg-indigo-600 text-white" : ""}`}
                title="Vista móvil (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewSize("tablet")}
                className={`p-1.5 rounded-lg hover:text-white transition-all ${previewSize === "tablet" ? "bg-indigo-600 text-white" : ""}`}
                title="Vista tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewSize("desktop")}
                className={`p-1.5 rounded-lg hover:text-white transition-all ${previewSize === "desktop" ? "bg-indigo-600 text-white" : ""}`}
                title="Vista completa"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Core element center */}
          <div className="flex-1 flex items-center justify-center py-8 z-10 transition-all duration-300">
            <div 
              className={`transition-all duration-300 flex justify-center items-center ${
                previewSize === "mobile" ? "w-[320px] bg-stone-800/20 p-4 border border-stone-800 rounded-xl" :
                previewSize === "tablet" ? "w-[480px] bg-stone-800/10 p-6 border border-stone-800 rounded-2xl" :
                "w-full"
              }`}
            >
              {activeTab === "button" && (
                <button
                  className={`${config.bgColor} ${config.textColor} ${config.paddingX} ${config.paddingY} ${config.borderRadius} ${config.shadow} ${config.fontSize} ${config.borderWidth} ${config.borderColor}${
                    config.isAnimated ? " transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0" : ""
                  } font-semibold inline-flex items-center gap-2 cursor-pointer shadow-stone-950/25`}
                >
                  <span>{componentText}</span>
                  {config.hasIcon && <ArrowRight className="w-4 h-4 shrink-0" />}
                </button>
              )}

              {activeTab === "badge" && (
                <span
                  className={`${config.bgColor} ${config.textColor} ${config.paddingX} ${config.paddingY} ${config.borderRadius} ${config.shadow} ${config.fontSize} ${config.borderWidth} ${config.borderColor}${
                    config.isAnimated ? " transition-all duration-300 transform hover:scale-105" : ""
                  } inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] select-none shadow-stone-950/15`}
                >
                  {config.hasIcon && <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />}
                  <span>{componentText}</span>
                </span>
              )}

              {activeTab === "alert" && (
                <div
                  className={`${config.bgColor} ${config.textColor} ${config.borderRadius} ${config.shadow} ${config.borderWidth} ${config.borderColor} flex items-center gap-3 p-4 border w-full max-w-md shadow-stone-950/30`}
                >
                  {config.hasIcon && <Activity className="w-5 h-5 shrink-0 animate-pulse text-indigo-400" />}
                  <div className="flex-1">
                    <p className="font-semibold text-[10px] uppercase tracking-wider opacity-75">Notificación</p>
                    <p className="text-xs font-bold mt-0.5 leading-normal">{componentText}</p>
                  </div>
                </div>
              )}

              {activeTab === "card" && (
                <div className={`w-full max-w-xs bg-white border border-stone-200 ${config.borderRadius} ${config.shadow} p-5 transition-all duration-300 hover:-translate-y-1 shadow-stone-900/10`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`${config.bgColor} ${config.textColor} ${config.borderRadius} px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider`}>
                      {componentText}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">Frame #203</span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-stone-900 tracking-tight">Diseño Replicado de Figma</h3>
                  <p className="text-[11px] text-stone-500 leading-normal mt-1.5">
                    Sombras rítmicas, bordes contrastantes y espaciado áureo refinado listo para usar.
                  </p>

                  <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-stone-100">
                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Replicado</span>
                    <button className="text-[11px] font-bold text-stone-900 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                      Ver código <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Size readout info footer */}
          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 border-t border-stone-800/80 pt-3 z-10">
            <span>Visual Width: {previewSize === "mobile" ? "375px (Responsive)" : previewSize === "tablet" ? "768px (Tablet)" : "100% (Ancho Completo)"}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Pixel Perfect Figma Target</span>
          </div>
        </div>

        {/* Generated Code block */}
        <div className="bg-stone-950 rounded-3xl p-6 border border-stone-900 flex flex-col justify-between flex-1 max-h-[340px] shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-emerald-400" /> Código React + Tailwind CSS
            </span>
            <button
              onClick={handleCopyCode}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl transition-all ${
                copied 
                  ? "bg-emerald-500 text-white" 
                  : "bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar Código
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-stone-900/40 p-4 rounded-xl border border-stone-900/60 text-emerald-400 font-mono text-xs select-all text-left">
            <pre className="whitespace-pre">{generateJSXCode()}</pre>
          </div>
        </div>

      </div>

    </div>
  );
}
