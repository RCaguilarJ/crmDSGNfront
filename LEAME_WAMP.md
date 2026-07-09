# 🚀 Guía de Configuración Local: Designs CRM con WAMP (phpMyAdmin) y VS Code

Esta guía te ayudará a descargar tu proyecto de Google AI Studio, configurarlo localmente en tu computadora con **WAMP Server**, levantar la base de datos relacional desde **phpMyAdmin**, y continuar el desarrollo utilizando **Visual Studio Code** con herramientas como **Codex**.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:
1. **Node.js** (Versión 18 o superior).
2. **WAMP Server** (con Apache, MySQL o MariaDB, y phpMyAdmin).
3. **Visual Studio Code** (con tus extensiones de desarrollo favoritas, incluyendo Codex para seguimiento).

---

## 🛠️ Paso 1: Configurar la Base de Datos en phpMyAdmin (WAMP)

1. Enciende tu servidor **WAMP Server** y espera a que el icono de la barra de tareas cambie a color **verde** (Apache y MySQL activos).
2. Abre tu navegador web e ingresa a phpMyAdmin:
   `http://localhost/phpmyadmin`
3. Inicia sesión en phpMyAdmin. Por defecto en WAMP:
   - **Usuario**: `root`
   - **Contraseña**: *(dejar en blanco)*
4. Ve a la pestaña **Importar** (Import) en la barra superior.
5. Selecciona el archivo **`database.sql`** ubicado en la raíz del proyecto que descargaste.
6. Haz clic en **Importar** (o *Continuar*) al final de la página.
7. phpMyAdmin creará automáticamente:
   - La base de datos `designs_crm`.
   - Las tablas `users` (usuarios), `clients` (clientes), `projects` (proyectos), `tasks` (tareas kanban) e `invoices` (pagos).
   - Insertará los datos semilla de fábrica (incluyendo los accesos corporativos para *adriana*, *jorge*, *carlos* y *sofia*).

---

## 💻 Paso 2: Instalación de Dependencias del Backend MySQL

Abre tu editor **Visual Studio Code** en la carpeta raíz del proyecto y abre una terminal integrada (`Ctrl + ~` o `Cmd + ~`). Ejecuta el siguiente comando para instalar las librerías necesarias del backend con MySQL:

```bash
npm install mysql2 express dotenv cors
```

*(Nota: `mysql2` es el conector que permite a Node.js realizar consultas seguras, parametrizadas y asíncronas con promesas en tu phpMyAdmin).*

---

## ⚙️ Paso 3: Configurar tus Variables de Entorno (`.env`)

En la raíz del proyecto local, crea un archivo llamado **`.env`** y añade las siguientes variables de configuración:

```env
# Puerto del Servidor Local Express
PORT=3000

# Credenciales de WAMP MySQL / phpMyAdmin
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=designs_crm

# Inteligencia Artificial (Obtenla gratis desde Google AI Studio)
GEMINI_API_KEY=tu_clave_secreta_de_gemini
```

---

## 🚀 Paso 4: Iniciar el Servidor de Respaldo MySQL

Para iniciar el backend local que hace consultas directas en phpMyAdmin, ejecuta en tu consola:

```bash
node server-mysql.js
```

Verás una salida en consola confirmando la conexión:
```text
✅ Conexión exitosa a la base de datos de phpMyAdmin (MySQL)
====================================================
🚀 DESIGNS CRM - SERVIDOR DE RESPALDO WAMP MYSQL
🖥️  Local: http://localhost:3000
====================================================
```

---

## 📐 Breakpoints y Diseño Responsivo Integrado

El frontend de **Designs CRM** está optimizado con las mejores prácticas de adaptabilidad utilizando **Tailwind CSS**. Esto garantiza que el CRM se vea pixel-perfect en cualquier resolución de pantalla (en pixeles):

1. **Pantallas Pequeñas (< 768px - Smartphones):**
   - El menú lateral (Sidebar) se oculta automáticamente.
   - Aparece un encabezado móvil flotante de acceso rápido con botón hamburguesa interactivo para desplegar el menú de forma fluida.
   - Las tablas de clientes, pagos y proyectos se empaquetan en contenedores con `overflow-x-auto` para evitar cortes de pantalla o desbordamiento horizontal.
2. **Pantallas Medianas (768px a 1024px - Tablets / Laptops Pequeñas):**
   - El menú lateral se transforma en una barra de navegación fija en el costado izquierdo que maximiza el área de lectura del tablero Kanban y el dashboard.
3. **Pantallas de Alta Resolución (> 1200px - Monitores de Escritorio):**
   - Los elementos se distribuyen en cuadrículas avanzadas (Bento grids) de hasta 4 columnas, aprovechando la amplitud del espacio para visualizaciones financieras, gráficos históricos y tableros interactivos.

---

## 📝 Lista de Accesos Rápidos Semilla (Importados desde SQL)

Puedes iniciar sesión en tu servidor local con cualquiera de los siguientes usuarios:
- **Administradora General:** `adriana` (contraseña: `demo`)
- **Administrador Financiero:** `jorge` (contraseña: `demo`)
- **Gerente de Desarrollo:** `carlos` (contraseña: `demo`)
- **Gerente Web:** `sofia` (contraseña: `demo`)

---
¡Listo! Ya puedes continuar con el desarrollo de tu CRM de forma local, persistiendo tu información en SQL y monitoreando tu progreso con **Codex** en tu Visual Studio Code.
