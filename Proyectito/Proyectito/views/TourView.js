/**
 * ==============================================================================
 * VISTA: TourView (POO)
 * Renderiza los recorridos guiados usando las clases exactas de styles.css
 * (.card-base, .tour-card, .tour-itinerary-box, .timeline-steps, etc.)
 * y provee modales de programación y edición.
 * ==============================================================================
 */

class TourView {
  constructor() {
    this.grid = document.getElementById('toursGrid');
  }

  render(tours = []) {
    if (!this.grid) return;

    if (tours.length === 0) {
      this.grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No hay recorridos guiados programados.</p>`;
      return;
    }

    this.grid.innerHTML = tours.map(tour => {
      const isFull = tour.registeredAttendees >= tour.maxCapacity;

      const stepsHtml = Array.isArray(tour.itinerary) && tour.itinerary.length > 0
        ? tour.itinerary.map(step => `
            <div class="timeline-step">
              <div class="step-marker">${step.step}</div>
              <div class="step-details">
                <span>${this.escape(step.roomName)}</span>
                <span class="step-time">${step.durationMin} min</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 400; margin-top: 2px;">${this.escape(step.focus)}</div>
            </div>
          `).join('')
        : '<p style="font-size: 0.85rem; color: var(--text-muted);">Itinerario general por salas principales.</p>';

      return `
        <article class="card-base tour-card" tabindex="0" aria-label="Visita: ${this.escape(tour.title)}. Guía: ${this.escape(tour.guide)}. Aforo: ${tour.registeredAttendees} de ${tour.maxCapacity}">
          <div class="tour-header-meta">
            <span class="tour-date-badge" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${this.escape(tour.duration)} · ${this.escape(tour.dateTime)}
            </span>
            <span class="tour-spots" style="color: ${isFull ? 'var(--status-danger)' : '#059669'};">
              ${isFull ? '● Agotado' : `● ${tour.registeredAttendees} / ${tour.maxCapacity} Inscritos`}
            </span>
          </div>

          <h3 class="tour-title">${this.escape(tour.title)}</h3>
          <p class="tour-guide" style="display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            <span><strong>${this.escape(tour.guide)}</strong> · Idioma: <strong>${this.escape(tour.language)}</strong></span>
          </p>

          <div class="tour-itinerary-box">
            <div class="itinerary-heading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Secuencia de Recorrido por Salas</span>
            </div>
            <div class="timeline-steps">
              ${stepsHtml}
            </div>
          </div>

          <div class="tour-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onclick="App.openEditTourModal('${tour.id}')" title="Editar visita guiada">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar Tour
            </button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" ${isFull ? 'disabled' : ''} onclick="App.registerTourAttendee('${tour.id}')">
              ${isFull ? 'Aforo Completo' : 'Inscribir Asistente'}
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  getAddModalContent() {
    const bodyHtml = `
      <form id="addTourForm" onsubmit="event.preventDefault(); App.submitNewTour();">
        <div class="form-group">
          <label class="form-label" for="tourTitleInput">Título del Recorrido Guiado</label>
          <input type="text" id="tourTitleInput" class="form-input" placeholder="Ej: Recorrido Nocturno de Barroco y Misticismo" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="tourGuideInput">Guía / Curador a Cargo</label>
            <input type="text" id="tourGuideInput" class="form-input" placeholder="Ej: Dr. Manuel Arboleda" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="tourLangInput">Idioma(s)</label>
            <input type="text" id="tourLangInput" class="form-input" placeholder="Ej: Español e Inglés" value="Español" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="tourDateInput">Horario y Días</label>
            <input type="text" id="tourDateInput" class="form-input" placeholder="Ej: Miércoles y Viernes · 17:00 PM" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="tourCapacityInput">Aforo Máximo</label>
            <input type="number" id="tourCapacityInput" class="form-input" value="25" min="5" max="50" required>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitNewTour()">Programar Recorrido</button>
    `;

    return { title: 'Programar Nueva Visita Guiada', bodyHtml, footerHtml };
  }

  getEditTourModalContent(tour) {
    const bodyHtml = `
      <form id="editTourForm" onsubmit="event.preventDefault(); App.submitEditTour('${tour.id}');">
        <div class="form-group">
          <label class="form-label" for="editTourTitleInput">Título del Recorrido Guiado</label>
          <input type="text" id="editTourTitleInput" class="form-input" value="${this.escape(tour.title)}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editTourGuideInput">Guía / Curador a Cargo</label>
            <input type="text" id="editTourGuideInput" class="form-input" value="${this.escape(tour.guide)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editTourLangInput">Idioma(s)</label>
            <input type="text" id="editTourLangInput" class="form-input" value="${this.escape(tour.language)}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editTourDateInput">Horario y Días</label>
            <input type="text" id="editTourDateInput" class="form-input" value="${this.escape(tour.dateTime)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editTourDurationInput">Duración Estimada</label>
            <input type="text" id="editTourDurationInput" class="form-input" value="${this.escape(tour.duration)}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="editTourCapacityInput">Aforo Máximo (Plazas)</label>
            <input type="number" id="editTourCapacityInput" class="form-input" value="${tour.maxCapacity || 25}" min="1" max="100" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editTourAttendeesInput">Asistentes Inscritos</label>
            <input type="number" id="editTourAttendeesInput" class="form-input" value="${tour.registeredAttendees || 0}" min="0" required>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="App.submitEditTour('${tour.id}')">Guardar Cambios en BD</button>
    `;

    return { title: `Editar Visita Guiada: ${tour.title}`, bodyHtml, footerHtml };
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

window.TourView = TourView;
