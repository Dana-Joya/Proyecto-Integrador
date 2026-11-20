/**
 * ==============================================================================
 * VISTA: ArtworkView (POO)
 * Renderiza el catálogo de obras, fichas técnicas y formularios
 * de alta y edición con sincronización a base de datos MySQL.
 * ==============================================================================
 */

class ArtworkView {
  constructor() {
    this.grid = document.getElementById('artworksGrid');
  }

  getConservationDetails(pct) {
    if (pct >= 90) return { statusClass: 'good', label: `${pct}% Óptimo` };
    if (pct >= 75) return { statusClass: 'warning', label: `${pct}% Regular` };
    return { statusClass: 'danger', label: `${pct}% Crítico` };
  }

  render(artworks = []) {
    if (!this.grid) return;

    if (artworks.length === 0) {
      this.grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No se encontraron piezas con los filtros seleccionados.</p>`;
      return;
    }

    this.grid.innerHTML = artworks.map(art => {
      const { statusClass, label } = this.getConservationDetails(art.conservationPercent);
      return `
        <article class="card-base artwork-card" tabindex="0" aria-label="Obra: ${this.escape(art.title)} por ${this.escape(art.artist)}. Estado de conservación: ${label}">
          <div class="artwork-image-wrap">
            <img src="${art.image}" alt="${this.escape(art.title)}" loading="lazy">
            <span class="artwork-category-tag">${this.escape(art.category)}</span>
            <div class="conservation-badge ${statusClass}">
              <span>●</span> ${label}
            </div>
          </div>
          <div class="artwork-body">
            <h3 class="artwork-title">${this.escape(art.title)}</h3>
            <p class="artwork-artist">${this.escape(art.artist)} (${this.escape(art.creationDate)})</p>
            <p class="artwork-desc">${this.escape(art.description)}</p>
            
            <div class="conservation-bar-container">
              <div class="conservation-bar-header">
                <span>Estado de Conservación</span>
                <span>${art.conservationPercent}%</span>
              </div>
              <div class="progress-track" role="progressbar" aria-valuenow="${art.conservationPercent}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-fill ${statusClass}" style="width: ${art.conservationPercent}%;"></div>
              </div>
            </div>

            <div class="artwork-footer-meta">
              <div class="artwork-room-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${this.escape(art.room)}</span>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="App.openArtworkDetailModal('${art.id}')">Ficha</button>
                <button class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 3px;" onclick="App.openEditArtworkModal('${art.id}')" title="Editar datos de la obra">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                <button class="btn btn-primary btn-sm" onclick="App.promptConservationUpdate('${art.id}', ${art.conservationPercent})">Estado</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  getDetailModalContent(art) {
    const bodyHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <img src="${art.image}" alt="${this.escape(art.title)}" style="width: 100%; height: 260px; object-fit: cover; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <div>
          <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">${this.escape(art.title)}</h4>
          <p style="color: var(--neon-violet-dark); font-weight: 700; font-size: 0.95rem;">${this.escape(art.artist)} (${this.escape(art.creationDate)})</p>
        </div>
        <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.92rem;">${this.escape(art.description)}</p>
        
        <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: var(--radius-md); display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
          <div><strong>Categoría:</strong> ${this.escape(art.category)}</div>
          <div><strong>Fecha Ingreso:</strong> ${this.escape(art.acquisitionDate)}</div>
          <div><strong>Ubicación Actual:</strong> ${this.escape(art.room)}</div>
          <div><strong>Conservación:</strong> <span style="color: #059669; font-weight: 800;">${art.conservationPercent}%</span></div>
        </div>

        <div style="border-top: 1px solid var(--border-light); padding-top: 14px;">
          <h5 style="font-size: 0.88rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Protocolo de Conservación Preventiva</h5>
          <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6;">
            <li>Lectura espectrofotométrica periódica (sin emisión UV).</li>
            <li>Monitoreo de termohigrometría automatizado por sensores IoT.</li>
            <li>Inspección anual de tensiones de soporte y película pictórica.</li>
          </ul>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.openEditArtworkModal('${art.id}')" style="display: inline-flex; align-items: center; gap: 6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Editar Obra
      </button>
      <button class="btn btn-primary" onclick="App.promptConservationUpdate('${art.id}', ${art.conservationPercent}); App.closeModal();">Actualizar Estado</button>
      <button class="btn btn-secondary" onclick="App.closeModal()">Cerrar</button>
    `;

    return { title: `Ficha Técnica Patrimonial #${art.id}`, bodyHtml, footerHtml };
  }

  getAddModalContent() {
    const defaultImg = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80";
    const bodyHtml = `
      <form id="addArtworkForm" onsubmit="event.preventDefault(); App.submitNewArtwork();">
        <div class="form-group">
          <label class="form-label" for="artTitleInput">Título de la Obra o Artefacto</label>
          <input type="text" id="artTitleInput" class="form-input" placeholder="Ej: Busto de Nefertiti (Réplica Autorizada)" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="artArtistInput">Autor / Colectivo Creador</label>
            <input type="text" id="artArtistInput" class="form-input" placeholder="Ej: Taller Real de Amarna" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="artCategoryInput">Categoría Patrimonial</label>
            <select id="artCategoryInput" class="form-select" onchange="App.onArtworkCategoryChange(this.value, 'artImageInput', 'artImagePreview')">
              <option value="Pintura al Óleo">Pintura al Óleo</option>
              <option value="Escultura en Mármol">Escultura en Mármol</option>
              <option value="Instalación Lumínica">Instalación Lumínica</option>
              <option value="Orfebrería Prehispánica">Orfebrería Prehispánica</option>
              <option value="Manuscrito y Pergamino">Manuscrito y Pergamino</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="artCreationDateInput">Época o Año de Creación</label>
            <input type="text" id="artCreationDateInput" class="form-input" placeholder="Ej: 1345 a.C." required>
          </div>
          <div class="form-group">
            <label class="form-label" for="artConservationInput">Estado de Conservación Inicial (%)</label>
            <input type="number" id="artConservationInput" class="form-input" min="1" max="100" value="95" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="artRoomInput">Sala de Exposición Asignada</label>
          <input type="text" id="artRoomInput" class="form-input" placeholder="Ej: Galería de Arqueología Clásica (A-201)" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="artImageInput">URL de la Imagen (Cambia automáticamente por categoría)</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input type="url" id="artImageInput" class="form-input" style="flex: 1;" placeholder="https://images.unsplash.com/photo-..." value="${defaultImg}" oninput="App.onArtworkImageInput(this.value, 'artImagePreview')">
            <div id="artImagePreview" style="width: 52px; height: 52px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-light); flex-shrink: 0; background: var(--bg-surface-alt); display: flex; align-items: center; justify-content: center;">
              <img src="${defaultImg}" alt="Vista previa" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="artDescInput">Ficha Técnica Descriptiva</label>
          <textarea id="artDescInput" class="form-textarea" rows="3" placeholder="Técnica de soporte, pigmentos, dimensiones y notas históricas..." required></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitNewArtwork()">Guardar en Catálogo</button>
    `;

    return { title: 'Registrar Nueva Obra en Patrimonio', bodyHtml, footerHtml };
  }

  getEditModalContent(art) {
    const categories = ['Pintura al Óleo', 'Escultura en Mármol', 'Instalación Lumínica', 'Orfebrería Prehispánica', 'Manuscrito y Pergamino'];
    const bodyHtml = `
      <form id="editArtworkForm" onsubmit="event.preventDefault(); App.submitEditArtwork('${art.id}');">
        <div class="form-group">
          <label class="form-label" for="editArtTitleInput">Título de la Obra o Artefacto</label>
          <input type="text" id="editArtTitleInput" class="form-input" value="${this.escape(art.title)}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editArtArtistInput">Autor / Colectivo Creador</label>
            <input type="text" id="editArtArtistInput" class="form-input" value="${this.escape(art.artist)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editArtCategoryInput">Categoría Patrimonial</label>
            <select id="editArtCategoryInput" class="form-select" onchange="App.onArtworkCategoryChange(this.value, 'editArtImageInput', 'editArtImagePreview')">
              ${categories.map(cat => `
                <option value="${cat}" ${art.category === cat ? 'selected' : ''}>${cat}</option>
              `).join('')}
              ${!categories.includes(art.category) ? `<option value="${this.escape(art.category)}" selected>${this.escape(art.category)}</option>` : ''}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editArtCreationDateInput">Época o Año de Creación</label>
            <input type="text" id="editArtCreationDateInput" class="form-input" value="${this.escape(art.creationDate)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editArtConservationInput">Estado de Conservación (%)</label>
            <input type="number" id="editArtConservationInput" class="form-input" min="1" max="100" value="${art.conservationPercent || 95}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editArtRoomInput">Sala de Exposición Asignada</label>
            <input type="text" id="editArtRoomInput" class="form-input" value="${this.escape(art.room)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editArtAcquisitionInput">Fecha de Registro / Ingreso</label>
            <input type="text" id="editArtAcquisitionInput" class="form-input" value="${this.escape(art.acquisitionDate || '')}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editArtImageInput">URL de la Imagen (Cambia automáticamente por categoría)</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input type="url" id="editArtImageInput" class="form-input" style="flex: 1;" value="${this.escape(art.image)}" required oninput="App.onArtworkImageInput(this.value, 'editArtImagePreview')">
            <div id="editArtImagePreview" style="width: 52px; height: 52px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-light); flex-shrink: 0; background: var(--bg-surface-alt); display: flex; align-items: center; justify-content: center;">
              <img src="${this.escape(art.image)}" alt="Vista previa" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editArtDescInput">Ficha Técnica Descriptiva</label>
          <textarea id="editArtDescInput" class="form-textarea" rows="3" required>${this.escape(art.description)}</textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitEditArtwork('${art.id}')">Guardar Cambios en BD</button>
    `;

    return { title: `Editar Obra: ${art.title}`, bodyHtml, footerHtml };
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

window.ArtworkView = ArtworkView;
