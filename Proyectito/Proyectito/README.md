# PATRIMONIA — Sistema de Administración de Museos

Interfaz web moderna, luminosa y altamente accesible (WCAG AA/AAA) diseñada para la gestión integral de patrimonio cultural, sedes museísticas, obras de arte, salas de exposición y recorridos guiados.

---

##  Sistema de Diseño Visual

La interfaz implementa un concepto estético contemporáneo: **fondo blanco/gris ultra claro con acentos de luz neón vibrante**.

- **Fondo General Luminoso:** `#F8FAFC` (Slate 50) y `#FFFFFF` para una sensación de pulcritud, amplitud y serenidad museística.
- **Tarjetas y Contenedores:** Blanco puro con sombras sutiles multinivel (`--shadow-card`) y bordes interactivos con resplandor neón violeta (`#C084FC`) y azul brillante (`#38BDF8` / `#0284C7`).
- **Acentos Neón:**
  - **Violeta Neón (`#C084FC` / `#A855F7`):** Utilizado en insignias, bordes activos, indicadores de foco y botones primarios combinados.
  - **Azul Neón (`#38BDF8` / `#0284C7`):** Empleado en estados secundarios, enlaces, coordenadas e indicadores climáticos.
  - **Efecto Glow:** Sombra difusa `box-shadow: 0 0 15px rgba(192, 132, 252, 0.28)` para un toque futurista y tecnológico sobre fondo claro.
- **Tipografía y Legibilidad:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) en tonos oscuros (`#0F172A` y `#334155`), garantizando un contraste óptimo.

---

##  Cumplimiento de Accesibilidad (WCAG 2.1 AA & AAA)

| Criterio WCAG | Implementación | Ratio de Contraste |
| :--- | :--- | :--- |
| **1.4.3 Contraste Mínimo (AA)** / **1.4.6 (AAA)** | Texto principal `#0F172A` sobre fondo `#FFFFFF` | **16.0 : 1** (Supera el estándar AAA de 7:1) |
| **Texto Secundario** | Texto `#334155` sobre fondo `#FFFFFF` | **9.5 : 1** (Supera el estándar AAA) |
| **2.4.1 Omitir Bloques** | Enlace `<a href="#mainContent" class="skip-link">` al inicio del documento | Visible al recibir foco mediante teclado |
| **2.4.7 Foco Visible** | `:focus-visible` personalizado con contorno de 3px en `#C084FC` y resplandor | Alto contraste e indicación precisa |
| **4.1.2 Nombre, Función, Valor** | Etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`), atributos `aria-label`, `aria-current`, `aria-expanded` y modales WAI-ARIA `role="dialog"` | Compatible con lectores de pantalla (NVDA, JAWS, VoiceOver) |
| **4.1.3 Mensajes de Estado** | Región `aria-live="polite"` para notificaciones flotantes (Toast) y alertas de estado | Informa cambios sin interrumpir al usuario |

---

##  Estructura del Proyecto (Arquitectura MVC Limpia y Unificada)

```text
Proyectito/
├── index.html                  # Interfaz semántica HTML5 accesible
├── css/
│   ├── styles.css              # Sistema de diseño principal, variables y efectos neón
│   └── accessibility.css       # Estilos dedicados para alto contraste y zoom
├── models/                     # Carpeta ÚNICA de Modelos (POO / Entidades Relacionales JPA)
│   ├── BaseEntity.js           # Clase base abstracta con validación y serialización
│   ├── Artwork.js              # Entidad Artwork / Artifact con mapeo de tabla y columnas
│   ├── Artifact.js             # Alias de compatibilidad con Artwork
│   ├── Museum.js               # Entidad Museum con persistencia y estadísticas
│   ├── Artist.js               # Entidad Artist y creadores patrimoniales
│   ├── Room.js                 # Entidad Room / ExhibitionRoom de salas climatizadas
│   ├── ExhibitionRoom.js       # Alias de compatibilidad con Room
│   ├── Category.js             # Entidad Category de clasificación de piezas
│   ├── Tour.js                 # Entidad Tour con itinerarios paso a paso
│   ├── Stats.js                # Cálculo de métricas del Dashboard
│   ├── SequenceHelper.js       # Generador de identificadores secuenciales
│   ├── AccessibilityModel.js   # Modelo de preferencias de accesibilidad
│   └── PatrimoniaModel.js      # Estado reactivo del catálogo patrimonial
├── controllers/                # Carpeta ÚNICA de Controladores (POO / MVC)
│   ├── BaseController.js       # Controlador base con respuestas estándar REST
│   ├── ArtworkController.js    # Controlador REST para obras y artefactos
│   ├── ArtifactController.js   # Alias de compatibilidad con ArtworkController
│   ├── MuseumController.js     # Controlador REST para sedes museísticas
│   ├── RoomController.js       # Controlador REST para salas de exhibición
│   ├── ExhibitionRoomController.js # Alias de compatibilidad con RoomController
│   ├── ArtistController.js     # Controlador REST para creadores
│   ├── CategoryController.js   # Controlador REST para categorías
│   ├── TourController.js       # Controlador REST para recorridos y aforo
│   ├── StatsController.js      # Controlador REST para métricas
│   ├── HealthController.js     # Chequeo de salud del servicio
│   ├── AppController.js        # Orquestador del frontend y eventos de UI
│   └── AccessibilityController.js # Controlador de accesibilidad y contraste
├── views/                      # Carpeta ÚNICA de Vistas (POO / UI)
│   ├── ModalView.js            # Ventanas modales WAI-ARIA
│   ├── ToastView.js            # Notificaciones toast no intrusivas
│   ├── AccessibilityView.js    # Panel y barra de accesibilidad
│   ├── GlobalSearchView.js     # Búsqueda global integral
│   ├── DashboardView.js        # Renderizado de métricas y resumen
│   ├── MuseumView.js           # Renderizado de tarjetas de sedes
│   ├── ArtworkView.js          # Renderizado de obras y estado de conservación
│   ├── RoomArtistView.js       # Renderizado de salas y artistas
│   └── TourView.js             # Renderizado de visitas guiadas
├── js/                         # Scripts de entrada y servicios
│   ├── services/
│   │   └── ApiService.js       # Comunicación REST con fallback offline
│   ├── api.js                  # Adaptador retrocompatible
│   └── app.js                  # Bootstrap del frontend
├── routes/                     # Enrutador REST Express (MVC)
│   └── apiRoutes.js
├── db.js                       # Pool MySQL y aprovisionamiento desde Modelos
├── server.js                   # Servidor Express estructurado en Clase Server (POO)
├── database.sql                # Script SQL patrimonia_db para phpMyAdmin
├── .env                        # Variables de entorno
└── README.md                   # Documentación arquitectónica
```

---

##  Módulos Funcionales Implementados

1. **Dashboard / Vista General:**
   - Métricas en tiempo real: Sedes activas, obras catalogadas, salas climatizadas, porcentaje medio de conservación.
   - Bitácora de monitoreo preventivo y alertas climáticas.
   - Accesos rápidos interactivos.
2. **Gestión de Museos:**
   - Tarjetas de sedes con fotografía arquitectónica, descripción institucional, dirección física, coordenadas GPS y enlace directo a su web oficial.
   - Modal para dar de alta nuevas sedes museísticas.
3. **Gestión de Obras & Artefactos:**
   - Fichas interactivas con imagen en alta calidad, fecha de creación, año de adquisición, categoría y sala asignada.
   - Indicador visual del **estado de conservación (%)** con código de color (Verde >90%, Ámbar 75-89%, Rojo <75%).
   - Barra de filtros instantáneos por categoría, estado de conservación y buscador textual predictivo.
   - Modal de ficha técnica detallada y actualización de estado de conservación.
4. **Salas de Exposición y Artistas:**
   - Pestaña de **Salas:** Aforo máximo, parámetros de climatización (temperatura y humedad relativa) y piezas alojadas.
   - Pestaña de **Artistas:** Perfil con avatar, época histórica, nacionalidad, biografía y acceso directo a sus obras catalogadas.
5. **Visitas Guiadas (Tours):**
   - Recorridos con fechas, guía asignado, duración e idioma.
   - **Itinerario de salas en orden secuencial:** Visualización paso a paso del recorrido cronológico por las salas del museo.
   - Control de aforo con inscripción interactiva de asistentes en un solo clic.

---

##  Backend Node.js + MySQL (phpMyAdmin)

El proyecto cuenta con un backend completo en **Node.js + Express** conectado a una base de datos relacional **MySQL / MariaDB** administrable desde **phpMyAdmin** (XAMPP).

###  Puesta en Marcha Rápida:

#### 1. Iniciar MySQL y Apache en XAMPP:
- Abre el **XAMPP Control Panel**.
- Haz clic en **Start** en los módulos **Apache** y **MySQL**.

#### 2. Importar la Base de Datos en phpMyAdmin:
1. Abre tu navegador e ingresa a: [`http://localhost/phpmyadmin`](http://localhost/phpmyadmin).
2. Haz clic en la pestaña superior **Importar** (o *Import*).
3. Haz clic en **Seleccionar archivo** y elige el archivo `database.sql` ubicado en la raíz de este proyecto.
4. Presiona el botón **Importar** (o *Continuar*) al final de la página.
5. Se creará automáticamente la base de datos `patrimonia_db` con todas sus tablas y datos patrimoniales iniciales.

#### 3. Iniciar el Servidor Node.js:
En la terminal dentro de esta carpeta, ejecuta:
```bash
npm start
```
> O si prefieres recarga automática durante desarrollo:
```bash
npm run dev
```

El servidor estará escuchando en: **`http://localhost:3000`**

---

###  Endpoints REST de la API:

| Método | Endpoint | Descripción | Objeto / Respuesta |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor y conexión a MySQL | `{"status": "UP", "database": "CONNECTED"}` |
| `GET` | `/api/stats` | Métricas en tiempo real calculadas en MySQL | `{ totalMuseums, totalArtworks, activeRooms, ... }` |
| `GET` | `/api/museos` | Lista de museos adscritos | `Array<Museum>` |
| `POST`| `/api/museos` | Registrar y guardar nueva sede en MySQL | `Museum` |
| `GET` | `/api/obras` | Catálogo de obras y artefactos | `Array<Artwork>` |
| `POST`| `/api/obras` | Guardar nueva pieza en base de datos | `Artwork` |
| `PUT` | `/api/obras/:id/conservation` | Actualizar porcentaje de conservación | `Artwork` |
| `GET` | `/api/salas` | Listado de salas de exposición | `Array<Room>` |
| `POST`| `/api/salas` | Registrar nueva sala | `Room` |
| `GET` | `/api/artistas` | Biografías de artistas | `Array<Artist>` |
| `POST`| `/api/artistas` | Registrar nuevo artista | `Artist` |
| `GET` | `/api/tours` | Visitas guiadas e itinerarios | `Array<Tour>` |
| `POST`| `/api/tours` | Programar nuevo tour con itinerario | `Tour` |
| `POST`| `/api/tours/:id/register` | Inscribir asistente con control de aforo | `Tour` |

---

> [!NOTE]
> **Modo Autónomo / Fallback:** Si por algún motivo MySQL o Node.js están detenidos temporalmente, el cliente en `js/api.js` mantendrá la interfaz operativa con datos en memoria e indicará el estado en el indicador lateral.



## Actualizaciones de esta entrega

### Accesibilidad
- El panel se abre desde el botón de accesibilidad de la parte superior o con `Alt + A`.
- En **Auditivo & Lector**, activa el apoyo auditivo para destacar los avisos en pantalla.
- Usa **Leer contenido** para escuchar la sección abierta, **Leer texto seleccionado** para leer una selección y **Detener** para parar la voz. La lectura usa SpeechSynthesis del navegador; requiere un navegador actualizado y audio habilitado.
- El apoyo auditivo no convierte sonidos en subtítulos: el sistema muestra avisos visuales reforzados.

### Historial de exposición
Se agregó la tabla `exhibition_history` y la API:
- `GET /api/historial-exposicion`
- `POST /api/historial-exposicion` con `artwork_id`, `room_id`, `start_date` y opcionalmente `end_date`, `notes`.
- `PUT /api/historial-exposicion/:id/cerrar` con `end_date`.

### Base de datos
- Para una instalación nueva, importa `database.sql`.
- Si ya tienes la base de datos creada, ejecuta `actualizar_bd.sql` desde phpMyAdmin sobre `patrimonia_db`.
- No vuelvas a importar `database.sql` sobre una base con datos que quieras conservar: ese archivo recrea las tablas principales y sus datos de demostración.

### Inicio
1. Instala Node.js y MySQL/XAMPP.
2. Configura las credenciales en `.env` usando `.env.example` como guía.
3. Ejecuta `npm install`.
4. Ejecuta `npm start` y abre `http://localhost:3000`.

![alt text](image.png)
![alt text](image-22.png)
![alt text](image-21.png)
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)
![alt text](image-4.png)
![alt text](image-16.png)
![alt text](image-7.png)
![alt text](image-8.png)
![alt text](image-5.png)
![alt text](image-15.png)
![alt text](image-6.png)
![alt text](image-9.png)
![alt text](image-10.png)
![alt text](image-11.png)
![alt text](image-12.png)
![alt text](image-13.png)
![alt text](image-14.png)
![alt text](image-17.png)
![alt text](image-18.png)
![alt text](image-19.png)
![alt text](image-20.png)