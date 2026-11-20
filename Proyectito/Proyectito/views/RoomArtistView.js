/**
 * ==============================================================================
 * VISTA: RoomArtistView (POO)
 * Renderiza los paneles de salas y artistas usando las clases de styles.css
 * (.card-base, .room-card, .artist-card, etc.) y provee modales de edición.
 * ==============================================================================
 */

class RoomArtistView {
  constructor() {
    this.roomsGrid = document.getElementById('roomsGrid');
    this.artistsGrid = document.getElementById('artistsGrid');
    this.subtabButtons = document.querySelectorAll('.subtab-btn');
    this.subtabPanels = document.querySelectorAll('.subtab-panel');
  }

  renderRooms(rooms = []) {
    if (!this.roomsGrid) return;

    if (rooms.length === 0) {
      this.roomsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No hay salas registradas.</p>`;
      return;
    }

    this.roomsGrid.innerHTML = rooms.map(room => `
      <article class="card-base room-card" tabindex="0" aria-label="Sala ${this.escape(room.code)}: ${this.escape(room.name)}. Aforo: ${room.capacity}. Climatización: ${this.escape(room.climateControl)}">
        <div class="room-header">
          <span class="room-code">${this.escape(room.code)}</span>
          <span class="room-status-indicator">● ${this.escape(room.status)}</span>
        </div>
        <h3 class="room-name">${this.escape(room.name)}</h3>
        <p class="room-museum">${this.escape(room.museumName)}</p>
        <div class="room-metrics">
          <div class="metric-box">
            <span class="metric-label">Aforo Máximo</span>
            <span class="metric-value">${room.capacity} personas</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">Piezas Alojadas</span>
            <span class="metric-value">${room.currentPieces} piezas</span>
          </div>
          <div class="metric-box" style="grid-column: 1 / -1;">
            <span class="metric-label">Climatización IoT</span>
            <span class="metric-value" style="color: var(--neon-blue); font-size: 0.95rem;">${this.escape(room.climateControl)}</span>
          </div>
        </div>
        <div style="margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 5px;" onclick="App.openEditRoomModal('${room.id}')" title="Editar datos de la sala">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar Sala
          </button>
        </div>
      </article>
    `).join('');
  }

  renderArtists(artists = []) {
    if (!this.artistsGrid) return;

    if (artists.length === 0) {
      this.artistsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No hay artistas registrados.</p>`;
      return;
    }

    this.artistsGrid.innerHTML = artists.map(art => `
      <article class="card-base artist-card" tabindex="0" aria-label="Artista: ${this.escape(art.name)}. Época: ${this.escape(art.period)}">
        <div class="artist-avatar-wrap">
          <img src="${art.avatar}" alt="Retrato de ${this.escape(art.name)}" loading="lazy">
        </div>
        <h3 class="artist-name">${this.escape(art.name)}</h3>
        <p class="artist-nationality-era">${this.escape(art.nationality)} · ${this.escape(art.period)}</p>
        <p class="artist-bio">${this.escape(art.bio)}</p>
        <div class="artist-stats-pill" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1v4H9zM14 10h1v4h-1z"/></svg>
          <span>${art.worksCount} Obras Catalogadas</span>
        </div>
        <div style="margin-top: 14px;">
          <button class="btn btn-secondary btn-sm" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 5px;" onclick="App.openEditArtistModal('${art.id}')" title="Editar perfil del artista">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar Artista
          </button>
        </div>
      </article>
    `).join('');
  }

  getAddRoomModalContent() {
    const bodyHtml = `
      <form id="addRoomForm" onsubmit="event.preventDefault(); App.submitNewRoom();">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="roomCodeInput">Código de Sala</label>
            <input type="text" id="roomCodeInput" class="form-input" placeholder="Ej: R-105" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="roomStatusInput">Estado de Acceso</label>
            <select id="roomStatusInput" class="form-select">
              <option value="Abierta al Público">Abierta al Público</option>
              <option value="Acceso Guiado">Acceso Guiado</option>
              <option value="Climatización Restringida">Climatización Restringida</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="roomNameInput">Nombre de la Sala</label>
          <input type="text" id="roomNameInput" class="form-input" placeholder="Ej: Galería de Escultura Neoclásica" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="roomMuseumInput">Sede Museística Asignada</label>
          <input type="text" id="roomMuseumInput" class="form-input" placeholder="Ej: Museo Nacional de Bellas Artes" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="roomCapacityInput">Aforo Máximo (Personas)</label>
            <input type="number" id="roomCapacityInput" class="form-input" value="35" min="1" max="500" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="roomPiecesInput">Piezas Alojadas</label>
            <input type="number" id="roomPiecesInput" class="form-input" value="0" min="0" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="roomClimateInput">Parámetros de Climatización IoT</label>
          <input type="text" id="roomClimateInput" class="form-input" value="20.0°C · 50% HR" placeholder="Ej: 20.0°C · 50% HR" required>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitNewRoom()">Registrar Sala en BD</button>
    `;

    return { title: 'Registrar Nueva Sala de Exposición', bodyHtml, footerHtml };
  }

  getEditRoomModalContent(room) {
    const bodyHtml = `
      <form id="editRoomForm" onsubmit="event.preventDefault(); App.submitEditRoom('${room.id}');">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editRoomCodeInput">Código de Sala</label>
            <input type="text" id="editRoomCodeInput" class="form-input" value="${this.escape(room.code)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editRoomStatusInput">Estado de Acceso</label>
            <select id="editRoomStatusInput" class="form-select">
              <option value="Abierta al Público" ${room.status === 'Abierta al Público' ? 'selected' : ''}>Abierta al Público</option>
              <option value="Acceso Guiado" ${room.status === 'Acceso Guiado' ? 'selected' : ''}>Acceso Guiado</option>
              <option value="Climatización Restringida" ${room.status === 'Climatización Restringida' ? 'selected' : ''}>Climatización Restringida</option>
              <option value="En Mantenimiento" ${room.status === 'En Mantenimiento' ? 'selected' : ''}>En Mantenimiento</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editRoomNameInput">Nombre de la Sala</label>
          <input type="text" id="editRoomNameInput" class="form-input" value="${this.escape(room.name)}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="editRoomMuseumInput">Sede Museística Asignada</label>
          <input type="text" id="editRoomMuseumInput" class="form-input" value="${this.escape(room.museumName)}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editRoomCapacityInput">Aforo Máximo (Personas)</label>
            <input type="number" id="editRoomCapacityInput" class="form-input" value="${room.capacity || 30}" min="1" max="500" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editRoomPiecesInput">Piezas Alojadas</label>
            <input type="number" id="editRoomPiecesInput" class="form-input" value="${room.currentPieces || 0}" min="0" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editRoomClimateInput">Parámetros de Climatización IoT</label>
          <input type="text" id="editRoomClimateInput" class="form-input" value="${this.escape(room.climateControl)}" placeholder="Ej: 20.5°C · 50% HR" required>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitEditRoom('${room.id}')">Guardar Cambios en BD</button>
    `;

    return { title: `Editar Sala: ${room.code} - ${room.name}`, bodyHtml, footerHtml };
  }

  getAddArtistModalContent() {
    const bodyHtml = `
      <form id="addArtistForm" onsubmit="event.preventDefault(); App.submitNewArtist();">
        <div class="form-group">
          <label class="form-label" for="artistNameInput">Nombre Completo del Creador / Autor</label>
          <input type="text" id="artistNameInput" class="form-input" placeholder="Ej: Diego Rodríguez de Silva y Velázquez" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="artistNationalityInput">Nacionalidad / Origen</label>
            <input type="text" id="artistNationalityInput" class="form-input" placeholder="Ej: Española (Sevilla)" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="artistPeriodInput">Época o Período Histórico</label>
            <input type="text" id="artistPeriodInput" class="form-input" placeholder="Ej: 1599 – 1660 · Barroco Español" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="artistWorksCountInput">Obras Catalogadas (Inicial)</label>
            <input type="number" id="artistWorksCountInput" class="form-input" value="1" min="0" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="artistAvatarInput">URL del Retrato / Avatar</label>
            <input type="url" id="artistAvatarInput" class="form-input" value="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="artistBioInput">Reseña Biográfica y Contexto Artístico</label>
          <textarea id="artistBioInput" class="form-textarea" rows="3" placeholder="Biografía sintética, principales aportes y técnica..." required></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitNewArtist()">Registrar Artista en BD</button>
    `;

    return { title: 'Registrar Nuevo Perfil de Artista', bodyHtml, footerHtml };
  }

  getEditArtistModalContent(art) {
    const bodyHtml = `
      <form id="editArtistForm" onsubmit="event.preventDefault(); App.submitEditArtist('${art.id}');">
        <div class="form-group">
          <label class="form-label" for="editArtistNameInput">Nombre Completo del Creador / Autor</label>
          <input type="text" id="editArtistNameInput" class="form-input" value="${this.escape(art.name)}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editArtistNationalityInput">Nacionalidad / Origen</label>
            <input type="text" id="editArtistNationalityInput" class="form-input" value="${this.escape(art.nationality)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editArtistPeriodInput">Época o Período Histórico</label>
            <input type="text" id="editArtistPeriodInput" class="form-input" value="${this.escape(art.period)}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editArtistWorksCountInput">Obras Catalogadas (Total)</label>
            <input type="number" id="editArtistWorksCountInput" class="form-input" value="${art.worksCount || 1}" min="0" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editArtistAvatarInput">URL del Retrato / Avatar</label>
            <input type="url" id="editArtistAvatarInput" class="form-input" value="${this.escape(art.avatar)}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editArtistBioInput">Reseña Biográfica y Contexto Artístico</label>
          <textarea id="editArtistBioInput" class="form-textarea" rows="3" required>${this.escape(art.bio)}</textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitEditArtist('${art.id}')">Guardar Cambios en BD</button>
    `;

    return { title: `Editar Artista: ${art.name}`, bodyHtml, footerHtml };
  }

  switchSubtab(targetSubtab) {
    this.subtabButtons.forEach(btn => {
      const isSelected = btn.dataset.subtab === targetSubtab;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected.toString());
    });

    this.subtabPanels.forEach(panel => {
      if (panel.id === `subtab-${targetSubtab}`) {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });
  }

  escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }
}

window.RoomArtistView = RoomArtistView;
