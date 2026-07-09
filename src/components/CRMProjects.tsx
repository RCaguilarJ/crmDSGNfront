import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  DollarSign,
  Figma,
  FileCode,
  FolderGit,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

export interface DesignProject {
  id: string;
  name: string;
  clientName: string;
  figmaNode: string;
  status: "En Boceto" | "En Diseño" | "En Revisión" | "Aprobado" | "Replicado";
  dueDate: string;
  budget: number;
  componentCode?: string;
  description: string;
  manager?: string;
  devs?: string[];
  startDate?: string;
  progress?: number;
  priority?: "Alta" | "Media" | "Urgente" | "Baja";
}

interface CRMProjectsProps {
  projects: DesignProject[];
  clients: Array<{ companyName: string }>;
  onAddProject: (proj: Omit<DesignProject, "id">) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProjectStatus: (id: string, status: DesignProject["status"]) => void;
  onLoadCodeToWorkspace: (code: string, name: string) => void;
  onUpdateProjectProgress?: (id: string, progress: number) => void;
  onEditProject?: (id: string, proj: Omit<DesignProject, "id">) => void;
}

const statusOptions = ["En Boceto", "En Diseño", "En Revisión", "Aprobado", "Replicado"] as const;

const priorityStyles: Record<NonNullable<DesignProject["priority"]>, string> = {
  Alta: "border-[#f7d48b] bg-[#fff8e8] text-[#d48b00]",
  Media: "border-[#bfd3ff] bg-[#f1f6ff] text-[#3b6ff6]",
  Urgente: "border-[#ffc9c7] bg-[#fff0f0] text-[#ef4444]",
  Baja: "border-slate-200 bg-slate-50 text-slate-500",
};

export default function CRMProjects({
  projects,
  clients,
  onAddProject,
  onDeleteProject,
  onUpdateProjectStatus,
  onLoadCodeToWorkspace,
  onUpdateProjectProgress,
  onEditProject,
}: CRMProjectsProps) {
  const [filterStatus, setFilterStatus] = useState<"All" | DesignProject["status"]>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewProject, setPreviewProject] = useState<DesignProject | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [newProjName, setNewProjName] = useState("");
  const [newProjClient, setNewProjClient] = useState("");
  const [newProjFigma, setNewProjFigma] = useState("");
  const [newProjStatus, setNewProjStatus] = useState<DesignProject["status"]>("En Diseño");
  const [newProjDueDate, setNewProjDueDate] = useState("");
  const [newProjBudget, setNewProjBudget] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjCode, setNewProjCode] = useState("");
  const [newProjManager, setNewProjManager] = useState("");
  const [newProjDevs, setNewProjDevs] = useState("");
  const [newProjStartDate, setNewProjStartDate] = useState("");
  const [newProjPriority, setNewProjPriority] = useState<DesignProject["priority"] | "">("");
  const [newProjProgress, setNewProjProgress] = useState<number>(0);

  const filteredProjects = projects.filter((project) => {
    return filterStatus === "All" || project.status === filterStatus;
  });

  const totalProjects = projects.length;
  const inDevelopment = projects.filter((project) => project.status === "En Diseño").length;
  const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const resetForm = () => {
    setNewProjName("");
    setNewProjClient("");
    setNewProjFigma("");
    setNewProjStatus("En Diseño");
    setNewProjDueDate("");
    setNewProjBudget("");
    setNewProjDesc("");
    setNewProjCode("");
    setNewProjManager("");
    setNewProjDevs("");
    setNewProjStartDate("");
    setNewProjPriority("");
    setNewProjProgress(0);
    setEditingProjectId(null);
  };

  const closeProjectModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newProjName.trim() || !newProjClient) {
      alert("Por favor completa los datos básicos.");
      return;
    }

    const payload: Omit<DesignProject, "id"> = {
      name: newProjName.trim(),
      clientName: newProjClient,
      figmaNode: newProjFigma || "Node: #Lienzo_Principal",
      status: newProjStatus,
      dueDate:
        newProjDueDate ||
        new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
      budget: Number(newProjBudget) || 5000,
      description: newProjDesc,
      componentCode:
        newProjCode ||
        `import React from "react";
import { Sparkles } from "lucide-react";

export default function CustomCard() {
  return (
    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white text-center">
      <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-pulse" />
      <h3 className="text-lg font-bold">${newProjName}</h3>
      <p className="text-xs text-slate-400 mt-2">Componente de diseño customizado para ${newProjClient}</p>
    </div>
  );
}`,
      manager: newProjManager || undefined,
      devs: newProjDevs
        ? newProjDevs
            .split(",")
            .map((dev) => dev.trim())
            .filter(Boolean)
        : undefined,
      startDate: newProjStartDate || undefined,
      progress: newProjProgress,
      priority: newProjPriority || undefined,
    };

    if (editingProjectId && typeof onEditProject === "function") {
      onEditProject(editingProjectId, payload);
    } else {
      onAddProject(payload);
    }

    closeProjectModal();
  };

  const openEditModal = (project: DesignProject) => {
    setEditingProjectId(project.id);
    setNewProjName(project.name);
    setNewProjClient(project.clientName);
    setNewProjFigma(project.figmaNode || "");
    setNewProjStatus(project.status);
    setNewProjDueDate(project.dueDate || "");
    setNewProjBudget(String(project.budget || 0));
    setNewProjDesc(project.description || "");
    setNewProjCode(project.componentCode || "");
    setNewProjManager(project.manager || "");
    setNewProjDevs((project.devs || []).join(", "));
    setNewProjStartDate(project.startDate || "");
    setNewProjPriority(project.priority || "");
    setNewProjProgress(project.progress ?? 0);
    setShowAddModal(true);
  };

  const getIframeSrcDoc = (project: DesignProject) => {
    const code = project.componentCode || "";
    const cleanedCode = code
      .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, "")
      .replace(/export\s+default\s+function\s+(\w+)/, "function App")
      .replace(/export\s+default\s+class\s+(\w+)/, "class App")
      .replace(/export\s+const\s+(\w+)\s*=/, "const App =");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://unpkg.com/lucide@latest"></script>
          <style>
            body {
              margin: 0;
              padding: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #09090b;
              color: #fafafa;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
            ::-webkit-scrollbar { display: none; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect } = React;
            const {
              Sparkles, Code, Figma, FolderGit, CheckCircle, Calendar, Clock, DollarSign
            } = lucide;

            ${cleanedCode}

            try {
              ReactDOM.createRoot(document.getElementById("root")).render(<App />);
            } catch (err) {
              document.getElementById("root").innerHTML = '<div class="p-6 bg-red-950/20 text-red-400 font-mono text-xs border border-red-900 rounded-xl">Error: ' + err.message + "</div>";
            }
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-4 animate-fade-in text-left">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[152px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_154px]">
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value as "All" | DesignProject["status"])}
          className="h-[52px] rounded-2xl border border-slate-200 bg-white px-5 text-[12px] font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
        >
          <option value="All">Todos los estados</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <div className="h-[52px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#96a5bf]">Total</div>
          <div className="mt-0.5 text-[16px] font-black leading-none text-[#2563eb]">{totalProjects}</div>
        </div>

        <div className="h-[52px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#96a5bf]">En desarrollo</div>
          <div className="mt-0.5 text-[16px] font-black leading-none text-[#6d28d9]">{inDevelopment}</div>
        </div>

        <div className="h-[52px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#96a5bf]">Presupuesto total</div>
          <div className="mt-0.5 text-[16px] font-black leading-none text-[#00a86b]">{formatCurrency(totalBudget)}</div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#2563eb] px-4 text-[13px] font-extrabold text-white shadow-[0_10px_18px_rgba(37,99,235,0.18)] transition hover:bg-[#1d4ed8] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo proyecto
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1440px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6d84a3]">
                <th className="px-4 py-4">Proyecto</th>
                <th className="px-4 py-4">Cliente</th>
                <th className="px-4 py-4">Gerente</th>
                <th className="px-4 py-4">Devs</th>
                <th className="px-4 py-4">Inicio</th>
                <th className="px-4 py-4">Entrega</th>
                <th className="px-4 py-4">Presupuesto</th>
                <th className="px-4 py-4">Avance</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Prioridad</th>
                <th className="px-4 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="transition-colors hover:bg-[#fbfcff]">
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setPreviewProject(project)}
                      className="text-[12px] font-bold text-[#1f2f46] transition hover:text-[#2563eb] cursor-pointer"
                    >
                      {project.name}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-[12px] font-medium text-[#667085]">{project.clientName}</td>
                  <td className="px-4 py-4 text-[12px] font-medium text-[#334155]">{project.manager || "-"}</td>
                  <td className="px-4 py-4">
                    {(project.devs || []).length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(project.devs || []).map((dev, index) => (
                          <span
                            key={`${project.id}-dev-${index}`}
                            className="rounded-md bg-[#eef4fb] px-2 py-0.5 text-[10px] font-medium text-[#5b6f8f]"
                          >
                            {dev}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[12px] text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-[12px] text-[#5b6b84]">{project.startDate || "-"}</td>
                  <td className="px-4 py-4 font-mono text-[12px] text-[#5b6b84]">{project.dueDate}</td>
                  <td className="px-4 py-4 font-mono text-[12px] font-bold text-[#0f172a]">
                    {formatCurrency(project.budget)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-[160px] items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={project.progress ?? 0}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          if (typeof onUpdateProjectProgress === "function") {
                            onUpdateProjectProgress(project.id, nextValue);
                          }
                        }}
                        className="crm-progress w-[128px]"
                      />
                      <span className="w-9 text-[11px] font-bold text-[#475467]">{project.progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={project.status}
                      onChange={(event) =>
                        onUpdateProjectStatus(project.id, event.target.value as DesignProject["status"])
                      }
                      className="h-8 min-w-[138px] rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        priorityStyles[project.priority || "Media"]
                      }`}
                    >
                      {project.priority || "Media"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(project)}
                        className="text-[#2563eb] transition hover:text-[#1d4ed8] cursor-pointer"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[13px] h-[13px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.5 3.5l4 4L13 15l-4 1 1-4 7.5-7.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="text-[#ff5a5f] transition hover:text-[#e11d48] cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-[13px] h-[13px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-14 text-center">
                    <FolderGit className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-bold text-slate-500">No hay proyectos para mostrar.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/60 p-6 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <FolderGit className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900">
                      {editingProjectId ? "Editar Proyecto" : "Registrar Nuevo Proyecto"}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Completa los datos del proyecto y guarda los cambios.
                    </p>
                  </div>
                </div>
                <button onClick={closeProjectModal} className="rounded-lg p-2 hover:bg-stone-100 cursor-pointer">
                  <X className="h-4 w-4 text-stone-500" />
                </button>
              </div>

              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <FolderGit className="h-4 w-4" />
                        Nombre del proyecto
                      </span>
                      <input
                        type="text"
                        value={newProjName}
                        onChange={(event) => setNewProjName(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Portal Inmobiliario"
                        required
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <Building2 className="h-4 w-4" />
                        Cliente asociado
                      </span>
                      <select
                        value={newProjClient}
                        onChange={(event) => setNewProjClient(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        required
                      >
                        <option value="">Selecciona un cliente</option>
                        {clients.map((client) => (
                          <option key={client.companyName} value={client.companyName}>
                            {client.companyName}
                          </option>
                        ))}
                        <option value="Nike México">Nike México</option>
                        <option value="Google Latam">Google Latam</option>
                        <option value="Netflix Inc">Netflix Inc</option>
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <Figma className="h-4 w-4" />
                        Referencia Figma
                      </span>
                      <input
                        type="text"
                        value={newProjFigma}
                        onChange={(event) => setNewProjFigma(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Frame #391:1240"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <CheckCircle className="h-4 w-4" />
                        Estado
                      </span>
                      <select
                        value={newProjStatus}
                        onChange={(event) => setNewProjStatus(event.target.value as DesignProject["status"])}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <Calendar className="h-4 w-4" />
                        Fecha de inicio
                      </span>
                      <input
                        type="date"
                        value={newProjStartDate}
                        onChange={(event) => setNewProjStartDate(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <Clock className="h-4 w-4" />
                        Fecha de entrega
                      </span>
                      <input
                        type="date"
                        value={newProjDueDate}
                        onChange={(event) => setNewProjDueDate(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <DollarSign className="h-4 w-4" />
                        Presupuesto
                      </span>
                      <input
                        type="number"
                        value={newProjBudget}
                        onChange={(event) => setNewProjBudget(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="15000"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-stone-600">
                        <Code className="h-4 w-4" />
                        Gerente
                      </span>
                      <input
                        type="text"
                        value={newProjManager}
                        onChange={(event) => setNewProjManager(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Marco"
                      />
                    </label>

                    <label className="space-y-1 md:col-span-2">
                      <span className="flex items-center gap-2 text-stone-600">
                        <Code className="h-4 w-4" />
                        Devs asignados
                      </span>
                      <input
                        type="text"
                        value={newProjDevs}
                        onChange={(event) => setNewProjDevs(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Carlos M., Ana G."
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Prioridad</span>
                      <select
                        value={newProjPriority}
                        onChange={(event) => setNewProjPriority(event.target.value as DesignProject["priority"] | "")}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                      >
                        <option value="">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </label>

                    <div className="space-y-1">
                      <span className="text-stone-600">Avance (%)</span>
                      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={newProjProgress}
                          onChange={(event) => setNewProjProgress(Number(event.target.value))}
                          className="crm-progress w-full"
                        />
                        <div className="w-10 text-right text-sm font-bold text-stone-700">{newProjProgress}%</div>
                      </div>
                    </div>

                    <label className="space-y-1 md:col-span-2">
                      <span className="text-stone-600">Descripción</span>
                      <input
                        type="text"
                        value={newProjDesc}
                        onChange={(event) => setNewProjDesc(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Describe brevemente el proyecto"
                      />
                    </label>

                    <label className="space-y-1 md:col-span-2">
                      <span className="flex items-center gap-2 text-stone-600">
                        <FileCode className="h-4 w-4" />
                        Código React inicial
                      </span>
                      <textarea
                        value={newProjCode}
                        onChange={(event) => setNewProjCode(event.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 font-mono text-[12px] outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Pega aquí el código base del proyecto..."
                      />
                    </label>
                  </div>

                  <div className="flex gap-2.5 border-t border-stone-150 pt-4">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 cursor-pointer"
                    >
                      {editingProjectId ? "Guardar cambios" : "Registrar Proyecto"}
                    </button>
                    <button
                      type="button"
                      onClick={closeProjectModal}
                      className="rounded-xl border border-stone-200 px-4 py-3 font-bold text-stone-700 transition hover:bg-stone-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {previewProject &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
            <div className="flex h-[650px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950 px-6 py-4">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 animate-pulse text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Visualización Interactiva</h3>
                    <p className="text-[10px] font-medium text-stone-400">
                      Replicación en React • {previewProject.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="rounded-xl p-1.5 transition hover:bg-stone-800 cursor-pointer"
                >
                  <X className="h-5 w-5 text-stone-400" />
                </button>
              </div>

              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-stone-950 p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#27272a_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-65" />
                <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl border border-stone-800 bg-black shadow-inner">
                  <iframe
                    title="Design Project Sandbox"
                    srcDoc={getIframeSrcDoc(previewProject)}
                    sandbox="allow-scripts"
                    className="h-full w-full border-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-800 bg-stone-950 px-6 py-4 text-xs">
                <span className="font-mono font-semibold text-stone-400">
                  Figma Node Reference: {previewProject.figmaNode}
                </span>
                <button
                  onClick={() => {
                    if (previewProject.componentCode) {
                      onLoadCodeToWorkspace(previewProject.componentCode, previewProject.name);
                      setPreviewProject(null);
                    }
                  }}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow transition hover:bg-indigo-500 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Cargar en Editor de IA
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
