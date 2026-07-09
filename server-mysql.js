/**
 * ====================================================================
 * BACKEND NODE.JS + EXPRESS CON CONECTOR MYSQL (WAMP STACK / PHPMYADMIN)
 * DESIGNS CRM - AGENCIA PIXEL PERFECT
 * ====================================================================
 * 
 * Este archivo está preparado para que puedas descargar el proyecto y correrlo
 * localmente en Visual Studio Code. Utiliza el módulo 'mysql2' para conectarse
 * a tu servidor WAMP (MySQL / MariaDB) utilizando phpMyAdmin.
 * 
 * INSTRUCCIONES DE USO EN VS CODE:
 * 1. Instala las dependencias necesarias:
 *    npm install express mysql2 dotenv cors
 * 
 * 2. Asegúrate de iniciar WAMP Server (Apache y MySQL activos).
 * 
 * 3. Importa el archivo 'database.sql' en tu phpMyAdmin para crear la BD y cargar los datos semilla.
 * 
 * 4. Crea o edita tu archivo '.env' con los siguientes campos:
 *    PORT=3000
 *    DB_HOST=localhost
 *    DB_USER=root
 *    DB_PASSWORD=
 *    DB_NAME=designs_crm
 *    GEMINI_API_KEY=tu_api_key_de_google_gemini
 * 
 * 5. Ejecuta este backend usando:
 *    node server-mysql.js
 */

const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS y lectura de cuerpos JSON
app.use(cors());
app.use(express.json());

// Configuración del Pool de Conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "designs_crm",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4_unicode_ci"
});

const WEB_PROJECTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS web_projects (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  client_name VARCHAR(150) NOT NULL,
  manager VARCHAR(100) NOT NULL,
  designer VARCHAR(100) NOT NULL,
  builder VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  status ENUM('Diseño inicial', 'Carga de contenido', 'Revisión cliente', 'Publicado', 'Maquetación') NOT NULL DEFAULT 'Diseño inicial',
  priority ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function ensureWebProjectsSchema() {
  await pool.execute(WEB_PROJECTS_TABLE_SQL);

  const seedRows = [
    ["wp_1_demo", "demo", "Sitio Web Clínica Médica", "Clínica Médica", "Sofía", "Valeria", "Luis", "2024-12-01", "2025-01-25", 95, "Revisión cliente", "Alta", "Sitio institucional con blog y formularios médicos."],
    ["wp_2_demo", "demo", "Landing Restaurante El Fogón", "Restaurante El", "Sofía", "Valeria", "Luis", "2024-12-15", "2025-02-01", 70, "Carga de contenido", "Media", "Landing promocional para reservas y menú."],
    ["wp_3_demo", "demo", "Portal Academia Luminar", "Academia de", "Luis", "Valeria", "Sofía", "2025-01-05", "2025-03-05", 20, "Diseño inicial", "Media", "Portal de cursos y captación."],
    ["wp_4_demo", "demo", "Web Despacho Montoya", "Despacho Jurídico", "Sofía", "Valeria", "Luis", "2024-11-20", "2025-01-10", 100, "Publicado", "Baja", "Sitio corporativo para despacho legal."],
    ["wp_5_demo", "demo", "Portafolio Taller Express", "Taller Automotriz", "Luis", "Valeria", "Sofía", "2024-12-10", "2025-01-30", 45, "Maquetación", "Baja", "Catálogo web de servicios automotrices."],
    ["wp_1_adriana", "adriana", "Sitio Web Clínica Médica", "Clínica Médica", "Sofía", "Valeria", "Luis", "2024-12-01", "2025-01-25", 95, "Revisión cliente", "Alta", "Sitio institucional con blog y formularios médicos."],
    ["wp_2_adriana", "adriana", "Landing Restaurante El Fogón", "Restaurante El", "Sofía", "Valeria", "Luis", "2024-12-15", "2025-02-01", 70, "Carga de contenido", "Media", "Landing promocional para reservas y menú."],
    ["wp_3_adriana", "adriana", "Portal Academia Luminar", "Academia de", "Luis", "Valeria", "Sofía", "2025-01-05", "2025-03-05", 20, "Diseño inicial", "Media", "Portal de cursos y captación."],
    ["wp_4_adriana", "adriana", "Web Despacho Montoya", "Despacho Jurídico", "Sofía", "Valeria", "Luis", "2024-11-20", "2025-01-10", 100, "Publicado", "Baja", "Sitio corporativo para despacho legal."],
    ["wp_5_adriana", "adriana", "Portafolio Taller Express", "Taller Automotriz", "Luis", "Valeria", "Sofía", "2024-12-10", "2025-01-30", 45, "Maquetación", "Baja", "Catálogo web de servicios automotrices."]
  ];

  await pool.query(
    `INSERT IGNORE INTO web_projects
      (id, username, name, client_name, manager, designer, builder, start_date, due_date, progress, status, priority, description)
     VALUES ?`,
    [seedRows]
  );
}

// Probar conexión a la base de datos al arrancar
(async () => {
  try {
    const connection = await pool.getConnection();
    await ensureWebProjectsSchema();
    console.log("✅ Conexión exitosa a la base de datos de phpMyAdmin (MySQL)");
    connection.release();
  } catch (error) {
    console.error("❌ Error conectando a la base de datos de WAMP (phpMyAdmin):");
    console.error(error.message);
    console.log("👉 Asegúrate de que WAMP Server esté encendido, que creaste la base de datos 'designs_crm' y que importaste 'database.sql'.");
  }
})();

// Helper para cifrar contraseñas (SHA256 con Salt)
function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

// ====================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ====================================================================
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Token faltante." });
  }

  // En el entorno local simplificado, el token Bearer representa el 'username'
  const token = authHeader.substring(7);
  
  try {
    const [rows] = await pool.execute(
      "SELECT username, role FROM users WHERE username = ?", 
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Sesión inválida o expirada." });
    }

    req.username = rows[0].username;
    req.role = rows[0].role;
    next();
  } catch (err) {
    res.status(500).json({ error: "Error de validación de sesión.", details: err.message });
  }
}

// ====================================================================
// ENDPOINTS DE AUTENTICACIÓN (LOGIN & SIGNUP)
// ====================================================================

// Registro de Usuario Nuevo
app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  const normalizedUser = username.trim().toLowerCase();

  try {
    // Verificar si el usuario ya existe
    const [existing] = await pool.execute(
      "SELECT username FROM users WHERE username = ?",
      [normalizedUser]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe en la base de datos." });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const defaultRole = normalizedUser === "adriana" ? "Admin General" : "Colaborador";

    // Insertar en MySQL
    await pool.execute(
      "INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)",
      [normalizedUser, passwordHash, salt, defaultRole]
    );

    res.json({
      success: true,
      user: {
        username: normalizedUser,
        projectsCount: 0,
        role: defaultRole
      },
      sessionId: normalizedUser // En local usamos el mismo username como token simplificado
    });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: "Error interno al crear usuario.", details: err.message });
  }
});

// Inicio de Sesión
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  const normalizedUser = username.trim().toLowerCase();

  try {
    const [users] = await pool.execute(
      "SELECT username, password_hash, salt, role FROM users WHERE username = ?",
      [normalizedUser]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const dbUser = users[0];
    const checkHash = hashPassword(password, dbUser.salt);

    if (checkHash !== dbUser.password_hash) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    // Contar proyectos creados por el usuario
    const [projectCountRows] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM projects WHERE username = ?) +
         (SELECT COUNT(*) FROM web_projects WHERE username = ?) as count`,
      [normalizedUser, normalizedUser]
    );
    const projectsCount = projectCountRows[0].count;

    res.json({
      success: true,
      user: {
        username: dbUser.username,
        projectsCount,
        role: dbUser.role
      },
      sessionId: dbUser.username // Token simplificado para agilizar el desarrollo local
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno al iniciar sesión.", details: err.message });
  }
});

// Obtener Estado de Sesión Actual
app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ user: null });
  }

  const token = authHeader.substring(7);

  try {
    const [users] = await pool.execute(
      "SELECT username, role FROM users WHERE username = ?",
      [token]
    );

    if (users.length === 0) {
      return res.json({ user: null });
    }

    const dbUser = users[0];
    const [projectCountRows] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM projects WHERE username = ?) +
         (SELECT COUNT(*) FROM web_projects WHERE username = ?) as count`,
      [dbUser.username, dbUser.username]
    );
    const projectsCount = projectCountRows[0].count;

    res.json({
      user: {
        username: dbUser.username,
        projectsCount,
        role: dbUser.role
      }
    });
  } catch (err) {
    res.json({ user: null, error: err.message });
  }
});


// ====================================================================
// ENDPOINTS DE PROYECTOS (SQL INTEGRADO)
// ====================================================================

// Obtener Proyectos del Usuario Conectado
app.get("/api/projects", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, description, figma_node as figmaNode, tailwind_classes as tailwindClasses, component_code as componentCode, created_at as createdAt FROM projects WHERE username = ? ORDER BY created_at DESC",
      [req.username]
    );
    res.json({ projects: rows });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener proyectos de MySQL.", details: err.message });
  }
});

// Crear o Guardar un Proyecto en MySQL
app.post("/api/projects", requireAuth, async (req, res) => {
  const { name, description, figmaNode, tailwindClasses, componentCode } = req.body;

  if (!name) {
    return res.status(400).json({ error: "El nombre del proyecto es obligatorio." });
  }

  const newId = "proj_" + Date.now();
  const dateIso = new Date().toISOString();

  try {
    await pool.execute(
      "INSERT INTO projects (id, name, description, figma_node, tailwind_classes, component_code, username, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        newId,
        name,
        description || "",
        figmaNode || "",
        tailwindClasses || "",
        componentCode || "",
        req.username,
        dateIso.slice(0, 19).replace('T', ' ') // Formatear para tipo TIMESTAMP de MySQL
      ]
    );

    res.json({
      success: true,
      project: {
        id: newId,
        name,
        description,
        figmaNode,
        tailwindClasses,
        componentCode,
        createdAt: dateIso
      }
    });
  } catch (err) {
    console.error("Error al guardar proyecto:", err);
    res.status(500).json({ error: "No se pudo guardar el proyecto en phpMyAdmin.", details: err.message });
  }
});

// Eliminar un Proyecto de MySQL
app.delete("/api/projects/:id", requireAuth, async (req, res) => {
  const projectId = req.params.id;

  try {
    const [result] = await pool.execute(
      "DELETE FROM projects WHERE id = ? AND username = ?",
      [projectId, req.username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado o no pertenece a tu cuenta." });
    }

    res.json({ success: true, message: "Proyecto eliminado correctamente de phpMyAdmin." });
  } catch (err) {
    res.status(500).json({ error: "No se pudo eliminar el proyecto de la base de datos.", details: err.message });
  }
});

// Actualizar un Proyecto de MySQL
app.patch("/api/projects/:id", requireAuth, async (req, res) => {
  const projectId = req.params.id;
  const { name, description, figmaNode, tailwindClasses, componentCode } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE projects
       SET
         name = COALESCE(?, name),
         description = COALESCE(?, description),
         figma_node = COALESCE(?, figma_node),
         tailwind_classes = COALESCE(?, tailwind_classes),
         component_code = COALESCE(?, component_code)
       WHERE id = ? AND username = ?`,
      [
        typeof name === "string" ? name : null,
        typeof description === "string" ? description : null,
        typeof figmaNode === "string" ? figmaNode : null,
        typeof tailwindClasses === "string" ? tailwindClasses : null,
        typeof componentCode === "string" ? componentCode : null,
        projectId,
        req.username
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado o no pertenece a tu cuenta." });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo actualizar el proyecto.", details: err.message });
  }
});

// Obtener Proyectos Web del Usuario Conectado
app.get("/api/web-projects", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        name,
        client_name as clientName,
        manager,
        designer,
        builder,
        DATE_FORMAT(start_date, '%Y-%m-%d') as startDate,
        DATE_FORMAT(due_date, '%Y-%m-%d') as dueDate,
        progress,
        status,
        priority,
        description
      FROM web_projects
      WHERE username = ?
      ORDER BY created_at DESC`,
      [req.username]
    );
    res.json({ projects: rows });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener proyectos web de MySQL.", details: err.message });
  }
});

// Crear Proyecto Web
app.post("/api/web-projects", requireAuth, async (req, res) => {
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
    description
  } = req.body;

  if (!name || !clientName || !manager || !designer || !builder) {
    return res.status(400).json({ error: "Faltan campos obligatorios del proyecto web." });
  }

  const newId = "wp_" + Date.now();

  try {
    await pool.execute(
      `INSERT INTO web_projects
        (id, username, name, client_name, manager, designer, builder, start_date, due_date, progress, status, priority, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        req.username,
        name,
        clientName,
        manager,
        designer,
        builder,
        startDate || new Date().toISOString().split("T")[0],
        dueDate || new Date().toISOString().split("T")[0],
        typeof progress === "number" ? progress : 0,
        status || "Diseño inicial",
        priority || "Media",
        description || ""
      ]
    );

    res.json({ success: true, project: { id: newId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: "No se pudo guardar el proyecto web.", details: err.message });
  }
});

// Actualizar Proyecto Web
app.patch("/api/web-projects/:id", requireAuth, async (req, res) => {
  const projectId = req.params.id;
  const updates = [];
  const values = [];

  const fieldMap = {
    name: "name",
    clientName: "client_name",
    manager: "manager",
    designer: "designer",
    builder: "builder",
    startDate: "start_date",
    dueDate: "due_date",
    progress: "progress",
    status: "status",
    priority: "priority",
    description: "description"
  };

  for (const [payloadKey, columnName] of Object.entries(fieldMap)) {
    if (req.body[payloadKey] !== undefined) {
      updates.push(`${columnName} = ?`);
      values.push(req.body[payloadKey]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No hay campos para actualizar." });
  }

  values.push(projectId, req.username);

  try {
    const [result] = await pool.execute(
      `UPDATE web_projects
       SET ${updates.join(", ")}
       WHERE id = ? AND username = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proyecto web no encontrado o no pertenece a tu cuenta." });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo actualizar el proyecto web.", details: err.message });
  }
});

// Eliminar Proyecto Web
app.delete("/api/web-projects/:id", requireAuth, async (req, res) => {
  const projectId = req.params.id;

  try {
    const [result] = await pool.execute(
      "DELETE FROM web_projects WHERE id = ? AND username = ?",
      [projectId, req.username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proyecto web no encontrado o no pertenece a tu cuenta." });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo eliminar el proyecto web.", details: err.message });
  }
});


// ====================================================================
// PROXY DE INTELIGENCIA ARTIFICIAL (GEMINI 3.5 FLASH)
// ====================================================================
app.post("/api/generate-component", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "El prompt descriptivo es requerido." });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return res.status(503).json({
      error: "El servicio de Inteligencia Artificial de Google Gemini no está configurado localmente. Por favor configura GEMINI_API_KEY en tu archivo '.env'."
    });
  }

  try {
    // Importación dinámica segura del SDK moderno de Google GenAI
    // para correr perfectamente tanto en CJS como en ESM en VS Code.
    const { GoogleGenAI, Type } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

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
2. Utiliza exclusivamente clases de Tailwind CSS para el estilo (gradientes refinados, bordes sutiles, espaciados generosos). Evita estilos en línea o CSS plano.
3. El componente debe ser perfectamente responsivo (adaptándose desde móviles hasta escritorio usando prefijos sm:, md:, lg:).
4. El código debe ser ejecutable directamente como un componente React (sin dependencias extrañas ni props requeridas).
5. Escapa correctamente las comillas y saltos de línea para que el JSON sea válido.`;

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
  } catch (error) {
    console.error("Error generating component with Gemini:", error);
    res.status(500).json({
      error: "Ocurrió un error al procesar tu solicitud con la IA.",
      details: error.message || error,
    });
  }
});


// Servir archivos estáticos del build de React en Producción
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// Ruta comodín para SPA Fallback de React
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Arrancar el Servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`🚀 DESIGNS CRM - SERVIDOR DE RESPALDO WAMP MYSQL`);
  console.log(`🖥️  Local: http://localhost:${PORT}`);
  console.log(`📅  Fecha actual local: 2026`);
  console.log(`====================================================`);
});
