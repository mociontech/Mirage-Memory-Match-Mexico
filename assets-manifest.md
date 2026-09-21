# Assets manifest

Mapa de cada asset descargado a su nodo de origen en Figma, para poder
re-sincronizar si el diseño cambia. Archivo: `Mirage`
(`vilVPSsVUtGwTG8Er9njo5`), página "03_Mirage MATCH".

| Archivo local | Nodo Figma | Nombre en Figma | Formato origen | Notas |
|---|---|---|---|---|
| `src/assets/images/logo-mirage.svg` | 32:115 (y equivalentes 35:341, etc. — instancia repetida) | "Logo Mirage" | SVG | Optimizado con SVGO (−40%). Reutilizado en todas las pantallas. |
| `src/assets/images/icon-person.svg` | 29:831 "Group 178" | ícono junto a campo "Nombre" | SVG | Optimizado con SVGO (−34.5%). |
| `src/assets/images/icon-envelope.svg` | 29:827 "icon" | ícono junto a campo "Correo" | SVG | Optimizado con SVGO (−45%). |
| `src/assets/images/icon-warning.svg` | 68:186 "Vector" | triángulo de advertencia | SVG | Optimizado con SVGO (−28.4%). Usado en el modal Advertencia. |
| `src/assets/images/logo-mark.svg` | 80:120 "Group 1000005827" | marca Mirage (solo el ícono, sin wordmark) | SVG | Optimizado con SVGO. Usado en ProductPopup. |
| `src/assets/images/instructions-touch.webp` | 29:1041 "image 14" | icono mano tocando (Instructivo) | PNG (raster, no vector en Figma) | Convertido a WebP, redimensionado a 446×588 (2× el render máximo de 223×294 en el diseño). |

## Pendiente (no se descargó todavía)

- **Arte de las 10 cartas del tablero** (frente por producto): en Figma solo hay
  bloques de color placeholder (`#FF006A`, `#A81780`, `#333`, `#00DAD7`,
  `#848484`, blanco) sin imagen de producto real — ver inconsistencia #5 del
  reporte de Fase 0. Se agregará aquí cuando el cliente entregue los assets
  finales de cada producto.
- **Favicon / ícono de app**: se sigue usando el `favicon.svg` genérico del
  scaffold inicial; reemplazar por un ícono de marca cuando se defina.
