import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArchiveRestore,
  CheckCircle2,
  CircleX,
  Eye,
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { apiFetch } from "../lib/api";

type UserItem = {
  username: string;
  name: string;
  email: string;
  role: string;
  area: string;
  status: "Activo" | "Bloqueado";
  initials: string;
};
type Role = { name: string; color: string; owner: string };
type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  area: string;
  status: "Activo" | "Bloqueado";
};
type DeletedUser = UserItem & { id: number; deletedBy: string; deletedAt: string };

const roles: Role[] = [
  { name: "Admin General", color: "#2463eb", owner: "Adriana" },
  { name: "Administración", color: "#00b981", owner: "Jorge" },
  { name: "Gerente Dev", color: "#8557f5", owner: "Carlos" },
  { name: "Gerente Web", color: "#f59e0b", owner: "Sofía" },
];
const modules = ["Dashboard", "Clientes", "Prospectos", "Servicios", "Pagos", "Renovaciones", "Cotizaciones", "Proyectos Dev", "Proyectos Web", "Kanban", "Tareas", "Personal", "Credenciales", "Reportes", "Usuarios", "Configuración"];
const permission: Record<string, string[]> = {
  "Admin General": modules,
  Administración: ["Dashboard", "Clientes", "Prospectos", "Servicios", "Pagos", "Renovaciones", "Cotizaciones", "Kanban", "Tareas", "Reportes"],
  "Gerente Dev": ["Dashboard", "Clientes", "Cotizaciones", "Proyectos Dev", "Kanban", "Tareas", "Personal"],
  "Gerente Web": ["Dashboard", "Clientes", "Cotizaciones", "Proyectos Web", "Kanban", "Tareas", "Personal"],
};
const fallback: UserItem[] = [
  { username: "adriana", name: "Adriana García López", email: "adriana@designs.mx", role: "Admin General", area: "Dirección", status: "Activo", initials: "AG" },
  { username: "jorge", name: "Jorge Ramírez Acosta", email: "jorge@designs.mx", role: "Administración", area: "Administración", status: "Activo", initials: "JR" },
  { username: "carlos", name: "Carlos Mendoza Ruiz", email: "carlos@designs.mx", role: "Gerente Dev", area: "Desarrollo", status: "Activo", initials: "CM" },
  { username: "sofia", name: "Sofía Rodríguez Vega", email: "sofia@designs.mx", role: "Gerente Web", area: "Páginas web", status: "Activo", initials: "SR" },
];
const emptyForm: UserForm = { firstName: "", lastName: "", email: "", password: "", role: "Administración", area: "Administración", status: "Activo" };
const api = (url: string, init?: RequestInit) => apiFetch<any>(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts.shift() || "", lastName: parts.join(" ") };
}

export default function CRMUsers() {
  const [users, setUsers] = useState<UserItem[]>(fallback);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [viewing, setViewing] = useState<UserItem | null>(null);
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [trashOpen, setTrashOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await api("/api/users");
      setUsers(response.users);
    } catch (loadError) {
      setNotice(loadError instanceof Error ? loadError.message : "No se pudo cargar el directorio.");
    }
  };
  useEffect(() => { void Promise.all([load(), loadTrash()]); }, []);

  const counts = useMemo(() => Object.fromEntries(roles.map((role) => [role.name, users.filter((user) => user.role === role.name).length])), [users]);
  const setField = <K extends keyof UserForm>(field: K, value: UserForm[K]) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };
  const openEdit = (user: UserItem) => {
    setEditing(user);
    setForm({ ...emptyForm, ...splitName(user.name), email: user.email, role: user.role, area: user.area, status: user.status });
    setError("");
    setModal(true);
  };
  const openView = (user: UserItem) => setViewing(user);
  const closeModal = () => { if (!busy) setModal(false); };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy("save");
    const name = `${form.firstName} ${form.lastName}`.trim();
    try {
      if (editing) {
        const payload: Record<string, string> = { name, email: form.email.trim(), role: form.role, area: form.area, status: form.status };
        if (form.password) payload.password = form.password;
        await api(`/api/users/${encodeURIComponent(editing.username)}`, { method: "PUT", body: JSON.stringify(payload) });
        setNotice(`Los datos de ${name} se actualizaron correctamente.`);
      } else {
        const username = form.email.split("@")[0].trim().toLowerCase();
        await api("/api/users", { method: "POST", body: JSON.stringify({ ...form, username, name }) });
        setNotice(`Se creó el usuario ${name} correctamente.`);
      }
      setModal(false);
      setForm(emptyForm);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar los cambios.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (user: UserItem) => {
    if (user.username === "adriana") { setNotice("El administrador principal no se puede eliminar."); return; }
    if (!window.confirm(`¿Mover a ${user.name} a la papelera? Podrás restaurarlo después.`)) return;
    setBusy(`delete-${user.username}`);
    try {
      await api(`/api/users/${encodeURIComponent(user.username)}`, { method: "DELETE" });
      setNotice(`${user.name} fue movido a la papelera.`);
      await load();
      if (trashOpen) await loadTrash();
    } catch (removeError) {
      setNotice(removeError instanceof Error ? removeError.message : "No se pudo eliminar el usuario.");
    } finally { setBusy(null); }
  };

  const loadTrash = async () => {
    try {
      const response = await api("/api/users-trash");
      setDeletedUsers(response.users);
    } catch (trashError) {
      setNotice(trashError instanceof Error ? trashError.message : "No se pudo cargar la papelera.");
    }
  };
  const toggleTrash = async () => {
    const next = !trashOpen;
    setTrashOpen(next);
    if (next) await loadTrash();
  };
  const restore = async (user: DeletedUser) => {
    setBusy(`restore-${user.id}`);
    try {
      await api(`/api/users-trash/${user.id}/restore`, { method: "POST", body: "{}" });
      setNotice(`${user.name || user.username} fue restaurado correctamente.`);
      await Promise.all([load(), loadTrash()]);
    } catch (restoreError) {
      setNotice(restoreError instanceof Error ? restoreError.message : "No se pudo restaurar el usuario.");
    } finally { setBusy(null); }
  };

  const modalView = modal && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17233b]/65 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="user-modal-title" className="my-auto w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_rgba(15,23,42,.4)] animate-scale-up">
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{editing ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}</span>
            <div><h2 id="user-modal-title" className="text-base font-bold text-slate-900">{editing ? "Editar usuario" : "Crear nuevo usuario"}</h2><p className="mt-1 text-xs text-slate-500">{editing ? `Actualiza la información y los permisos de @${editing.username}.` : "Completa los datos para dar acceso al CRM."}</p></div>
          </div>
          <button type="button" onClick={closeModal} aria-label="Cerrar" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </header>
        <div className="max-h-[calc(100vh-190px)] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" required><input autoFocus required value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} placeholder="Ej. Mariana" className="user-input" /></Field>
            <Field label="Apellidos" required><input required value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} placeholder="Ej. López García" className="user-input" /></Field>
            <Field label="Correo electrónico" required hint={!editing && form.email.includes("@") ? `Usuario de acceso: ${form.email.split("@")[0].toLowerCase()}` : undefined}><input required type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="usuario@designs.mx" className="user-input" /></Field>
            <Field label={editing ? "Nueva contraseña" : "Contraseña"} required={!editing} hint={editing ? "Déjala vacía para conservar la actual." : "Mínimo 12 caracteres."}><div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required={!editing} minLength={form.password ? 12 : undefined} maxLength={128} type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} placeholder={editing ? "Sin cambios" : "Mínimo 12 caracteres"} className="user-input pl-9" /></div></Field>
          </div>
          <div className="my-5 border-t border-slate-100" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Rol"><select value={form.role} onChange={(e) => setField("role", e.target.value)} className="user-input">{roles.map((role) => <option key={role.name}>{role.name}</option>)}</select></Field>
            <Field label="Área"><select value={form.area} onChange={(e) => setField("area", e.target.value)} className="user-input"><option>Administración</option><option>Dirección</option><option>Desarrollo</option><option>Páginas web</option></select></Field>
            <Field label="Estado"><select value={form.status} onChange={(e) => setField("status", e.target.value as UserForm["status"])} className="user-input"><option value="Activo">Activo</option><option value="Bloqueado">Bloqueado</option></select></Field>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{error}</p>}
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeModal} disabled={busy === "save"} className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button disabled={busy === "save"} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2463eb] px-5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70">{busy === "save" && <LoaderCircle className="h-4 w-4 animate-spin" />}{editing ? "Guardar cambios" : "Crear usuario"}</button>
        </footer>
      </form>
    </div>, document.body,
  );

  const detailsView = viewing && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17233b]/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewing(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="user-details-title" className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_rgba(15,23,42,.4)]">
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{viewing.initials}</span><div><h2 id="user-details-title" className="text-base font-bold text-slate-900">{viewing.name}</h2><p className="mt-1 text-xs text-slate-500">@{viewing.username}</p></div></div><button type="button" onClick={() => setViewing(null)} aria-label="Cerrar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></header>
        <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2"><Detail label="Correo" value={viewing.email} /><Detail label="Rol" value={viewing.role} /><Detail label="Área" value={viewing.area} /><Detail label="Estado" value={viewing.status} /></div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4"><button type="button" onClick={() => setViewing(null)} className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600">Cerrar</button><button type="button" onClick={() => { const user = viewing; setViewing(null); openEdit(user); }} className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-bold text-white"><Pencil className="h-4 w-4" />Editar usuario</button></footer>
      </section>
    </div>, document.body,
  );

  return <div className="-mt-1 space-y-4 text-left text-[11px] animate-fade-in">
    {notice && <div role="status" className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-800"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Cerrar mensaje" className="rounded p-1 hover:bg-blue-100"><X className="h-4 w-4" /></button></div>}
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{roles.map((role) => <section key={role.name} className="h-[124px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"><div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ color: role.color, background: `${role.color}12` }}><Shield className="h-4 w-4" /></div><h2 className="mt-2 font-bold text-slate-900">{role.name}</h2><p className="mt-1 text-[#91a0bd]">{role.owner}</p><p className="mt-1 font-semibold" style={{ color: role.color }}>{counts[role.name] || 0} usuario{counts[role.name] === 1 ? "" : "s"}</p></section>)}</div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><header className="flex min-h-[60px] flex-wrap items-center justify-between gap-3 px-4 py-3"><div><h2 className="text-xs font-bold text-slate-900">Directorio de usuarios</h2><p className="mt-1 text-[10px] text-slate-400">Consulta, edita o mueve usuarios a la papelera.</p></div><div className="flex gap-2"><button onClick={() => void toggleTrash()} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50"><Trash2 className="h-3.5 w-3.5" />Papelera</button><button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-[#2463eb] px-4 py-2.5 font-bold text-white hover:bg-blue-700"><Plus className="h-3.5 w-3.5" />Nuevo usuario</button></div></header><div className="overflow-x-auto"><table className="w-full min-w-[980px]"><thead className="h-9 bg-[#f6f8fb] text-left text-[10px] uppercase text-[#58708f]"><tr>{["Usuario", "Correo", "Rol", "Área", "Estado", "Acciones"].map((heading) => <th className="px-3 font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{users.map((user) => { const role = roles.find((item) => item.name === user.role) || roles[0]; const rowBusy = busy?.endsWith(user.username); return <tr className="h-[54px] border-t border-slate-100 transition hover:bg-slate-50/60" key={user.username}><td className="px-3"><div className="flex items-center gap-2"><i className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] not-italic font-bold text-white" style={{ background: role.color }}>{user.initials}</i><div><b className="block text-slate-800">{user.name}</b><span className="text-[9px] text-slate-400">@{user.username}</span></div></div></td><td className="px-3 font-mono text-[#58708f]">{user.email}</td><td className="px-3"><span className="rounded-full px-2 py-1 font-semibold" style={{ color: role.color, background: `${role.color}12` }}>{user.role}</span></td><td className="px-3 text-[#58708f]">{user.area}</td><td className="px-3"><span className={`rounded-full border px-2 py-1 ${user.status === "Activo" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-600"}`}>{user.status}</span></td><td className="px-3"><div className="flex items-center gap-1"><ActionButton label={`Ver información de ${user.name}`} color="text-slate-600 hover:bg-slate-100" onClick={() => openView(user)} disabled={rowBusy}><Eye className="h-4 w-4" /></ActionButton><ActionButton label={`Editar a ${user.name}`} color="text-blue-600 hover:bg-blue-50" onClick={() => openEdit(user)} disabled={rowBusy}><Pencil className="h-4 w-4" /></ActionButton><ActionButton label={`Eliminar a ${user.name}`} color="text-rose-600 hover:bg-rose-50" onClick={() => void remove(user)} disabled={rowBusy}>{busy === `delete-${user.username}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</ActionButton></div></td></tr>; })}</tbody></table></div></section>
    {trashOpen && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><header className="flex items-center justify-between px-4 py-3"><div><h2 className="text-xs font-bold text-slate-900">Papelera de usuarios</h2><p className="mt-1 text-[10px] text-slate-400">Los registros eliminados se conservan para poder recuperarlos.</p></div><button onClick={() => setTrashOpen(false)} aria-label="Cerrar papelera" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></header><div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead className="h-9 bg-slate-50 text-left text-[10px] uppercase text-slate-500"><tr><th className="px-4">Usuario</th><th className="px-4">Correo</th><th className="px-4">Eliminado por</th><th className="px-4">Fecha</th><th className="px-4">Acción</th></tr></thead><tbody>{deletedUsers.length ? deletedUsers.map((user) => <tr key={user.id} className="border-t border-slate-100"><td className="px-4 py-3"><b>{user.name || user.username}</b><span className="ml-2 text-slate-400">@{user.username}</span></td><td className="px-4 text-slate-500">{user.email}</td><td className="px-4 text-slate-500">@{user.deletedBy}</td><td className="px-4 text-slate-500">{new Date(user.deletedAt).toLocaleString("es-MX")}</td><td className="px-4"><button onClick={() => void restore(user)} disabled={busy === `restore-${user.id}`} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">{busy === `restore-${user.id}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArchiveRestore className="h-4 w-4" />}Restaurar</button></td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">La papelera está vacía.</td></tr>}</tbody></table></div></section>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><h2 className="h-10 px-4 pt-3 text-xs font-bold">Matriz de permisos por rol</h2><div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="h-9 bg-[#f6f8fb] text-left text-[10px] uppercase text-[#58708f]"><tr><th className="px-4">Módulo</th>{roles.map((role) => <th key={role.name} className="text-center normal-case" style={{ color: role.color }}>{role.name}</th>)}</tr></thead><tbody>{modules.map((module) => <tr key={module} className="h-[34px] border-t border-slate-100"><td className="px-4 font-semibold">{module}</td>{roles.map((role) => <td key={role.name} className="text-center">{permission[role.name].includes(module) ? <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-emerald-500" /> : <CircleX className="mx-auto h-3.5 w-3.5 text-slate-200" />}</td>)}</tr>)}</tbody></table></div></section>
    {modalView}
    {detailsView}
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span><strong className="mt-1.5 block text-xs text-slate-800">{value || "Sin información"}</strong></div>;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#58708f]">{label}{required && <span className="ml-1 text-rose-500">*</span>}</span>{children}{hint && <span className="mt-1.5 block text-[10px] text-slate-400">{hint}</span>}</label>;
}

function ActionButton({ label, color, onClick, disabled, children }: { label: string; color: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className={`rounded-lg p-2 transition disabled:cursor-wait disabled:opacity-40 ${color}`}>{children}</button>;
}
