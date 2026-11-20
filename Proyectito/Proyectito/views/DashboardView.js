/**
 * ==============================================================================
 * VISTA: DashboardView (POO)
 * Renderiza métricas, indicadores de climatización, bitácora en tiempo real
 * y distribución patrimonial dinámica basada en los datos reales del sistema.
 * Utiliza las clases exactas de styles.css (.card-base, .stat-card, etc.)
 * ==============================================================================
 */

class DashboardView {
  constructor() {
    this.statsContainer = document.getElementById('statsContainer');
    this.chartContainer = document.getElementById('categoryDistributionBars');
    this.activityList = document.getElementById('activityList');
  }

  renderStats(stats = {}) {
    if (!this.statsContainer) return;

    const cards = [
      {
        title: "Sedes Museísticas",
        value: stats.totalMuseums ?? 0,
        desc: "Instituciones integradas",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z"/></svg>`,
        badge: "Activas",
        badgeClass: "badge-green",
        isPositive: true
      },
      {
        title: "Obras Catalogadas",
        value: stats.totalArtworks ?? 0,
        desc: "Piezas bajo custodia",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
        badge: "Inventariado",
        badgeClass: "badge-violet",
        isPositive: true
      },
      {
        title: "Salas Climatizadas",
        value: stats.activeRooms ?? 0,
        desc: "Monitoreo continuo IoT",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
        badge: "20.5°C · 48% HR",
        badgeClass: "badge-blue",
        isPositive: true
      },
      {
        title: "Conservación Media",
        value: `${stats.avgConservation ?? 94.0}%`,
        desc: "Índice de integridad física",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        badge: stats.avgConservation >= 90 ? "Estándar Óptimo" : "En Monitoreo",
        badgeClass: stats.avgConservation >= 90 ? "badge-green" : "badge-amber",
        isPositive: stats.avgConservation >= 90
      }
    ];

    this.statsContainer.innerHTML = cards.map(c => `
      <article class="card-base stat-card" tabindex="0" aria-label="${c.title}: ${c.value}. ${c.desc}">
        <div class="stat-info">
          <span class="stat-title">${c.title}</span>
          <div class="stat-value">${c.value}</div>
          <div class="stat-meta ${c.isPositive ? 'positive' : ''}">
            <span>${c.desc}</span>
            <span class="badge ${c.badgeClass}" style="margin-left: 6px;">${c.badge}</span>
          </div>
        </div>
        <div class="stat-icon" aria-hidden="true">${c.icon}</div>
      </article>
    `).join('');
  }

  renderCategoryChart(artworks = []) {
    if (!this.chartContainer) return;

    if (!artworks || artworks.length === 0) {
      this.chartContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          No hay piezas catalogadas actualmente para calcular la distribución.
        </div>
      `;
      return;
    }

    // Agrupar por categoría patrimonial real
    const categoryCounts = {};
    artworks.forEach(art => {
      const cat = (art.category && art.category.trim()) || 'Otras Categorías';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const total = artworks.length;
    const colors = [
      'fill-violet',
      'fill-blue',
      'fill-cyan',
      'fill-amber',
      'fill-emerald'
    ];

    const sortedCategories = Object.entries(categoryCounts)
      .map(([name, count], index) => {
        const pct = Math.round((count / total) * 100);
        return {
          name,
          count,
          pct,
          colorClass: colors[index % colors.length]
        };
      })
      .sort((a, b) => b.count - a.count);

    this.chartContainer.innerHTML = sortedCategories.map(cat => `
      <div class="chart-bar-row">
        <div class="chart-bar-info">
          <span>${this.escape(cat.name)} (${cat.count} ${cat.count === 1 ? 'pieza' : 'piezas'})</span>
          <span>${cat.pct}% del Acervo</span>
        </div>
        <div class="chart-track" role="progressbar" aria-valuenow="${cat.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${this.escape(cat.name)}">
          <div class="chart-fill ${cat.colorClass}" style="width: ${cat.pct}%;"></div>
        </div>
      </div>
    `).join('');
  }

  renderActivityLog(model = {}) {
    const list = document.getElementById('activityList');
    if (!list) return;

    const items = [];

    // 1. Climatización IoT de salas reales
    const rooms = model.rooms || [];
    if (rooms.length > 0) {
      const room = rooms[0];
      items.push({
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        iconStyle: `color: var(--neon-blue);`,
        title: `Estabilidad Climática IoT: ${this.escape(room.code)}`,
        desc: `${this.escape(room.name)} en ${this.escape(room.museumName)} registra monitoreo ambiental activo (${this.escape(room.climateControl)}).`,
        time: 'Hace 10 min'
      });
    }

    // 2. Estado de conservación de obras reales
    const artworks = model.artworks || [];
    if (artworks.length > 0) {
      const attentionArt = [...artworks].sort((a, b) => (a.conservationPercent || 100) - (b.conservationPercent || 100))[0];
      if (attentionArt && attentionArt.conservationPercent < 95) {
        items.push({
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
          iconStyle: `color: #f59e0b;`,
          title: `Monitoreo Preventivo: ${this.escape(attentionArt.title)}`,
          desc: `Pieza de ${this.escape(attentionArt.artist)} en ${this.escape(attentionArt.room)} registra ${attentionArt.conservationPercent}% de conservación. Protocolo de preservación activo.`,
          time: 'Hace 45 min'
        });
      } else {
        items.push({
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
          iconStyle: `color: #10b981;`,
          title: `Protocolo de Integridad Física Óptimo`,
          desc: `El total de las ${artworks.length} obras catalogadas mantiene un índice de conservación superior al estándar preventivo.`,
          time: 'Hace 1 hora'
        });
      }
    }

    // 3. Recorridos y aforo de visitas guiadas reales
    const tours = model.tours || [];
    if (tours.length > 0) {
      const tour = tours[0];
      const registered = tour.registeredAttendees || 0;
      const max = tour.maxCapacity || 25;
      const pct = Math.round((registered / max) * 100);
      items.push({
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        iconStyle: `color: var(--neon-violet-dark);`,
        title: `Aforo al ${pct}% en Visita Programada`,
        desc: `Tour "${this.escape(tour.title)}" a cargo de ${this.escape(tour.guide)} cuenta con ${registered} de ${max} plazas ocupadas (${this.escape(tour.dateTime)}).`,
        time: 'Hoy'
      });
    }

    if (items.length === 0) {
      list.innerHTML = `<p style="padding: 16px; color: var(--text-muted); font-size: 0.88rem; text-align: center;">Sin registros de actividad en este momento.</p>`;
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="activity-item">
        <div class="activity-avatar" style="${item.iconStyle}" aria-hidden="true">
          ${item.icon}
        </div>
        <div class="activity-details">
          <div class="activity-title">${item.title}</div>
          <div class="activity-desc">${item.desc}</div>
        </div>
        <div class="activity-time">${item.time}</div>
      </div>
    `).join('');
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

window.DashboardView = DashboardView;
