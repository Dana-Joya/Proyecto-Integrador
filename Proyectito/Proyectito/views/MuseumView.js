/**
 * ==============================================================================
 * VISTA: MuseumView (POO)
 * Renderiza el grid de sedes museísticas, fichas de detalle y formularios
 * de alta y edición con sincronización a base de datos MySQL.
 * ==============================================================================
 */

class MuseumView {
  constructor() {
    this.grid = document.getElementById('museumsGrid');
  }

  render(museums = []) {
    if (!this.grid) return;

    if (museums.length === 0) {
      this.grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No hay sedes registradas.</p>`;
      return;
    }

    this.grid.innerHTML = museums.map(mus => `
      <article class="card-base museum-card" tabindex="0" aria-label="Sede: ${this.escape(mus.name)}. Ubicación: ${this.escape(mus.location)}">
        <div class="museum-image-header">
          <img src="${mus.image}" alt="Fachada de ${this.escape(mus.name)}" loading="lazy">
          <div class="museum-badge-overlay">${mus.activeRooms} Salas Activas</div>
        </div>
        <div class="museum-body">
          <h3 class="museum-title">${this.escape(mus.name)}</h3>
          <p class="museum-desc">${this.escape(mus.description)}</p>
          <div class="museum-meta-list">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${this.escape(mus.location)}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span>${mus.totalWorks} Obras Catalogadas · Fundado en ${mus.foundedYear}</span>
            </div>
          </div>
          <div class="museum-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="App.openMuseumDetailModal('${mus.id}')">Ver Ficha</button>
            <button class="btn btn-secondary btn-sm" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onclick="App.openEditMuseumModal('${mus.id}')" title="Editar ficha de la sede">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar Sede
            </button>
            <a href="${mus.webUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">Sitio Web</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  getDetailModalContent(mus) {
    const bodyHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <img src="${mus.image}" alt="${this.escape(mus.name)}" style="width: 100%; height: 240px; object-fit: cover; border-radius: var(--radius-md);">
        <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">${this.escape(mus.name)}</h4>
        <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.92rem;">${this.escape(mus.description)}</p>
        <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: var(--radius-md); font-size: 0.86rem; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> <strong>Ubicación:</strong> ${this.escape(mus.location)}</div>
          <div style="display: flex; align-items: center; gap: 6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> <strong>Sitio Oficial:</strong> <a href="${mus.webUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--morado-primary);">${this.escape(mus.webUrl)}</a></div>
          <div style="display: flex; align-items: center; gap: 6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> <strong>Coordenadas GPS:</strong> ${this.escape(mus.coordinates)}</div>
          <div style="display: flex; align-items: center; gap: 6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1v4H9zM14 10h1v4h-1z"/></svg> <strong>Capacidad Patrimonial:</strong> ${mus.activeRooms} Salas activas con ${mus.totalWorks} obras registradas.</div>
          <div style="display: flex; align-items: center; gap: 6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> <strong>Año de Fundación:</strong> ${mus.foundedYear}</div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.openEditMuseumModal('${mus.id}')" style="display: inline-flex; align-items: center; gap: 6px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Editar Ficha
      </button>
      <button class="btn btn-primary" onclick="App.closeModal()">Cerrar</button>
    `;

    return { title: `Ficha de Sede: ${mus.name}`, bodyHtml, footerHtml };
  }

  getAddModalContent() {
    const bodyHtml = `
      <form id="addMuseumForm" onsubmit="event.preventDefault(); App.submitNewMuseum();">
        <div class="form-group">
          <label class="form-label" for="musNameInput">Nombre de la Institución Museística</label>
          <input type="text" id="musNameInput" class="form-input" placeholder="Ej: Museo Iberoamericano de Escultura" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="musDescInput">Descripción y Misión Cultural</label>
          <textarea id="musDescInput" class="form-textarea" rows="3" placeholder="Objetivos de conservación, colecciones destacadas..." required></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="musLocationInput">Ubicación Geográfica / Dirección</label>
            <input type="text" id="musLocationInput" class="form-input" placeholder="Ej: Sevilla, España · Calle Real 10" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="musCoordInput">Coordenadas GPS</label>
            <input type="text" id="musCoordInput" class="form-input" placeholder="Ej: 37.3891° N, 5.9845° W" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="musWebInput">Enlace Sitio Web Oficial</label>
            <input type="url" id="musWebInput" class="form-input" placeholder="https://www.ejemplo-museo.org" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="musFoundedYearInput">Año de Fundación</label>
            <input type="number" id="musFoundedYearInput" class="form-input" value="1995" min="1000" max="2099" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="musImageInput">URL de la Imagen de Fachada</label>
          <input type="url" id="musImageInput" class="form-input" placeholder="https://images.unsplash.com/photo-..." value="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80">
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitNewMuseum()">Registrar Museo en BD</button>
    `;

    return { title: 'Registrar Nueva Sede de Museo', bodyHtml, footerHtml };
  }

  getEditModalContent(mus) {
    const bodyHtml = `
      <form id="editMuseumForm" onsubmit="event.preventDefault(); App.submitEditMuseum('${mus.id}');">
        <div class="form-group">
          <label class="form-label" for="editMusNameInput">Nombre de la Institución Museística</label>
          <input type="text" id="editMusNameInput" class="form-input" value="${this.escape(mus.name)}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="editMusDescInput">Descripción y Misión Cultural</label>
          <textarea id="editMusDescInput" class="form-textarea" rows="3" required>${this.escape(mus.description)}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editMusLocationInput">Ubicación Geográfica / Dirección</label>
            <input type="text" id="editMusLocationInput" class="form-input" value="${this.escape(mus.location)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editMusCoordInput">Coordenadas GPS</label>
            <input type="text" id="editMusCoordInput" class="form-input" value="${this.escape(mus.coordinates)}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editMusWebInput">Enlace Sitio Web Oficial</label>
            <input type="url" id="editMusWebInput" class="form-input" value="${this.escape(mus.webUrl)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editMusYearInput">Año de Fundación</label>
            <input type="number" id="editMusYearInput" class="form-input" value="${mus.foundedYear || 2000}" min="1000" max="2099" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editMusRoomsInput">Salas Activas</label>
            <input type="number" id="editMusRoomsInput" class="form-input" value="${mus.activeRooms || 1}" min="1" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editMusWorksInput">Obras Catalogadas (Total Estimado)</label>
            <input type="number" id="editMusWorksInput" class="form-input" value="${mus.totalWorks || 0}" min="0" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editMusImageInput">URL de la Imagen de Fachada</label>
          <input type="url" id="editMusImageInput" class="form-input" value="${this.escape(mus.image)}" required>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitEditMuseum('${mus.id}')">Guardar Cambios en BD</button>
    `;

    return { title: `Editar Sede: ${mus.name}`, bodyHtml, footerHtml };
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

window.MuseumView = MuseumView;
