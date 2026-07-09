import React, { useState, useEffect } from "react";
import {
  Sparkles, 
  Play, 
  Code, 
  HelpCircle, 
  Check, 
  Copy, 
  AlertCircle, 
  Flame, 
  Save, 
  Cpu, 
  Terminal,
  MonitorPlay
} from "lucide-react";
import { apiFetch } from "../lib/api";

interface AICodeAssistantProps {
  onSaveToDatabase: (project: {
    name: string;
    description: string;
    componentCode: string;
    figmaNode: string;
  }) => Promise<void>;
  isLoggedIn: boolean;
  activeCodeToLoad?: { code: string; name: string } | null;
}

export default function AICodeAssistant({ onSaveToDatabase, isLoggedIn, activeCodeToLoad }: AICodeAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [generatedData, setGeneratedData] = useState<{
    name: string;
    explanation: string;
    code: string;
  } | null>(null);

  // Auto load active code if supplied
  useEffect(() => {
    if (activeCodeToLoad) {
      setGeneratedData({
        name: activeCodeToLoad.name,
        explanation: "Código importado del gestor de proyectos del CRM.",
        code: activeCodeToLoad.code
      });
    }
  }, [activeCodeToLoad]);

  // Pre-configured templates to help the user get started
  const templates = [
    {
      title: "Pricing Bento Card",
      prompt: "Una tarjeta de precios estilo bento grid oscura, con gradientes ámbar y morados, un badge llamativo 'MÁS POPULAR', una lista de 5 beneficios con iconos de check, y un gran botón de suscripción premium con efecto hover."
    },
    {
      title: "Bento KPI Stat Card",
      prompt: "Una sección de estadísticas bento con 3 métricas de negocio. El fondo de la tarjeta es un sutil blur de cristaleria (glassmorphism), bordes refinados con reflejos, porcentajes de incremento en verde esmeralda y un mini gráfico de barras estilizado."
    },
    {
      title: "Hero Sign-up Page",
      prompt: "Una sección hero minimalista con un título display de gran impacto en fuente moderna, un subtítulo descriptivo elegante, y un formulario de registro integrado (input + botón con flecha) que tenga un efecto de transición suave."
    }
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) {
      setError("Por favor describe un diseño o selecciona una plantilla de Figma.");
      return;
    }

    setError("");
    setIsLoading(true);
    setGeneratedData(null);

    try {
      const data = await apiFetch<{
        name: string;
        explanation: string;
        code: string;
      }>("/api/generate-component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt }),
      });

      setGeneratedData(data);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al conectar con Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedData) return;
    navigator.clipboard.writeText(generatedData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToPortfolio = async () => {
    if (!generatedData) return;
    if (!isLoggedIn) {
      alert("Por favor inicia sesión con la cuenta de demostración ('demo') para guardar esta réplica.");
      return;
    }

    try {
      await onSaveToDatabase({
        name: generatedData.name,
        description: generatedData.explanation,
        componentCode: generatedData.code,
        figmaNode: "Gemini AI"
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Prepares the Babel React Iframe sandbox content
  const getIframeSrcDoc = () => {
    if (!generatedData) return "";

    // Clean user code of ES imports to let it run cleanly on Babel-standalone
    let cleanedCode = generatedData.code
      .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, "") // Remove standard imports
      .replace(/export\s+default\s+function\s+(\w+)/, "function App") // Standard export
      .replace(/export\s+default\s+class\s+(\w+)/, "class App") // Class export fallback
      .replace(/export\s+const\s+(\w+)\s*=/, "const App ="); // Arrow function fallback

    // Ensure App exists
    if (!cleanedCode.includes("function App") && !cleanedCode.includes("const App") && !cleanedCode.includes("class App")) {
      cleanedCode += "\nfunction App() { return <div className='p-6 text-amber-400 font-mono'>Error: Component default export not resolved properly.</div> }";
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  animation: {
                    'spin-slow': 'spin 8s linear infinite',
                  }
                }
              }
            }
          </script>
          <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <!-- Pre-import Lucide icons into window to mock import -->
          <script src="https://unpkg.com/lucide@latest"></script>
          <style>
            body {
              margin: 0;
              padding: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #0c0a09;
              color: #f5f5f4;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            /* Hide scrollbar */
            ::-webkit-scrollbar { display: none; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            // Inject state and references
            const { useState, useEffect, useRef, useMemo } = React;
            
            // Mock lucide imports inside Babel
            const LucideIcons = window.lucide;
            // Map Lucide icons to React Components
            const LucideMock = new Proxy({}, {
              get(target, prop) {
                return (props) => {
                  const elRef = useRef(null);
                  useEffect(() => {
                    if (elRef.current) {
                      // Empty and reconstruct
                      elRef.current.innerHTML = '';
                      const iconName = prop.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
                      const icon = LucideIcons[prop] || LucideIcons.Activity;
                      if (icon) {
                        const svgString = LucideIcons.createOutline({
                          ...props,
                          name: iconName,
                        });
                        elRef.current.appendChild(svgString);
                      }
                    }
                  }, [props]);
                  return <span ref={elRef} className={props.className} style={{ display: 'inline-flex', alignItems: 'center' }} />;
                };
              }
            });

            // Re-bind Lucide globally inside this sandbox
            window.LucideReact = LucideMock;
            // Inject Lucide variables
            const { 
              ArrowRight, Sparkles, Activity, Shield, Cpu, Compass, Check, X, Info, 
              AlertCircle, Star, Heart, TrendingUp, DollarSign, Users, ShoppingBag, 
              Percent, Menu, ArrowUpRight, ArrowDownRight, Award, Lock, ExternalLink 
            } = LucideMock;

            // --- INJECTED CODE START ---
            ${cleanedCode}
            // --- INJECTED CODE END ---

            try {
              ReactDOM.createRoot(document.getElementById('root')).render(<App />);
            } catch (err) {
              document.getElementById('root').innerHTML = '<div class="p-6 bg-red-950/20 text-red-400 font-mono text-xs border border-red-900 rounded-xl">Error de renderizado: ' + err.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div id="ai-code-assistant-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* Sidebar Inputs */}
      <div className="lg:col-span-5 flex flex-col gap-5 h-full overflow-y-auto max-h-[750px] pr-1">
        
        {/* Module Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-sans">Asistente Figma de IA</h3>
              <p className="text-xs text-stone-500 leading-normal">Describe un diseño y Gemini lo estructurará en React con Tailwind.</p>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-stone-100">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe tu diseño de Figma. Ej. 'Un banner de bienvenida con un fondo futurista satinado, un badge brillante con texto 'New Version' y un botón animado...'"
              rows={4}
              className="w-full text-xs p-3 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium leading-relaxed resize-none"
            />

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="w-full mt-3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:bg-indigo-400"
            >
              {isLoading ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" /> Procesando con Gemini...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Generar Réplica de Figma
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Templates */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Plantillas de Referencia
          </h4>
          <div className="space-y-3">
            {templates.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(tpl.prompt);
                  handleGenerate(tpl.prompt);
                }}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-xl border border-stone-150 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all group flex flex-col gap-1"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                    {tpl.title}
                  </span>
                  <Sparkles className="w-3 h-3 text-stone-400 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                  {tpl.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Code Display & Iframe Live Preview */}
      <div className="lg:col-span-7 flex flex-col gap-6 h-full">
        {error && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">Error en la Generación</p>
              <p className="text-[11px] mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {!generatedData && !isLoading && !error && (
          <div className="flex-1 min-h-[450px] bg-stone-950 border border-stone-900 rounded-3xl flex flex-col justify-center items-center text-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-4 animate-pulse">
              <MonitorPlay className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lienzo Generativo AI</h3>
            <p className="text-xs text-stone-500 max-w-sm mt-2 leading-relaxed">
              Describe lo que deseas replicar en el panel de la izquierda o selecciona una plantilla pre-diseñada para ver el renderizado inteligente de Gemini en tiempo real.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex-1 min-h-[450px] bg-stone-950 border border-stone-900 rounded-3xl flex flex-col justify-center items-center text-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compilando Réplica de Figma...</h3>
            <p className="text-xs text-stone-500 max-w-xs mt-2 leading-relaxed">
              Gemini está procesando los tokens, estructurando las clases de Tailwind y emitiendo el código compatible. Esto tomará sólo unos segundos.
            </p>
          </div>
        )}

        {generatedData && (
          <div className="flex flex-col gap-6 flex-1">
            
            {/* Live Render Area (Iframe Sandbox) */}
            <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 shadow-xl flex flex-col h-[380px]">
              <div className="flex justify-between items-center border-b border-stone-800/80 pb-3 mb-4">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-indigo-400" /> Renderizado en Vivo
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {generatedData.name}
                </span>
              </div>

              {/* Sandboxed iframe execution */}
              <div className="flex-1 bg-stone-950 rounded-2xl border border-stone-950 overflow-hidden relative shadow-inner">
                <iframe
                  title="JSX Sandbox"
                  srcDoc={getIframeSrcDoc()}
                  sandbox="allow-scripts"
                  className="w-full h-full border-none"
                />
              </div>
            </div>

            {/* AI Explanation & Actions */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 mb-2">
                <Terminal className="w-4 h-4 text-indigo-500" /> Explicación del Diseño
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed font-medium bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                {generatedData.explanation}
              </p>

              <div className="flex gap-3 mt-4 pt-3 border-t border-stone-100">
                <button
                  onClick={handleCopyCode}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                    copied 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : "bg-white border-stone-200 hover:bg-stone-50 text-stone-800"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> ¡Código Copiado!
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4" /> Copiar Código React
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveToPortfolio}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    saveSuccess 
                      ? "bg-emerald-600 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> ¡Guardado!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Guardar en DB
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
