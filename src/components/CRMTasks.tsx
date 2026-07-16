import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Layers,
  Pencil,
  Plus,
  Tag,
  Trash2,
  TriangleAlert,
  User,
  UserRound,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface Task {
  id: string;
  title: string;
  description: string;
  column: "Backlog" | "Diseño" | "Desarrollo" | "QA" | "Entregado";
  priority: "Baja" | "Media" | "Alta";
  projectName: string;
  assignee: string;
}

interface CRMTasksProps {
  tasks: Task[];
  projects: Array<{ name: string }>;
  onAddTask: (task: Omit<Task, "id">) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, changes: Partial<Task>) => void;
  onUpdateTaskColumn: (id: string, column: Task["column"]) => void;
}

type TaskStatusFilter = "Todas" | "Pendiente" | "En proceso" | "Urgente" | "Completada";
type TaskCategoryFilter = "Todos" | "Desarrollo" | "Páginas web" | "Administrativo";
type TaskVisualStatus = Exclude<TaskStatusFilter, "Todas">;
type TaskVisualCategory = Exclude<TaskCategoryFilter, "Todos">;
type FormStatus = Exclude<TaskStatusFilter, "Todas">;

const STATUS_FILTERS: TaskStatusFilter[] = ["Todas", "Pendiente", "En proceso", "Urgente", "Completada"];
const CATEGORY_FILTERS: TaskCategoryFilter[] = ["Todos", "Desarrollo", "Páginas web", "Administrativo"];
const FORM_STATUSES: FormStatus[] = ["Pendiente", "En proceso", "Urgente", "Completada"];

const priorityColors: Record<Task["priority"], string> = {
  Alta: "border-amber-200 bg-amber-50 text-amber-700",
  Media: "border-blue-200 bg-blue-50 text-blue-700",
  Baja: "border-slate-200 bg-slate-100 text-slate-500"
};

const statusBadgeColors: Record<TaskVisualStatus, string> = {
  Pendiente: "border-amber-200 bg-amber-50 text-amber-700",
  "En proceso": "border-orange-200 bg-orange-50 text-orange-700",
  Urgente: "border-rose-200 bg-rose-50 text-rose-600",
  Completada: "border-emerald-200 bg-emerald-50 text-emerald-600"
};

const normalizeText = (value: string) => {
  if (!/[ÃÂ]/.test(value)) return value;
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
};

const getTaskSearchText = (task: Task) =>
  `${normalizeText(task.title)} ${normalizeText(task.description)} ${normalizeText(task.projectName)} ${normalizeText(task.assignee)}`.toLowerCase();

const getTaskStatus = (task: Task): TaskVisualStatus => {
  const text = getTaskSearchText(task);

  if (task.column === "Entregado") {
    return "Completada";
  }

  if (/cobro|dominio|hosting|pago|vencid|renovar|urgente/.test(text)) {
    return "Urgente";
  }

  if (task.column === "Backlog") {
    return "Pendiente";
  }

  return "En proceso";
};

const getTaskCategory = (task: Task): TaskVisualCategory => {
  const text = getTaskSearchText(task);

  if (/hosting|dominio|cobro|pago|propuesta|administrativ/.test(text)) {
    return "Administrativo";
  }

  if (/landing|portal|web|sitio|seo|header|wireframe|tipograf/.test(text)) {
    return "Páginas web";
  }

  return "Desarrollo";
};

const getTaskDueDate = (task: Task) => {
  const status = getTaskStatus(task);

  if (status === "Urgente") {
    return "Hoy";
  }

  if (status === "Completada") {
    return "Finalizada";
  }

  return "Sin definir";
};

const mapFormStatusToColumn = (status: FormStatus): Task["column"] => {
  switch (status) {
    case "Pendiente":
      return "Backlog";
    case "En proceso":
      return "Desarrollo";
    case "Urgente":
      return "QA";
    case "Completada":
      return "Entregado";
  }
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5";

export default function CRMTasks({
  tasks,
  projects,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onUpdateTaskColumn
}: CRMTasksProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColumn, setNewColumn] = useState<Task["column"]>("Backlog");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Media");
  const [newProjName, setNewProjName] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategoryFilter>("Desarrollo");
  const [newStatus, setNewStatus] = useState<FormStatus>("Pendiente");
  const [newDueDate, setNewDueDate] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<TaskStatusFilter>("Todas");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<TaskCategoryFilter>("Todos");

  const assigneeOptions = useMemo(() => {
    const values = new Set<string>(["Carlos Mendoza", "Ana Silva", "Luis Pérez", "Valeria Castro"]);
    tasks.forEach((task) => values.add(normalizeText(task.assignee)));
    return Array.from(values);
  }, [tasks]);

  const resetForm = () => {
    setNewTitle("");
    setNewDesc("");
    setNewColumn("Backlog");
    setNewPriority("Media");
    setNewProjName("");
    setNewAssignee("Carlos Mendoza");
    setNewCategory("Desarrollo");
    setNewStatus("Pendiente");
    setNewDueDate("");
  };

  const openForm = () => {
    resetForm();
    setEditingTaskId(null);
    setShowAddForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTitle(normalizeText(task.title));
    setNewDesc(normalizeText(task.description));
    setNewColumn(task.column);
    setNewPriority(task.priority);
    setNewProjName(normalizeText(task.projectName));
    setNewAssignee(normalizeText(task.assignee));
    setNewCategory(getTaskCategory(task));
    setNewStatus(getTaskStatus(task));
    setNewDueDate("");
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Por favor escribe el título de la tarea.");
      return;
    }

    const mappedColumn = mapFormStatusToColumn(newStatus);
    const categoryHint =
      newCategory !== "Desarrollo" && !newDesc.toLowerCase().includes(newCategory.toLowerCase())
        ? `${newDesc.trim()} ${newDesc.trim() ? "· " : ""}${newCategory}`.trim()
        : newDesc;

    const changes = { title: newTitle.trim(), description: categoryHint, column: mappedColumn, priority: newPriority, projectName: newProjName || "-", assignee: newAssignee || "Carlos Mendoza" };
    if (editingTaskId) onUpdateTask(editingTaskId, changes);
    else onAddTask(changes);

    closeForm();
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = activeStatusFilter === "Todas" || getTaskStatus(task) === activeStatusFilter;
    const matchesCategory = activeCategoryFilter === "Todos" || getTaskCategory(task) === activeCategoryFilter;
    return matchesStatus && matchesCategory;
  });

  const totalTasks = tasks.length;
  const urgentTasks = tasks.filter((task) => getTaskStatus(task) === "Urgente").length;
  const inProgressTasks = tasks.filter((task) => getTaskStatus(task) === "En proceso").length;
  const completedTasks = tasks.filter((task) => getTaskStatus(task) === "Completada").length;

  void onUpdateTaskColumn;
  void newColumn;
  void newDueDate;

  if (showAddForm) {
    return (
      <div className="space-y-6 animate-fade-in text-left font-sans">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <span>/</span>
             <span className="text-slate-900">{editingTaskId ? "Editar tarea" : "Nueva tarea"}</span>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="task-create-form"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <ClipboardCheck className="h-4 w-4" />
               {editingTaskId ? "Guardar cambios" : "Crear tarea"}
            </button>
          </div>
        </div>

        <form
          id="task-create-form"
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-[590px] flex-col gap-4"
        >
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              Información de la tarea
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Título *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Describe brevemente qué hay que hacer..."
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Descripción detallada
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Pasos a seguir, contexto, recursos necesarios, criterios de aceptación..."
                  rows={4}
                  className={`${inputClassName} min-h-28 resize-none`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
              <UserRound className="h-4 w-4 text-violet-500" />
              Asignación
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Responsable
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className={inputClassName}
                >
                  {assigneeOptions.map((assignee) => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Módulo / área
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TaskCategoryFilter)}
                  className={inputClassName}
                >
                  {CATEGORY_FILTERS.filter((item) => item !== "Todos").map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Proyecto relacionado
                </label>
                <select
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className={inputClassName}
                >
                  <option value="">-</option>
                  {projects.map((project) => (
                    <option key={project.name} value={normalizeText(project.name)}>
                      {normalizeText(project.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-base font-black text-slate-900">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Planificación
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Prioridad
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Task["priority"])}
                  className={inputClassName}
                >
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as FormStatus)}
                  className={inputClassName}
                >
                  {FORM_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-500">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <ClipboardCheck className="h-4 w-4" />
               {editingTaskId ? "Guardar cambios" : "Crear tarea"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-left font-sans">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Total tareas</p>
          <p className="mt-1 text-[2rem] font-black leading-none text-blue-600">{totalTasks}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Urgentes</p>
          <p className="mt-1 text-[2rem] font-black leading-none text-rose-500">{urgentTasks}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">En proceso</p>
          <p className="mt-1 text-[2rem] font-black leading-none text-amber-500">{inProgressTasks}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Completadas</p>
          <p className="mt-1 text-[2rem] font-black leading-none text-emerald-500">{completedTasks}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = activeStatusFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveStatusFilter(filter)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((filter) => {
              const isActive = activeCategoryFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveCategoryFilter(filter)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={openForm}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva tarea
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm font-semibold text-slate-400 shadow-sm"
            >
              Sin tareas con estos filtros
            </motion.div>
          ) : (
            filteredTasks.map((task) => {
              const taskStatus = getTaskStatus(task);
              const taskCategory = getTaskCategory(task);
              const isCompleted = taskStatus === "Completada";
              const isUrgent = taskStatus === "Urgente";

              return (
                <motion.article
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className={`rounded-2xl border bg-white px-4 py-3 shadow-sm ${
                    isCompleted
                      ? "border-emerald-200"
                      : isUrgent
                        ? "border-rose-200"
                        : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-500"
                          : isUrgent
                            ? "bg-rose-50 text-rose-500"
                            : "border border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {isUrgent ? (
                        <TriangleAlert className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <h3
                            className={`text-lg font-black tracking-tight text-slate-900 ${
                              isCompleted ? "text-slate-400 line-through" : ""
                            }`}
                          >
                            {normalizeText(task.title)}
                          </h3>
                          <p
                            className={`mt-1 text-sm font-medium text-slate-500 ${
                              isCompleted ? "text-slate-400 line-through" : ""
                            }`}
                          >
                            {normalizeText(task.description)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {normalizeText(task.assignee)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5" />
                              {normalizeText(task.projectName)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              Límite: {getTaskDueDate(task)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5" />
                              {taskCategory}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeColors[taskStatus]}`}>
                            {taskStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditForm(task)}
                            className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })
          )}
        </AnimatePresence>
      </div>
{/*  */}    </div>
  );
}
