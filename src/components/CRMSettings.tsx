import React, { useState } from "react";
import { 
  Settings, 
  CheckCircle, 
  X, 
  Globe, 
  Bell, 
  ShieldAlert, 
  Palette, 
  Database,
  CloudLightning,
  Smartphone
} from "lucide-react";

export default function CRMSettings() {
  const [appName, setAppName] = useState("Designs CRM");
  const [appUrl, setAppUrl] = useState("https://designs-crm-run-applet.aistudio.com");
  const [currency, setCurrency] = useState("MXN");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [themeMode, setThemeMode] = useState("light");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert("¡Configuración corporativa guardada con éxito!");
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1d63ff]" /> Configuración General del Sistema
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">Ajusta los parámetros globales de la plataforma, tasas impositivas, preferencias de notificaciones e integraciones externas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main form section (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-semibold">
            
            {/* Section 1: Agency Brand */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" /> Identidad de la Agencia
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">Nombre de la Plataforma *</label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">URL de Host o Dominio *</label>
                  <input
                    type="text"
                    required
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Regional Preferences */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-slate-400" /> Preferencias Regionales y Estilo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">Moneda del Sistema *</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  >
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Tema Visual Predeterminado *</label>
                  <select
                    value={themeMode}
                    onChange={(e) => setThemeMode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  >
                    <option value="light">Tema Claro (Minimalist Slate)</option>
                    <option value="dark">Tema Oscuro (Cosmic Midnight - Deshabilitado)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Notification channels */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-slate-400" /> Canales de Alerta & Notificaciones
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-[#1d63ff] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-slate-800 font-bold block">Integración Instantánea WhatsApp Web</span>
                    <span className="text-[10px] text-slate-400 font-medium">Permite disparar textos preestablecidos directamente al número celular del cliente.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="w-4 h-4 text-[#1d63ff] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-slate-800 font-bold block">Correos de Alerta Automatizados (SMTP)</span>
                    <span className="text-[10px] text-slate-400 font-medium">Envía resúmenes quincenales de renovación de hostings al administrador del CRM.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1d63ff] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/15 cursor-pointer transition-all active:scale-95"
              >
                Guardar Configuración
              </button>
            </div>

          </form>
        </div>

        {/* System Metadata sidebar (1 column) */}
        <div className="space-y-6">
          
          {/* Databases & Connections card */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-slate-400" /> Motor de Almacenamiento
            </h4>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Base de Datos</span>
                <span className="font-mono text-slate-700 font-bold">SQLite / LocalStorage</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
                <span className="text-slate-400">Estado de Sincronización</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  ● Conectado
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
                <span className="text-slate-400">Último Backup</span>
                <span className="text-slate-600 font-medium">Hace 15 minutos</span>
              </div>

              <button
                onClick={() => {
                  localStorage.clear();
                  alert("¡LocalStorage limpiado con éxito! Reiniciando base de datos a valores por defecto.");
                  window.location.reload();
                }}
                className="w-full mt-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl cursor-pointer text-center text-xs font-bold transition-all"
              >
                Restablecer Base de Datos
              </button>
            </div>
          </div>

          {/* Integration Status card */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <CloudLightning className="w-4 h-4 text-slate-400" /> Integraciones Webhook
            </h4>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span>Figma Live Sync</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Activo</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span>Slack Alerts Hook</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Apagado</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
