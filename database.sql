-- ====================================================================
-- BASE DE DATOS PARA DESIGNS CRM (AGENCIA PIXEL PERFECT)
-- COMPATIBLE CON PHPMYADMIN, WAMP SERVER, MYSQL Y MARIADB
-- ====================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "-06:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 1. CREACIÓN DE LA BASE DE DATOS
--
CREATE DATABASE IF NOT EXISTS `designs_crm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `designs_crm`;

-- --------------------------------------------------------------------
-- 2. TABLA DE USUARIOS / CORPORATIVOS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `username` VARCHAR(50) NOT NULL PRIMARY KEY,
  `password_hash` VARCHAR(64) NOT NULL,
  `salt` VARCHAR(32) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Colaborador',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. TABLA DE CLIENTES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `company_name` VARCHAR(150) NOT NULL,
  `contact_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `status` ENUM('Activo', 'Próximo a vencer', 'Vencido', 'Suspendido') NOT NULL DEFAULT 'Activo',
  `services` INT NOT NULL DEFAULT 1,
  `responsible` VARCHAR(100) DEFAULT NULL,
  `next_renewal` DATE DEFAULT NULL,
  `avatar_initials` VARCHAR(5) DEFAULT 'CL',
  `avatar_bg` VARCHAR(50) DEFAULT 'bg-[#1d63ff]',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. TABLA DE PROYECTOS (RÉPLICAS DE FIGMA Y COMPONENTES)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `figma_node` VARCHAR(100) DEFAULT NULL,
  `tailwind_classes` TEXT DEFAULT NULL,
  `component_code` MEDIUMTEXT DEFAULT NULL,
  `username` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. TABLA DE TAREAS KANBAN
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_projects` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `manager` VARCHAR(100) NOT NULL,
  `designer` VARCHAR(100) NOT NULL,
  `builder` VARCHAR(100) NOT NULL,
  `start_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `progress` INT NOT NULL DEFAULT 0,
  `status` ENUM('Diseño inicial', 'Carga de contenido', 'Revisión cliente', 'Publicado', 'Maquetación') NOT NULL DEFAULT 'Diseño inicial',
  `priority` ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. TABLA DE TAREAS KANBAN
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `column_name` ENUM('Backlog', 'Diseño', 'Desarrollo', 'QA', 'Entregado') NOT NULL DEFAULT 'Backlog',
  `priority` ENUM('Baja', 'Media', 'Alta') NOT NULL DEFAULT 'Media',
  `project_name` VARCHAR(150) DEFAULT NULL,
  `assignee` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. TABLA DE FACTURAS / COBROS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `client_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('Pagado', 'Pendiente', 'Vencido') NOT NULL DEFAULT 'Pendiente',
  `due_date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================================================================
-- SEED DE DATOS: CARGA INICIAL COMPATIBLE CON EL DEMO DEL COMPONENTE
-- ====================================================================

-- 1. USUARIOS (Contraseña de fábrica de los usuarios es 'demo' encriptada con SHA256)
--    Cuentas: demo, adriana, jorge, carlos, sofia
INSERT INTO `users` (`username`, `password_hash`, `salt`, `role`) VALUES
('demo', '00b28913b839804e339178cb3cb4fe4b8a5c3bbecbf9e023472be9bf1293aeb4', '9a03b5f92bdc489c', 'Colaborador'),
('adriana', 'be3927d206f6904e223192cb9cb4fefb2a8c3bbffbf9e083472be9bf1283deb5', '8c05b2f92bdc234a', 'Admin General'),
('jorge', 'ec4899d206f6804e223112cb9cb4feab2a8c3bbafbf9e093472be9bf1293ce12', '7c01b2f52bdc567b', 'Administración'),
('carlos', 'f59e0bd206f6704e223122cb9cb4fecb2a8c3bbdfbf9e013472be9bf1223fe34', '5c03b1f92bdc112d', 'Gerente Dev'),
('sofia', 'a855f7d206f6604e223152cb9cb4fedb2a8c3bbcfbf9e043472be9bf1243fa56', '4c02b3f92bdc889e', 'Gerente Web')
ON DUPLICATE KEY UPDATE `role`=VALUES(`role`);

-- 2. CLIENTES
INSERT INTO `clients` (`id`, `company_name`, `contact_name`, `email`, `phone`, `status`, `services`, `responsible`, `next_renewal`, `avatar_initials`, `avatar_bg`) VALUES
('c_1', 'Constructora Murillo S.A.', 'Ing. Roberto Murillo', 'r.murillo@constructoramurillo.mx', '+52 664 234 5678', 'Activo', 4, 'Carlos Mendoza', '2025-02-15', 'CO', 'bg-[#f59e0b]'),
('c_2', 'Farmacia San Pablo del Norte', 'Lic. Patricia Sánchez', 'p.sanchez@farmsanpablo.mx', '+52 33 1234 5678', 'Activo', 3, 'Sofía Rodríguez', '2025-01-20', 'FA', 'bg-[#ec4899]'),
('c_3', 'Clínica Médica del Valle', 'Dr. Ernesto Valdés', 'e.valdes@clinicadelvalle.mx', '+52 81 9876 5432', 'Activo', 2, 'Luis Pérez', '2025-03-10', 'CL', 'bg-[#eab308]'),
('c_4', 'Grupo Inmobiliario Arenas', 'Arq. Mónica Arenas', 'm.arenas@grupoarenas.mx', '+52 55 5555 1234', 'Activo', 5, 'Marco Herrera', '2025-01-31', 'GR', 'bg-[#84cc16]'),
('c_5', 'Restaurante El Fogón Real', 'Chef Omar Lozano', 'o.lozano@elfogonreal.mx', '+52 33 8765 4321', 'Activo', 2, 'Sofía Rodríguez', '2025-04-05', 'RE', 'bg-[#a855f7]'),
('c_6', 'Academia de Idiomas Luminar', 'Mtra. Elena Quiroga', 'e.quiroga@idiomesluminar.mx', '+52 442 345 6789', 'Activo', 3, 'Luis Pérez', '2025-02-28', 'AC', 'bg-[#10b981]'),
('c_7', 'Despacho Jurídico Montoya & Asoc.', 'Lic. Hernán Montoya', 'h.montoya@montoya-abogados.mx', '+52 55 4444 3333', 'Próximo a vencer', 2, 'Carlos Mendoza', '2025-01-12', 'DE', 'bg-[#f59e0b]'),
('c_8', 'Distribuidora Noroeste Express', 'Lic. Beatriz Flores', 'b.flores@noroeste-express.mx', '+52 664 555 6677', 'Vencido', 3, 'Marco Herrera', '2024-12-20', 'DI', 'bg-[#ef4444]'),
('c_9', 'Hotel Boutique Riviera Maya', 'Lic. Andrés Castellanos', 'a.castellanos@rivieramaya-hotel.mx', '+52 998 123 4567', 'Activo', 4, 'Valeria Castro', '2025-05-15', 'HO', 'bg-[#1d63ff]'),
('c_10', 'Taller Automotriz Express TJ', 'Ing. Miguel Ramos', 'm.ramos@tallerexpress.mx', '+52 664 789 0123', 'Suspendido', 1, 'Luis Pérez', '2025-06-01', 'TA', 'bg-[#94a3b8]')
ON DUPLICATE KEY UPDATE `company_name`=VALUES(`company_name`);

-- 3. PROYECTOS WEB
INSERT INTO `web_projects` (`id`, `username`, `name`, `client_name`, `manager`, `designer`, `builder`, `start_date`, `due_date`, `progress`, `status`, `priority`, `description`) VALUES
('wp_1_demo', 'demo', 'Sitio Web Clínica Médica', 'Clínica Médica', 'Sofía', 'Valeria', 'Luis', '2024-12-01', '2025-01-25', 95, 'Revisión cliente', 'Alta', 'Sitio institucional con blog y formularios médicos.'),
('wp_2_demo', 'demo', 'Landing Restaurante El Fogón', 'Restaurante El', 'Sofía', 'Valeria', 'Luis', '2024-12-15', '2025-02-01', 70, 'Carga de contenido', 'Media', 'Landing promocional para reservas y menú.'),
('wp_3_demo', 'demo', 'Portal Academia Luminar', 'Academia de', 'Luis', 'Valeria', 'Sofía', '2025-01-05', '2025-03-05', 20, 'Diseño inicial', 'Media', 'Portal de cursos y captación.'),
('wp_4_demo', 'demo', 'Web Despacho Montoya', 'Despacho Jurídico', 'Sofía', 'Valeria', 'Luis', '2024-11-20', '2025-01-10', 100, 'Publicado', 'Baja', 'Sitio corporativo para despacho legal.'),
('wp_5_demo', 'demo', 'Portafolio Taller Express', 'Taller Automotriz', 'Luis', 'Valeria', 'Sofía', '2024-12-10', '2025-01-30', 45, 'Maquetación', 'Baja', 'Catálogo web de servicios automotrices.'),
('wp_1_adriana', 'adriana', 'Sitio Web Clínica Médica', 'Clínica Médica', 'Sofía', 'Valeria', 'Luis', '2024-12-01', '2025-01-25', 95, 'Revisión cliente', 'Alta', 'Sitio institucional con blog y formularios médicos.'),
('wp_2_adriana', 'adriana', 'Landing Restaurante El Fogón', 'Restaurante El', 'Sofía', 'Valeria', 'Luis', '2024-12-15', '2025-02-01', 70, 'Carga de contenido', 'Media', 'Landing promocional para reservas y menú.'),
('wp_3_adriana', 'adriana', 'Portal Academia Luminar', 'Academia de', 'Luis', 'Valeria', 'Sofía', '2025-01-05', '2025-03-05', 20, 'Diseño inicial', 'Media', 'Portal de cursos y captación.'),
('wp_4_adriana', 'adriana', 'Web Despacho Montoya', 'Despacho Jurídico', 'Sofía', 'Valeria', 'Luis', '2024-11-20', '2025-01-10', 100, 'Publicado', 'Baja', 'Sitio corporativo para despacho legal.'),
('wp_5_adriana', 'adriana', 'Portafolio Taller Express', 'Taller Automotriz', 'Luis', 'Valeria', 'Sofía', '2024-12-10', '2025-01-30', 45, 'Maquetación', 'Baja', 'Catálogo web de servicios automotrices.')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 4. TAREAS KANBAN
INSERT INTO `tasks` (`id`, `title`, `description`, `column_name`, `priority`, `project_name`, `assignee`) VALUES
('t_1', 'Diseñar wireframes de la landing page', 'Crear bosquejo estructural en Figma y validar la alineación áurea.', 'Backlog', 'Media', 'Dashboard de Análisis Financiero', 'Eduardo López'),
('t_2', 'Replicar card de precios con gradiente', 'Desarrollar el componente en React + Tailwind usando clases rítmicas.', 'Desarrollo', 'Alta', 'Bento Layout Hero Section', 'Ana Silva'),
('t_3', 'Revisión de accesibilidad de colores', 'Verificar contraste contrast ratio AAA de los badges.', 'QA', 'Baja', 'Bento Layout Hero Section', 'Carlos Slim'),
('t_4', 'Definir tipografía Space Grotesk', 'Configurar fuentes responsivas y tracking tight en el header.', 'Diseño', 'Alta', 'Dashboard de Análisis Financiero', 'Eduardo López')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 5. FACTURAS / COBROS
INSERT INTO `invoices` (`id`, `client_name`, `amount`, `status`, `due_date`, `description`) VALUES
('inv_1', 'Google Latam', 45000.00, 'Pagado', '2026-07-15', 'Servicio de diseño UI/UX y exportación de componentes reactivos.'),
('inv_2', 'Nike México', 35000.00, 'Pendiente', '2026-07-28', 'Réplica interactiva del Bento Hero Section en React.'),
('inv_3', 'Netflix Inc', 15000.00, 'Vencido', '2026-06-30', 'Consultoría de branding y diseño de bento grids.')
ON DUPLICATE KEY UPDATE `amount`=VALUES(`amount`);

COMMIT;

-- ====================================================================
-- MENSAJE DEÉXITO: Base de datos cargada con éxito para Designs CRM.
-- ====================================================================
