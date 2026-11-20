/**
 * ==============================================================================
 * CONTROLADOR PRINCIPAL: AppController (POO / MVC)
 * Orquesta los modelos, vistas, servicios y adaptaciones de accesibilidad.
 * ==============================================================================
 */

class AppController {
  constructor() {
    this.model = new PatrimoniaModel();
    this.api = window.museumApi || new ApiService();

    // Vistas especializadas
    this.modalView = new ModalView();
    this.toastView = new ToastView();
    this.dashboardView = new DashboardView();
    this.museumView = new MuseumView();
    this.artworkView = new ArtworkView();
    this.roomArtistView = new RoomArtistView();
    this.tourView = new TourView();

    // Vista de Búsqueda Global Integral
    this.globalSearchView = new GlobalSearchView();
    this.searchDebounceTimer = null;
    this.currentSearchResults = null;

    // Controlador de Accesibilidad
    this.accessibility = new AccessibilityController();

    // Para backward compatibility con toasts
    window.toastView = this.toastView;
  }

  async init() {
    document.body.style.overflow = '';
    this.cacheDOM();
    this.bindEvents();
    this.listenApiStatus();

    // Reaccionar ante cambios en el modelo de datos
    this.model.subscribe(() => {
      this.render();
    });

    await this.loadInitialData();
    this.render();
  }

  cacheDOM() {
    this.dom = {
      navButtons: document.querySelectorAll('.nav-btn'),
      sections: document.querySelectorAll('.content-section'),
      breadcrumbActive: document.getElementById('breadcrumbActive'),
      mobileMenuBtn: document.getElementById('mobileMenuBtn'),
      sidebar: document.getElementById('sidebar'),
      globalSearchInput: document.getElementById('globalSearchInput'),
      apiStatusText: document.getElementById('apiStatusText'),
      apiStatusDot: document.getElementById('apiStatusDot'),
      artworkCategoryFilter: document.getElementById('artworkCategoryFilter'),
      artworkConservationFilter: document.getElementById('artworkConservationFilter'),
      artworkSearchInput: document.getElementById('artworkSearchInput'),
      quickActionNewArtwork: document.getElementById('quickActionNewArtwork'),
      quickActionNewMuseum: document.getElementById('quickActionNewMuseum'),
      quickActionTours: document.getElementById('quickActionTours'),
      quickActionRooms: document.getElementById('quickActionRooms'),
      badgeMuseumsCount: document.getElementById('badgeMuseumsCount'),
      badgeArtworksCount: document.getElementById('badgeArtworksCount'),
      badgeRoomsCount: document.getElementById('badgeRoomsCount'),
      badgeToursCount: document.getElementById('badgeToursCount')
    };
  }

  bindEvents() {
    // 1. Navegación principal entre secciones
    this.dom.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSection = btn.dataset.section;
        if (targetSection) this.navigateTo(targetSection);
      });
    });

    // Accesos directos del Dashboard
    if (this.dom.quickActionNewArtwork) {
      this.dom.quickActionNewArtwork.addEventListener('click', () => this.openAddArtworkModal());
    }
    if (this.dom.quickActionNewMuseum) {
      this.dom.quickActionNewMuseum.addEventListener('click', () => this.openAddMuseumModal());
    }
    if (this.dom.quickActionTours) {
      this.dom.quickActionTours.addEventListener('click', () => this.navigateTo('tours'));
    }
    if (this.dom.quickActionRooms) {
      this.dom.quickActionRooms.addEventListener('click', () => {
        this.navigateTo('rooms');
        this.switchSubtab('rooms');
      });
    }

    // 2. Menú móvil responsive
    if (this.dom.mobileMenuBtn && this.dom.sidebar) {
      this.dom.mobileMenuBtn.addEventListener('click', () => {
        const isOpen = this.dom.sidebar.classList.toggle('open');
        this.dom.mobileMenuBtn.setAttribute('aria-expanded', isOpen.toString());
      });
    }

    // 3. Subtabs para Salas y Artistas
    if (this.roomArtistView.subtabButtons) {
      this.roomArtistView.subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.subtab;
          this.switchSubtab(target);
        });
      });
    }

    // 4. Filtros de Obras
    if (this.dom.artworkCategoryFilter) {
      this.dom.artworkCategoryFilter.addEventListener('change', (e) => {
        this.model.setArtworkFilter({ category: e.target.value });
      });
    }

    if (this.dom.artworkConservationFilter) {
      this.dom.artworkConservationFilter.addEventListener('change', (e) => {
        this.model.setArtworkFilter({ conservation: e.target.value });
      });
    }

    if (this.dom.artworkSearchInput) {
      this.dom.artworkSearchInput.addEventListener('input', (e) => {
        this.model.setArtworkFilter({ search: e.target.value.toLowerCase().trim() });
      });
    }

    // 5. Búsqueda Global en Header (Obras, Sedes, Artistas, Salas, Tours)
    if (this.dom.globalSearchInput) {
      this.dom.globalSearchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchDebounceTimer);
        const query = e.target.value;
        this.searchDebounceTimer = setTimeout(() => {
          this.handleGlobalSearch(query);
        }, 120);
      });

      this.dom.globalSearchInput.addEventListener('focus', (e) => {
        const query = e.target.value;
        if (query && query.trim().length > 0) {
          this.handleGlobalSearch(query);
        }
      });

      this.dom.globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.openFullSearchModal();
        } else if (e.key === 'Escape') {
          this.globalSearchView.hide();
        }
      });
    }

    // Cerrar desplegable de búsqueda al hacer clic fuera
    document.addEventListener('click', (e) => {
      const searchBox = document.querySelector('.header-search');
      if (searchBox && !searchBox.contains(e.target)) {
        this.globalSearchView.hide();
      }
    });

    // 6. Atajos de teclado accesibles
    document.addEventListener('keydown', (e) => {
      // Ignorar si el usuario está escribiendo en un input
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.altKey && e.key === '1') { e.preventDefault(); this.navigateTo('dashboard'); }
      if (e.altKey && e.key === '2') { e.preventDefault(); this.navigateTo('museums'); }
      if (e.altKey && e.key === '3') { e.preventDefault(); this.navigateTo('artworks'); }
      if (e.altKey && e.key === '4') { e.preventDefault(); this.navigateTo('rooms'); }
      if (e.altKey && e.key === '5') { e.preventDefault(); this.navigateTo('tours'); }

      if (e.key === '/' && this.dom.globalSearchInput) {
        e.preventDefault();
        this.dom.globalSearchInput.focus();
      }
    });
  }

  listenApiStatus() {
    let previousLive = null;
    this.api.onStatusChange(async (isLive, meta) => {
      if (this.dom.apiStatusText && this.dom.apiStatusDot) {
        if (isLive) {
          const isDbConnected = meta && meta.database === 'CONNECTED';
          if (isDbConnected) {
            this.dom.apiStatusText.textContent = 'Node.js + MySQL Conectado';
            this.dom.apiStatusDot.style.background = '#10b981';
            this.dom.apiStatusDot.style.boxShadow = '0 0 8px #10b981';
            if (previousLive === false) {
              await this.loadInitialData();
              this.render();
            }
          } else {
            this.dom.apiStatusText.textContent = 'Node.js (Esperando MySQL phpMyAdmin)';
            this.dom.apiStatusDot.style.background = '#f59e0b';
            this.dom.apiStatusDot.style.boxShadow = '0 0 8px #f59e0b';
          }
        } else {
          this.dom.apiStatusText.textContent = 'Modo Local (Autónomo)';
          this.dom.apiStatusDot.style.background = '#C084FC';
          this.dom.apiStatusDot.style.boxShadow = '0 0 8px #C084FC';
        }
      }
      previousLive = isLive;
    });
  }

  async loadInitialData() {
    try {
      const [stats, museums, artworks, rooms, artists, tours] = await Promise.all([
        this.api.getDashboardStats(),
        this.api.getMuseums(),
        this.api.getArtworks(),
        this.api.getRooms(),
        this.api.getArtists(),
        this.api.getTours()
      ]);

      this.model.setInitialData({ stats, museums, artworks, rooms, artists, tours });
    } catch (error) {
      console.warn('[AppController] Error en carga inicial:', error);
    }
  }

  render() {
    this.dashboardView.renderStats(this.model.stats);
    this.dashboardView.renderCategoryChart(this.model.artworks);
    this.dashboardView.renderActivityLog(this.model);
    this.updateSidebarBadges();
    this.museumView.render(this.model.museums);
    this.artworkView.render(this.model.getFilteredArtworks());
    this.roomArtistView.renderRooms(this.model.rooms);
    this.roomArtistView.renderArtists(this.model.artists);
    this.tourView.render(this.model.tours);
  }

  updateSidebarBadges() {
    if (this.dom.badgeMuseumsCount) {
      this.dom.badgeMuseumsCount.textContent = this.model.museums.length;
    }
    if (this.dom.badgeArtworksCount) {
      this.dom.badgeArtworksCount.textContent = this.model.artworks.length;
    }
    if (this.dom.badgeRoomsCount) {
      this.dom.badgeRoomsCount.textContent = this.model.rooms.length;
    }
    if (this.dom.badgeToursCount) {
      this.dom.badgeToursCount.textContent = this.model.tours.length;
    }
  }

  navigateTo(sectionId) {
    this.model.activeSection = sectionId;
    document.body.setAttribute('data-active-section', sectionId);

    this.dom.sections.forEach(sec => {
      const isTarget = sec.id === sectionId;
      sec.classList.toggle('active-section', isTarget);
      sec.classList.toggle('active', isTarget);
      if (isTarget) {
        sec.focus();
      }
    });

    this.dom.navButtons.forEach(btn => {
      const isCurrent = btn.dataset.section === sectionId;
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-current', isCurrent ? 'page' : 'false');
    });

    if (this.dom.breadcrumbActive) {
      const titles = {
        dashboard: 'Dashboard / Vista General',
        museums: 'Sedes Museísticas',
        artworks: 'Obras & Artefactos',
        rooms: 'Salas y Artistas',
        tours: 'Visitas Guiadas (Tours)'
      };
      this.dom.breadcrumbActive.textContent = titles[sectionId] || 'Patrimonia';
    }

    if (this.dom.sidebar && this.dom.sidebar.classList.contains('open')) {
      this.dom.sidebar.classList.remove('open');
      if (this.dom.mobileMenuBtn) {
        this.dom.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchSubtab(target) {
    this.model.activeSubtab = target;
    this.roomArtistView.switchSubtab(target);
  }

  showToast(message) {
    this.toastView.show(message);
  }

  closeModal() {
    this.modalView.close();
  }

  // --- Búsqueda Global Integral (Obras, Sedes, Artistas, Salas, Tours) ---
  handleGlobalSearch(query) {
    if (!query || query.trim().length === 0) {
      this.currentSearchResults = null;
      this.globalSearchView.hide();
      return;
    }

    const results = this.model.searchAll(query);
    this.currentSearchResults = results;
    this.globalSearchView.renderDropdown(results);
  }

  openFullSearchModal() {
    const query = this.dom.globalSearchInput?.value?.trim();
    if (!query) return;

    this.globalSearchView.hide();
    const results = (this.currentSearchResults && this.currentSearchResults.query === query)
      ? this.currentSearchResults
      : this.model.searchAll(query);

    const { title, bodyHtml, footerHtml } = this.globalSearchView.getFullResultsModalContent(results);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  selectSearchResult(type, id) {
    this.globalSearchView.hide();

    switch (type) {
      case 'artwork':
        this.openArtworkDetailModal(id);
        break;
      case 'museum':
        this.openMuseumDetailModal(id);
        break;
      case 'artist':
        this.navigateTo('rooms');
        this.switchSubtab('artists');
        this.showToast('Navegando a perfil de Artista');
        break;
      case 'room':
        this.navigateTo('rooms');
        this.switchSubtab('rooms');
        this.showToast('Navegando a ficha de Sala');
        break;
      case 'tour':
        this.navigateTo('tours');
        this.showToast('Navegando a Visitas Guiadas');
        break;
      default:
        break;
    }
  }

  // --- Modales de Museos ---
  openAddMuseumModal() {
    const { title, bodyHtml, footerHtml } = this.museumView.getAddModalContent();
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitNewMuseum() {
    const name = document.getElementById('musNameInput')?.value;
    const description = document.getElementById('musDescInput')?.value;
    const location = document.getElementById('musLocationInput')?.value;
    const coordinates = document.getElementById('musCoordInput')?.value;
    const webUrl = document.getElementById('musWebInput')?.value;
    const foundedYear = parseInt(document.getElementById('musFoundedYearInput')?.value || '2000', 10);
    const image = document.getElementById('musImageInput')?.value || "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80";

    if (!name || !description || !location) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    try {
      const newMuseum = await this.api.createMuseum({
        name,
        description,
        location,
        coordinates: coordinates || "40.0000° N, 3.0000° W",
        webUrl: webUrl || "https://www.patrimonio-cultural.gob",
        foundedYear,
        image
      });

      this.model.addMuseum(newMuseum);
      this.closeModal();
      this.showToast(`Sede "${name}" guardada con éxito en MySQL.`);
    } catch (err) {
      alert('Error al guardar museo: ' + err.message);
    }
  }

  openMuseumDetailModal(id) {
    const mus = this.model.museums.find(m => m.id === id);
    if (!mus) return;
    const { title, bodyHtml, footerHtml } = this.museumView.getDetailModalContent(mus);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  openEditMuseumModal(id) {
    const mus = this.model.museums.find(m => m.id === id);
    if (!mus) return;
    const { title, bodyHtml, footerHtml } = this.museumView.getEditModalContent(mus);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitEditMuseum(id) {
    const name = document.getElementById('editMusNameInput')?.value;
    const description = document.getElementById('editMusDescInput')?.value;
    const location = document.getElementById('editMusLocationInput')?.value;
    const coordinates = document.getElementById('editMusCoordInput')?.value;
    const webUrl = document.getElementById('editMusWebInput')?.value;
    const foundedYear = parseInt(document.getElementById('editMusYearInput')?.value || '2000', 10);
    const activeRooms = parseInt(document.getElementById('editMusRoomsInput')?.value || '1', 10);
    const totalWorks = parseInt(document.getElementById('editMusWorksInput')?.value || '0', 10);
    const image = document.getElementById('editMusImageInput')?.value;

    if (!name || !description || !location) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    try {
      const updatedMuseum = await this.api.updateMuseum(id, {
        name,
        description,
        location,
        coordinates,
        webUrl,
        foundedYear,
        activeRooms,
        totalWorks,
        image
      });

      this.model.updateMuseum(updatedMuseum);
      this.closeModal();
      this.showToast(`Sede "${updatedMuseum.name}" actualizada con éxito en la base de datos.`);
    } catch (err) {
      console.error('[AppController] Error al actualizar museo:', err);
      alert('Error al guardar cambios: ' + err.message);
    }
  }

  // --- Modales de Obras y Lógica de Categorías e Imágenes ---
  getDefaultArtworkImage(category) {
    const defaultImages = {
      'Pintura al Óleo': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      'Escultura en Mármol': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      'Instalación Lumínica': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      'Orfebrería Prehispánica': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      'Manuscrito y Pergamino': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    };
    return defaultImages[category] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
  }

  onArtworkCategoryChange(category, inputId, previewId) {
    const newImgUrl = this.getDefaultArtworkImage(category);
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
      inputEl.value = newImgUrl;
    }
    this.onArtworkImageInput(newImgUrl, previewId);
  }

  onArtworkImageInput(url, previewId) {
    const previewEl = document.getElementById(previewId);
    if (previewEl) {
      const cleanUrl = (url || '').trim();
      if (cleanUrl) {
        previewEl.innerHTML = `<img src="${cleanUrl}" alt="Vista previa" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'font-size:9px; color:var(--text-muted); text-align:center; padding:2px;\\'>Sin imagen</span>';">`;
      } else {
        previewEl.innerHTML = `<span style="font-size:9px; color:var(--text-muted); text-align:center; padding:2px;">Sin imagen</span>`;
      }
    }
  }

  openAddArtworkModal() {
    const { title, bodyHtml, footerHtml } = this.artworkView.getAddModalContent();
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitNewArtwork() {
    const title = document.getElementById('artTitleInput')?.value;
    const artist = document.getElementById('artArtistInput')?.value;
    const category = document.getElementById('artCategoryInput')?.value;
    const creationDate = document.getElementById('artCreationDateInput')?.value;
    const conservationPercent = parseInt(document.getElementById('artConservationInput')?.value || '95', 10);
    const room = document.getElementById('artRoomInput')?.value;
    const description = document.getElementById('artDescInput')?.value;
    const image = document.getElementById('artImageInput')?.value || this.getDefaultArtworkImage(category);

    if (!title || !artist || !description) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    try {
      const newArt = await this.api.createArtwork({
        title,
        artist,
        category,
        creationDate,
        conservationPercent,
        room,
        image,
        description
      });

      this.model.addArtwork(newArt);
      this.closeModal();
      this.showToast(`Obra "${title}" catalogada y guardada en la base de datos.`);
    } catch (err) {
      alert('Error al catalogar obra: ' + err.message);
    }
  }

  openArtworkDetailModal(id) {
    const art = this.model.artworks.find(a => a.id === id);
    if (!art) return;
    const { title, bodyHtml, footerHtml } = this.artworkView.getDetailModalContent(art);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  openEditArtworkModal(id) {
    const art = this.model.artworks.find(a => a.id === id);
    if (!art) return;
    const { title, bodyHtml, footerHtml } = this.artworkView.getEditModalContent(art);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitEditArtwork(id) {
    const title = document.getElementById('editArtTitleInput')?.value;
    const artist = document.getElementById('editArtArtistInput')?.value;
    const category = document.getElementById('editArtCategoryInput')?.value;
    const creationDate = document.getElementById('editArtCreationDateInput')?.value;
    const conservationPercent = parseInt(document.getElementById('editArtConservationInput')?.value || '95', 10);
    const room = document.getElementById('editArtRoomInput')?.value;
    const acquisitionDate = document.getElementById('editArtAcquisitionInput')?.value;
    const image = document.getElementById('editArtImageInput')?.value;
    const description = document.getElementById('editArtDescInput')?.value;

    if (!title || !artist || !description) {
      alert('Por favor complete los campos requeridos.');
      return;
    }

    try {
      const updatedArt = await this.api.updateArtwork(id, {
        title,
        artist,
        category,
        creationDate,
        conservationPercent,
        room,
        acquisitionDate,
        image,
        description
      });

      this.model.updateArtwork(updatedArt);
      this.closeModal();
      this.showToast(`Obra "${updatedArt.title}" actualizada con éxito en la base de datos.`);
    } catch (err) {
      console.error('[AppController] Error al actualizar obra:', err);
      alert('Error al guardar cambios: ' + err.message);
    }
  }

  // --- Modales de Salas y Artistas ---
  openAddRoomModal() {
    const { title, bodyHtml, footerHtml } = this.roomArtistView.getAddRoomModalContent();
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitNewRoom() {
    const code = document.getElementById('roomCodeInput')?.value;
    const status = document.getElementById('roomStatusInput')?.value || 'Abierta al Público';
    const name = document.getElementById('roomNameInput')?.value;
    const museumName = document.getElementById('roomMuseumInput')?.value;
    const capacity = parseInt(document.getElementById('roomCapacityInput')?.value || '35', 10);
    const currentPieces = parseInt(document.getElementById('roomPiecesInput')?.value || '0', 10);
    const climateControl = document.getElementById('roomClimateInput')?.value || '20.0°C · 50% HR';

    if (!code || !name) {
      alert('Por favor complete el código y nombre de la sala.');
      return;
    }

    try {
      const newRoom = await this.api.createRoom({
        code,
        status,
        name,
        museumName: museumName || 'Museo Nacional',
        capacity,
        currentPieces,
        climateControl
      });

      this.model.addRoom(newRoom);
      this.closeModal();
      this.showToast(`Sala "${code} - ${name}" creada y registrada en la base de datos.`);
    } catch (err) {
      console.error('[AppController] Error al crear sala:', err);
      alert('Error al registrar sala: ' + err.message);
    }
  }

  openAddArtistModal() {
    const { title, bodyHtml, footerHtml } = this.roomArtistView.getAddArtistModalContent();
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitNewArtist() {
    const name = document.getElementById('artistNameInput')?.value;
    const nationality = document.getElementById('artistNationalityInput')?.value;
    const period = document.getElementById('artistPeriodInput')?.value;
    const worksCount = parseInt(document.getElementById('artistWorksCountInput')?.value || '1', 10);
    const avatar = document.getElementById('artistAvatarInput')?.value || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
    const bio = document.getElementById('artistBioInput')?.value;

    if (!name || !bio) {
      alert('Por favor complete el nombre y reseña del artista.');
      return;
    }

    try {
      const newArtist = await this.api.createArtist({
        name,
        nationality: nationality || 'Origen no especificado',
        period: period || 'Época contemporánea',
        worksCount,
        avatar,
        bio
      });

      this.model.addArtist(newArtist);
      this.closeModal();
      this.showToast(`Artista "${name}" registrado exitosamente en la base de datos.`);
    } catch (err) {
      console.error('[AppController] Error al crear artista:', err);
      alert('Error al registrar artista: ' + err.message);
    }
  }

  openAddRoomOrArtistModal() {
    if (this.model.activeSubtab === 'artists') {
      this.openAddArtistModal();
    } else {
      this.openAddRoomModal();
    }
  }

  openEditRoomModal(id) {
    const room = this.model.rooms.find(r => r.id === id);
    if (!room) return;
    const { title, bodyHtml, footerHtml } = this.roomArtistView.getEditRoomModalContent(room);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitEditRoom(id) {
    const code = document.getElementById('editRoomCodeInput')?.value;
    const status = document.getElementById('editRoomStatusInput')?.value;
    const name = document.getElementById('editRoomNameInput')?.value;
    const museumName = document.getElementById('editRoomMuseumInput')?.value;
    const capacity = parseInt(document.getElementById('editRoomCapacityInput')?.value || '30', 10);
    const currentPieces = parseInt(document.getElementById('editRoomPiecesInput')?.value || '0', 10);
    const climateControl = document.getElementById('editRoomClimateInput')?.value;

    if (!code || !name) {
      alert('Por favor complete los campos obligatorios de la sala.');
      return;
    }

    try {
      const updatedRoom = await this.api.updateRoom(id, {
        code,
        status,
        name,
        museumName,
        capacity,
        currentPieces,
        climateControl
      });

      this.model.updateRoom(updatedRoom);
      this.closeModal();
      this.showToast(`Sala "${updatedRoom.code} - ${updatedRoom.name}" actualizada con éxito en la base de datos.`);
    } catch (err) {
      console.error('[AppController] Error al actualizar sala:', err);
      alert('Error al guardar cambios: ' + err.message);
    }
  }

  openEditArtistModal(id) {
    const art = this.model.artists.find(a => a.id === id);
    if (!art) return;
    const { title, bodyHtml, footerHtml } = this.roomArtistView.getEditArtistModalContent(art);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitEditArtist(id) {
    const name = document.getElementById('editArtistNameInput')?.value;
    const nationality = document.getElementById('editArtistNationalityInput')?.value;
    const period = document.getElementById('editArtistPeriodInput')?.value;
    const worksCount = parseInt(document.getElementById('editArtistWorksCountInput')?.value || '1', 10);
    const avatar = document.getElementById('editArtistAvatarInput')?.value;
    const bio = document.getElementById('editArtistBioInput')?.value;

    if (!name || !bio) {
      alert('Por favor complete el nombre y reseña del artista.');
      return;
    }

    try {
      const updatedArtist = await this.api.updateArtist(id, {
        name,
        nationality,
        period,
        worksCount,
        avatar,
        bio
      });

      this.model.updateArtist(updatedArtist);
      this.closeModal();
      this.showToast(`Perfil de "${updatedArtist.name}" actualizado con éxito en la base de datos.`);
    } catch (err) {
      console.error('[AppController] Error al actualizar artista:', err);
      alert('Error al guardar cambios: ' + err.message);
    }
  }

  async promptConservationUpdate(artId, currentPercent) {
    const val = prompt(`Ingrese el nuevo porcentaje de conservación para la pieza (1 - 100):`, currentPercent);
    if (val !== null) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 1 && num <= 100) {
        try {
          await this.api.updateArtworkConservation(artId, num);
        } catch (err) {
          console.warn('Advertencia al guardar conservación en backend:', err);
        }
        this.model.updateArtworkConservation(artId, num);
        this.showToast(`Estado de conservación actualizado al ${num}% y guardado en MySQL.`);
      } else {
        alert('Por favor ingrese un número entero válido entre 1 y 100.');
      }
    }
  }

  // --- Modales de Tours ---
  openAddTourModal() {
    const { title, bodyHtml, footerHtml } = this.tourView.getAddModalContent();
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitNewTour() {
    const title = document.getElementById('tourTitleInput')?.value;
    const guide = document.getElementById('tourGuideInput')?.value;
    const language = document.getElementById('tourLangInput')?.value;
    const dateTime = document.getElementById('tourDateInput')?.value;
    const maxCapacity = parseInt(document.getElementById('tourCapacityInput')?.value || '25', 10);

    if (!title || !guide || !dateTime) {
      alert('Por favor complete los campos requeridos.');
      return;
    }

    try {
      const newTour = await this.api.createTour({
        title,
        guide,
        language,
        dateTime,
        duration: "60 min",
        maxCapacity,
        registeredAttendees: 0,
        itinerary: [
          { step: 1, roomName: "Sala de Recepción Patrimonial", durationMin: 15, focus: "Contexto histórico" },
          { step: 2, roomName: "Galería de Obras Principales", durationMin: 35, focus: "Análisis técnico de piezas" },
          { step: 3, roomName: "Cámara de Conservación", durationMin: 10, focus: "Conclusiones y preguntas" }
        ]
      });

      this.model.addTour(newTour);
      this.closeModal();
      this.showToast(`Tour "${title}" programado y guardado en MySQL.`);
    } catch (err) {
      alert('Error al crear tour: ' + err.message);
    }
  }

  async registerTourAttendee(tourId) {
    try {
      const updatedTour = await this.api.registerTour(tourId);
      if (updatedTour) {
        this.model.updateTour(updatedTour);
      }
      this.showToast('¡Asistente inscrito correctamente en MySQL!');
    } catch (err) {
      this.showToast('No fue posible registrar al asistente. Aforo completo.');
    }
  }

  openEditTourModal(id) {
    const tour = this.model.tours.find(t => t.id === id);
    if (!tour) return;
    const { title, bodyHtml, footerHtml } = this.tourView.getEditTourModalContent(tour);
    this.modalView.open(title, bodyHtml, footerHtml);
  }

  async submitEditTour(id) {
    const title = document.getElementById('editTourTitleInput')?.value;
    const guide = document.getElementById('editTourGuideInput')?.value;
    const language = document.getElementById('editTourLangInput')?.value;
    const dateTime = document.getElementById('editTourDateInput')?.value;
    const duration = document.getElementById('editTourDurationInput')?.value;
    const maxCapacity = parseInt(document.getElementById('editTourCapacityInput')?.value || '25', 10);
    const registeredAttendees = parseInt(document.getElementById('editTourAttendeesInput')?.value || '0', 10);

    if (!title || !guide || !dateTime) {
      alert('Por favor complete los campos requeridos del tour.');
      return;
    }

    try {
      const updatedTour = await this.api.updateTour(id, {
        title,
        guide,
        language,
        dateTime,
        duration,
        maxCapacity,
        registeredAttendees
      });

      this.model.updateTour(updatedTour);
      this.closeModal();
      this.showToast(`Tour "${updatedTour.title}" actualizado con éxito en la base de datos.`);
    } catch (err) {
      console.error('[AppController] Error al actualizar tour:', err);
      alert('Error al guardar cambios: ' + err.message);
    }
  }

  // --- Atajos y Reportes ---
  openShortcutsModal() {
    const bodyHtml = `
      <table class="shortcuts-table" aria-label="Lista de combinaciones de teclas">
        <thead>
          <tr style="text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">
            <th style="padding-bottom: 8px;">Acción de Navegación</th>
            <th style="padding-bottom: 8px; text-align: right;">Atajo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ir a Vista General (Dashboard)</td>
            <td><kbd class="kbd-shortcut">Alt</kbd> + <kbd class="kbd-shortcut">1</kbd></td>
          </tr>
          <tr>
            <td>Ir a Sedes Museísticas</td>
            <td><kbd class="kbd-shortcut">Alt</kbd> + <kbd class="kbd-shortcut">2</kbd></td>
          </tr>
          <tr>
            <td>Ir a Obras & Artefactos</td>
            <td><kbd class="kbd-shortcut">Alt</kbd> + <kbd class="kbd-shortcut">3</kbd></td>
          </tr>
          <tr>
            <td>Ir a Salas y Artistas</td>
            <td><kbd class="kbd-shortcut">Alt</kbd> + <kbd class="kbd-shortcut">4</kbd></td>
          </tr>
          <tr>
            <td>Ir a Visitas Guiadas (Tours)</td>
            <td><kbd class="kbd-shortcut">Alt</kbd> + <kbd class="kbd-shortcut">5</kbd></td>
          </tr>
          <tr>
            <td>Panel de Accesibilidad Universal</td>
            <td><kbd class="kbd-shortcut">Alt</kbd> + <kbd class="kbd-shortcut">A</kbd></td>
          </tr>
          <tr>
            <td>Foco en Búsqueda Global</td>
            <td><kbd class="kbd-shortcut">/</kbd></td>
          </tr>
          <tr>
            <td>Cerrar Ventana Emergente (Modal)</td>
            <td><kbd class="kbd-shortcut">Escape</kbd></td>
          </tr>
        </tbody>
      </table>
    `;

    const footerHtml = `
      <button class="btn btn-primary" onclick="App.closeModal()">Cerrar Guía</button>
    `;

    this.modalView.open('Atajos de Teclado Accesibles (WCAG)', bodyHtml, footerHtml);
  }

  exportDataReport() {
    const reportData = {
      sistema: "Patrimonia - Sistema de Administración de Museos",
      fechaGeneracion: new Date().toISOString(),
      estadisticas: this.model.stats,
      sedes: this.model.museums,
      obras: this.model.artworks,
      salas: this.model.rooms,
      artistas: this.model.artists,
      visitasGuiadas: this.model.tours
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `patrimonia_reporte_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.showToast('¡Reporte patrimonial consolidado descargado con éxito!');
  }
}

if (typeof window !== 'undefined') {
  window.AppController = AppController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppController;
}

