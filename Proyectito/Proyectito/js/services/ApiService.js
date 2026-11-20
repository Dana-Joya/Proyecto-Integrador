/**
 * ==============================================================================
 * SERVICIO: ApiService (POO)
 * Gestiona la comunicación REST con el backend Node.js + MySQL con
 * persistencia local autónoma (localStorage) si el backend aún no está iniciado.
 * ==============================================================================
 */

class ApiService {
  constructor(baseUrl) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (typeof window !== 'undefined' && window.location && window.location.origin.includes(':3000')) {
      this.baseUrl = '/api';
    } else {
      this.baseUrl = 'http://localhost:3000/api';
    }

    this.useMockFallback = true;
    this.isLiveBackend = false;
    this.statusListeners = [];
    this.backendMeta = null;
    this.storageKey = 'patrimonia_db_persistent_v1';

    // Semilla inicial predeterminada
    this.initialSeedDatabase = {
      stats: { totalMuseums: 4, totalArtworks: 6, activeRooms: 5, weeklyTours: 3, avgConservation: 89.7 },
      museums: [
        {
          id: "mus-1",
          name: "Museo Nacional de Bellas Artes y Patrimonio",
          description: "Principal institución dedicada a la preservación y divulgación de obras pictóricas, escultóricas y orfebrería de los siglos XVI al XIX.",
          location: "Madrid, España · Paseo del Arte 45",
          coordinates: "40.4168° N, 3.7038° W",
          webUrl: "https://www.patrimonio-artes.gob.es",
          image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
          totalWorks: 580,
          activeRooms: 7,
          foundedYear: 1819
        },
        {
          id: "mus-2",
          name: "Museo Arqueológico & Antropológico Central",
          description: "Custodia tesoros precolombinos, piezas del Mediterráneo clásico y fósiles de alta relevancia científica y patrimonial.",
          location: "Bogotá, Colombia · Cra 7 # 28-66",
          coordinates: "4.6152° N, 74.0688° W",
          webUrl: "https://www.arqueologiacentral.org",
          image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
          totalWorks: 420,
          activeRooms: 5,
          foundedYear: 1938
        },
        {
          id: "mus-3",
          name: "Galería de Arte Vanguardista Lumina",
          description: "Espacio experimental enfocado en videoarte, instalaciones cinéticas, arte lumínico contemporáneo y neo-expresionismo.",
          location: "Berlín, Alemania · Auguststraße 69",
          coordinates: "52.5284° N, 13.3958° E",
          webUrl: "https://www.lumina-gallery.eu",
          image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80",
          totalWorks: 194,
          activeRooms: 4,
          foundedYear: 2008
        },
        {
          id: "mus-4",
          name: "Palacio de la Fotografía y Artes Gráficas",
          description: "Monasterio restaurado que alberga colecciones históricas de daguerrotipos, manuscritos iluminados y fotografía analógica.",
          location: "Ciudad de México · Calle Moneda 13",
          coordinates: "19.4326° N, 99.1332° W",
          webUrl: "https://www.palaciofotografia.mx",
          image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
          totalWorks: 90,
          activeRooms: 2,
          foundedYear: 1982
        }
      ],
      artworks: [
        {
          id: "art-1",
          title: "Alegoría de la Luz Aurora",
          artist: "Sofonisba Anguissola",
          artistId: "art-sofonisba",
          category: "Pintura al Óleo",
          creationDate: "1578",
          acquisitionDate: "1984-06-12",
          conservationPercent: 96,
          room: "Sala Dorada Renacentista (R-102)",
          museumId: "mus-1",
          image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
          description: "Retrato mitológico al óleo sobre lino fino. Destaca el tratamiento sutil de los claroscuros y pigmentos ultramarinos originales."
        },
        {
          id: "art-2",
          title: "Busto del Emperador Sereno",
          artist: "Taller Helenístico / Atribuido",
          artistId: "art-helenistico",
          category: "Escultura en Mármol",
          creationDate: "Siglo II d.C.",
          acquisitionDate: "1952-11-03",
          conservationPercent: 88,
          room: "Galería de Arqueología Clásica (A-201)",
          museumId: "mus-2",
          image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
          description: "Talla en mármol de Paros con pátina de envejecimiento natural. Exhibe una técnica refinada en el drapeado y la expresión facial."
        },
        {
          id: "art-3",
          title: "Composición Neón Prismática #4",
          artist: "Eleni Vance",
          artistId: "art-vance",
          category: "Instalación Lumínica",
          creationDate: "2021",
          acquisitionDate: "2022-03-15",
          conservationPercent: 99,
          room: "Pabellón Lumina Experimental (L-01)",
          museumId: "mus-3",
          image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
          description: "Estructura cinética de tubos de neón de cátodo frío y metacrilato reactivo que sincroniza frecuencias de luz con resonancias acústicas."
        },
        {
          id: "art-4",
          title: "Máscara Ceremonial del Sol Dorado",
          artist: "Orfebres Cultura Quimbaya",
          artistId: "art-quimbaya",
          category: "Orfebrería Prehispánica",
          creationDate: "c. 750 d.C.",
          acquisitionDate: "1960-04-22",
          conservationPercent: 92,
          room: "Cámara del Tesoro Precolombino (T-03)",
          museumId: "mus-2",
          image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
          description: "Pieza repujada y fundida a la cera perdida en aleación tumbaga (oro y cobre nativo) con acabados pulidos a espejo."
        },
        {
          id: "art-5",
          title: "Manuscrito Iluminado: Códice de las Estrellas",
          artist: "Fray Gabriel de San Lucas",
          artistId: "art-gabriel",
          category: "Manuscrito y Pergamino",
          creationDate: "1492",
          acquisitionDate: "1973-09-18",
          conservationPercent: 68,
          room: "Bóveda de Documentos Raros (V-10)",
          museumId: "mus-4",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
          description: "Tratado astronómico ilustrado con panes de oro y tintas minerales. Requiere control estricto de humedad (<45%) y cero luz ultravioleta."
        },
        {
          id: "art-6",
          title: "Retrato en Penumbra de Dama con Perla",
          artist: "Sofonisba Anguissola",
          artistId: "art-sofonisba",
          category: "Pintura al Óleo",
          creationDate: "1584",
          acquisitionDate: "1999-01-30",
          conservationPercent: 95,
          room: "Sala Dorada Renacentista (R-102)",
          museumId: "mus-1",
          image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
          description: "Obra maestra de la retratista renacentista. Presenta barniz original estabilizado en el último proceso de conservación preventiva de 2024."
        }
      ],
      rooms: [
        {
          id: "room-1",
          code: "R-102",
          name: "Sala Dorada Renacentista",
          museumName: "Museo Nacional de Bellas Artes",
          museumId: "mus-1",
          capacity: 45,
          currentPieces: 14,
          climateControl: "20.5°C · 50% HR",
          status: "Abierta al Público"
        },
        {
          id: "room-2",
          code: "A-201",
          name: "Galería de Arqueología Clásica",
          museumName: "Museo Arqueológico & Antropológico",
          museumId: "mus-2",
          capacity: 60,
          currentPieces: 28,
          climateControl: "19.8°C · 48% HR",
          status: "Abierta al Público"
        },
        {
          id: "room-3",
          code: "L-01",
          name: "Pabellón Lumina Experimental",
          museumName: "Galería de Arte Vanguardista Lumina",
          museumId: "mus-3",
          capacity: 35,
          currentPieces: 8,
          climateControl: "21.0°C · 45% HR",
          status: "Abierta al Público"
        },
        {
          id: "room-4",
          code: "T-03",
          name: "Cámara del Tesoro Precolombino",
          museumName: "Museo Arqueológico & Antropológico",
          museumId: "mus-2",
          capacity: 25,
          currentPieces: 42,
          climateControl: "20.0°C · 42% HR",
          status: "Acceso Guiado"
        },
        {
          id: "room-5",
          code: "V-10",
          name: "Bóveda de Documentos Raros",
          museumName: "Palacio de la Fotografía y Artes Gráficas",
          museumId: "mus-4",
          capacity: 15,
          currentPieces: 19,
          climateControl: "18.5°C · 40% HR",
          status: "Climatización Restringida"
        }
      ],
      artists: [
        {
          id: "art-sofonisba",
          name: "Sofonisba Anguissola",
          period: "1532 – 1625 · Renacimiento Tardío",
          nationality: "Italiana (Cremona)",
          bio: "Pintora pionera del Renacimiento que alcanzó reconocimiento internacional en las cortes europeas, elogiada por Miguel Ángel y retratista de la corte de Felipe II.",
          worksCount: 4,
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
        },
        {
          id: "art-vance",
          name: "Eleni Vance",
          period: "1986 – Presente · Arte Contemporáneo",
          nationality: "Greco-Alemana (Berlín)",
          bio: "Artista multidisciplinar e ingeniera lumínica conocida por sus instalaciones cinéticas a gran escala que exploran la refracción del espectro visible y el vacío espacial.",
          worksCount: 3,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        },
        {
          id: "art-gabriel",
          name: "Fray Gabriel de San Lucas",
          period: "c. 1450 – 1512 · Gótico Tardío",
          nationality: "Española (Toledo)",
          bio: "Maestro miniaturista y calígrafo monástico, reconocido por la precisión botánica y astronómica plasmada en pergaminos litúrgicos y cartas náuticas.",
          worksCount: 2,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
        },
        {
          id: "art-quimbaya",
          name: "Maestros Orfebres Quimbaya",
          period: "Periodo Clásico Prehispánico (500 – 1000 d.C.)",
          nationality: "Cuenca del Río Cauca (Colombia)",
          bio: "Colectivo patrimonial de creadores que alcanzaron una cúspide metalúrgica sin precedentes en el tratamiento de aleaciones áureas con técnica de fundición por cera perdida.",
          worksCount: 6,
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
        }
      ],
      tours: [
        {
          id: "tour-1",
          title: "Ruta Magistral: Del Renacimiento a la Vanguardia",
          guide: "Dra. Elena Santillán (Curadora Principal)",
          dateTime: "Martes y Jueves · 10:30 AM",
          duration: "90 min",
          registeredAttendees: 18,
          maxCapacity: 25,
          language: "Español e Inglés",
          itinerary: [
            { step: 1, roomName: "Sala Dorada Renacentista (R-102)", durationMin: 25, focus: "Técnica del sfumato y retratos cortesanos" },
            { step: 2, roomName: "Bóveda de Documentos Raros (V-10)", durationMin: 20, focus: "Códices manuscritos y pigmentos botánicos" },
            { step: 3, roomName: "Pabellón Lumina Experimental (L-01)", durationMin: 35, focus: "Instalación lumínica y diálogo contemporáneo" },
            { step: 4, roomName: "Jardín Escultórico Central", durationMin: 10, focus: "Coloquio final con la curadora" }
          ]
        },
        {
          id: "tour-2",
          title: "Oro, Mitos y Alquimia Precolombina",
          guide: "Prof. Mateo Cárdenas (Arqueólogo Residente)",
          dateTime: "Sábados y Domingos · 16:00 PM",
          duration: "75 min",
          registeredAttendees: 22,
          maxCapacity: 25,
          language: "Español",
          itinerary: [
            { step: 1, roomName: "Galería de Arqueología Clásica (A-201)", durationMin: 20, focus: "Cosmogonías comparadas y primeras civilizaciones" },
            { step: 2, roomName: "Cámara del Tesoro Precolombino (T-03)", durationMin: 40, focus: "Metalurgia mágica y la máscara solar Quimbaya" },
            { step: 3, roomName: "Sala de Conservación In-Situ", durationMin: 15, focus: "Demostración de preservación de metales nobles" }
          ]
        },
        {
          id: "tour-3",
          title: "Nocturno de Luces & Tecnologías Patrimoniales",
          guide: "Ing. Clara Von Berg (Conservadora Digital)",
          dateTime: "Viernes · 19:30 PM",
          duration: "60 min",
          registeredAttendees: 15,
          maxCapacity: 20,
          language: "Español, Alemán",
          itinerary: [
            { step: 1, roomName: "Pabellón Lumina Experimental (L-01)", durationMin: 30, focus: "Espectro electromagnético en el arte de neón" },
            { step: 2, roomName: "Laboratorio de Escaneo 3D y Fotogrametría", durationMin: 30, focus: "Gemelos digitales de esculturas clásicas" }
          ]
        }
      ]
    };

    // Cargar datos persistentes de localStorage si existen, o usar semilla
    this.mockDatabase = this.loadFromStorage() || JSON.parse(JSON.stringify(this.initialSeedDatabase));

    // Comprobación inicial de salud y monitoreo activo
    this.checkBackendHealth();
    this.startHealthMonitor();
  }

  /**
   * Persistencia física en localStorage
   */
  saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.mockDatabase));
      }
    } catch (e) {
      console.warn('[ApiService] Error al guardar en localStorage:', e);
    }
  }

  loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.museums) && Array.isArray(parsed.artworks)) {
            // Si por un error previo el almacenamiento quedó en ceros/vacío, restaurar semilla
            if (parsed.museums.length === 0 && parsed.artworks.length === 0) {
              return null;
            }
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[ApiService] Error al leer de localStorage:', e);
    }
    return null;
  }

  startHealthMonitor() {
    // Monitoreo periódico cada 4 segundos para detectar cuando el usuario encienda XAMPP / Node
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.checkBackendHealth();
      }, 4000);
    }
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.isLiveBackend, this.backendMeta);
  }

  notifyStatus(isLive, meta = null) {
    const wasLive = this.isLiveBackend;
    this.isLiveBackend = isLive;
    this.backendMeta = meta;

    if (!wasLive && isLive) {
      console.log("%c✓ [Conexión Establecida] Backend Node.js + MySQL Activo", "color: #10b981; font-weight: bold; font-size: 13px;");
    }

    this.statusListeners.forEach(cb => cb(isLive, meta));
  }

  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/health`, { credentials: 'omit', signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const meta = await res.json();
        this.notifyStatus(true, meta);
        return true;
      }
    } catch (e) {
      // Backend desconectado
    }
    this.notifyStatus(false, null);
    return false;
  }

  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.isLiveBackend) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: { ...defaultHeaders, ...options.headers }
        });
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Sincronizar en almacén local como copia de seguridad
        this.syncEndpointToMock(endpoint, options.method || 'GET', data);
        return data;
      } catch (err) {
        console.warn(`[ApiService] Fallo en MySQL al consultar ${endpoint}. Utilizando almacén persistente:`, err.message);
      }
    }

    // Retardo simulado suave
    await new Promise(resolve => setTimeout(resolve, 60));
    const result = this.mockHandler(endpoint, options);
    this.saveToStorage(); // Asegura persistencia en disco tras cada operación
    return result;
  }

  syncEndpointToMock(endpoint, method, data) {
    try {
      if (!data) return;
      if (endpoint === '/museos') {
        if (method === 'GET' && Array.isArray(data)) this.mockDatabase.museums = data;
        if (method === 'POST') this.mockDatabase.museums.unshift(data);
        this.saveToStorage();
      } else if (endpoint.startsWith('/museos/') && method === 'PUT') {
        const id = endpoint.split('/')[2];
        const idx = this.mockDatabase.museums.findIndex(m => String(m.id).toLowerCase() === String(id).toLowerCase());
        if (idx !== -1) this.mockDatabase.museums[idx] = { ...this.mockDatabase.museums[idx], ...data };
        else this.mockDatabase.museums.unshift(data);
        this.saveToStorage();
      } else if (endpoint === '/obras') {
        if (method === 'GET' && Array.isArray(data)) this.mockDatabase.artworks = data;
        if (method === 'POST') this.mockDatabase.artworks.unshift(data);
        this.saveToStorage();
      } else if (endpoint.startsWith('/obras/') && method === 'PUT') {
        const id = endpoint.split('/')[2];
        const idx = this.mockDatabase.artworks.findIndex(a => String(a.id).toLowerCase() === String(id).toLowerCase());
        if (idx !== -1) this.mockDatabase.artworks[idx] = { ...this.mockDatabase.artworks[idx], ...data };
        else this.mockDatabase.artworks.unshift(data);
        this.saveToStorage();
      } else if (endpoint === '/salas') {
        if (method === 'GET' && Array.isArray(data)) this.mockDatabase.rooms = data;
        if (method === 'POST') this.mockDatabase.rooms.push(data);
        this.saveToStorage();
      } else if (endpoint.startsWith('/salas/') && method === 'PUT') {
        const id = endpoint.split('/')[2];
        const idx = this.mockDatabase.rooms.findIndex(r => String(r.id).toLowerCase() === String(id).toLowerCase());
        if (idx !== -1) this.mockDatabase.rooms[idx] = { ...this.mockDatabase.rooms[idx], ...data };
        else this.mockDatabase.rooms.push(data);
        this.saveToStorage();
      } else if (endpoint === '/artistas') {
        if (method === 'GET' && Array.isArray(data)) this.mockDatabase.artists = data;
        if (method === 'POST') this.mockDatabase.artists.push(data);
        this.saveToStorage();
      } else if (endpoint.startsWith('/artistas/') && method === 'PUT') {
        const id = endpoint.split('/')[2];
        const idx = this.mockDatabase.artists.findIndex(a => String(a.id).toLowerCase() === String(id).toLowerCase());
        if (idx !== -1) this.mockDatabase.artists[idx] = { ...this.mockDatabase.artists[idx], ...data };
        else this.mockDatabase.artists.push(data);
        this.saveToStorage();
      } else if (endpoint === '/tours') {
        if (method === 'GET' && Array.isArray(data)) this.mockDatabase.tours = data;
        if (method === 'POST') this.mockDatabase.tours.unshift(data);
        this.saveToStorage();
      } else if (endpoint.startsWith('/tours/') && method === 'PUT') {
        const id = endpoint.split('/')[2];
        const idx = this.mockDatabase.tours.findIndex(t => String(t.id).toLowerCase() === String(id).toLowerCase());
        if (idx !== -1) this.mockDatabase.tours[idx] = { ...this.mockDatabase.tours[idx], ...data };
        else this.mockDatabase.tours.unshift(data);
        this.saveToStorage();
      }
    } catch (e) {
      // Ignorar errores de sincronización
    }
  }

  mockHandler(endpoint, options) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    if (endpoint === '/stats' && method === 'GET') {
      const museums = this.mockDatabase.museums || [];
      const artworks = this.mockDatabase.artworks || [];
      const rooms = this.mockDatabase.rooms || [];
      const tours = this.mockDatabase.tours || [];
      const avg = artworks.length > 0
        ? parseFloat((artworks.reduce((acc, a) => acc + (Number(a.conservationPercent) || 95), 0) / artworks.length).toFixed(1))
        : 95.0;

      return {
        totalMuseums: museums.length,
        totalArtworks: artworks.length,
        activeRooms: rooms.length,
        weeklyTours: tours.length,
        avgConservation: avg
      };
    }

    if (endpoint === '/museos') {
      if (method === 'GET') return [...this.mockDatabase.museums];
      if (method === 'POST') {
        const nextNum = this.mockDatabase.museums.length + 1;
        const newMuseum = {
          id: `mus-${nextNum}`,
          totalWorks: 0,
          activeRooms: 1,
          foundedYear: 2000,
          image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
          ...body
        };
        this.mockDatabase.museums.unshift(newMuseum);
        this.mockDatabase.stats.totalMuseums++;
        this.saveToStorage();
        return newMuseum;
      }
    }

    if (endpoint.startsWith('/museos/') && method === 'PUT') {
      const musId = endpoint.split('/')[2];
      const mus = this.mockDatabase.museums.find(m => String(m.id).toLowerCase() === String(musId).toLowerCase());
      if (mus && body) {
        Object.assign(mus, body);
        this.saveToStorage();
        return { ...mus };
      } else if (body) {
        const newMus = { id: musId, totalWorks: 0, activeRooms: 1, foundedYear: 2000, ...body };
        this.mockDatabase.museums.unshift(newMus);
        this.saveToStorage();
        return newMus;
      }
      return { id: musId, ...(body || {}) };
    }

    if (endpoint === '/obras') {
      if (method === 'GET') return [...this.mockDatabase.artworks];
      if (method === 'POST') {
        const nextNum = this.mockDatabase.artworks.length + 1;
        const newArt = {
          id: `art-${nextNum}`,
          acquisitionDate: new Date().toISOString().split('T')[0],
          conservationPercent: body.conservationPercent !== undefined ? parseInt(body.conservationPercent, 10) : 95,
          image: body.image || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
          ...body
        };
        this.mockDatabase.artworks.unshift(newArt);
        this.mockDatabase.stats.totalArtworks++;
        this.saveToStorage();
        return newArt;
      }
    }

    if (endpoint.startsWith('/obras/') && endpoint.endsWith('/conservation') && method === 'PUT') {
      const artId = endpoint.split('/')[2];
      const art = this.mockDatabase.artworks.find(a => String(a.id).toLowerCase() === String(artId).toLowerCase());
      if (art && body) {
        art.conservationPercent = body.conservationPercent !== undefined ? parseInt(body.conservationPercent, 10) : (body.percent !== undefined ? parseInt(body.percent, 10) : art.conservationPercent);
        this.saveToStorage();
        return art;
      }
    }

    if (endpoint.startsWith('/obras/') && !endpoint.endsWith('/conservation') && method === 'PUT') {
      const artId = endpoint.split('/')[2];
      const art = this.mockDatabase.artworks.find(a => String(a.id).toLowerCase() === String(artId).toLowerCase());
      if (art && body) {
        Object.assign(art, body);
        this.saveToStorage();
        return { ...art };
      } else if (body) {
        const newArt = { id: artId, conservationPercent: 95, ...body };
        this.mockDatabase.artworks.unshift(newArt);
        this.saveToStorage();
        return newArt;
      }
      return { id: artId, ...(body || {}) };
    }

    if (endpoint === '/salas') {
      if (method === 'GET') return [...this.mockDatabase.rooms];
      if (method === 'POST') {
        const nextNum = this.mockDatabase.rooms.length + 1;
        const newRoom = {
          id: `room-${nextNum}`,
          currentPieces: 0,
          status: "Abierta al Público",
          climateControl: "20.0°C · 50% HR",
          capacity: 30,
          ...body
        };
        this.mockDatabase.rooms.push(newRoom);
        this.mockDatabase.stats.activeRooms++;
        this.saveToStorage();
        return newRoom;
      }
    }

    if (endpoint.startsWith('/salas/') && method === 'PUT') {
      const roomId = endpoint.split('/')[2];
      const room = this.mockDatabase.rooms.find(r => String(r.id).toLowerCase() === String(roomId).toLowerCase());
      if (room && body) {
        Object.assign(room, body);
        this.saveToStorage();
        return { ...room };
      } else if (body) {
        const newRoom = { id: roomId, capacity: 30, status: "Abierta al Público", ...body };
        this.mockDatabase.rooms.push(newRoom);
        this.saveToStorage();
        return newRoom;
      }
      return { id: roomId, ...(body || {}) };
    }

    if (endpoint === '/artistas') {
      if (method === 'GET') return [...this.mockDatabase.artists];
      if (method === 'POST') {
        const nextNum = this.mockDatabase.artists.length + 1;
        const newArtist = {
          id: `artist-${nextNum}`,
          worksCount: 1,
          avatar: body.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
          bio: body.bio || "Sin reseña biográfica registrada.",
          ...body
        };
        this.mockDatabase.artists.push(newArtist);
        this.saveToStorage();
        return newArtist;
      }
    }

    if (endpoint.startsWith('/artistas/') && method === 'PUT') {
      const artistId = endpoint.split('/')[2];
      const artist = this.mockDatabase.artists.find(a => String(a.id).toLowerCase() === String(artistId).toLowerCase());
      if (artist && body) {
        Object.assign(artist, body);
        this.saveToStorage();
        return { ...artist };
      } else if (body) {
        const newArtist = { id: artistId, worksCount: 1, ...body };
        this.mockDatabase.artists.push(newArtist);
        this.saveToStorage();
        return newArtist;
      }
      return { id: artistId, ...(body || {}) };
    }

    if (endpoint === '/tours') {
      if (method === 'GET') return [...this.mockDatabase.tours];
      if (method === 'POST') {
        const nextNum = this.mockDatabase.tours.length + 1;
        const newTour = {
          id: `tour-${nextNum}`,
          registeredAttendees: 0,
          duration: "60 min",
          maxCapacity: 25,
          language: "Español",
          ...body
        };
        this.mockDatabase.tours.unshift(newTour);
        this.mockDatabase.stats.weeklyTours++;
        this.saveToStorage();
        return newTour;
      }
    }

    if (endpoint.startsWith('/tours/') && !endpoint.endsWith('/register') && method === 'PUT') {
      const tourId = endpoint.split('/')[2];
      const tour = this.mockDatabase.tours.find(t => String(t.id).toLowerCase() === String(tourId).toLowerCase());
      if (tour && body) {
        Object.assign(tour, body);
        this.saveToStorage();
        return { ...tour };
      } else if (body) {
        const newTour = { id: tourId, maxCapacity: 25, ...body };
        this.mockDatabase.tours.unshift(newTour);
        this.saveToStorage();
        return newTour;
      }
      return { id: tourId, ...(body || {}) };
    }

    if (endpoint.startsWith('/tours/') && endpoint.endsWith('/register') && method === 'POST') {
      const tourId = endpoint.split('/')[2];
      const tour = this.mockDatabase.tours.find(t => t.id === tourId);
      if (tour && tour.registeredAttendees < tour.maxCapacity) {
        tour.registeredAttendees++;
        this.saveToStorage();
        return tour;
      }
      throw new Error("Aforo completo para este tour");
    }

    return { status: "OK", message: "Operación completada con éxito" };
  }

  // --- Métodos de Alto Nivel de la API ---

  async getDashboardStats() {
    return this.request('/stats');
  }

  async getMuseums() {
    return this.request('/museos');
  }

  async createMuseum(museumData) {
    return this.request('/museos', {
      method: 'POST',
      body: JSON.stringify(museumData)
    });
  }

  async updateMuseum(id, museumData) {
    return this.request(`/museos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(museumData)
    });
  }

  async getArtworks() {
    return this.request('/obras');
  }

  async createArtwork(artworkData) {
    return this.request('/obras', {
      method: 'POST',
      body: JSON.stringify(artworkData)
    });
  }

  async updateArtwork(id, artworkData) {
    return this.request(`/obras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(artworkData)
    });
  }

  async updateArtworkConservation(artworkId, percent) {
    return this.request(`/obras/${artworkId}/conservation`, {
      method: 'PUT',
      body: JSON.stringify({ conservationPercent: percent })
    });
  }

  async getRooms() {
    return this.request('/salas');
  }

  async createRoom(roomData) {
    return this.request('/salas', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  async updateRoom(id, roomData) {
    return this.request(`/salas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  }

  async getArtists() {
    return this.request('/artistas');
  }

  async createArtist(artistData) {
    return this.request('/artistas', {
      method: 'POST',
      body: JSON.stringify(artistData)
    });
  }

  async updateArtist(id, artistData) {
    return this.request(`/artistas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(artistData)
    });
  }

  async getTours() {
    return this.request('/tours');
  }

  async createTour(tourData) {
    return this.request('/tours', {
      method: 'POST',
      body: JSON.stringify(tourData)
    });
  }

  async updateTour(id, tourData) {
    return this.request(`/tours/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tourData)
    });
  }

  async registerTour(tourId) {
    return this.request(`/tours/${tourId}/register`, {
      method: 'POST'
    });
  }
}

// Instancia global compartida
if (typeof window !== 'undefined') {
  window.ApiService = ApiService;
  window.museumApi = new ApiService();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
