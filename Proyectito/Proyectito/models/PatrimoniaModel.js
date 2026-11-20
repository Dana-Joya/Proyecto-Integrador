/**
 * ==============================================================================
 * MODELO: PatrimoniaModel (POO / MVC)
 * Gestiona el estado reactivo del catálogo patrimonial, integrando las
 * entidades basadas en herencia (MuseumModel, ArtworkModel, RoomModel, etc.).
 * ==============================================================================
 */

class PatrimoniaModel {
  constructor() {
    this.activeSection = 'dashboard';
    this.activeSubtab = 'rooms';

    this.museums = [];
    this.artworks = [];
    this.rooms = [];
    this.artists = [];
    this.tours = [];
    this.stats = {
      totalMuseums: 0,
      totalArtworks: 0,
      activeRooms: 0,
      weeklyTours: 0,
      avgConservation: 95
    };

    this.artworkFilter = {
      category: 'all',
      conservation: 'all',
      search: ''
    };

    this.listeners = [];
  }

  /**
   * Inicialización de datos asegurando instanciación de clases hijas (Herencia y Polimorfismo)
   */
  setInitialData({ stats, museums, artworks, rooms, artists, tours }) {
    const MuseumCls = typeof MuseumModel !== 'undefined' ? MuseumModel : (typeof window !== 'undefined' ? (window.MuseumModel || window.Museum) : null);
    const ArtworkCls = typeof ArtworkModel !== 'undefined' ? ArtworkModel : (typeof window !== 'undefined' ? (window.ArtworkModel || window.Artwork) : null);
    const RoomCls = typeof RoomModel !== 'undefined' ? RoomModel : (typeof window !== 'undefined' ? (window.RoomModel || window.Room) : null);
    const ArtistCls = typeof ArtistModel !== 'undefined' ? ArtistModel : (typeof window !== 'undefined' ? (window.ArtistModel || window.Artist) : null);
    const TourCls = typeof TourModel !== 'undefined' ? TourModel : (typeof window !== 'undefined' ? (window.TourModel || window.Tour) : null);

    if (museums && Array.isArray(museums)) {
      this.museums = museums.map(m => (MuseumCls && !(m instanceof MuseumCls) ? new MuseumCls(m) : m));
    }
    if (artworks && Array.isArray(artworks)) {
      this.artworks = artworks.map(a => (ArtworkCls && !(a instanceof ArtworkCls) ? new ArtworkCls(a) : a));
    }
    if (rooms && Array.isArray(rooms)) {
      this.rooms = rooms.map(r => (RoomCls && !(r instanceof RoomCls) ? new RoomCls(r) : r));
    }
    if (artists && Array.isArray(artists)) {
      this.artists = artists.map(art => (ArtistCls && !(art instanceof ArtistCls) ? new ArtistCls(art) : art));
    }
    if (tours && Array.isArray(tours)) {
      this.tours = tours.map(t => (TourCls && !(t instanceof TourCls) ? new TourCls(t) : t));
    }
    if (stats) {
      this.stats = { ...stats };
    }
    this.recalculateStats();
    this.notify();
  }

  recalculateStats() {
    this.stats.totalMuseums = this.museums.length;
    this.stats.totalArtworks = this.artworks.length;
    this.stats.activeRooms = this.rooms.length;
    this.stats.weeklyTours = this.tours.length;

    if (this.artworks.length > 0) {
      const sum = this.artworks.reduce((acc, a) => acc + (Number(a.conservationPercent) || 95), 0);
      this.stats.avgConservation = parseFloat((sum / this.artworks.length).toFixed(1));
    } else {
      this.stats.avgConservation = 95.0;
    }
  }

  addMuseum(museum) {
    const inst = museum instanceof MuseumModel ? museum : new MuseumModel(museum);
    inst.validate();
    this.museums.unshift(inst);
    this.recalculateStats();
    this.notify();
  }

  updateMuseum(updated) {
    const idx = this.museums.findIndex(m => String(m.id) === String(updated.id));
    if (idx !== -1) {
      const inst = new MuseumModel({ ...this.museums[idx], ...updated });
      inst.validate();
      this.museums[idx] = inst;
    } else {
      const inst = new MuseumModel(updated);
      inst.validate();
      this.museums.unshift(inst);
    }
    this.recalculateStats();
    this.notify();
  }

  addArtwork(artwork) {
    const inst = artwork instanceof ArtworkModel ? artwork : new ArtworkModel(artwork);
    inst.validate();
    this.artworks.unshift(inst);
    this.recalculateStats();
    this.notify();
  }

  updateArtwork(updated) {
    const idx = this.artworks.findIndex(a => String(a.id) === String(updated.id));
    if (idx !== -1) {
      const inst = new ArtworkModel({ ...this.artworks[idx], ...updated });
      inst.validate();
      this.artworks[idx] = inst;
    } else {
      const inst = new ArtworkModel(updated);
      inst.validate();
      this.artworks.unshift(inst);
    }
    this.recalculateStats();
    this.notify();
  }

  updateArtworkConservation(id, percent) {
    const art = this.artworks.find(a => String(a.id) === String(id));
    if (art) {
      art.conservationPercent = percent;
      art.validate();
      this.recalculateStats();
      this.notify();
    }
  }

  addRoom(room) {
    const inst = room instanceof RoomModel ? room : new RoomModel(room);
    inst.validate();
    this.rooms.push(inst);
    this.recalculateStats();
    this.notify();
  }

  updateRoom(updated) {
    const idx = this.rooms.findIndex(r => String(r.id) === String(updated.id));
    if (idx !== -1) {
      const inst = new RoomModel({ ...this.rooms[idx], ...updated });
      inst.validate();
      this.rooms[idx] = inst;
    } else {
      const inst = new RoomModel(updated);
      inst.validate();
      this.rooms.push(inst);
    }
    this.recalculateStats();
    this.notify();
  }

  addArtist(artist) {
    const inst = artist instanceof ArtistModel ? artist : new ArtistModel(artist);
    inst.validate();
    this.artists.push(inst);
    this.notify();
  }

  updateArtist(updated) {
    const idx = this.artists.findIndex(a => String(a.id) === String(updated.id));
    if (idx !== -1) {
      const inst = new ArtistModel({ ...this.artists[idx], ...updated });
      inst.validate();
      this.artists[idx] = inst;
    } else {
      const inst = new ArtistModel(updated);
      inst.validate();
      this.artists.push(inst);
    }
    this.notify();
  }

  addTour(tour) {
    const inst = tour instanceof TourModel ? tour : new TourModel(tour);
    inst.validate();
    this.tours.unshift(inst);
    this.recalculateStats();
    this.notify();
  }

  updateTour(updatedTour) {
    const idx = this.tours.findIndex(t => String(t.id) === String(updatedTour.id));
    if (idx !== -1) {
      const inst = new TourModel({ ...this.tours[idx], ...updatedTour });
      inst.validate();
      this.tours[idx] = inst;
    } else {
      const inst = new TourModel(updatedTour);
      inst.validate();
      this.tours.unshift(inst);
    }
    this.recalculateStats();
    this.notify();
  }

  setArtworkFilter(newFilter) {
    this.artworkFilter = { ...this.artworkFilter, ...newFilter };
    this.notify();
  }

  getFilteredArtworks() {
    const { category, conservation, search } = this.artworkFilter;

    return this.artworks.filter(art => {
      // Filtro por categoría
      if (category !== 'all' && !art.category.toLowerCase().includes(category.toLowerCase())) {
        return false;
      }

      // Filtro por porcentaje de conservación
      const pct = art.conservationPercent || 0;
      if (conservation === 'excellent' && pct <= 90) return false;
      if (conservation === 'regular' && (pct < 75 || pct > 90)) return false;
      if (conservation === 'critical' && pct >= 75) return false;

      // Filtro por texto de búsqueda
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = art.title && art.title.toLowerCase().includes(q);
        const matchArtist = art.artist && art.artist.toLowerCase().includes(q);
        const matchRoom = art.room && art.room.toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchRoom) return false;
      }

      return true;
    });
  }

  /**
   * Búsqueda integral polimórfica sobre todo el catálogo (Obras, Museos, Artistas, Salas, Tours)
   */
  searchAll(query) {
    if (!query || !query.trim()) {
      return { query: '', total: 0, artworks: [], museums: [], artists: [], rooms: [], tours: [] };
    }

    const q = query.toLowerCase().trim();

    // 1. Obras y artefactos
    const artworks = this.artworks.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.artist && a.artist.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q)) ||
      (a.room && a.room.toLowerCase().includes(q)) ||
      (a.description && a.description.toLowerCase().includes(q))
    );

    // 2. Sedes museísticas
    const museums = this.museums.filter(m =>
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.location && m.location.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.foundedYear && m.foundedYear.toString().includes(q))
    );

    // 3. Artistas y creadores
    const artists = this.artists.filter(art =>
      (art.name && art.name.toLowerCase().includes(q)) ||
      (art.nationality && art.nationality.toLowerCase().includes(q)) ||
      (art.period && art.period.toLowerCase().includes(q)) ||
      (art.bio && art.bio.toLowerCase().includes(q))
    );

    // 4. Salas de exposición
    const rooms = this.rooms.filter(r =>
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.code && r.code.toLowerCase().includes(q)) ||
      (r.museumName && r.museumName.toLowerCase().includes(q)) ||
      (r.climateControl && r.climateControl.toLowerCase().includes(q))
    );

    // 5. Visitas guiadas (Tours)
    const tours = this.tours.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.guide && t.guide.toLowerCase().includes(q)) ||
      (t.language && t.language.toLowerCase().includes(q)) ||
      (t.dateTime && t.dateTime.toLowerCase().includes(q)) ||
      (Array.isArray(t.itinerary) && t.itinerary.some(step =>
        (step.roomName && step.roomName.toLowerCase().includes(q)) ||
        (step.focus && step.focus.toLowerCase().includes(q))
      ))
    );

    const total = artworks.length + museums.length + artists.length + rooms.length + tours.length;
    return { query, total, artworks, museums, artists, rooms, tours };
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }
}

if (typeof window !== 'undefined') {
  window.PatrimoniaModel = PatrimoniaModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PatrimoniaModel;
}
