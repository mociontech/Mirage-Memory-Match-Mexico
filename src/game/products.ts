import ciMagnumComercialLigero from "../assets/images/products/ci-magnum-comercial-ligero.png";
import inverterX from "../assets/images/products/inverter-x.png";
import lavadoraAutomatica from "../assets/images/products/lavadora-automatica.png";
import magnumInverter22Mx from "../assets/images/products/magnum-inverter-22-mx.png";
import neoMinisplit from "../assets/images/products/neo-minisplit.png";
import rviCassette from "../assets/images/products/rvi-cassette.png";
import turboFluxMx from "../assets/images/products/turbo-flux-mx.png";
import x5OnOff from "../assets/images/products/x5-onoff.png";

import ciMagnumLogo from "../assets/images/products/logos/ci-magnum-logo.svg";
import inverterXLogo from "../assets/images/products/logos/inverter-x-logo.svg";
import lavadoraAutomaticaLogo from "../assets/images/products/logos/lavadora-automatica-logo.svg";
import magnumInverter22MxLogo from "../assets/images/products/logos/magnum-inverter-22-mx-logo.svg";
import neoLogo from "../assets/images/products/logos/neo-logo.svg";
import rviCassetteLogo from "../assets/images/products/logos/rvi-cassette-logo.svg";
import turboFluxMxLogo from "../assets/images/products/logos/turbo-flux-mx-logo.svg";
import x5OnOffLogo from "../assets/images/products/logos/x5-onoff-logo.svg";

/** left/top/width/height as % of the card box — see CardRect below. */
export interface CardRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  name: string;
  /** Brand wordmark shown above the product photo on a matched/revealed card — exported straight from Figma per product. */
  logo: string;
  image: string;
  /**
   * Exact placement of `logo` and `image` inside the card, as a % of the
   * card's own box (188x178 in Figma) — e.g. `left: 34/188*100`. Every
   * product's logo/photo has its own size and position in the design (they
   * are not laid out on a shared grid), so this is per-product data rather
   * than a shared CSS rule.
   */
  logoRect: CardRect;
  photoRect: CardRect;
  /** Copy shown in ProductPopup when this product's pair is matched. */
  popupCopy: string;
}

/**
 * Mexico board, per Figma node 122:588 ("inicio Juego" in the MEXICO section
 * of the Mirage file, fileKey vilVPSsVUtGwTG8Er9njo5): 8 products, 16 cards,
 * 4x4 grid — matches PAIRS_COUNT in game.config.ts.
 *
 * Ci Magnum, Neo and Turbo Flux are the same real products/photography as
 * the Colombia board, but this board places them at slightly different
 * proportions inside the card, so their rects were recomputed from this
 * frame's own pixel positions rather than reused from Colombia's file.
 *
 * PENDING: popupCopy is still placeholder for all products — Figma only
 * shows the board itself, no final popup copy yet.
 */
/**
 * Fuerza la descarga + decode real (no solo bytes) de las 16 imagenes del
 * tablero (8 fotos + 8 logos) apenas arranca la app - mismo patron que usa
 * la pitch de Products para sus banners. Sin esto, el primer <img> de cada
 * producto recien empezaba a pedirse cuando Game.tsx montaba (con la
 * revelacion inicial de las 8 parejas de una), lo que en wifi de stand
 * (venue congestionado, no la red de oficina donde se prueba normalmente)
 * dejaba tarjetas en blanco varias partidas seguidas: no es que el cache
 * "se llenara" jugando, es que cada carga fresca de la app volvia a pelear
 * por las mismas 16 descargas justo cuando mas apuran (la revelacion dura
 * INTRO_REVEAL_DURATION_MS). Llamar esto en el mount de App.tsx les da
 * todo el resto del flujo (Welcome -> Registro -> Instructivo) para llegar
 * a destino antes de que hagan falta. decode() puede no existir en
 * navegadores viejos, de ahi el optional chaining + catch mudo (no es
 * fatal, solo se pierde el adelanto).
 */
export function preloadProductAssets(): void {
  for (const product of PRODUCTS) {
    for (const src of [product.image, product.logo]) {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
    }
  }
}

export const PRODUCTS: Product[] = [
  {
    id: "x5-onoff",
    name: "X5 Inverter",
    logo: x5OnOffLogo,
    image: x5OnOff,
    logoRect: { left: 22.87, top: 14.61, width: 48.44, height: 26.4 },
    photoRect: { left: 4.79, top: 44.94, width: 88.83, height: 47.19 },
    popupCopy: "Copy pendiente del cliente para X5 Inverter",
  },
  {
    id: "neo",
    name: "NEO",
    logo: neoLogo,
    image: neoMinisplit,
    logoRect: { left: 19.15, top: 22.47, width: 56.91, height: 16.96 },
    photoRect: { left: 4.79, top: 48.31, width: 90.96, height: 38.76 },
    popupCopy: "Copy pendiente del cliente para NEO",
  },
  {
    id: "inverter-x",
    name: "Inverter X",
    logo: inverterXLogo,
    image: inverterX,
    logoRect: { left: 15.96, top: 14.04, width: 81.91, height: 21.51 },
    photoRect: { left: 6.91, top: 44.94, width: 85.11, height: 31.46 },
    popupCopy: "Copy pendiente del cliente para Inverter X",
  },
  {
    id: "lavadora-automatica",
    name: "Lavadora Automatica",
    logo: lavadoraAutomaticaLogo,
    image: lavadoraAutomatica,
    logoRect: { left: 21.81, top: 10.11, width: 55.71, height: 22.99 },
    photoRect: { left: 32.98, top: 39.33, width: 30.85, height: 53.93 },
    popupCopy: "Copy pendiente del cliente para Lavadora Automatica",
  },
  {
    id: "ci-magnum",
    name: "Ci Magnum",
    logo: ciMagnumLogo,
    image: ciMagnumComercialLigero,
    logoRect: { left: 33.51, top: 14.04, width: 32.38, height: 31.46 },
    photoRect: { left: 4.79, top: 49.44, width: 87.23, height: 39.33 },
    popupCopy: "Copy pendiente del cliente para Ci Magnum",
  },
  {
    id: "rvi-cassette",
    name: "RVI",
    logo: rviCassetteLogo,
    image: rviCassette,
    logoRect: { left: 4.26, top: 4.49, width: 91.49, height: 28.09 },
    photoRect: { left: 11.17, top: 37.64, width: 76.06, height: 53.93 },
    popupCopy: "Copy pendiente del cliente para RVI",
  },
  {
    id: "magnum-inverter-22-mx",
    name: "Magnum Inverter 22",
    logo: magnumInverter22MxLogo,
    image: magnumInverter22Mx,
    logoRect: { left: 13.3, top: 13.48, width: 73.4, height: 15.35 },
    photoRect: { left: 11.7, top: 37.64, width: 74.47, height: 36.52 },
    popupCopy: "Copy pendiente del cliente para Magnum Inverter 22",
  },
  {
    // A diferencia de Neo/Ci Magnum, este SI es un equipo distinto al de
    // Colombia (un calentador WiFi, no el boiler que usa el tablero CO) -
    // foto y logo propios de este tablero, no reutilizados.
    id: "turbo-flux-mx",
    name: "Turbo Flux",
    logo: turboFluxMxLogo,
    image: turboFluxMx,
    logoRect: { left: 27.13, top: 8.43, width: 51.06, height: 29.93 },
    photoRect: { left: 35.11, top: 40.45, width: 27.66, height: 52.81 },
    popupCopy: "Copy pendiente del cliente para Turbo Flux",
  },
];
