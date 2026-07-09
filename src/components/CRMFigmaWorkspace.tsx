import React, { useState } from "react";
import { Sparkles, Sliders, Eye, Code, Figma } from "lucide-react";
import FigmaInspectMode from "./FigmaInspectMode";
import ComponentPlayground from "./ComponentPlayground";
import AICodeAssistant from "./AICodeAssistant";

interface CRMFigmaWorkspaceProps {
  onSaveToDatabase: (project: {
    name: string;
    description: string;
    componentCode: string;
    figmaNode: string;
  }) => Promise<void>;
  isLoggedIn: boolean;
  activeCodeToLoad: { code: string; name: string } | null;
  onClearActiveCode: () => void;
}

export default function CRMFigmaWorkspace({ 
  onSaveToDatabase, 
  isLoggedIn, 
  activeCodeToLoad,
  onClearActiveCode
}: CRMFigmaWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"inspect" | "playground" | "ai">("inspect");

  // If there's active code to load from the projects page, we auto-navigate to the AI assistant tab or playground
  React.useEffect(() => {
    if (activeCodeToLoad) {
      setActiveTab("ai");
    }
  }, [activeCodeToLoad]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header with Navigation for Workspace sub-modules */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
            <Figma className="w-5 h-5 text-indigo-600 animate-pulse" />
            Lienzo Figma a Código React
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">Traduce tus assets y coordenadas visuales de Figma directamente a código limpio.</p>
        </div>

        {/* Workspace tabs */}
        <div className="flex gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold self-stretch md:self-auto justify-center">
          <button
            onClick={() => {
              setActiveTab("inspect");
              onClearActiveCode();
            }}
            className={`px-4 py-2 text-center rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "inspect"
                ? "bg-stone-900 text-white shadow-sm font-bold"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Inspeccionar Frame
          </button>
          <button
            onClick={() => {
              setActiveTab("playground");
              onClearActiveCode();
            }}
            className={`px-4 py-2 text-center rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "playground"
                ? "bg-stone-900 text-white shadow-sm font-bold"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Estilo Rítmico
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 text-center rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "ai"
                ? "bg-stone-900 text-white shadow-sm font-bold"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/10" /> Generador AI
          </button>
        </div>
      </div>

      {/* Notifications from loaded code */}
      {activeCodeToLoad && activeTab === "ai" && (
        <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Código de **{activeCodeToLoad.name}** cargado con éxito. ¡Compílalo o copia la réplica!</span>
          </div>
          <button 
            onClick={onClearActiveCode}
            className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-lg font-bold hover:bg-indigo-100/50 transition-colors cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Core Tab Renderers */}
      <div className="min-h-[600px]">
        {activeTab === "inspect" && <FigmaInspectMode />}
        {activeTab === "playground" && (
          <ComponentPlayground 
            onSaveToDatabase={onSaveToDatabase} 
            isLoggedIn={isLoggedIn} 
          />
        )}
        {activeTab === "ai" && (
          <AICodeAssistant 
            onSaveToDatabase={onSaveToDatabase} 
            isLoggedIn={isLoggedIn} 
            activeCodeToLoad={activeCodeToLoad}
          />
        )}
      </div>

    </div>
  );
}
