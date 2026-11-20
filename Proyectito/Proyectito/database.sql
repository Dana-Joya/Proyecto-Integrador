-- ============================================================================
-- PATRIMONIA - SISTEMA DE ADMINISTRACIÓN DE MUSEOS Y PATRIMONIO CULTURAL
-- Base de Datos MySQL / MariaDB para phpMyAdmin
-- ============================================================================

-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `patrimonia_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `patrimonia_db`;

-- Desactivar restricciones de claves foráneas para recreación segura
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `exhibition_history`;
DROP TABLE IF EXISTS `tour_itineraries`;
DROP TABLE IF EXISTS `tours`;
DROP TABLE IF EXISTS `artworks`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `artists`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `museums`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TABLA 1: MUSEOS (Sedes institucionales)
-- ============================================================================
CREATE TABLE `museums` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `coordinates` VARCHAR(100) DEFAULT NULL,
  `web_url` VARCHAR(255) DEFAULT NULL,
  `image` TEXT DEFAULT NULL,
  `total_works` INT NOT NULL DEFAULT 0,
  `active_rooms` INT NOT NULL DEFAULT 1,
  `founded_year` INT DEFAULT 2000,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA 1.1: CATEGORÍAS (Categorías de piezas y artefactos)
-- ============================================================================
CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA 2: ARTISTAS (Creadores y colectivos patrimoniales)
-- ============================================================================
CREATE TABLE `artists` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `period` VARCHAR(255) DEFAULT NULL,
  `nationality` VARCHAR(150) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `works_count` INT NOT NULL DEFAULT 0,
  `avatar` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA 3: SALAS DE EXPOSICIÓN
-- ============================================================================
CREATE TABLE `rooms` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `museum_name` VARCHAR(255) DEFAULT NULL,
  `museum_id` VARCHAR(50) DEFAULT NULL,
  `capacity` INT NOT NULL DEFAULT 30,
  `current_pieces` INT NOT NULL DEFAULT 0,
  `climate_control` VARCHAR(100) DEFAULT '20.0°C · 50% HR',
  `status` VARCHAR(100) NOT NULL DEFAULT 'Abierta al Público',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rooms_museum` (`museum_id`),
  CONSTRAINT `fk_rooms_museum` FOREIGN KEY (`museum_id`) REFERENCES `museums` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA 4: OBRAS Y ARTEFACTOS
-- ============================================================================
CREATE TABLE `artworks` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255) NOT NULL,
  `artist_id` VARCHAR(50) DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `creation_date` VARCHAR(100) DEFAULT NULL,
  `acquisition_date` VARCHAR(50) DEFAULT NULL,
  `conservation_percent` INT NOT NULL DEFAULT 95,
  `room` VARCHAR(255) DEFAULT NULL,
  `museum_id` VARCHAR(50) DEFAULT NULL,
  `image` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_artworks_artist` (`artist_id`),
  KEY `idx_artworks_museum` (`museum_id`),
  CONSTRAINT `fk_artworks_museum` FOREIGN KEY (`museum_id`) REFERENCES `museums` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA 5: VISITAS GUIADAS (TOURS)
-- ============================================================================
CREATE TABLE `tours` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `guide` VARCHAR(255) NOT NULL,
  `date_time` VARCHAR(150) NOT NULL,
  `duration` VARCHAR(50) NOT NULL DEFAULT '60 min',
  `registered_attendees` INT NOT NULL DEFAULT 0,
  `max_capacity` INT NOT NULL DEFAULT 25,
  `language` VARCHAR(100) NOT NULL DEFAULT 'Español',
  `description` TEXT DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `web_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA 6: ITINERARIO DE TOURS (Paso a paso de cada recorrido)
-- ============================================================================
CREATE TABLE `tour_itineraries` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `tour_id` VARCHAR(50) NOT NULL,
  `step_order` INT NOT NULL,
  `room_name` VARCHAR(255) NOT NULL,
  `duration_min` INT NOT NULL DEFAULT 15,
  `focus` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_itinerary_tour` (`tour_id`),
  CONSTRAINT `fk_itinerary_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERCIÓN DE DATOS INICIALES (PATRIMONIO INICIAL COMPLETO)
-- ============================================================================

-- 1. MUSEOS
INSERT INTO `museums` (`id`, `name`, `description`, `location`, `coordinates`, `web_url`, `image`, `total_works`, `active_rooms`, `founded_year`) VALUES
('mus-1', 'Museo Nacional de Bellas Artes y Patrimonio', 'Principal institución dedicada a la preservación y divulgación de obras pictóricas, escultóricas y orfebrería de los siglos XVI al XIX.', 'Madrid, España · Paseo del Arte 45', '40.4168° N, 3.7038° W', 'https://www.patrimonio-artes.gob.es', 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80', 580, 7, 1819),
('mus-2', 'Museo Arqueológico & Antropológico Central', 'Custodia tesoros precolombinos, piezas del Mediterráneo clásico y fósiles de alta relevancia científica y patrimonial.', 'Bogotá, Colombia · Cra 7 # 28-66', '4.6152° N, 74.0688° W', 'https://www.arqueologiacentral.org', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80', 420, 5, 1938),
('mus-3', 'Galería de Arte Vanguardista Lumina', 'Espacio experimental enfocado en videoarte, instalaciones cinéticas, arte lumínico contemporáneo y neo-expresionismo.', 'Berlín, Alemania · Auguststraße 69', '52.5284° N, 13.3958° E', 'https://www.lumina-gallery.eu', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80', 194, 4, 2008),
('mus-4', 'Palacio de la Fotografía y Artes Gráficas', 'Monasterio restaurado que alberga colecciones históricas de daguerrotipos, manuscritos iluminados y fotografía analógica.', 'Ciudad de México · Calle Moneda 13', '19.4326° N, 99.1332° W', 'https://www.palaciofotografia.mx', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80', 90, 2, 1982);

-- 1.1 CATEGORÍAS
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
('cat-1', 'Pintura al Óleo', 'Obras pictóricas sobre lienzo, tabla o lino.'),
('cat-2', 'Escultura en Mármol', 'Esculturas clásicas y tallas en piedra.'),
('cat-3', 'Instalación Lumínica', 'Obras contemporáneas con luz y neón.'),
('cat-4', 'Orfebrería Prehispánica', 'Piezas en oro, cobre y aleaciones arqueológicas.'),
('cat-5', 'Manuscrito y Pergamino', 'Códices iluminados y documentos históricos.');

-- 2. ARTISTAS
INSERT INTO `artists` (`id`, `name`, `period`, `nationality`, `bio`, `works_count`, `avatar`) VALUES
('art-sofonisba', 'Sofonisba Anguissola', '1532 – 1625 · Renacimiento Tardío', 'Italiana (Cremona)', 'Pintora pionera del Renacimiento que alcanzó reconocimiento internacional en las cortes europeas, elogiada por Miguel Ángel y retratista de la corte de Felipe II.', 4, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'),
('art-vance', 'Eleni Vance', '1986 – Presente · Arte Contemporáneo', 'Greco-Alemana (Berlín)', 'Artista multidisciplinar e ingeniera lumínica conocida por sus instalaciones cinéticas a gran escala que exploran la refracción del espectro visible y el vacío espacial.', 3, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
('art-gabriel', 'Fray Gabriel de San Lucas', 'c. 1450 – 1512 · Gótico Tardío', 'Española (Toledo)', 'Maestro miniaturista y calígrafo monástico, reconocido por la precisión botánica y astronómica plasmada en pergaminos litúrgicos y cartas náuticas.', 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'),
('art-quimbaya', 'Maestros Orfebres Quimbaya', 'Periodo Clásico Prehispánico (500 – 1000 d.C.)', 'Cuenca del Río Cauca (Colombia)', 'Colectivo patrimonial de creadores que alcanzaron una cúspide metalúrgica sin precedentes en el tratamiento de aleaciones áureas con técnica de fundición por cera perdida.', 6, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80');

-- 3. SALAS DE EXPOSICIÓN
INSERT INTO `rooms` (`id`, `code`, `name`, `museum_name`, `museum_id`, `capacity`, `current_pieces`, `climate_control`, `status`) VALUES
('room-1', 'R-102', 'Sala Dorada Renacentista', 'Museo Nacional de Bellas Artes', 'mus-1', 45, 14, '20.5°C · 50% HR', 'Abierta al Público'),
('room-2', 'A-201', 'Galería de Arqueología Clásica', 'Museo Arqueológico & Antropológico', 'mus-2', 60, 28, '19.8°C · 48% HR', 'Abierta al Público'),
('room-3', 'L-01', 'Pabellón Lumina Experimental', 'Galería de Arte Vanguardista Lumina', 'mus-3', 35, 8, '21.0°C · 45% HR', 'Abierta al Público'),
('room-4', 'T-03', 'Cámara del Tesoro Precolombino', 'Museo Arqueológico & Antropológico', 'mus-2', 25, 42, '20.0°C · 42% HR', 'Acceso Guiado'),
('room-5', 'V-10', 'Bóveda de Documentos Raros', 'Palacio de la Fotografía y Artes Gráficas', 'mus-4', 15, 19, '18.5°C · 40% HR', 'Climatización Restringida');

-- 4. OBRAS Y ARTEFACTOS
INSERT INTO `artworks` (`id`, `title`, `artist`, `artist_id`, `category`, `creation_date`, `acquisition_date`, `conservation_percent`, `room`, `museum_id`, `image`, `description`) VALUES
('art-1', 'Alegoría de la Luz Aurora', 'Sofonisba Anguissola', 'art-sofonisba', 'Pintura al Óleo', '1578', '1984-06-12', 96, 'Sala Dorada Renacentista (R-102)', 'mus-1', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', 'Retrato mitológico al óleo sobre lino fino. Destaca el tratamiento sutil de los claroscuros y pigmentos ultramarinos originales.'),
('art-2', 'Busto del Emperador Sereno', 'Taller Helenístico / Atribuido', 'art-helenistico', 'Escultura en Mármol', 'Siglo II d.C.', '1952-11-03', 88, 'Galería de Arqueología Clásica (A-201)', 'mus-2', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80', 'Talla en mármol de Paros con pátina de envejecimiento natural. Exhibe una técnica refinada en el drapeado y la expresión facial.'),
('art-3', 'Composición Neón Prismática #4', 'Eleni Vance', 'art-vance', 'Instalación Lumínica', '2021', '2022-03-15', 99, 'Pabellón Lumina Experimental (L-01)', 'mus-3', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', 'Estructura cinética de tubos de neón de cátodo frío y metacrilato reactivo que sincroniza frecuencias de luz con resonancias acústicas.'),
('art-4', 'Máscara Ceremonial del Sol Dorado', 'Orfebres Cultura Quimbaya', 'art-quimbaya', 'Orfebrería Prehispánica', 'c. 750 d.C.', '1960-04-22', 92, 'Cámara del Tesoro Precolombino (T-03)', 'mus-2', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', 'Pieza repujada y fundida a la cera perdida en aleación tumbaga (oro y cobre nativo) con acabados pulidos a espejo.'),
('art-5', 'Manuscrito Iluminado: Códice de las Estrellas', 'Fray Gabriel de San Lucas', 'art-gabriel', 'Manuscrito y Pergamino', '1492', '1973-09-18', 68, 'Bóveda de Documentos Raros (V-10)', 'mus-4', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', 'Tratado astronómico ilustrado con panes de oro y tintas minerales. Requiere control estricto de humedad (<45%) y cero luz ultravioleta.'),
('art-6', 'Retrato en Penumbra de Dama con Perla', 'Sofonisba Anguissola', 'art-sofonisba', 'Pintura al Óleo', '1584', '1999-01-30', 95, 'Sala Dorada Renacentista (R-102)', 'mus-1', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', 'Obra maestra de la retratista renacentista. Presenta barniz original estabilizado en el último proceso de conservación preventiva de 2024.');

-- 5. TOURS
INSERT INTO `tours` (`id`, `title`, `guide`, `date_time`, `duration`, `registered_attendees`, `max_capacity`, `language`) VALUES
('tour-1', 'Ruta Magistral: Del Renacimiento a la Vanguardia', 'Dra. Elena Santillán (Curadora Principal)', 'Martes y Jueves · 10:30 AM', '90 min', 18, 25, 'Español e Inglés'),
('tour-2', 'Oro, Mitos y Alquimia Precolombina', 'Prof. Mateo Cárdenas (Arqueólogo Residente)', 'Sábados y Domingos · 16:00 PM', '75 min', 22, 25, 'Español'),
('tour-3', 'Nocturno de Luces & Tecnologías Patrimoniales', 'Ing. Clara Von Berg (Conservadora Digital)', 'Viernes · 19:30 PM', '60 min', 15, 20, 'Español, Alemán');

-- 6. ITINERARIOS DE TOURS
INSERT INTO `tour_itineraries` (`tour_id`, `step_order`, `room_name`, `duration_min`, `focus`) VALUES
('tour-1', 1, 'Sala Dorada Renacentista (R-102)', 25, 'Técnica del sfumato y retratos cortesanos'),
('tour-1', 2, 'Bóveda de Documentos Raros (V-10)', 20, 'Códices manuscritos y pigmentos botánicos'),
('tour-1', 3, 'Pabellón Lumina Experimental (L-01)', 35, 'Instalación lumínica y diálogo contemporáneo'),
('tour-1', 4, 'Jardín Escultórico Central', 10, 'Coloquio final con la curadora'),
('tour-2', 1, 'Galería de Arqueología Clásica (A-201)', 20, 'Cosmogonías comparadas y primeras civilizaciones'),
('tour-2', 2, 'Cámara del Tesoro Precolombino (T-03)', 40, 'Metalurgia mágica y la máscara solar Quimbaya'),
('tour-2', 3, 'Sala de Conservación In-Situ', 15, 'Demostración de preservación de metales nobles'),
('tour-3', 1, 'Pabellón Lumina Experimental (L-01)', 30, 'Espectro electromagnético en el arte de neón'),
('tour-3', 2, 'Laboratorio de Escaneo 3D y Fotogrametría', 30, 'Gemelos digitales de esculturas clásicas');



-- ============================================================================
-- TABLA 7: HISTORIAL DE EXPOSICIÓN DE OBJETOS
-- Registra cada periodo en el que una obra permanece en una sala.
-- ============================================================================
CREATE TABLE IF NOT EXISTS `exhibition_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `artwork_id` VARCHAR(50) NOT NULL,
  `room_id` VARCHAR(50) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exhibition_artwork` (`artwork_id`),
  KEY `idx_exhibition_room` (`room_id`),
  CONSTRAINT `fk_exhibition_artwork` FOREIGN KEY (`artwork_id`)
    REFERENCES `artworks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exhibition_room` FOREIGN KEY (`room_id`)
    REFERENCES `rooms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_exhibition_dates` CHECK (`end_date` IS NULL OR `end_date` >= `start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
