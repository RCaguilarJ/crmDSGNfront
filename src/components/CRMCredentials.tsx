import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X
} from "lucide-react";
import { useServerCollection } from "../lib/useServerCollection";

export interface CredentialItem {
  id: string;
  clientName: string;
  projectName: string;
  type: "Hosting" | "CMS" | "SSH/VPS" | "Sistema";
  url: string;
  username: string;
  passwordText: string;
  updatedAt: string;
  responsible: string;
  status: "Activo" | "Inactivo";
}

type CredentialFormState = {
  clientName: string;
  projectName: string;
  type: CredentialItem["type"];
  url: string;
  username: string;
  passwordText: string;
  responsible: string;
  status: CredentialItem["status"];
};

// Credentials must only come from the authenticated backend; never ship secrets
// as fallback data in the public JavaScript bundle.
const DEFAULT_CREDENTIALS: CredentialItem[] = [];

const defaultFormState: CredentialFormState = {
  clientName: "",
  projectName: "",
  type: "Hosting",
  url: "",
  username: "",
  passwordText: "",
  responsible: "Carlos",
  status: "Activo"
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5";

const typeBadgeMap: Record<CredentialItem["type"], string> = {
  Hosting: "border-slate-200 bg-slate-100 text-slate-600",
  CMS: "border-slate-200 bg-slate-100 text-slate-600",
  "SSH/VPS": "border-slate-200 bg-slate-100 text-slate-600",
  Sistema: "border-slate-200 bg-slate-100 text-slate-600"
};

const statusBadgeMap: Record<CredentialItem["status"], string> = {
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

const maskPassword = (password: string) => "•".repeat(Math.max(password.length, 10));

export default function CRMCredentials() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<CredentialFormState>(defaultFormState);
  const [editForm, setEditForm] = useState<CredentialFormState>(defaultFormState);

  const [credentials, setCredentials] = useServerCollection<CredentialItem>("credentials", "crm_credentials", DEFAULT_CREDENTIALS);

  const clientOptions = useMemo(
    () =>
      Array.from(
        new Set([
          "Constructora Murillo",
          "Farmacia San Pablo del Norte",
          "Grupo Inmobiliario Arenas",
          "Hotel Boutique Riviera",
          "Clínica Médica del Valle",
          ...credentials.map((credential) => normalizeText(credential.clientName))
        ])
      ),
    [credentials]
  );

  const responsibleOptions = useMemo(
    () =>
      Array.from(
        new Set(["Carlos", "Sofía", "Marco", "Luis", ...credentials.map((credential) => normalizeText(credential.responsible))])
      ),
    [credentials]
  );

  const currentEditingCredential = editingCredentialId
    ? credentials.find((credential) => credential.id === editingCredentialId) || null
    : null;

  const saveCredentials = (updated: CredentialItem[]) => {
    setCredentials(updated);
  };

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopiedId(null);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteCredential = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta credencial?")) return;
    saveCredentials(credentials.filter((credential) => credential.id !== id));
  };

  const handleOpenAddModal = () => {
    setAddForm({
      ...defaultFormState,
      clientName: "",
      responsible: responsibleOptions[0] || "Carlos"
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (credential: CredentialItem) => {
    setEditForm({
      clientName: normalizeText(credential.clientName),
      projectName: normalizeText(credential.projectName),
      type: credential.type,
      url: normalizeText(credential.url),
      username: normalizeText(credential.username),
      passwordText: normalizeText(credential.passwordText),
      responsible: normalizeText(credential.responsible),
      status: credential.status
    });
    setEditingCredentialId(credential.id);
  };

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.clientName.trim() || !addForm.projectName.trim() || !addForm.username.trim() || !addForm.passwordText.trim()) return;

    const nextCredential: CredentialItem = {
      id: `cred_${Date.now()}`,
      clientName: addForm.clientName.trim(),
      projectName: addForm.projectName.trim(),
      type: addForm.type,
      url: addForm.url.trim(),
      username: addForm.username.trim(),
      passwordText: addForm.passwordText.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
      responsible: addForm.responsible,
      status: addForm.status
    };

    saveCredentials([nextCredential, ...credentials]);
    setShowAddModal(false);
    setAddForm(defaultFormState);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCredentialId) return;
    if (!editForm.clientName.trim() || !editForm.projectName.trim() || !editForm.username.trim() || !editForm.passwordText.trim()) return;

    saveCredentials(
      credentials.map((credential) =>
        credential.id === editingCredentialId
          ? {
              ...credential,
              clientName: editForm.clientName.trim(),
              projectName: editForm.projectName.trim(),
              type: editForm.type,
              url: editForm.url.trim(),
              username: editForm.username.trim(),
              passwordText: editForm.passwordText.trim(),
              responsible: editForm.responsible,
              status: editForm.status,
              updatedAt: new Date().toISOString().slice(0, 10)
            }
          : credential
      )
    );

    setEditingCredentialId(null);
    setEditForm(defaultFormState);
  };

  const renderCopyAction = (id: string, value: string) => (
    <button
      type="button"
      onClick={() => handleCopy(id, value)}
      className="text-slate-300 transition-colors hover:text-slate-500"
      title="Copiar"
    >
      {copiedId === id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <div className="space-y-4 animate-fade-in text-left font-sans">
      <section className="flex items-start justify-between gap-4 rounded-2xl border border-[#f5c54d] bg-[#fff8e6] px-4 py-3">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#f59e0b]" />
          <div>
            <h3 className="text-[24px] font-black tracking-tight text-[#b45309] md:text-[18px]">
              Acceso Restringido — Solo Administradores
            </h3>
            <p className="mt-1 text-sm font-medium text-[#d97706]">
              Credenciales confidenciales. El acceso queda registrado. No comparta esta información.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
        >
          <Plus className="h-4 w-4" />
          Nueva credencial
        </button>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 bg-white">
              <tr className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
                <th className="px-4 py-4">Cliente</th>
                <th className="px-4 py-4">Proyecto</th>
                <th className="px-4 py-4">Tipo</th>
                <th className="px-4 py-4">URL</th>
                <th className="px-4 py-4">Usuario</th>
                <th className="px-4 py-4">Contraseña</th>
                <th className="px-4 py-4">Actualizado</th>
                <th className="px-4 py-4">Responsable</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((credential) => {
                const isVisible = !!revealedPasswords[credential.id];
                const safeClientName = normalizeText(credential.clientName);
                const safeProjectName = normalizeText(credential.projectName);
                const safeUrl = normalizeText(credential.url);
                const safeUsername = normalizeText(credential.username);
                const safePassword = normalizeText(credential.passwordText);
                const safeResponsible = normalizeText(credential.responsible);

                return (
                  <tr key={credential.id} className="border-b border-slate-100 text-sm text-slate-700 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-slate-900">{safeClientName}</td>
                    <td className="px-4 py-3 font-medium text-slate-500">{safeProjectName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadgeMap[credential.type]}`}>
                        {credential.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[160px] truncate font-mono text-[13px] text-[#2563eb]" title={safeUrl}>
                          {safeUrl}
                        </span>
                        {renderCopyAction(`${credential.id}_url`, safeUrl)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] text-slate-700">{safeUsername}</span>
                        {renderCopyAction(`${credential.id}_user`, safeUsername)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] tracking-[0.08em] text-slate-800">
                          {isVisible ? safePassword : maskPassword(safePassword)}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(credential.id)}
                          className="text-slate-300 transition-colors hover:text-slate-500"
                          title={isVisible ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        {renderCopyAction(`${credential.id}_password`, safePassword)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-slate-400">{credential.updatedAt}</td>
                    <td className="px-4 py-3 font-medium text-slate-500">{safeResponsible}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeMap[credential.status]}`}>
                        {credential.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(credential)}
                          className="text-blue-500 transition-colors hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCredential(credential.id)}
                          className="text-rose-400 transition-colors hover:text-rose-500"
                          title="Borrar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[450px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Nueva credencial</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCredential} className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Cliente
                  </label>
                  <select
                    value={addForm.clientName}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    className={inputClassName}
                    required
                  >
                    <option value=""></option>
                    {clientOptions.map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Proyecto / servicio
                  </label>
                  <input
                    type="text"
                    value={addForm.projectName}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, projectName: e.target.value }))}
                    placeholder="Ej. WordPress Admin"
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Tipo
                  </label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, type: e.target.value as CredentialItem["type"] }))}
                    className={inputClassName}
                  >
                    <option value="Hosting">Hosting</option>
                    <option value="CMS">CMS</option>
                    <option value="SSH/VPS">SSH/VPS</option>
                    <option value="Sistema">Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    URL
                  </label>
                  <input
                    type="text"
                    value={addForm.url}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={addForm.username}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="usuario"
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Contraseña
                  </label>
                  <input
                    type="text"
                    value={addForm.passwordText}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, passwordText: e.target.value }))}
                    placeholder="contraseña segura"
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Responsable
                  </label>
                  <select
                    value={addForm.responsible}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, responsible: e.target.value }))}
                    className={inputClassName}
                  >
                    {responsibleOptions.map((responsible) => (
                      <option key={responsible} value={responsible}>
                        {responsible}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Estado
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, status: e.target.value as CredentialItem["status"] }))}
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
                  onClick={() => setShowAddModal(false)}
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

      {currentEditingCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[450px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Editar credencial</h3>
              <button
                type="button"
                onClick={() => setEditingCredentialId(null)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={editForm.clientName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Proyecto / servicio
                  </label>
                  <input
                    type="text"
                    value={editForm.projectName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, projectName: e.target.value }))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Tipo
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value as CredentialItem["type"] }))}
                    className={inputClassName}
                  >
                    <option value="Hosting">Hosting</option>
                    <option value="CMS">CMS</option>
                    <option value="SSH/VPS">SSH/VPS</option>
                    <option value="Sistema">Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    URL
                  </label>
                  <input
                    type="text"
                    value={editForm.url}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, url: e.target.value }))}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Contraseña
                  </label>
                  <input
                    type="text"
                    value={editForm.passwordText}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, passwordText: e.target.value }))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Responsable
                  </label>
                  <select
                    value={editForm.responsible}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, responsible: e.target.value }))}
                    className={inputClassName}
                  >
                    {responsibleOptions.map((responsible) => (
                      <option key={responsible} value={responsible}>
                        {responsible}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                    Estado
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as CredentialItem["status"] }))}
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
                  onClick={() => setEditingCredentialId(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
