import React, { useState, useEffect, Suspense, lazy } from "react";
import { 
  Figma, 
  Sparkles, 
  Users, 
  FolderGit, 
  Layers, 
  DollarSign, 
  LogOut, 
  Menu, 
  X, 
  Lock, 
  User as UserIcon, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  RefreshCw,
  FileText,
  Briefcase,
  Key,
  BarChart3,
  UserCog,
  Settings,
  House,
  Search,
  Bell,
  Clock,
  Globe,
  Code2,
  Trello,
  CheckSquare,
  ChevronLeft
} from "lucide-react";

// Import types
import type { Client, User } from "./types";
import type { DesignProject } from "./components/CRMProjects";
import type { WebProject } from "./components/CRMWebProjects";
import type { Task } from "./components/CRMTasks";
import type { Invoice } from "./components/CRMBilling";
import { apiFetch, clearStoredSession, getStoredSession, storeSession } from "./lib/api";
import NotificationCenter from "./components/NotificationCenter";

// Lazy-loaded components for optimal initial loading
const CRMDashboard = lazy(() => import("./components/CRMDashboard"));
const CRMClients = lazy(() => import("./components/CRMClients"));
const CRMProjects = lazy(() => import("./components/CRMProjects"));
const CRMWebProjects = lazy(() => import("./components/CRMWebProjects"));
const CRMTasks = lazy(() => import("./components/CRMTasks"));
const CRMKanban = lazy(() => import("./components/CRMKanban"));
const CRMBilling = lazy(() => import("./components/CRMBilling"));
const CRMFigmaWorkspace = lazy(() => import("./components/CRMFigmaWorkspace"));
const CRMLeads = lazy(() => import("./components/CRMLeads"));
const CRMServices = lazy(() => import("./components/CRMServices"));
const CRMRenewals = lazy(() => import("./components/CRMRenewals"));
const CRMQuotes = lazy(() => import("./components/CRMQuotes"));
const CRMStaff = lazy(() => import("./components/CRMStaff"));
const CRMCredentials = lazy(() => import("./components/CRMCredentials"));
const CRMReports = lazy(() => import("./components/CRMReports"));
const CRMUsers = lazy(() => import("./components/CRMUsers"));
const CRMSettings = lazy(() => import("./components/CRMSettings"));

type RoleKey = "admin_general" | "administracion" | "gerente_dev" | "gerente_web";

const ROLE_KEY_BY_NAME: Record<string, RoleKey> = {
  admin_general: "admin_general",
  "Admin General": "admin_general",
  administracion: "administracion",
  "Administración": "administracion",
  gerente_dev: "gerente_dev",
  "Gerente Dev": "gerente_dev",
  gerente_web: "gerente_web",
  "Gerente Web": "gerente_web",
};

const VIEW_PERMISSIONS: Record<string, RoleKey[]> = {
  dashboard: ["admin_general", "administracion", "gerente_dev", "gerente_web"],
  clients: ["admin_general", "administracion", "gerente_dev", "gerente_web"],
  leads: ["admin_general", "administracion"],
  services: ["admin_general", "administracion"],
  billing: ["admin_general", "administracion"],
  renewals: ["admin_general", "administracion"],
  quotes: ["admin_general", "administracion"],
  projects: ["admin_general", "administracion", "gerente_dev"],
  projects_web: ["admin_general", "gerente_web"],
  kanban: ["admin_general", "administracion", "gerente_dev", "gerente_web"],
  tasks: ["admin_general", "administracion", "gerente_dev", "gerente_web"],
  staff: ["admin_general", "gerente_dev", "gerente_web"],
  credentials: ["admin_general"],
  reports: ["admin_general", "administracion"],
  users: ["admin_general"],
  settings: ["admin_general"],
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Inicio", icon: House },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "leads", label: "Prospectos", icon: UserPlus },
  { id: "services", label: "Servicios", icon: Layers },
  { id: "billing", label: "Pagos", icon: DollarSign },
  { id: "renewals", label: "Renovaciones", icon: RefreshCw },
  { id: "quotes", label: "Cotizaciones", icon: FileText },
  { id: "projects", label: "Proyectos Dev", icon: Code2 },
  { id: "projects_web", label: "Proyectos Web", icon: Globe },
  { id: "kanban", label: "Kanban", icon: Trello },
  { id: "tasks", label: "Tareas", icon: CheckSquare },
  { id: "staff", label: "Personal", icon: Briefcase },
  { id: "credentials", label: "Credenciales", icon: Key },
  { id: "reports", label: "Reportes", icon: BarChart3 },
  { id: "users", label: "Usuarios", icon: UserCog },
  { id: "settings", label: "Configuración", icon: Settings },
] as const;

function canAccessView(role: string | undefined, view: string, assignedModules: string[] = [], effectivePermissions: Record<string,string[]> | null = null) {
  const roleKey = role ? ROLE_KEY_BY_NAME[role] : undefined;
  const roleAllowed = effectivePermissions ? effectivePermissions[view]?.includes("view") : Boolean(roleKey && VIEW_PERMISSIONS[view]?.includes(roleKey));
  return assignedModules.includes(view) || Boolean(roleAllowed);
}

export default function App() {
  // Navigation active view
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view");
    if (requestedView && NAV_ITEMS.some((item) => item.id === requestedView)) setActiveView(requestedView);
  }, []);

  // Real-time digital clock
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignedModules, setAssignedModules] = useState<string[]>([]);
  const [effectivePermissions,setEffectivePermissions] = useState<Record<string,string[]> | null>(null);
  const visibleNavItems = NAV_ITEMS.filter((item) => item.id === "dashboard" || canAccessView(currentUser?.role, item.id, assignedModules,effectivePermissions));
  const canPerform = (moduleName:string,action:string) => currentUser?.role === "Admin General" || (effectivePermissions ? Boolean(effectivePermissions[moduleName]?.includes(action)) : action !== "delete" && canAccessView(currentUser?.role,moduleName));
  const [sessionId, setSessionId] = useState<string | null>(getStoredSession());
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (currentUser && !canAccessView(currentUser.role, activeView, assignedModules,effectivePermissions)) {
      setActiveView("dashboard");
    }
  }, [currentUser, activeView, assignedModules,effectivePermissions]);

  // Core Data States
  const [clients, setClients] = useState<Client[]>(() => {
    const cached = localStorage.getItem("crm_clients");
    return cached ? JSON.parse(cached) : [
      { 
        id: "c_1", 
        companyName: "Constructora Murillo S.A.", 
        contactName: "Ing. Roberto Murillo", 
        phone: "+52 664 234 5678", 
        email: "r.murillo@constructoramurillo.mx", 
        services: 4, 
        responsible: "Carlos Mendoza", 
        status: "Activo", 
        nextRenewal: "2025-02-15",
        avatarInitials: "CO",
        avatarBg: "bg-[#f59e0b]"
      },
      { 
        id: "c_2", 
        companyName: "Farmacia San Pablo del Norte", 
        contactName: "Lic. Patricia Sánchez", 
        phone: "+52 33 1234 5678", 
        email: "p.sanchez@farmsanpablo.mx", 
        services: 3, 
        responsible: "Sofía Rodríguez", 
        status: "Activo", 
        nextRenewal: "2025-01-20",
        avatarInitials: "FA",
        avatarBg: "bg-[#ec4899]"
      },
      { 
        id: "c_3", 
        companyName: "Clínica Médica del Valle", 
        contactName: "Dr. Ernesto Valdés", 
        phone: "+52 81 9876 5432", 
        email: "e.valdes@clinicadelvalle.mx", 
        services: 2, 
        responsible: "Luis Pérez", 
        status: "Activo", 
        nextRenewal: "2025-03-10",
        avatarInitials: "CL",
        avatarBg: "bg-[#eab308]"
      },
      { 
        id: "c_4", 
        companyName: "Grupo Inmobiliario Arenas", 
        contactName: "Arq. Mónica Arenas", 
        phone: "+52 55 5555 1234", 
        email: "m.arenas@grupoarenas.mx", 
        services: 5, 
        responsible: "Marco Herrera", 
        status: "Activo", 
        nextRenewal: "2025-01-31",
        avatarInitials: "GR",
        avatarBg: "bg-[#84cc16]"
      },
      { 
        id: "c_5", 
        companyName: "Restaurante El Fogón Real", 
        contactName: "Chef Omar Lozano", 
        phone: "+52 33 8765 4321", 
        email: "o.lozano@elfogonreal.mx", 
        services: 2, 
        responsible: "Sofía Rodríguez", 
        status: "Activo", 
        nextRenewal: "2025-04-05",
        avatarInitials: "RE",
        avatarBg: "bg-[#a855f7]"
      },
      { 
        id: "c_6", 
        companyName: "Academia de Idiomas Luminar", 
        contactName: "Mtra. Elena Quiroga", 
        phone: "+52 442 345 6789", 
        email: "e.quiroga@idiomesluminar.mx", 
        services: 3, 
        responsible: "Luis Pérez", 
        status: "Activo", 
        nextRenewal: "2025-02-28",
        avatarInitials: "AC",
        avatarBg: "bg-[#10b981]"
      },
      { 
        id: "c_7", 
        companyName: "Despacho Jurídico Montoya & Asoc.", 
        contactName: "Lic. Hernán Montoya", 
        phone: "+52 55 4444 3333", 
        email: "h.montoya@montoya-abogados.mx", 
        services: 2, 
        responsible: "Carlos Mendoza", 
        status: "Próximo a vencer", 
        nextRenewal: "2025-01-12",
        avatarInitials: "DE",
        avatarBg: "bg-[#f59e0b]"
      },
      { 
        id: "c_8", 
        companyName: "Distribuidora Noroeste Express", 
        contactName: "Lic. Beatriz Flores", 
        phone: "+52 664 555 6677", 
        email: "b.flores@noroeste-express.mx", 
        services: 3, 
        responsible: "Marco Herrera", 
        status: "Vencido", 
        nextRenewal: "2024-12-20",
        avatarInitials: "DI",
        avatarBg: "bg-[#ef4444]"
      },
      { 
        id: "c_9", 
        companyName: "Hotel Boutique Riviera Maya", 
        contactName: "Lic. Andrés Castellanos", 
        phone: "+52 998 123 4567", 
        email: "a.castellanos@rivieramaya-hotel.mx", 
        services: 4, 
        responsible: "Valeria Castro", 
        status: "Activo", 
        nextRenewal: "2025-05-15",
        avatarInitials: "HO",
        avatarBg: "bg-[#1d63ff]"
      },
      { 
        id: "c_10", 
        companyName: "Taller Automotriz Express TJ", 
        contactName: "Ing. Miguel Ramos", 
        phone: "+52 664 789 0123", 
        email: "m.ramos@tallerexpress.mx", 
        services: 1, 
        responsible: "Luis Pérez", 
        status: "Suspendido", 
        nextRenewal: "2025-06-01",
        avatarInitials: "TA",
        avatarBg: "bg-[#94a3b8]"
      }
    ];
  });

  const [projects, setProjects] = useState<DesignProject[]>(() => {
    const cached = localStorage.getItem("crm_projects");
    try {
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Invalid cached projects, falling back to mocks", e);
    }

    // Mock projects for visual progress and QA
    return [
      {
        id: "p_101",
        name: "Landing - Restaurante El Fogón",
        clientName: "Restaurante El Fogón Real",
        figmaNode: "Frame / Landing / Hero",
        status: "En Diseño",
        dueDate: "2026-08-15",
        budget: 12000,
        componentCode: "",
        description: "Replicar hero con CTA y sobremenu animado.",
        manager: "Adriana García",
        devs: ["Ana Silva", "Eduardo López"],
        startDate: "2026-06-01",
        progress: 45,
        priority: "Alta"
      },
      {
        id: "p_102",
        name: "Portal de Clientes - Clínica del Valle",
        clientName: "Clínica Médica del Valle",
        figmaNode: "Pages / Clientes / Dashboard",
        status: "En Revisión",
        dueDate: "2026-07-30",
        budget: 30000,
        componentCode: "",
        description: "Dashboard de salud con widgets y gráficas.",
        manager: "Luis Pérez",
        devs: ["Carlos Mendoza"],
        startDate: "2026-05-20",
        progress: 78,
        priority: "Media"
      },
      {
        id: "p_103",
        name: "E-commerce - Distribuidora Noroeste",
        clientName: "Distribuidora Noroeste Express",
        figmaNode: "Store / Checkout",
        status: "En Boceto",
        dueDate: "2026-09-10",
        budget: 45000,
        componentCode: "",
        description: "Checkout optimizado y pasarela de pagos.",
        manager: "Marco Herrera",
        devs: ["Sofía Rodríguez", "Ana Silva"],
        startDate: "2026-06-10",
        progress: 12,
        priority: "Urgente"
      }
    ];
  });
  const [webProjects, setWebProjects] = useState<WebProject[]>(() => {
    const cached = localStorage.getItem("crm_web_projects");
    try {
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Invalid cached web projects, falling back to mocks", e);
    }

    return [
      {
        id: "wp_101",
        name: "Sitio Web Clínica Médica",
        clientName: "Clínica Médica",
        manager: "Sofía",
        designer: "Valeria",
        builder: "Luis",
        startDate: "2024-12-01",
        dueDate: "2025-01-25",
        progress: 95,
        status: "Revisión cliente",
        priority: "Alta",
        description: "Sitio institucional con servicios, blog y formularios médicos.",
      },
      {
        id: "wp_102",
        name: "Landing Restaurante El Fogón",
        clientName: "Restaurante El",
        manager: "Sofía",
        designer: "Valeria",
        builder: "Luis",
        startDate: "2024-12-15",
        dueDate: "2025-02-01",
        progress: 70,
        status: "Carga de contenido",
        priority: "Media",
        description: "Landing de campaña con menú, galería y reservas.",
      },
      {
        id: "wp_103",
        name: "Portal Academia Luminar",
        clientName: "Academia de",
        manager: "Luis",
        designer: "Valeria",
        builder: "Sofía",
        startDate: "2025-01-05",
        dueDate: "2025-03-05",
        progress: 20,
        status: "Diseño inicial",
        priority: "Media",
        description: "Portal de cursos y captación para academia de idiomas.",
      },
      {
        id: "wp_104",
        name: "Web Despacho Montoya",
        clientName: "Despacho Jurídico",
        manager: "Sofía",
        designer: "Valeria",
        builder: "Luis",
        startDate: "2024-11-20",
        dueDate: "2025-01-10",
        progress: 100,
        status: "Publicado",
        priority: "Baja",
        description: "Sitio corporativo legal con páginas de práctica y contacto.",
      },
      {
        id: "wp_105",
        name: "Portafolio Taller Express",
        clientName: "Taller Automotriz",
        manager: "Luis",
        designer: "Valeria",
        builder: "Sofía",
        startDate: "2024-12-10",
        dueDate: "2025-01-30",
        progress: 45,
        status: "Maquetación",
        priority: "Baja",
        description: "Web catálogo de servicios automotrices con cotizador.",
      },
    ];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem("crm_tasks");
    return cached ? JSON.parse(cached) : [
      { id: "t_1", title: "Diseñar wireframes de la landing page", description: "Crear bosquejo estructural en Figma y validar la alineación áurea.", column: "Backlog", priority: "Media", projectName: "Dashboard de Análisis Financiero", assignee: "Eduardo López" },
      { id: "t_2", title: "Replicar card de precios con gradiente", description: "Desarrollar el componente en React + Tailwind usando clases rítmicas.", column: "Desarrollo", priority: "Alta", projectName: "Bento Layout Hero Section", assignee: "Ana Silva" },
      { id: "t_3", title: "Revisión de accesibilidad de colores", description: "Verificar contraste contrast ratio AAA de los badges.", column: "QA", priority: "Baja", projectName: "Bento Layout Hero Section", assignee: "Carlos Slim" },
      { id: "t_4", title: "Definir tipografía Space Grotesk", description: "Configurar fuentes responsivas y tracking tight en el header.", column: "Diseño", priority: "Alta", projectName: "Dashboard de Análisis Financiero", assignee: "Eduardo López" }
    ];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const cached = localStorage.getItem("crm_invoices");
    return cached ? JSON.parse(cached) : [
      { id: "inv_1", clientName: "Google Latam", amount: 45000, status: "Pagado", dueDate: "2026-07-15", description: "Servicio de diseño UI/UX y exportación de componentes reactivos." },
      { id: "inv_2", clientName: "Nike México", amount: 35000, status: "Pendiente", dueDate: "2026-07-28", description: "Réplica interactiva del Bento Hero Section en React." },
      { id: "inv_3", clientName: "Netflix Inc", amount: 15000, status: "Vencido", dueDate: "2026-06-30", description: "Consultoría de branding y diseño de bento grids." }
    ];
  });

  // State to hold active component code to load into AI assistant
  const [activeCodeToLoad, setActiveCodeToLoad] = useState<{ code: string; name: string } | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Save clients, tasks, invoices state locally when changed
  useEffect(() => {
    localStorage.setItem("crm_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("crm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("crm_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("crm_web_projects", JSON.stringify(webProjects));
  }, [webProjects]);

  useEffect(() => {
    localStorage.setItem("crm_invoices", JSON.stringify(invoices));
  }, [invoices]);

  // Auth synchronization on boot
  useEffect(() => {
    fetchUserStatus();
  }, [sessionId]);

  useEffect(() => {
    if (!currentUser || !sessionId) {
      setAssignedModules([]);
      setEffectivePermissions(null);
      return;
    }
    const loadAssignedModules = () => apiFetch<{ modules:string[] }>("/api/access/modules")
      .then((data) => setAssignedModules(data.modules || []))
      .catch((error) => console.error("No se pudieron cargar los módulos asignados",error));
    const loadPermissions = () => apiFetch<{permissions:Record<string,string[]>}>("/api/permissions/effective")
      .then((data) => setEffectivePermissions(data.permissions || {}))
      .catch((error) => console.error("No se pudieron cargar los permisos",error));
    void loadAssignedModules();
    void loadPermissions();
    const interval = window.setInterval(()=>{void loadAssignedModules();void loadPermissions()},15000);
    return () => window.clearInterval(interval);
  }, [currentUser,sessionId]);

  // Sync projects from database
  useEffect(() => {
    if (currentUser) {
      fetchClientsFromDatabase();
      fetchTasksFromDatabase();

      if (canAccessView(currentUser.role, "projects",assignedModules,effectivePermissions)) fetchProjectsFromDatabase();
      else setProjects([]);

      if (canAccessView(currentUser.role, "projects_web",assignedModules,effectivePermissions)) fetchWebProjectsFromDatabase();
      else setWebProjects([]);

      if (canAccessView(currentUser.role, "billing",assignedModules,effectivePermissions)) fetchInvoicesFromDatabase();
      else setInvoices([]);
    }
  }, [currentUser, refreshTrigger, assignedModules,effectivePermissions]);

  // Keep time-sensitive notifications current without requiring a page refresh.
  useEffect(() => {
    if (!currentUser) return;
    const interval = window.setInterval(() => {
      void fetchClientsFromDatabase();
      void fetchTasksFromDatabase();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [currentUser?.username, sessionId]);

  const fetchUserStatus = async () => {
    if (!sessionId) {
      setCurrentUser(null);
      return;
    }
    try {
      const data = await apiFetch<{ user: User | null }>("/api/auth/me", {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error("Error fetching user status", e);
    }
  };

  const fetchProjectsFromDatabase = async () => {
    if (!sessionId) return;
    try {
      const data = await apiFetch<{ projects?: any[] }>("/api/projects", {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      if (data.projects) {
        // Map database saved projects to our DesignProject structure
        const mapped: DesignProject[] = data.projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          clientName: p.figmaNode ? "Nike México" : "Lienzo Interno", // Fallback association
          figmaNode: p.figmaNode || "Lienzo AI",
          status: "Replicado",
          dueDate: new Date(p.createdAt).toISOString().split('T')[0],
          budget: 15000,
          componentCode: p.componentCode,
          description: p.description || "Componente replicado con éxito."
        }));

        setProjects(mapped);
      }
    } catch (e) {
      console.error("Error fetching projects", e);
    }
  };

  const fetchClientsFromDatabase = async () => {
    if (!sessionId) return;
    try {
      const data = await apiFetch<{ clients?: Client[] }>("/api/clients", {
        headers: { Authorization: `Bearer ${sessionId}` }
      });

      if (data.clients) {
        setClients(data.clients);
      }
    } catch (e) {
      console.error("Error fetching clients", e);
    }
  };

  const fetchWebProjectsFromDatabase = async () => {
    if (!sessionId) return;
    try {
      const data = await apiFetch<{ projects?: WebProject[] }>("/api/web-projects", {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      if (data.projects) {
        setWebProjects(data.projects);
      }
    } catch (e) {
      console.error("Error fetching web projects", e);
    }
  };

  const fetchTasksFromDatabase = async () => {
    if (!sessionId) return;
    try {
      const data = await apiFetch<{ tasks: Array<Omit<Task, "column"> & { columnName: Task["column"] }> }>("/api/tasks");
      setTasks(data.tasks.map(({ columnName, ...task }) => ({ ...task, column: columnName })));
    } catch (e) { console.error("Error fetching tasks", e); }
  };

  const fetchInvoicesFromDatabase = async () => {
    if (!sessionId) return;
    try {
      const data = await apiFetch<{ invoices: Invoice[] }>("/api/invoices");
      setInvoices(data.invoices.map(invoice => ({ ...invoice, amount: Number(invoice.amount) })));
    } catch (e) { console.error("Error fetching invoices", e); }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setAuthError("Por favor escribe tu usuario y contraseña.");
      return;
    }
    setAuthError("");
    setAuthLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";
    try {
      const data = await apiFetch<{ sessionId: string; user: User }>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });


      // Backend sets refresh token in HttpOnly cookie; store only access token
      storeSession(data.sessionId);
      setSessionId(data.sessionId);
      setCurrentUser(data.user);
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickRoleLogin = async (roleUsername: string) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const data = await apiFetch<{ sessionId: string; user: User }>("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: roleUsername })
      });
      storeSession(data.sessionId);
      setSessionId(data.sessionId);
      setCurrentUser(data.user);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    // Inform backend to revoke refresh token cookie
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    clearStoredSession();
    setSessionId(null);
    setCurrentUser(null);
    setProjects([]);
    setWebProjects([]);
  };

  // Saved components to backend
  const handleSaveToDatabase = async (project: {
    name: string;
    description: string;
    componentCode: string;
    figmaNode: string;
    clientName?: string;
    status?: string;
    dueDate?: string;
    budget?: number;
    manager?: string;
    devs?: string[];
    startDate?: string;
    progress?: number;
    priority?: string;
  }) => {
    if (!sessionId) return;
    try {
      await apiFetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`
        },
        body: JSON.stringify(project)
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Client modification helpers
  const handleAddClient = (client: Omit<Client, "id">) => {
    const newClient: Client = {
      ...client,
      id: "c_" + Date.now()
    };
    setClients(prev => [...prev, newClient]);
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleUpsertClient = (client: Client) => {
    setClients(prev => {
      const existingIndex = prev.findIndex(item => item.id === client.id);

      if (existingIndex === -1) {
        return [client, ...prev];
      }

      return prev.map(item => item.id === client.id ? client : item);
    });
  };

  const handleUpdateClientStatus = (id: string, status: Client["status"]) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  // Project modification helpers
  const handleAddProject = async (proj: Omit<DesignProject, "id">) => {
    // If logged in, save to backend db as well
    if (currentUser) {
      await handleSaveToDatabase({
        ...proj,
        componentCode: proj.componentCode || ""
      });
    } else {
      const newProj: DesignProject = {
        ...proj,
        id: "p_" + Date.now()
      };
      setProjects(prev => [newProj, ...prev]);
    }
  };

  const handleEditProject = async (id: string, proj: Omit<DesignProject, "id">) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...proj } : p));

    if (currentUser && id.startsWith("proj_")) {
      try {
        await apiFetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${sessionId}`, "Content-Type": "application/json" },
          body: JSON.stringify(proj)
        });
        setRefreshTrigger(t => t + 1);
      } catch (e) {
        console.error("Failed to persist project edit", e);
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (currentUser && id.startsWith("proj_")) {
      try {
        await apiFetch(`/api/projects/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${sessionId}` }
        });
        setRefreshTrigger(p => p + 1);
      } catch (e) {
        console.error(e);
      }
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateProjectStatus = (id: string, status: DesignProject["status"]) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleUpdateProjectProgress = async (id: string, progress: number) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, progress } : p));

    // If logged in, persist progress to backend
    if (currentUser && id.startsWith("proj_")) {
      try {
        await apiFetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${sessionId}` },
          body: JSON.stringify({ progress })
        });
        setRefreshTrigger(t => t + 1);
      } catch (e) {
        console.error("Failed to persist project progress", e);
      }
    }
  };

  const handleAddWebProject = async (project: Omit<WebProject, "id">) => {
    if (currentUser) {
      try {
        await apiFetch("/api/web-projects", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionId}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(project)
        });
        setRefreshTrigger((prev) => prev + 1);
      } catch (e) {
        console.error("Failed to persist web project", e);
      }
      return;
    }

    const newProject: WebProject = {
      ...project,
      id: "wp_" + Date.now()
    };
    setWebProjects((prev) => [...prev, newProject]);
  };

  const handleEditWebProject = async (id: string, project: Omit<WebProject, "id">) => {
    setWebProjects((prev) => prev.map((item) => item.id === id ? { ...item, ...project } : item));

    if (currentUser) {
      try {
        await apiFetch(`/api/web-projects/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${sessionId}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(project)
        });
        setRefreshTrigger((prev) => prev + 1);
      } catch (e) {
        console.error("Failed to persist web project edit", e);
      }
    }
  };

  const handleDeleteWebProject = async (id: string) => {
    if (currentUser) {
      try {
        await apiFetch(`/api/web-projects/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${sessionId}` }
        });
        setRefreshTrigger((prev) => prev + 1);
      } catch (e) {
        console.error("Failed to delete web project", e);
      }
      return;
    }

    setWebProjects((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateWebProjectStatus = async (id: string, status: WebProject["status"]) => {
    setWebProjects((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));

    if (currentUser) {
      try {
        await apiFetch(`/api/web-projects/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${sessionId}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        });
      } catch (e) {
        console.error("Failed to update web project status", e);
      }
    }
  };

  const handleUpdateWebProjectProgress = async (id: string, progress: number) => {
    setWebProjects((prev) => prev.map((item) => item.id === id ? { ...item, progress } : item));

    if (currentUser) {
      try {
        await apiFetch(`/api/web-projects/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${sessionId}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ progress })
        });
      } catch (e) {
        console.error("Failed to update web project progress", e);
      }
    }
  };

  // Task helpers
  const handleAddTask = async (task: Omit<Task, "id">) => {
    try {
      const data = await apiFetch<{ task: Task }>("/api/tasks", { method: "POST", body: JSON.stringify(task) });
      setTasks(prev => [...prev, { ...data.task, column: data.task.column || task.column }]);
    } catch (e) { console.error("Failed to create task", e); }
  };

  const handleDeleteTask = async (id: string) => {
    try { await apiFetch(`/api/tasks/${id}`, { method: "DELETE" }); setTasks(prev => prev.filter(t => t.id !== id)); }
    catch (e) { console.error("Failed to delete task", e); }
  };

  const handleUpdateTask = async (id: string, changes: Partial<Task>) => {
    try {
      await apiFetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
      setTasks(prev => prev.map(task => task.id === id ? { ...task, ...changes } : task));
    } catch (e) { console.error("Failed to update task", e); }
  };

  const handleUpdateTaskColumn = async (id: string, column: Task["column"]) => {
    try { await apiFetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ column }) }); setTasks(prev => prev.map(t => t.id === id ? { ...t, column } : t)); }
    catch (e) { console.error("Failed to update task", e); }
  };

  // Invoice helpers
  const handleAddInvoice = async (inv: Omit<Invoice, "id">) => {
    try { const data=await apiFetch<{invoice:Invoice}>("/api/invoices",{method:"POST",body:JSON.stringify(inv)}); setInvoices(prev=>[...prev,data.invoice]); }
    catch(e){console.error("Failed to create invoice",e);}
  };

  const handleDeleteInvoice = async (id: string) => {
    try{await apiFetch(`/api/invoices/${id}`,{method:"DELETE"});setInvoices(prev=>prev.filter(i=>i.id!==id));}
    catch(e){console.error("Failed to delete invoice",e);}
  };

  const handleUpdateInvoiceStatus = async (id: string, status: Invoice["status"]) => {
    try {
      await apiFetch(`/api/invoices/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch (e) {
      console.error("Failed to update invoice", e);
      window.alert("No se pudo actualizar el pago. Verifica la conexión con la API.");
    }
  };

  // Link Projects view to AI workspace editor
  const handleLoadCodeToWorkspace = (code: string, name: string) => {
    setActiveCodeToLoad({ code, name });
    setActiveView("figma");
  };

  // Compute stats for dashboard
  const stats = {
    totalClients: clients.length,
    activeProjects: projects.length,
    pendingDesigns: projects.filter(p => p.status === "En Revisión" || p.status === "En Diseño").length,
    totalRevenue: invoices.filter(i => i.status === "Pagado").reduce((acc, curr) => acc + curr.amount, 0),
    revenueGrowth: "+18.4%"
  };

  const pageTitleMap: Record<string, string> = {
    dashboard: "Dashboard",
    clients: "Clientes",
    leads: "Prospectos",
    services: "Servicios",
    billing: "Pagos",
    renewals: "Renovaciones",
    quotes: "Cotizaciones",
    projects: "Proyectos - Desarrollo",
    projects_web: "Proyectos - Páginas Web",
    kanban: "Kanban",
    tasks: "Tareas",
    staff: "Personal",
    credentials: "Credenciales",
    reports: "Reportes",
    users: "Usuarios",
    settings: "Configuración",
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] font-sans flex flex-col md:flex-row text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. NOT LOGGED IN AUTH SCREEN */}
      {!currentUser ? (
        <div className="crm-auth min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#f0f2f5] font-sans">
          
          {/* Left Panel: Sidebar Branding */}
          <div className="lg:w-[35%] xl:w-[30%] bg-[#080f1e] p-5 sm:p-8 lg:p-12 flex flex-col justify-between text-left relative overflow-hidden text-white min-h-[300px] lg:min-h-screen shrink-0">
            {/* Background geometric accents / grids / glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Logo */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex h-14 w-full max-w-[220px] items-center overflow-hidden sm:max-w-[240px] lg:h-16 lg:max-w-[250px]">
                <img src="/desingsgdl-logo.png" alt="DesingsGDL" className="block h-auto w-full max-w-full object-contain object-left mix-blend-screen" />
              </div>
            </div>

            {/* Middle Content */}
            <div className="my-auto py-8 lg:py-0 relative z-10 max-w-md">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Gestión integral para tu agencia digital
              </h1>
              <p className="text-slate-400 text-xs lg:text-sm mt-4 leading-relaxed font-medium">
                Clientes, proyectos, pagos, renovaciones y equipo desde un solo lugar.
              </p>

              {/* Bullet list of features */}
              <div className="mt-10 space-y-5">
                {[
                  { icon: Users, text: "Clientes y prospectos centralizados" },
                  { icon: DollarSign, text: "Control de pagos en MXN" },
                  { icon: Sparkles, text: "Alertas de renovaciones automáticas" },
                  { icon: Layers, text: "Tableros Kanban por área" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#1d63ff]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="text-xs text-slate-500 font-semibold relative z-10 mt-auto pt-6">
              © 2025 Desings Agency · Tijuana, México
            </div>
          </div>

          {/* Right Panel: Content Area with Card */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
            <div className="crm-auth-card bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-10 border border-slate-200/40 w-full max-w-[460px] shadow-xl animate-scale-up text-left">
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Iniciar sesión</h1>
                <p className="text-xs text-slate-400 font-semibold mt-1.5">Accede con tu cuenta corporativa</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-semibold">
                  <label className="block text-slate-400 font-extrabold tracking-widest text-[10px] mb-2 uppercase">CORREO ELECTRÓNICO</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="usuario@desings.mx"
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium text-slate-800"
                    />
                  </div>

                <div>
                  <label className="block text-slate-400 font-extrabold tracking-widest text-[10px] mb-2 uppercase">CONTRASEÑA</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={isLogin ? undefined : 12}
                      maxLength={128}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="flex items-start gap-2 bg-rose-50 text-rose-600 p-3.5 rounded-xl border border-rose-100 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-[11px] font-bold">{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-[#1d63ff] hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-400 text-sm shadow-md"
                >
                  {authLoading ? "Cargando..." : isLogin ? "Ingresar" : "Crear Cuenta"}
                  {!authLoading && <ArrowRight className="w-4 h-4" />}
                </button>

                {import.meta.env.DEV && (
                  <>
                    <div className="relative flex items-center py-4">
                      <div className="flex-grow border-t border-slate-200/60" />
                      <span className="mx-4 flex-shrink text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Acceso rápido por rol
                      </span>
                      <div className="flex-grow border-t border-slate-200/60" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { username: "adriana", displayName: "Adriana", roleName: "Admin General", initials: "AG", bgColor: "bg-[#00b289]" },
                        { username: "jorge", displayName: "Jorge", roleName: "Administración", initials: "JR", bgColor: "bg-[#7c3aed]" },
                        { username: "carlos", displayName: "Carlos", roleName: "Gerente Dev", initials: "CM", bgColor: "bg-[#f59e0b]" },
                        { username: "sofia", displayName: "Sofía", roleName: "Gerente Web", initials: "SR", bgColor: "bg-[#fca5a5]" }
                      ].map((role) => (
                        <button
                          key={role.username}
                          type="button"
                          disabled={authLoading}
                          onClick={() => handleQuickRoleLogin(role.username)}
                          className="group flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white p-3 text-left transition-all hover:bg-slate-50 hover:shadow-sm active:scale-[0.97] disabled:opacity-60"
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${role.bgColor} text-xs font-bold uppercase text-white shadow-sm`}>
                            {role.initials}
                          </div>
                          <div className="min-w-0 text-left">
                            <h4 className="truncate text-xs font-black leading-tight text-slate-800 transition-colors group-hover:text-[#1d63ff]">{role.displayName}</h4>
                            <p className="mt-0.5 truncate text-[10px] font-bold tracking-tight text-slate-400">{role.roleName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

              </form>
            </div>
          </div>
        </div>
      ) : (
        
        // 2. MAIN CRM PANEL WITH PERSISTENT SIDEBAR LAYOUT
        <>
          {/* Mobile responsive Header */}
          <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3.5 flex justify-between items-center w-full sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1d63ff] text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-sm">Desings CRM</span>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Persistent Left Sidebar Navigation */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 h-[100dvh] w-[min(18rem,86vw)] overflow-y-auto bg-[#0c1427] p-4 text-slate-300 flex flex-col justify-between border-r border-slate-800/40 shrink-0 transition-transform duration-300 md:relative md:inset-auto md:h-auto md:min-h-[100dvh] md:w-56 md:self-stretch md:translate-x-0
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}>
            <div>
              {/* Branding and Logo */}
              <div className="flex items-center justify-between mb-6 px-1 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-[150px] max-w-[70%] items-center overflow-hidden">
                    <img src="/desingsgdl-logo.png" alt="DesingsGDL" className="block h-auto w-full object-contain object-left mix-blend-screen" />
                  </div>
                </div>
                {/* Chevron icon as requested by the screenshot design aesthetics */}
                <button className="text-slate-500 hover:text-white transition-colors hidden md:block">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation list matching the screenshot */}
              <div className="space-y-0.5">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === "projects") {
                          setActiveView("projects");
                        } else if (item.id === "projects_web") {
                          setActiveView("projects_web");
                        } else {
                          setActiveView(item.id);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-bold transition-all text-left cursor-pointer
                        ${isActive 
                          ? "bg-[#1d63ff] text-white shadow-lg shadow-[#1d63ff]/20" 
                          : "hover:bg-white/5 hover:text-white text-slate-400"}
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current user session footer inside Sidebar */}
            <div className="border-t border-slate-800/60 pt-3 mt-5 shrink-0">
              <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#00b289] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser.username === "adriana" ? "AG" : currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs font-black text-white truncate leading-tight">
                      {currentUser.username === "adriana" ? "Adriana García" : currentUser.username}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-tight">
                      {currentUser.role || "Admin General"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Status Indicator */}
              <div className="mt-3 flex items-center justify-start text-[10px] text-slate-500 font-mono px-1">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Cerrar sesión</span>
                </button>
                <span className="hidden items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>
            </div>
          </aside>

          {/* Core Content Container layout */}
          <main
            className={`crm-main min-w-0 flex-1 min-h-screen overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-8 flex flex-col justify-between w-full ${
              activeView === "services" ||
              activeView === "leads" ||
              activeView === "clients" ||
              activeView === "billing" ||
              activeView === "renewals" ||
              activeView === "quotes" ||
              activeView === "tasks" ||
              activeView === "staff" ||
              activeView === "credentials" ||
              activeView === "reports" ||
              activeView === "users" ||
              activeView === "settings"
                ? "max-w-none"
                : activeView === "projects" || activeView === "projects_web" || activeView === "kanban"
                  ? "max-w-none"
                  : "max-w-7xl mx-auto"
            }`}
          >
            
            {/* Desktop Top Header (matching the exact figma design style) */}
            <header className="hidden md:flex justify-between items-center pb-6 mb-6 border-b border-slate-200/80 w-full">
              {/* Left Side: Page Title and Search Input */}
              <div className="flex items-center gap-6">
                <h1 className="text-lg font-black text-slate-800 capitalize tracking-tight">
                  {pageTitleMap[activeView] || activeView}
                </h1>
                
                {/* Search Bar */}
                <div className="relative w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-4 py-1.5 text-[11px] font-semibold bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              {/* Right Side: Clock, Notification and User Avatar Badge */}
              <div className="flex items-center gap-4">
                {/* Clock Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f4f9] border border-slate-100 rounded-xl text-[11px] font-bold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentTime || "10:00"}</span>
                </div>

                {/* Notifications Bell */}
                <NotificationCenter
                  clients={clients}
                  tasks={tasks}
                  username={currentUser.username}
                  onNavigate={setActiveView}
                />

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200" />

                {/* Profile Badge */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#00b289] text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0">
                    {currentUser.username === "adriana" ? "AG" : currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-800 leading-none">
                      {currentUser.username === "adriana" ? "Adriana" : currentUser.username}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5 block tracking-tight">
                      {currentUser.role || "Admin General"}
                    </span>
                  </div>
                </div>
              </div>
            </header>
            
            {/* Display Active Sub-view */}
            <div className="crm-content min-w-0 flex-1 pb-12">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="text-xs text-stone-500 font-bold">Cargando módulo...</span>
                  </div>
                </div>
              }>
                {activeView === "dashboard" && (
                  <CRMDashboard 
                    stats={stats} 
                    recentProjects={projects.slice(0, 3)} 
                    onNavigateToView={(view) => setActiveView(view)} 
                  />
                )}
                {activeView === "clients" && (
                  <CRMClients 
                    clients={clients} 
                    onClientsLoaded={setClients}
                    onClientSaved={handleUpsertClient}
                    onDeleteClient={handleDeleteClient} 
                  />
                )}
                {activeView === "leads" && (
                  <CRMLeads />
                )}
                {activeView === "projects" && (
                  <CRMProjects 
                    projects={projects} 
                    clients={clients} 
                    onAddProject={handleAddProject} 
                    onDeleteProject={handleDeleteProject} 
                    onUpdateProjectStatus={handleUpdateProjectStatus}
                    onLoadCodeToWorkspace={handleLoadCodeToWorkspace}
                    onUpdateProjectProgress={handleUpdateProjectProgress}
                    onEditProject={handleEditProject}
                  />
                )}
                {activeView === "projects_web" && (
                  <CRMWebProjects
                    projects={webProjects}
                    clients={clients}
                    onAddProject={handleAddWebProject}
                    onDeleteProject={handleDeleteWebProject}
                    onEditProject={handleEditWebProject}
                    onUpdateProjectStatus={handleUpdateWebProjectStatus}
                    onUpdateProjectProgress={handleUpdateWebProjectProgress}
                  />
                )}
                {activeView === "kanban" && (
                  <CRMKanban />
                )}
                {activeView === "tasks" && (
                  <CRMTasks 
                    tasks={tasks} 
                    projects={[
                      ...projects.map((project) => ({ id: project.id, name: project.name, type: "dev" as const })),
                      ...webProjects.map((project) => ({ id: project.id, name: project.name, type: "web" as const }))
                    ]}
                    onAddTask={handleAddTask} 
                     onDeleteTask={handleDeleteTask} 
                     onUpdateTask={handleUpdateTask}
                     onUpdateTaskColumn={handleUpdateTaskColumn} 
                  />
                )}
                {activeView === "billing" && (
                  <CRMBilling 
                    invoices={invoices} 
                    clients={clients} 
                    onAddInvoice={handleAddInvoice} 
                    onDeleteInvoice={handleDeleteInvoice} 
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus} 
                  />
                )}
                {activeView === "services" && (
                  <CRMServices />
                )}
                {activeView === "renewals" && (
                  <CRMRenewals />
                )}
                {activeView === "quotes" && (
                  <CRMQuotes canCreate={canPerform("quotes","create")} canEdit={canPerform("quotes","edit")} canDelete={canPerform("quotes","delete")} canExport={canPerform("quotes","export")} />
                )}
                {activeView === "staff" && (
                  <CRMStaff />
                )}
                {activeView === "credentials" && (
                  <CRMCredentials />
                )}
                {activeView === "reports" && (
                  <CRMReports />
                )}
                {activeView === "users" && (
                  <CRMUsers />
                )}
                {activeView === "settings" && (
                  <CRMSettings />
                )}
                {activeView === "figma" && (
                  <CRMFigmaWorkspace 
                    onSaveToDatabase={handleSaveToDatabase} 
                    isLoggedIn={!!currentUser} 
                    activeCodeToLoad={activeCodeToLoad}
                    onClearActiveCode={() => setActiveCodeToLoad(null)}
                  />
                )}
              </Suspense>
            </div>


          </main>
        </>
      )}

    </div>
  );
}
