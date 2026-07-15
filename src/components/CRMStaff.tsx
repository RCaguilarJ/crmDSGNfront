import React, { useMemo, useState } from "react";
import {
  Briefcase,
  Eye,
  Pencil,
  Plus,
  Trash2,
  X,
  Ban,
  CheckCircle2
} from "lucide-react";
import { useServerCollection } from "../lib/useServerCollection";

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  area: "Desarrollo" | "Páginas web" | "Diseño" | "Ventas" | "Contabilidad";
  email: string;
  phone: string;
  memberType: "Interno" | "Externo" | "Freelance";
  status: "Activo" | "Inactivo";
  projectsCount: number;
  tasksCount: number;
  avatarColor: string;
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "staff_1",
    name: "Carlos Mendoza",
    position: "Gerente de Desarrollo",
    area: "Desarrollo",
    email: "c.mendoza@desings.mx",
    phone: "+52 664 100 2233",
    memberType: "Interno",
    status: "Activo",
    projectsCount: 4,
    tasksCount: 8,
    avatarColor: "bg-[#f59e0b]"
  },
  {
    id: "staff_2",
    name: "Sofía Rodríguez",
    position: "Gerente de Páginas Web",
    area: "Páginas web",
    email: "s.rodriguez@desings.mx",
    phone: "+52 33 200 4455",
    memberType: "Interno",
    status: "Activo",
    projectsCount: 3,
    tasksCount: 6,
    avatarColor: "bg-[#f59e0b]"
  },
  {
    id: "staff_3",
    name: "Marco Herrera",
    position: "Desarrollador Full-Stack Sr.",
    area: "Desarrollo",
    email: "m.herrera@desings.mx",
    phone: "+52 81 300 6677",
    memberType: "Interno",
    status: "Activo",
    projectsCount: 5,
    tasksCount: 11,
    avatarColor: "bg-[#06b6d4]"
  },
  {
    id: "staff_4",
    name: "Valeria Castro",
    position: "Diseñadora UI/UX",
    area: "Diseño",
    email: "v.castro@desings.mx",
    phone: "+52 55 400 8899",
    memberType: "Interno",
    status: "Activo",
    projectsCount: 3,
    tasksCount: 7,
    avatarColor: "bg-[#ec4899]"
  },
  {
    id: "staff_5",
    name: "Luis Pérez",
    position: "Maquetador Web",
    area: "Páginas web",
    email: "l.perez@desings.mx",
    phone: "+52 442 500 1122",
    memberType: "Interno",
    status: "Activo",
    projectsCount: 4,
    tasksCount: 9,
    avatarColor: "bg-[#ef4444]"
  },
  {
    id: "staff_6",
    name: "Ana González",
    position: "Desarrolladora Backend",
    area: "Desarrollo",
    email: "a.gonzalez@desings.mx",
    phone: "+52 664 600 3344",
    memberType: "Interno",
    status: "Activo",
    projectsCount: 3,
    tasksCount: 5,
    avatarColor: "bg-[#10b981]"
  },
  {
    id: "staff_7",
    name: "Daniela Fuentes",
    position: "Ejecutiva de Ventas",
    area: "Ventas",
    email: "d.fuentes@desings.mx",
    phone: "+52 33 700 5566",
    memberType: "Interno",
    status: "Activo",
    projectsCount: 0,
    tasksCount: 4,
    avatarColor: "bg-[#ef4444]"
  },
  {
    id: "staff_8",
    name: "Jorge Ramírez",
    position: "Contador General",
    area: "Contabilidad",
    email: "j.ramirez@desings.mx",
    phone: "+52 55 800 7788",
    memberType: "Externo",
    status: "Activo",
    projectsCount: 0,
    tasksCount: 3,
    avatarColor: "bg-[#8b5cf6]"
  },
  {
    id: "staff_9",
    name: "Tomás Ávila",
    position: "Dev Front-end Freelance",
    area: "Desarrollo",
    email: "t.avila@freelance.mx",
    phone: "+52 664 900 9900",
    memberType: "Freelance",
    status: "Inactivo",
    projectsCount: 1,
    tasksCount: 2,
    avatarColor: "bg-[#fca5a5]"
  }
];

const avatarPalette = [
  "bg-[#f59e0b]",
  "bg-[#06b6d4]",
  "bg-[#ec4899]",
  "bg-[#ef4444]",
  "bg-[#10b981]",
  "bg-[#8b5cf6]"
];

const areaBadgeMap: Record<StaffMember["area"], string> = {
  Desarrollo: "border-blue-200 bg-blue-50 text-blue-700",
  "Páginas web": "border-blue-200 bg-blue-50 text-blue-700",
  Diseño: "border-blue-200 bg-blue-50 text-blue-700",
  Ventas: "border-slate-200 bg-slate-100 text-slate-600",
  Contabilidad: "border-slate-200 bg-slate-100 text-slate-600"
};

const typeBadgeMap: Record<StaffMember["memberType"], string> = {
  Interno: "border-blue-200 bg-blue-50 text-blue-700",
  Externo: "border-slate-200 bg-slate-100 text-slate-600",
  Freelance: "border-violet-200 bg-violet-50 text-violet-600"
};

const statusBadgeMap: Record<StaffMember["status"], string> = {
  Activo: "border-emerald-200 bg-emerald-50 text-emerald-600",
  Inactivo: "border-slate-200 bg-slate-100 text-slate-400"
};

const normalizeText = (value: string) => {
  if (!/[ÃÂ]/.test(value)) return value;
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
};

const getInitials = (name: string) =>
  normalizeText(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const mapLegacyDepartment = (value?: string): StaffMember["area"] => {
  const normalized = normalizeText(value || "");

  if (normalized === "Administración") return "Contabilidad";
  if (normalized === "Marketing") return "Páginas web";
  if (normalized === "Diseño") return "Diseño";
  if (normalized === "Desarrollo") return "Desarrollo";

  return "Desarrollo";
};

const mapLegacyStatus = (value?: string): StaffMember["status"] => {
  if (value === "OnLeave") return "Inactivo";
  return "Activo";
};

const normalizeStoredStaff = (value: unknown): StaffMember[] => {
  if (!Array.isArray(value)) return DEFAULT_STAFF;

  return value.map((item, index) => {
    const candidate = item as Partial<StaffMember> & {
      role?: string;
      department?: string;
      activeProjects?: number;
      status?: string;
      type?: string;
      projects?: number;
      tasks?: number;
    };

    return {
      id: candidate.id || `staff_${Date.now()}_${index}`,
      name: normalizeText(candidate.name || "Sin nombre"),
      position: normalizeText(candidate.position || candidate.role || "Sin puesto"),
      area: candidate.area || mapLegacyDepartment(candidate.department),
      email: normalizeText(candidate.email || "correo@desings.mx"),
      phone: normalizeText(candidate.phone || "+52 -- --- ----"),
      memberType:
        candidate.memberType === "Externo" || candidate.memberType === "Freelance" || candidate.memberType === "Interno"
          ? candidate.memberType
          : "Interno",
      status: candidate.status === "Inactivo" || candidate.status === "Activo" ? candidate.status : mapLegacyStatus(candidate.status),
      projectsCount: candidate.projectsCount ?? candidate.projects ?? candidate.activeProjects ?? 0,
      tasksCount: candidate.tasksCount ?? candidate.tasks ?? Math.max((candidate.activeProjects ?? 0) * 2, 0),
      avatarColor: candidate.avatarColor || avatarPalette[index % avatarPalette.length]
    };
  });
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5";

export default function CRMStaff() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newArea, setNewArea] = useState<StaffMember["area"]>("Desarrollo");
  const [newMemberType, setNewMemberType] = useState<StaffMember["memberType"]>("Interno");
  const [newStatus, setNewStatus] = useState<StaffMember["status"]>("Activo");

  const [staff, setStaff] = useServerCollection<StaffMember>("staff", "crm_staff", normalizeStoredStaff(DEFAULT_STAFF));

  const featuredMembers = staff.slice(0, 4);

  const saveStaff = (updated: StaffMember[]) => {
    setStaff(updated);
  };

  const resetForm = () => {
    setNewName("");
    setNewPosition("");
    setNewEmail("");
    setNewPhone("");
    setNewArea("Desarrollo");
    setNewMemberType("Interno");
    setNewStatus("Activo");
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPosition.trim()) return;

    const newMember: StaffMember = {
      id: `staff_${Date.now()}`,
      name: newName.trim(),
      position: newPosition.trim(),
      area: newArea,
      email: newEmail.trim() || "correo@desings.mx",
      phone: newPhone.trim() || "+52 -- --- ----",
      memberType: newMemberType,
      status: newStatus,
      projectsCount: 0,
      tasksCount: 0,
      avatarColor: avatarPalette[staff.length % avatarPalette.length]
    };

    saveStaff([newMember, ...staff]);
    resetForm();
    setShowAddModal(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (!confirm("¿Deseas eliminar a este miembro del personal?")) return;
    saveStaff(staff.filter((member) => member.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    saveStaff(
      staff.map((member) =>
        member.id === id
          ? { ...member, status: member.status === "Activo" ? "Inactivo" : "Activo" }
          : member
      )
    );
  };

  const totals = useMemo(
    () => ({
      active: staff.filter((member) => member.status === "Activo").length,
      projects: staff.reduce((sum, member) => sum + member.projectsCount, 0),
      tasks: staff.reduce((sum, member) => sum + member.tasksCount, 0)
    }),
    [staff]
  );

  return (
    <div className="space-y-4 animate-fade-in text-left font-sans">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {featuredMembers.map((member) => (
          <article
            key={member.id}
            className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white ${member.avatarColor}`}
              >
                {getInitials(member.name)}
              </div>
              <h3 className="text-[28px] font-black tracking-tight text-slate-900 md:text-[20px]">
                {normalizeText(member.name)}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{normalizeText(member.position)}</p>
              <span
                className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${areaBadgeMap[member.area]}`}
              >
                {member.area}
              </span>

              <div className="mt-5 flex items-center">
                <div className="px-5 text-center">
                  <div className="text-[30px] font-black leading-none text-slate-900 md:text-[24px]">
                    {member.projectsCount}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-400">Proyectos</div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="px-5 text-center">
                  <div className="text-[30px] font-black leading-none text-slate-900 md:text-[24px]">
                    {member.tasksCount}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-400">Tareas</div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1d4ed8]"
        >
          <Plus className="h-4 w-4" />
          Nuevo miembro
        </button>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 bg-white">
              <tr className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
                <th className="px-4 py-4">Nombre</th>
                <th className="px-4 py-4">Puesto</th>
                <th className="px-4 py-4">Área</th>
                <th className="px-4 py-4">Correo</th>
                <th className="px-4 py-4">Teléfono</th>
                <th className="px-4 py-4">Tipo</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4 text-center">Proyectos</th>
                <th className="px-4 py-4 text-center">Tareas</th>
                <th className="px-4 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member, index) => (
                <tr
                  key={member.id}
                  className={`border-b border-slate-100 text-sm text-slate-700 last:border-b-0 ${
                    member.status === "Inactivo" ? "bg-slate-50/60 text-slate-400" : "bg-white"
                  } ${index % 2 === 0 ? "" : "bg-slate-50/20"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${member.avatarColor}`}
                      >
                        {getInitials(member.name)}
                      </div>
                      <span className="font-semibold text-slate-900">{normalizeText(member.name)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-500">{normalizeText(member.position)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${areaBadgeMap[member.area]}`}>
                      {member.area}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-500">{normalizeText(member.email)}</td>
                  <td className="px-4 py-3 font-medium text-slate-500">{normalizeText(member.phone)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadgeMap[member.memberType]}`}>
                      {member.memberType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeMap[member.status]}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{member.projectsCount}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{member.tasksCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        className="text-blue-500 transition-colors hover:text-blue-600"
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-slate-400 transition-colors hover:text-slate-600"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id)}
                        className={`transition-colors ${
                          member.status === "Activo"
                            ? "text-amber-400 hover:text-amber-500"
                            : "text-emerald-400 hover:text-emerald-500"
                        }`}
                        title={member.status === "Activo" ? "Desactivar" : "Activar"}
                      >
                        {member.status === "Activo" ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-rose-400 transition-colors hover:text-rose-500"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[450px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-[22px] font-black tracking-tight text-slate-900">Nuevo miembro</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre Apellido"
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Puesto
                  </label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Ej. Desarrollador Full-Stack"
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="correo@desings.mx"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+52 ..."
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Área
                  </label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value as StaffMember["area"])}
                    className={inputClassName}
                  >
                    <option value="Desarrollo">Desarrollo</option>
                    <option value="Páginas web">Páginas web</option>
                    <option value="Diseño">Diseño</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Contabilidad">Contabilidad</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Tipo
                  </label>
                  <select
                    value={newMemberType}
                    onChange={(e) => setNewMemberType(e.target.value as StaffMember["memberType"])}
                    className={inputClassName}
                  >
                    <option value="Interno">Interno</option>
                    <option value="Externo">Externo</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Estado
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StaffMember["status"])}
                    className={inputClassName}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
