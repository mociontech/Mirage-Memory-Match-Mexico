/**
 * Cache-first para imagenes/fuentes/video propios del build (mismo origen).
 * Objetivo puntual: en wifi de stand (venue congestionado), una descarga que
 * ya se completo una vez no debe volver a competir por red en la proxima
 * carga de la app - se sirve directo del cache, y de paso se revalida en
 * segundo plano (stale-while-revalidate) para no quedar pegado a un asset
 * viejo si el deploy cambio.
 *
 * No intercepta:
 * - Peticiones a otro origen (Supabase, Evius) - esas nunca deben cachearse
 *   aca, tienen su propia logica de reintentos (ver services/outbox.ts).
 * - HTML/JS/CSS - Vite ya les pone hash en el nombre de archivo, así que un
 *   deploy nuevo sirve rutas nuevas solas; cachearlos aca solo arriesgaria
 *   servir una version vieja de la app.
 */
const CACHE_NAME = "mirage-memory-match-assets-v1";
const CACHEABLE_EXTENSIONS = /\.(png|jpe?g|webp|gif|svg|ttf|woff2?|mp4)$/i;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!CACHEABLE_EXTENSIONS.test(url.pathname)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      // stale-while-revalidate: si ya esta en cache, se sirve de una y la
      // red actualiza el cache para la proxima - si no esta, se espera la red.
      return cached ?? network;
    }),
  );
});
