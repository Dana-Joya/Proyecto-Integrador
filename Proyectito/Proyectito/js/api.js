/**
 * ==============================================================================
 * CLIENTE API: MuseumApiClient (POO)
 * Mantiene compatibilidad directa con ApiService.
 * ==============================================================================
 */

if (typeof ApiService !== 'undefined') {
  window.MuseumApiClient = ApiService;
  if (!window.museumApi) {
    window.museumApi = new ApiService();
  }
}
