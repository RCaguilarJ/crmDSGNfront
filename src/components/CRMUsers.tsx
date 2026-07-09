import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  X, 
  Lock, 
  UserCog, 
  Mail, 
  ShieldCheck,
  Shield,
  KeyRound
} from "lucide-react";

export interface CRMUserItem {
  id: string;
  name: string;
  username: string;
  roleName: string;
  email: string;
  avatarColor: string;
  initials: string;
  status: "Active" | "Blocked";
  lastLogin: string;
}

export default function CRMUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<CRMUserItem | null>(null);

  // Form State
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState("Gerente Dev");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAvatarColor, setNewAvatarColor] = useState("bg-[#7c3aed]");

  const [crmUsers, setCrmUsers] = useState<CRMUserItem[]>(() => {
    const cached = localStorage.getItem("crm_users_list");
    return cached ? JSON.parse(cached) : [
      { id: "usr_1", name: "Adriana García", username: "adriana", roleName: "Admin General", email: "adriana@desings.mx", avatarColor: "bg-[#00b289]", initials: "AG", status: "Active", lastLogin: "Hoy, 10:07" },
      { id: "usr_2", name: "Jorge Ramírez", username: "jorge", roleName: "Administración", email: "jorge@desings.mx", avatarColor: "bg-[#7c3aed]", initials: "JR", status: "Active", lastLogin: "Hoy, 09:45" },
      { id: "usr_3", name: "Carlos Mendoza", username: "carlos", roleName: "Gerente Dev", email: "carlos@desings.mx", avatarColor: "bg-[#f59e0b]", initials: "CM", status: "Active", lastLogin: "Ayer, 18:22" },
      { id: "usr_4", name: "Sofía Rodríguez", username: "sofia", roleName: "Gerente Web", email: "sofia@desings.mx", avatarColor: "bg-[#fca5a5]", initials: "SR", status: "Active", lastLogin: "04 Jul, 11:15" },
      { id: "usr_5", name: "Usuario Demo", username: "demo", roleName: "Diseñador", email: "demo@desings.mx", avatarColor: "bg-blue-500", initials: "UD", status: "Active", lastLogin: "Nunca" }
    ];
  });

  const saveCrmUsers = (updated: CRMUserItem[]) => {
    setCrmUsers(updated);
    localStorage.setItem("crm_users_list", JSON.stringify(updated));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    const normalizedUsername = newUsername.trim().toLowerCase();
    
    // Check duplication
    if (crmUsers.some(u => u.username === normalizedUsername)) {
      alert("El nombre de usuario ya se encuentra registrado.");
      return;
    }

    const init = newName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    const newUsr: CRMUserItem = {
      id: "usr_" + Date.now(),
      name: newName,
      username: normalizedUsername,
      roleName: newRole,
      email: newEmail || `${normalizedUsername}@desings.mx`,
      avatarColor: newAvatarColor,
      initials: init || "UD",
      status: "Active",
      lastLogin: "Nunca"
    };

    const updated = [...crmUsers, newUsr];
    saveCrmUsers(updated);

    // Reset Form
    setNewName("");
    setNewUsername("");
    setNewRole("Gerente Dev");
    setNewEmail("");
    setNewPassword("");
    setNewAvatarColor("bg-[#7c3aed]");
    setShowAddModal(false);

    alert(`Usuario corporativo "${normalizedUsername}" registrado con contraseña provisional.`);
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (username === "adriana") {
      alert("No se puede dar de baja al usuario Administrador Principal (Adriana).");
      return;
    }
    if (confirm(`¿Estás seguro de inhabilitar y eliminar la cuenta de @${username}?`)) {
      const updated = crmUsers.filter(u => u.id !== id);
      saveCrmUsers(updated);
    }
  };

  const handleBlockUser = (id: string) => {
    const updated = crmUsers.map(u => {
      if (u.id === id) {
        if (u.username === "adriana") return u;
        const newStatus: CRMUserItem["status"] = u.status === "Active" ? "Blocked" : "Active";
        return { ...u, status: newStatus };
      }
      return u;
    });
    saveCrmUsers(updated);
  };

  // Filter
  const filteredUsers = crmUsers.filter(u => {
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#1d63ff]" /> Usuarios y Accesos al Sistema
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Administra los usuarios autorizados para ingresar a Designs CRM, asignación de roles corporativos y bloqueos temporales de accesos.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#1d63ff] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/15 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Registrar Cuenta de Usuario
        </button>
      </div>

      {/* Security alert */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 font-semibold leading-relaxed">
          <strong className="text-slate-800 block mb-0.5">Permisos de Administrador General:</strong>
          Únicamente las cuentas con rol de **Admin General** pueden registrar usuarios, modificar su estado comercial, inhabilitar inicios de sesión y reestablecer contraseñas de seguridad.
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, usuario de red o rol corporativo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none text-xs font-semibold text-slate-700 transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table layouts */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-4 px-4">Usuario / Colaborador</th>
                <th className="py-4 px-4">Usuario de Acceso</th>
                <th className="py-4 px-4">Rol Corporativo</th>
                <th className="py-4 px-4">Correo Institucional</th>
                <th className="py-4 px-4 text-center">Último Acceso</th>
                <th className="py-4 px-4 text-center">Estado</th>
                <th className="py-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                        {u.initials}
                      </div>
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">@{u.username}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-600 flex items-center gap-1.5">
                      <Shield className={`w-3.5 h-3.5 ${u.roleName === "Admin General" ? "text-emerald-500" : "text-blue-500"}`} />
                      {u.roleName}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-semibold">{u.email}</td>
                  <td className="py-4 px-4 text-center text-slate-500 font-medium">{u.lastLogin}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                    }`}>
                      {u.status === "Active" ? "Activo" : "Bloqueado"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {u.username !== "adriana" && (
                        <>
                          <button
                            onClick={() => handleBlockUser(u.id)}
                            className={`p-1 px-2 border rounded-lg cursor-pointer text-[10px] font-bold ${
                              u.status === "Active"
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                            title={u.status === "Active" ? "Bloquear inicio de sesión" : "Desbloquear inicio de sesión"}
                          >
                            {u.status === "Active" ? "Bloquear" : "Activar"}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setShowPasswordModal(u)}
                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer"
                        title="Reestablecer Contraseña"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {u.username !== "adriana" && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"
                          title="Eliminar Cuenta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 max-w-sm w-full shadow-2xl animate-scale-up text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#1d63ff]" /> Reestablecer Acceso
              </h3>
              <button 
                onClick={() => setShowPasswordModal(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs font-semibold space-y-4">
              <p className="text-slate-500 leading-relaxed">
                Estás a punto de sobreescribir las credenciales de inicio de sesión de <strong className="text-slate-800">@{showPasswordModal.username}</strong> ({showPasswordModal.name}).
              </p>

              <div>
                <label className="block text-slate-500 mb-1.5">Nueva Contraseña Provisional *</label>
                <input
                  type="text"
                  defaultValue="demo1234"
                  id="provisionalPassInput"
                  placeholder="ej. demo1234"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-mono font-bold text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const passVal = (document.getElementById("provisionalPassInput") as HTMLInputElement)?.value;
                    alert(`Contraseña de @${showPasswordModal.username} reestablecida a "${passVal}". El usuario deberá cambiarla en su primer login.`);
                    setShowPasswordModal(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer font-bold"
                >
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 max-w-lg w-full shadow-2xl animate-scale-up text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#1d63ff]" /> Registrar Nueva Cuenta CRM
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5">Nombre del Colaborador *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ej. Juan Carlos"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Usuario de Ingreso *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">@</span>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="usuario"
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5">Rol de Acceso *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  >
                    <option value="Admin General">Admin General (Acceso Total)</option>
                    <option value="Administración">Administración (Facturación & Leads)</option>
                    <option value="Gerente Dev">Gerente Dev (Proyectos Dev)</option>
                    <option value="Gerente Web">Gerente Web (Proyectos Web & WordPress)</option>
                    <option value="Diseñador">Diseñador UI/UX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Color del Avatar</label>
                  <select
                    value={newAvatarColor}
                    onChange={(e) => setNewAvatarColor(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  >
                    <option value="bg-[#7c3aed]">Púrpura Corporativo</option>
                    <option value="bg-[#00b289]">Verde Esmeralda</option>
                    <option value="bg-[#f59e0b]">Ámbar Mostaza</option>
                    <option value="bg-[#fca5a5]">Rosa Pastel</option>
                    <option value="bg-[#1d63ff]">Azul Eléctrico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1.5">Correo Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="colaborador@desings.mx"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">Contraseña Inicial *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d63ff] font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1d63ff] hover:bg-blue-600 text-white rounded-xl cursor-pointer font-bold shadow shadow-blue-500/15"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
