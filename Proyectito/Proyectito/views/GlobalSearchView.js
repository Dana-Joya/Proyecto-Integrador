/**
 * ==============================================================================
 * VISTA: GlobalSearchView (POO)
 * Renderiza el menú desplegable de búsqueda global en tiempo real y el modal
 * consolidado de resultados para todas las entidades (Obras, Sedes, Artistas, Salas, Tours).
 * ==============================================================================
 */

class GlobalSearchView {
  constructor() {
    this.createDropdownContainer();
  }

  createDropdownContainer() {
    let dropdown = document.getElementById('globalSearchResults');
    if (!dropdown) {
      const searchBox = document.querySelector('.header-search');
      if (searchBox) {
        dropdown = document.createElement('div');
        dropdown.id = 'globalSearchResults';
        dropdown.className = 'global-search-dropdown';
        dropdown.setAttribute('role', 'region');
        dropdown.setAttribute('aria-label', 'Resultados de búsqueda global instantánea');
        dropdown.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            const item = e.target.closest('.search-item, .search-view-all-btn');
            if (item) {
              e.preventDefault();
              item.click();
            }
          }
        });
        searchBox.appendChild(dropdown);
      }
    }
    this.dropdown = dropdown;
  }

  isOpen() {
    return this.dropdown && this.dropdown.classList.contains('active');
  }

  show() {
    if (this.dropdown) {
      this.dropdown.classList.add('active');
      this.dropdown.setAttribute('aria-hidden', 'false');
    }
  }

  hide() {
    if (this.dropdown) {
      this.dropdown.classList.remove('active');
      this.dropdown.setAttribute('aria-hidden', 'true');
    }
  }

  renderDropdown(results) {
    if (!this.dropdown) return;

    if (!results.query || results.query.trim().length === 0) {
      this.hide();
      return;
    }

    if (results.total === 0) {
      this.dropdown.innerHTML = `
        <div class="search-empty-state">
          <p style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>No se encontraron coincidencias para "<strong>${this.escape(results.query)}</strong>".</span>
          </p>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
            Busca por título de obra, artista, sede, sala o temática de tour.
          </p>
        </div>
      `;
      this.show();
      return;
    }

    let html = '';

    // 1. Obras (Máximo 3 destacadas)
    if (results.artworks.length > 0) {
      html += `
        <div class="search-group-heading">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Obras & Artefactos
          </span>
          <span class="search-item-tag">${results.artworks.length}</span>
        </div>
      `;
      results.artworks.slice(0, 3).forEach(art => {
        html += `
          <div class="search-item" tabindex="0" onclick="App.selectSearchResult('artwork', '${art.id}')" role="button">
            <img class="search-item-thumb" src="${art.image}" alt="${art.title}">
            <div class="search-item-content">
              <div class="search-item-title">${art.title}</div>
              <div class="search-item-meta">${art.artist} · ${art.category}</div>
            </div>
            <span class="badge ${art.conservationPercent >= 90 ? 'badge-green' : 'badge-amber'}">${art.conservationPercent}%</span>
          </div>
        `;
      });
    }

    // 2. Sedes Museísticas (Máximo 2 destacadas)
    if (results.museums.length > 0) {
      html += `
        <div class="search-group-heading">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1v4H9zM14 10h1v4h-1z"/></svg>
            Sedes Museísticas
          </span>
          <span class="search-item-tag">${results.museums.length}</span>
        </div>
      `;
      results.museums.slice(0, 2).forEach(mus => {
        html += `
          <div class="search-item" tabindex="0" onclick="App.selectSearchResult('museum', '${mus.id}')" role="button">
            <img class="search-item-thumb" src="${mus.image}" alt="${mus.name}">
            <div class="search-item-content">
              <div class="search-item-title">${mus.name}</div>
              <div class="search-item-meta" style="display: flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${mus.location}
              </div>
            </div>
          </div>
        `;
      });
    }

    // 3. Artistas (Máximo 2 destacados)
    if (results.artists.length > 0) {
      html += `
        <div class="search-group-heading">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
            Artistas & Creadores
          </span>
          <span class="search-item-tag">${results.artists.length}</span>
        </div>
      `;
      results.artists.slice(0, 2).forEach(art => {
        html += `
          <div class="search-item" tabindex="0" onclick="App.selectSearchResult('artist', '${art.id}')" role="button">
            <img class="search-item-avatar" src="${art.avatar}" alt="${art.name}">
            <div class="search-item-content">
              <div class="search-item-title">${art.name}</div>
              <div class="search-item-meta">${art.period} · ${art.nationality}</div>
            </div>
          </div>
        `;
      });
    }

    // 4. Salas de Exposición (Máximo 2 destacadas)
    if (results.rooms.length > 0) {
      html += `
        <div class="search-group-heading">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Salas de Exposición
          </span>
          <span class="search-item-tag">${results.rooms.length}</span>
        </div>
      `;
      results.rooms.slice(0, 2).forEach(room => {
        html += `
          <div class="search-item" tabindex="0" onclick="App.selectSearchResult('room', '${room.id}')" role="button">
            <div class="search-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            </div>
            <div class="search-item-content">
              <div class="search-item-title">${room.code} - ${room.name}</div>
              <div class="search-item-meta">${room.museumName} · Aforo: ${room.capacity}</div>
            </div>
          </div>
        `;
      });
    }

    // 5. Visitas Guiadas (Tours) (Máximo 2 destacados)
    if (results.tours.length > 0) {
      html += `
        <div class="search-group-heading">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Recorridos Guiados
          </span>
          <span class="search-item-tag">${results.tours.length}</span>
        </div>
      `;
      results.tours.slice(0, 2).forEach(tour => {
        html += `
          <div class="search-item" tabindex="0" onclick="App.selectSearchResult('tour', '${tour.id}')" role="button">
            <div class="search-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="search-item-content">
              <div class="search-item-title">${tour.title}</div>
              <div class="search-item-meta" style="display: flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                ${tour.guide} · ${tour.dateTime}
              </div>
            </div>
          </div>
        `;
      });
    }

    // Botón para ver todos los resultados consolidados
    html += `
      <button class="search-view-all-btn" type="button" onclick="App.openFullSearchModal()">
        Ver los ${results.total} resultados en detalle →
      </button>
    `;

    this.dropdown.innerHTML = html;
    this.show();
  }

  getFullResultsModalContent(results) {
    if (!results || results.total === 0) {
      return {
        title: `Búsqueda Global: "${results.query || ''}"`,
        bodyHtml: `<p style="text-align: center; color: var(--text-muted); padding: 30px;">No se encontraron resultados en ninguna categoría para "${results.query || ''}".</p>`,
        footerHtml: `<button class="btn btn-secondary" onclick="App.closeModal()">Cerrar</button>`
      };
    }

    let bodyHtml = `
      <div style="display: flex; flex-direction: column; gap: 20px; max-height: 65vh; overflow-y: auto; padding-right: 6px;">
        <div style="font-size: 0.95rem; color: var(--text-secondary);">
          Se encontraron <strong>${results.total}</strong> coincidencias para "<em>${this.escape(results.query)}</em>":
        </div>
    `;

    // 1. Obras
    if (results.artworks.length > 0) {
      bodyHtml += `
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--morado-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Obras & Artefactos (${results.artworks.length})</span>
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
            ${results.artworks.map(a => `
              <div style="background: var(--bg-surface-alt); border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center; border: 1px solid var(--border-light); cursor: pointer;"
                onclick="App.closeModal(); App.openArtworkDetailModal('${a.id}')">
                <img src="${a.image}" alt="${a.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);">
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${a.artist}</div>
                  <div style="font-size: 0.75rem; color: var(--morado-primary); font-weight: 600; display: flex; align-items: center; gap: 3px;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>${a.room}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. Sedes Museísticas
    if (results.museums.length > 0) {
      bodyHtml += `
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--morado-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1v4H9zM14 10h1v4h-1z"/></svg>
            <span>Sedes Museísticas (${results.museums.length})</span>
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
            ${results.museums.map(m => `
              <div style="background: var(--bg-surface-alt); border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center; border: 1px solid var(--border-light); cursor: pointer;"
                onclick="App.closeModal(); App.openMuseumDetailModal('${m.id}')">
                <img src="${m.image}" alt="${m.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);">
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.name}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 3px;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>${m.location}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--morado-primary); font-weight: 600;">${m.totalWorks} obras · ${m.activeRooms} salas</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 3. Artistas
    if (results.artists.length > 0) {
      bodyHtml += `
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--morado-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
            <span>Artistas & Creadores (${results.artists.length})</span>
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
            ${results.artists.map(art => `
              <div style="background: var(--bg-surface-alt); border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center; border: 1px solid var(--border-light); cursor: pointer;"
                onclick="App.closeModal(); App.navigateTo('rooms'); App.switchSubtab('artists');">
                <img src="${art.avatar}" alt="${art.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 50%;">
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; font-size: 0.9rem;">${art.name}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${art.nationality}</div>
                  <div style="font-size: 0.75rem; color: var(--morado-primary);">${art.period}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 4. Salas
    if (results.rooms.length > 0) {
      bodyHtml += `
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--morado-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span>Salas de Exposición (${results.rooms.length})</span>
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
            ${results.rooms.map(r => `
              <div style="background: var(--bg-surface-alt); border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center; border: 1px solid var(--border-light); cursor: pointer;"
                onclick="App.closeModal(); App.navigateTo('rooms'); App.switchSubtab('rooms');">
                <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: var(--morado-subtle); color: var(--morado-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1v4H9zM14 10h1v4h-1z"/></svg>
                </div>
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; font-size: 0.9rem;">${r.code} - ${r.name}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${r.museumName}</div>
                  <div style="font-size: 0.75rem; color: var(--morado-primary); font-weight: 600;">Climatización: ${r.climateControl}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 5. Tours
    if (results.tours.length > 0) {
      bodyHtml += `
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--morado-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <span>Recorridos Guiados (${results.tours.length})</span>
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
            ${results.tours.map(t => `
              <div style="background: var(--bg-surface-alt); border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center; border: 1px solid var(--border-light); cursor: pointer;"
                onclick="App.closeModal(); App.navigateTo('tours');">
                <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: var(--morado-subtle); color: var(--morado-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="7" y2="8.01"/><line x1="12" y1="8" x2="12" y2="8.01"/><line x1="17" y1="8" x2="17" y2="8.01"/></svg>
                </div>
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; font-size: 0.9rem;">${t.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    <span>Guía: ${t.guide}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--morado-primary); font-weight: 600;">${t.dateTime} (${t.duration})</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    bodyHtml += `</div>`;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cerrar</button>
    `;

    return { title: `Resultados de Búsqueda Global (${results.total})`, bodyHtml, footerHtml };
  }

  escape(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }
}

window.GlobalSearchView = GlobalSearchView;
