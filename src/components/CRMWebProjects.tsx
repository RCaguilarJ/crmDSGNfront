import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FolderGit, Globe, Plus, Trash2, X } from "lucide-react";

export interface WebProject {
  id: string;
  name: string;
  clientName: string;
  manager: string;
  designer: string;
  builder: string;
  startDate: string;
  dueDate: string;
  progress: number;
  status: "Diseño inicial" | "Carga de contenido" | "Revisión cliente" | "Publicado" | "Maquetación";
  priority: "Alta" | "Media" | "Baja";
  description?: string;
}

interface CRMWebProjectsProps {
  projects: WebProject[];
  clients: Array<{ companyName: string }>;
  onAddProject: (project: Omit<WebProject, "id">) => void | Promise<void>;
  onDeleteProject: (id: string) => void | Promise<void>;
  onEditProject: (id: string, project: Omit<WebProject, "id">) => void | Promise<void>;
  onUpdateProjectStatus: (id: string, status: WebProject["status"]) => void | Promise<void>;
  onUpdateProjectProgress: (id: string, progress: number) => void | Promise<void>;
}

const statusOptions = [
  "Diseño inicial",
  "Carga de contenido",
  "Revisión cliente",
  "Publicado",
  "Maquetación",
] as const;

const priorityStyles: Record<WebProject["priority"], string> = {
  Alta: "border-[#f7d48b] bg-[#fff8e8] text-[#d48b00]",
  Media: "border-[#bfd3ff] bg-[#f1f6ff] text-[#3b6ff6]",
  Baja: "border-[#d8e0ea] bg-[#f5f7fa] text-[#7c8ba1]",
};

export default function CRMWebProjects({
  projects,
  clients,
  onAddProject,
  onDeleteProject,
  onEditProject,
  onUpdateProjectStatus,
  onUpdateProjectProgress,
}: CRMWebProjectsProps) {
  const [filterStatus, setFilterStatus] = useState<"All" | WebProject["status"]>("All");
  const [showModal, setShowModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [manager, setManager] = useState("");
  const [designer, setDesigner] = useState("");
  const [builder, setBuilder] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<WebProject["status"]>("Diseño inicial");
  const [priority, setPriority] = useState<WebProject["priority"]>("Media");
  const [description, setDescription] = useState("");

  const filteredProjects = projects.filter((project) => {
    return filterStatus === "All" || project.status === filterStatus;
  });

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((project) => project.status === "Publicado").length;

  const resetForm = () => {
    setProjectName("");
    setClientName("");
    setManager("");
    setDesigner("");
    setBuilder("");
    setStartDate("");
    setDueDate("");
    setProgress(0);
    setStatus("Diseño inicial");
    setPriority("Media");
    setDescription("");
    setEditingProjectId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const openEditModal = (project: WebProject) => {
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setClientName(project.clientName);
    setManager(project.manager);
    setDesigner(project.designer);
    setBuilder(project.builder);
    setStartDate(project.startDate);
    setDueDate(project.dueDate);
    setProgress(project.progress);
    setStatus(project.status);
    setPriority(project.priority);
    setDescription(project.description || "");
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!projectName.trim() || !clientName || !manager.trim() || !designer.trim() || !builder.trim()) {
      alert("Completa los campos obligatorios del proyecto web.");
      return;
    }

    const payload: Omit<WebProject, "id"> = {
      name: projectName.trim(),
      clientName,
      manager: manager.trim(),
      designer: designer.trim(),
      builder: builder.trim(),
      startDate: startDate || new Date().toISOString().split("T")[0],
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      progress,
      status,
      priority,
      description: description.trim(),
    };

    if (editingProjectId) {
      await onEditProject(editingProjectId, payload);
    } else {
      await onAddProject(payload);
    }

    closeModal();
  };

  return (
    <div className="space-y-4 animate-fade-in text-left">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[198px_minmax(0,1fr)_minmax(0,1fr)_154px]">
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value as "All" | WebProject["status"])}
          className="h-[52px] rounded-2xl border border-slate-200 bg-white px-5 text-[12px] font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
        >
          <option value="All">Todos los estados</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="h-[52px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#96a5bf]">Total proyectos</div>
          <div className="mt-0.5 text-[16px] font-black leading-none text-[#2563eb]">{totalProjects}</div>
        </div>

        <div className="h-[52px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#96a5bf]">Publicados</div>
          <div className="mt-0.5 text-[16px] font-black leading-none text-[#00a86b]">{publishedProjects}</div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#2563eb] px-4 text-[13px] font-extrabold text-white shadow-[0_10px_18px_rgba(37,99,235,0.18)] transition hover:bg-[#1d4ed8] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo proyecto
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6d84a3]">
                <th className="px-4 py-4">Proyecto</th>
                <th className="px-4 py-4">Cliente</th>
                <th className="px-4 py-4">Gerente</th>
                <th className="px-4 py-4">Diseñador</th>
                <th className="px-4 py-4">Maquetador</th>
                <th className="px-4 py-4">Inicio</th>
                <th className="px-4 py-4">Entrega</th>
                <th className="px-4 py-4">Avance</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Prioridad</th>
                <th className="px-4 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="transition-colors hover:bg-[#fbfcff]">
                  <td className="px-4 py-4 text-[12px] font-bold text-[#1f2f46]">{project.name}</td>
                  <td className="px-4 py-4 text-[12px] font-medium text-[#667085]">{project.clientName}</td>
                  <td className="px-4 py-4 text-[12px] font-medium text-[#5b6b84]">{project.manager}</td>
                  <td className="px-4 py-4 text-[12px] font-medium text-[#5b6b84]">{project.designer}</td>
                  <td className="px-4 py-4 text-[12px] font-medium text-[#5b6b84]">{project.builder}</td>
                  <td className="px-4 py-4 font-mono text-[12px] text-[#5b6b84]">{project.startDate}</td>
                  <td className="px-4 py-4 font-mono text-[12px] text-[#5b6b84]">{project.dueDate}</td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-[160px] items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={project.progress}
                        onChange={(event) => onUpdateProjectProgress(project.id, Number(event.target.value))}
                        className="crm-progress w-[128px]"
                      />
                      <span className="w-9 text-[11px] font-bold text-[#475467]">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={project.status}
                      onChange={(event) => onUpdateProjectStatus(project.id, event.target.value as WebProject["status"])}
                      className="h-8 min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                    >
                      {statusOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${priorityStyles[project.priority]}`}
                    >
                      {project.priority}
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
                    <p className="text-sm font-bold text-slate-500">No hay proyectos web para mostrar.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/60 p-6 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-[#2563eb]" />
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900">
                      {editingProjectId ? "Editar Proyecto Web" : "Registrar Nuevo Proyecto Web"}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Completa la información operativa del proyecto y guarda los cambios.
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="rounded-lg p-2 hover:bg-stone-100 cursor-pointer">
                  <X className="h-4 w-4 text-stone-500" />
                </button>
              </div>

              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-stone-600">Nombre del proyecto</span>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                        placeholder="Sitio Web Clínica Médica"
                        required
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Cliente</span>
                      <select
                        value={clientName}
                        onChange={(event) => setClientName(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                        required
                      >
                        <option value="">Selecciona un cliente</option>
                        {clients.map((client) => (
                          <option key={client.companyName} value={client.companyName}>
                            {client.companyName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Gerente</span>
                      <input
                        type="text"
                        value={manager}
                        onChange={(event) => setManager(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                        placeholder="Sofía"
                        required
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Diseñador</span>
                      <input
                        type="text"
                        value={designer}
                        onChange={(event) => setDesigner(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                        placeholder="Valeria"
                        required
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Maquetador</span>
                      <input
                        type="text"
                        value={builder}
                        onChange={(event) => setBuilder(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                        placeholder="Luis"
                        required
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Estado</span>
                      <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value as WebProject["status"])}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      >
                        {statusOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Inicio</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Entrega</span>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-stone-600">Prioridad</span>
                      <select
                        value={priority}
                        onChange={(event) => setPriority(event.target.value as WebProject["priority"])}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      >
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
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
                          value={progress}
                          onChange={(event) => setProgress(Number(event.target.value))}
                          className="crm-progress w-full"
                        />
                        <div className="w-10 text-right text-sm font-bold text-stone-700">{progress}%</div>
                      </div>
                    </div>

                    <label className="space-y-1 md:col-span-2">
                      <span className="text-stone-600">Descripción</span>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 outline-none transition focus:border-[#2563eb] focus:bg-white"
                        placeholder="Detalles del alcance del proyecto web..."
                      />
                    </label>
                  </div>

                  <div className="flex gap-2.5 border-t border-stone-150 pt-4">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-[#2563eb] px-6 py-3 font-bold text-white transition hover:bg-[#1d4ed8] cursor-pointer"
                    >
                      {editingProjectId ? "Guardar cambios" : "Registrar Proyecto"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
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
    </div>
  );
}
