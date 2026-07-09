import React from "react";
import { ArrowRight, Sparkles, Shield, Cpu, Compass } from "lucide-react";

export default function BentoHeroSection() {
  return (
    <div className="w-full bg-stone-50 text-stone-900 py-12 px-5 sm:px-10 rounded-3xl border border-stone-200 shadow-xl font-sans text-left">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-stone-700 tracking-wider uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Replicado de Figma a React
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-950 mb-4 leading-tight">
          Diseños de Figma <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">Impecables</span>
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Estructura tus interfaces con componentes reutilizables, escalables y adaptables a cualquier dispositivo.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
          <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-all flex items-center justify-center gap-1.5 shadow">
            Comenzar Exploración <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-stone-800 border border-stone-200 font-semibold text-xs hover:bg-stone-50 transition-all">
            Ver Especificaciones
          </button>
        </div>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 self-start mb-5">
            <Cpu className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-1">Componentes Reutilizables</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Consolida tus layouts con props de TypeScript bien estructuradas, clases de Tailwind limpias y sin sobrecargar tu bundle final.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-6 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div className="p-2.5 bg-white/10 rounded-xl self-start mb-5 border border-white/10">
            <Shield className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold mb-1">Base de Datos de Sesión</h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Inicia sesión con nuestro backend de Express para persistir todos los cambios realizados en tus componentes.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm md:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
          <div className="flex gap-3 items-start">
            <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200 shrink-0">
              <Compass className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">100% Responsivo</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Prueba cómo reacciona este bento grid de Figma achicando el ancho del viewport de visualización de este simulador.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-stone-100 text-stone-800 text-[10px] font-bold hover:bg-stone-200 transition-all whitespace-nowrap self-start sm:self-auto">
            Configurar Breakpoints
          </button>
        </div>
      </div>
    </div>
  );
}
