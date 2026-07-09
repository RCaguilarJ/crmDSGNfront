import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Parse JSON bodies
app.use(express.json());

// Initialize Gemini client safely (only if key is available)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Simple JSON DB Interface
interface SavedProject {
  id: string;
  name: string;
  description: string;
  figmaNode?: string;
  tailwindClasses?: string;
  componentCode?: string;
  createdAt: string;
}

interface SavedWebProject {
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
  createdAt: string;
}

interface User {
  username: string;
  passwordHash: string;
  salt: string;
  projects: SavedProject[];
  webProjects?: SavedWebProject[];
}

interface Database {
  users: { [username: string]: User };
  sessions: { [sessionId: string]: string }; // sessionId -> username
}

// Seed helper to initialize DB
function getInitialProjects(): SavedProject[] {
  return [
    {
      id: "proj_1",
      name: "Dashboard de Análisis Financiero",
      description: "Replica de Figma de un panel de métricas con KPI bento, tablas y gráficos responsivos.",
      figmaNode: "Figma Frame: #1203:402",
      tailwindClasses: "grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-slate-900 rounded-2xl",
      createdAt: new Date().toISOString(),
      componentCode: `import React from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingBag, Percent } from "lucide-react";

export default function FinancialDashboard() {
  const stats = [
    { label: "Revenue", value: "$48,259.00", change: "+12.5%", isPositive: true, icon: DollarSign, color: "from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20" },
    { label: "Active Users", value: "10,249", change: "+4.3%", isPositive: true, icon: Users, color: "from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/20" },
    { label: "Sales count", value: "3,102", change: "-2.1%", isPositive: false, icon: ShoppingBag, color: "from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20" },
    { label: "Conversion", value: "24.15%", change: "+0.8%", isPositive: true, icon: Percent, color: "from-violet-500/10 to-purple-500/10 text-violet-400 border-violet-500/20" }
  ];

  return (
    <div className="w-full min-h-[500px] bg-slate-950 text-slate-100 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase">Métricas Principales</span>
          <h1 className="text-3xl font-bold tracking-tight mt-1 text-white">Dashboard Corporativo</h1>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white shadow-sm transition-all">Este Mes</button>
          <button className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-all">Último Trimestre</button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-400 font-medium">{stat.label}</span>
              <div className={\`p-2.5 rounded-xl border \${stat.color}\`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={\`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 \${
                  stat.isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }\`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {stat.change}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">vs mes anterior</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-white">Rendimiento Histórico</h3>
            <span className="text-xs text-indigo-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Tendencia alcista
            </span>
          </div>
          <div className="h-48 flex items-end gap-3 pt-6 border-b border-slate-800">
            {[45, 60, 55, 70, 65, 85, 80, 95, 90, 110, 105, 120].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md group-hover:from-indigo-400 group-hover:to-cyan-400 transition-all duration-300" 
                  style={{ height: \`\${(val / 120) * 100}%\` }}
                />
                <span className="text-[10px] text-slate-500 font-mono group-hover:text-slate-300 transition-all">{['E','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">Presupuesto Ejecutado</h3>
            <p className="text-xs text-slate-400 mb-6">Distribución porcentual de los fondos operativos de este periodo.</p>
          </div>
          <div className="relative flex items-center justify-center py-4">
            <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-t-indigo-500 border-r-cyan-400 border-l-violet-500 border-b-transparent animate-spin-slow" />
              <div className="text-center">
                <span className="text-2xl font-bold text-white">74.2%</span>
                <p className="text-[10px] text-slate-500 font-medium">Consumido</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Operaciones</span>
              <span className="font-semibold text-white">45%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Marketing</span>
              <span className="font-semibold text-white">29.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    },
    {
      id: "proj_2",
      name: "Bento Layout Hero Section",
      description: "Sección hero con estilo bento moderno, gradientes refinados y tipografía contrastante.",
      figmaNode: "Figma Frame: #88:210",
      tailwindClasses: "max-w-6xl mx-auto px-4 py-16 text-center font-sans",
      createdAt: new Date().toISOString(),
      componentCode: `import React from "react";
import { ArrowRight, Sparkles, Shield, Cpu, Compass } from "lucide-react";

export default function BentoHeroSection() {
  return (
    <div className="w-full bg-stone-50 text-stone-900 py-16 px-6 md:px-12 rounded-3xl border border-stone-200 shadow-xl font-sans">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Figma Design Replicated
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-950 mb-6 leading-[1.1]">
          Recrea Experiencias <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">Impecables</span>
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Diseños de alta fidelidad exportados directamente desde tu lienzo de Figma a código React interactivo con Tailwind CSS.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-md">
            Comenzar Ahora <ArrowRight className="w-4 h-4" />
          </button>
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-stone-800 border border-stone-200 font-semibold text-sm hover:bg-stone-50 transition-all">
            Ver Plantillas
          </button>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 self-start mb-6">
            <Cpu className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Componentes Altamente Escalables</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Generados para encajar en cualquier arquitectura moderna de React. Con props limpias, TypeScript robusto y clases de Tailwind adaptables.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-8 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-white/15 rounded-xl self-start mb-6">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Autenticación Integrada</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Soporte nativo para inicio de sesión, permitiendo a tu equipo guardar y compartir componentes de Figma replicados de manera segura.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm md:col-span-3 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-md transition-all">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 self-start">
              <Compass className="w-6 h-6 text-stone-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Responsive Ready</h3>
              <p className="text-sm text-stone-600 mt-1">
                Visualiza cómo reacciona tu diseño en smartphones, tablets y pantallas de escritorio grandes al instante.
              </p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-lg bg-stone-100 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-all whitespace-nowrap self-start md:self-auto">
            Configurar Breakpoints
          </button>
        </div>
      </div>
    </div>
  );
}`,
    }
  ];
}

function getInitialWebProjects(): SavedWebProject[] {
  return [
    {
      id: "wp_1",
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
      description: "Sitio institucional con blog y formularios médicos.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "wp_2",
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
      description: "Landing promocional para reservas y menú.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "wp_3",
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
      description: "Portal de cursos y captación.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "wp_4",
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
      description: "Sitio corporativo para despacho legal.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "wp_5",
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
      description: "Catálogo web de servicios automotrices.",
      createdAt: new Date().toISOString(),
    },
  ];
}

function createUserHelper(
  uname: string,
  pword: string,
  projects: SavedProject[] = [],
  webProjects: SavedWebProject[] = [],
): User {
  const s = crypto.randomBytes(16).toString("hex");
  const h = crypto
    .createHash("sha256")
    .update(pword + s)
    .digest("hex");
  return {
    username: uname,
    passwordHash: h,
    salt: s,
    projects,
    webProjects,
  };
}

function initDatabase(): Database {
  const seedUsers = ["demo", "adriana", "jorge", "carlos", "sofia"];
  const initialProjects = getInitialProjects();
  const initialWebProjects = getInitialWebProjects();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content) as Database;
      if (!parsed.users) parsed.users = {};
      if (!parsed.sessions) parsed.sessions = {};
      
      let changed = false;
      for (const username of seedUsers) {
        if (!parsed.users[username]) {
          parsed.users[username] = createUserHelper(username, "demo", initialProjects, initialWebProjects);
          changed = true;
        } else if (!Array.isArray(parsed.users[username].webProjects)) {
          parsed.users[username].webProjects = initialWebProjects;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
      }
      return parsed;
    } catch (e) {
      console.error("Error reading database, creating a new one", e);
    }
  }

  const defaultDb: Database = {
    users: {},
    sessions: {},
  };

  // Seed default users (demo, adriana, jorge, carlos, sofia) with password 'demo'
  for (const username of seedUsers) {
    defaultDb.users[username] = createUserHelper(username, "demo", initialProjects, initialWebProjects);
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
  return defaultDb;
}

// Global Database reference
let db = initDatabase();

// Helper to save DB
function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("Failed to save database file:", e);
  }
}

// Auth Middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Token faltante." });
  }

  const sessionId = authHeader.substring(7);
  const username = db.sessions[sessionId];

  if (!username || !db.users[username]) {
    return res.status(401).json({ error: "Sesión inválida o expirada." });
  }

  (req as any).username = username;
  (req as any).user = db.users[username];
  next();
}

// --- API ROUTES ---

// Auth Signup
app.post("/api/auth/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  const normalizedUser = username.trim().toLowerCase();
  if (db.users[normalizedUser]) {
    return res.status(400).json({ error: "El usuario ya existe" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");

  db.users[normalizedUser] = {
    username: normalizedUser,
    passwordHash,
    salt,
    projects: [],
    webProjects: [],
  };

  // Auto login on signup
  const sessionId = crypto.randomBytes(24).toString("hex");
  db.sessions[sessionId] = normalizedUser;
  saveDb();

  res.json({
    success: true,
    user: { 
      username: normalizedUser, 
      projectsCount: 0,
      role: normalizedUser === "adriana" ? "Admin General" : (normalizedUser === "jorge" ? "Administración" : (normalizedUser === "carlos" ? "Gerente Dev" : (normalizedUser === "sofia" ? "Gerente Web" : "Colaborador")))
    },
    sessionId,
  });
});

// Auth Login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  const normalizedUser = username.trim().toLowerCase();
  const user = db.users[normalizedUser];

  if (!user) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const checkHash = crypto
    .createHash("sha256")
    .update(password + user.salt)
    .digest("hex");

  if (checkHash !== user.passwordHash) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const sessionId = crypto.randomBytes(24).toString("hex");
  db.sessions[sessionId] = normalizedUser;
  saveDb();

  res.json({
    success: true,
    user: { 
      username: normalizedUser, 
      projectsCount: user.projects.length + (user.webProjects?.length || 0),
      role: normalizedUser === "adriana" ? "Admin General" : (normalizedUser === "jorge" ? "Administración" : (normalizedUser === "carlos" ? "Gerente Dev" : (normalizedUser === "sofia" ? "Gerente Web" : "Colaborador")))
    },
    sessionId,
  });
});

// Auth Get Me
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ user: null });
  }

  const sessionId = authHeader.substring(7);
  const username = db.sessions[sessionId];
  const user = username ? db.users[username] : null;

  if (!user) {
    return res.json({ user: null });
  }

  res.json({
    user: {
      username: user.username,
      projectsCount: user.projects.length + (user.webProjects?.length || 0),
      role: user.username === "adriana" ? "Admin General" : (user.username === "jorge" ? "Administración" : (user.username === "carlos" ? "Gerente Dev" : (user.username === "sofia" ? "Gerente Web" : "Colaborador")))
    },
  });
});

// Get User Projects
app.get("/api/projects", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  res.json({ projects: user.projects });
});

// Create/Save Project
app.post("/api/projects", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { name, description, figmaNode, tailwindClasses, componentCode } = req.body;

  if (!name) {
    return res.status(400).json({ error: "El nombre del proyecto es obligatorio" });
  }

  const newProject: SavedProject = {
    id: "proj_" + Date.now(),
    name,
    description: description || "",
    figmaNode: figmaNode || "",
    tailwindClasses: tailwindClasses || "",
    componentCode: componentCode || "",
    createdAt: new Date().toISOString(),
  };

  user.projects.unshift(newProject);
  saveDb();

  res.json({ success: true, project: newProject });
});

// Delete Project
app.delete("/api/projects/:id", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const projectId = req.params.id;

  const initialLength = user.projects.length;
  user.projects = user.projects.filter((p) => p.id !== projectId);

  if (user.projects.length === initialLength) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }

  saveDb();
  res.json({ success: true });
});

// Update Project
app.patch("/api/projects/:id", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const projectId = req.params.id;
  const project = user.projects.find((item) => item.id === projectId);

  if (!project) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }

  const { name, description, figmaNode, tailwindClasses, componentCode } = req.body;

  if (typeof name === "string") project.name = name;
  if (typeof description === "string") project.description = description;
  if (typeof figmaNode === "string") project.figmaNode = figmaNode;
  if (typeof tailwindClasses === "string") project.tailwindClasses = tailwindClasses;
  if (typeof componentCode === "string") project.componentCode = componentCode;

  saveDb();
  res.json({ success: true, project });
});

// Get User Web Projects
app.get("/api/web-projects", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  res.json({ projects: user.webProjects || [] });
});

// Create Web Project
app.post("/api/web-projects", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const {
    name,
    clientName,
    manager,
    designer,
    builder,
    startDate,
    dueDate,
    progress,
    status,
    priority,
    description,
  } = req.body;

  if (!name || !clientName || !manager || !designer || !builder) {
    return res.status(400).json({ error: "Faltan campos obligatorios del proyecto web." });
  }

  if (!Array.isArray(user.webProjects)) {
    user.webProjects = [];
  }

  const newProject: SavedWebProject = {
    id: "wp_" + Date.now(),
    name,
    clientName,
    manager,
    designer,
    builder,
    startDate: startDate || new Date().toISOString().split("T")[0],
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    progress: typeof progress === "number" ? progress : 0,
    status: status || "Diseño inicial",
    priority: priority || "Media",
    description: description || "",
    createdAt: new Date().toISOString(),
  };

  user.webProjects.unshift(newProject);
  saveDb();

  res.json({ success: true, project: newProject });
});

// Update Web Project
app.patch("/api/web-projects/:id", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const projectId = req.params.id;
  const project = (user.webProjects || []).find((item) => item.id === projectId);

  if (!project) {
    return res.status(404).json({ error: "Proyecto web no encontrado" });
  }

  const fields: Array<keyof SavedWebProject> = [
    "name",
    "clientName",
    "manager",
    "designer",
    "builder",
    "startDate",
    "dueDate",
    "status",
    "priority",
    "description",
  ];

  for (const field of fields) {
    if (typeof req.body[field] === "string") {
      (project[field] as string) = req.body[field];
    }
  }

  if (typeof req.body.progress === "number") {
    project.progress = req.body.progress;
  }

  saveDb();
  res.json({ success: true, project });
});

// Delete Web Project
app.delete("/api/web-projects/:id", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const projectId = req.params.id;

  if (!Array.isArray(user.webProjects)) {
    user.webProjects = [];
  }

  const initialLength = user.webProjects.length;
  user.webProjects = user.webProjects.filter((item) => item.id !== projectId);

  if (user.webProjects.length === initialLength) {
    return res.status(404).json({ error: "Proyecto web no encontrado" });
  }

  saveDb();
  res.json({ success: true });
});

// AI Figma Code Generator Endpoint (Uses Gemini 3.5 Flash)
app.post("/api/generate-component", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "El prompt descriptivo es requerido." });
  }

  if (!ai) {
    return res.status(503).json({
      error: "El servicio de Inteligencia Artificial de Google Gemini no está configurado aún. Por favor asegúrate de que GEMINI_API_KEY esté configurada en los Secrets de la app.",
    });
  }

  try {
    const systemInstruction = `Eres un experto internacional en Figma y frontend React con Tailwind CSS.
Recibirás un prompt en español que describe un elemento de diseño, una sección, o una replica de Figma. Tu objetivo es generar una respuesta JSON que contenga código React puro de un componente moderno, estético y responsive.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "name": "NombreDeComponenteEnPascalCase",
  "explanation": "Breve explicación en español de los breakpoints responsivos, animaciones y elecciones estéticas usadas en el diseño.",
  "code": "El código completo de React. El componente debe ser self-contained, importar los iconos de 'lucide-react' explícitamente en la cabecera (por ejemplo: import { ArrowRight, Star } from 'lucide-react';) y usar la exportación por defecto (export default function ...)."
}

Reglas estrictas de diseño y código:
1. No utilices librerías de diseño adicionales excepto 'lucide-react' para los iconos.
2. Utiliza exclusivamente clases de Tailwind CSS v4 para el estilo (gradientes refinados, bordes sutiles, espaciados generosos, fondos satinados de cristaleria). Evita estilos en línea o CSS plano.
3. El componente debe ser perfectamente responsivo (adaptándose desde móviles hasta escritorio usando prefijos sm:, md:, lg:).
4. El código debe ser ejecutable directamente como un componente React (sin dependencias extrañas ni props requeridas).
5. Escapa correctamente las comillas y saltos de línea para que el JSON sea válido. No agregues bloques de markdown como \`\`\`json fuera de la estructura.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Genera un componente React para el siguiente diseño: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            explanation: { type: Type.STRING },
            code: { type: Type.STRING },
          },
          required: ["name", "explanation", "code"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No se recibió contenido de texto desde Gemini.");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating component with Gemini:", error);
    res.status(500).json({
      error: "Ocurrió un error al procesar tu solicitud con la IA.",
      details: error.message || error,
    });
  }
});

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API server running successfully." });
});

// Setup Vite & Static Assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
