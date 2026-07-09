import React, { useState, useEffect } from "react";
import { User, SavedProject } from "../types";
import { apiFetch } from "../lib/api";
import { 
  Lock, 
  User as UserIcon, 
  FolderGit, 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Sparkles, 
  LogOut, 
  AlertCircle,
  FileCode2,
  Figma,
  Calendar
} from "lucide-react";

interface ProjectsManagerProps {
  onLoadProjectCode: (code: string, name: string) => void;
  onRefreshTrigger: number;
}

export default function ProjectsManager({ onLoadProjectCode, onRefreshTrigger }: ProjectsManagerProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem("figma_session"));
  const [projects, setProjects] = useState<SavedProject[]>([]);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New Project Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjNode, setNewProjNode] = useState("");
  const [newProjCode, setNewProjCode] = useState("");
  const [newProjClasses, setNewProjClasses] = useState("");

  // Fetch Current User on mount or sessionId changes
  useEffect(() => {
    fetchUserStatus();
  }, [sessionId]);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser, onRefreshTrigger]);

  const fetchUserStatus = async () => {
    if (!sessionId) {
      setCurrentUser(null);
      return;
    }
    try {
      const data = await apiFetch<{ user: User | null }>("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        // Stale session
        handleLogout();
      }
    } catch (e) {
      console.error("Error fetching user status", e);
    }
  };

  const fetchProjects = async () => {
    if (!sessionId) return;
    try {
      const data = await apiFetch<{ projects?: SavedProject[] }>("/api/projects", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error("Error fetching projects", e);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setAuthError("Por favor completa todos los campos");
      return;
    }
    setAuthError("");
    setIsLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";
    try {
      const data = await apiFetch<{ sessionId: string; user: User }>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("figma_session", data.sessionId);
      setSessionId(data.sessionId);
      setCurrentUser(data.user);
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("figma_session");
    setSessionId(null);
    setCurrentUser(null);
    setProjects([]);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      alert("El nombre del proyecto es requerido");
      return;
    }

    try {
      await apiFetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          name: newProjName,
          description: newProjDesc,
          figmaNode: newProjNode || "Lienzo Personalizado",
          componentCode: newProjCode || `import React from "react";\n\nexport default function CustomItem() {\n  return (\n    <div className="p-6 bg-white rounded-xl shadow-md">\n      <h3>${newProjName}</h3>\n    </div>\n  );\n}`,
          tailwindClasses: newProjClasses,
        }),
      });

      // Reset form
      setNewProjName("");
      setNewProjDesc("");
      setNewProjNode("");
      setNewProjCode("");
      setNewProjClasses("");
      setShowAddForm(false);
      
      // Refresh
      fetchProjects();
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de eliminar este componente guardado?")) return;

    try {
      await apiFetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="projects-manager-container" className="h-full flex flex-col">
      {/* User Login card / status */}
      {!currentUser ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {isLogin ? "Inicia Sesión para Guardar" : "Regístrate en el Sistema"}
              </h3>
              <p className="text-xs text-stone-500">Persiste tus réplicas de Figma y exporta código.</p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Usuario</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. roberto"
                  className="w-full text-sm pl-9 pr-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-sm pl-9 pr-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {authError && (
              <div className="flex items-start gap-2 text-xs bg-rose-50 text-rose-600 p-3 rounded-lg border border-rose-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
            >
              {isLoading ? "Procesando..." : isLogin ? "Ingresar" : "Crear Cuenta"}
            </button>

            <div className="text-center pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAuthError("");
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-all"
              >
                {isLogin ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </form>

          {/* Quick instructions */}
          <div className="mt-5 pt-4 border-t border-stone-100 text-[11px] text-stone-500 space-y-1.5">
            <p className="font-semibold text-stone-600">💡 Tip de Prueba:</p>
            <p>Puedes usar el usuario pre-sembrado <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-700">demo</code> con contraseña <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-700">demo</code> para cargar ejemplos de forma instantánea.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-500/20 uppercase">
                {currentUser.username[0]}
              </div>
              <div>
                <h4 className="text-xs text-stone-500 font-medium">Conectado como</h4>
                <p className="text-sm font-bold text-stone-900 leading-tight">@{currentUser.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-all"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Projects List Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FolderGit className="w-4 h-4 text-stone-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Réplicas Guardadas</h3>
        </div>
        {currentUser && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-all bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        )}
      </div>

      {/* Add Manual Component Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm mb-4 space-y-3">
          <h4 className="text-xs font-bold text-stone-900">Registrar Nueva Réplica</h4>
          <form onSubmit={handleCreateProject} className="space-y-2.5 text-xs">
            <div>
              <label className="block text-stone-500 font-medium mb-1">Nombre del Diseño</label>
              <input
                type="text"
                required
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                placeholder="ej. Botón Glassmorphism Premium"
                className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-stone-500 font-medium mb-1">Descripción</label>
              <input
                type="text"
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="ej. Estilo degradado de Figma con sombras rítmicas"
                className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-stone-500 font-medium mb-1">Referencia Nodo Figma</label>
              <input
                type="text"
                value={newProjNode}
                onChange={(e) => setNewProjNode(e.target.value)}
                placeholder="ej. Frame #305:12"
                className="w-full p-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-stone-500 font-medium mb-1">Código de React (Opcional)</label>
              <textarea
                value={newProjCode}
                onChange={(e) => setNewProjCode(e.target.value)}
                placeholder="Copia tu código React aquí..."
                rows={3}
                className="w-full p-2 border border-stone-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[10px]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg font-bold"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Scroller */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {projects.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
            <FileCode2 className="w-8 h-8 text-stone-400 mx-auto mb-2.5" />
            <p className="text-xs font-semibold text-stone-600">No hay réplicas cargadas</p>
            <p className="text-[11px] text-stone-400 max-w-[200px] mx-auto mt-1 leading-relaxed">
              {!currentUser 
                ? "Inicia sesión con la cuenta 'demo' para cargar componentes pre-sembrados de Figma"
                : "Usa el generador de IA o el playground para diseñar y guardar componentes"}
            </p>
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                if (proj.componentCode) {
                  onLoadProjectCode(proj.componentCode, proj.name);
                }
              }}
              className="group relative bg-white border border-stone-200 hover:border-indigo-400 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 mb-1.5">
                  <Figma className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded uppercase">
                    {proj.figmaNode || "Lienzo"}
                  </span>
                </div>
                {currentUser && (
                  <button
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h4 className="text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                {proj.name}
              </h4>
              <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-normal">
                {proj.description}
              </p>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100 text-[10px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(proj.createdAt).toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1 text-indigo-500 font-semibold ml-auto">
                  <Code className="w-3 h-3" /> Cargar código
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
