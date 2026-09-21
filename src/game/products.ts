import boilerTurboFlux from "../assets/images/products/boiler-turbo-flux.webp";
import ciMagnumComercialLigero from "../assets/images/products/ci-magnum-comercial-ligero.webp";
import disx30 from "../assets/images/products/disx30.webp";
import m22MinisplitColombia from "../assets/images/products/m22-minisplit-colombia.webp";
import neoMinisplit from "../assets/images/products/neo-minisplit.webp";
import nexMinisplit from "../assets/images/products/nex-minisplit.webp";
import v32Minisplit from "../assets/images/products/v32-minisplit.webp";
import xtraMultinverter from "../assets/images/products/xtra-multinverter.webp";

import nexLogo from "../assets/images/products/logos/nex-logo.png";
import neoLogo from "../assets/images/products/logos/neo-logo.png";
import v32Logo from "../assets/images/products/logos/v32-logo.png";
import disx30Logo from "../assets/images/products/logos/disx30-logo.png";
import ciMagnumLogo from "../assets/images/products/logos/ci-magnum-logo.png";
import xtraLogo from "../assets/images/products/logos/xtra-logo.png";
import m22MagnumLogo from "../assets/images/products/logos/m22-magnum-logo.png";
import boilerTurboFluxLogo from "../assets/images/products/logos/boiler-turbo-flux-logo.png";

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
 * Colombia board, per Figma node 209:862 ("inicio Juego" in the COLOMBIA
 * section of the Mirage file, fileKey vilVPSsVUtGwTG8Er9njo5): 8 products,
 * 16 cards, 4x4 grid — matches PAIRS_COUNT in game.config.ts.
 *
 * PENDING (client copy): popupCopy is still placeholder for all products —
 * Figma only labels this "8 pantallas totales, una por producto" without
 * final copy text yet. Names, logos and images are real.
 */
export const PRODUCTS: Product[] = [
  {
    id: "nex",
    name: "NEX",
    logo: nexLogo,
    image: nexMinisplit,
    logoRect: { left: 18.09, top: 11.8, width: 68.62, height: 31.46 },
    photoRect: { left: 5.85, top: 50, width: 87.77, height: 32.02 },
    popupCopy: "Copy pendiente del cliente para NEX",
  },
  {
    id: "neo",
    name: "NEO",
    logo: neoLogo,
    image: neoMinisplit,
    logoRect: { left: 19.15, top: 11.8, width: 56.91, height: 17.42 },
    photoRect: { left: 4.79, top: 43.26, width: 90.96, height: 38.76 },
    popupCopy: "Copy pendiente del cliente para NEO",
  },
  {
    id: "v32",
    name: "V32",
    logo: v32Logo,
    image: v32Minisplit,
    logoRect: { left: 20.21, top: 10.67, width: 56.91, height: 24.72 },
    photoRect: { left: 6.91, top: 48.88, width: 87.23, height: 33.71 },
    popupCopy: "Copy pendiente del cliente para V32",
  },
  {
    id: "disx30",
    name: "DIS X30",
    logo: disx30Logo,
    image: disx30,
    logoRect: { left: 22.34, top: 6.46, width: 53.19, height: 23.03 },
    photoRect: { left: 40.96, top: 32.58, width: 17.55, height: 61.8 },
    popupCopy: "Copy pendiente del cliente para DIS X30",
  },
  {
    id: "ci-magnum",
    name: "Ci Magnum",
    logo: ciMagnumLogo,
    image: ciMagnumComercialLigero,
    logoRect: { left: 33.51, top: 9.55, width: 32.45, height: 31.46 },
    photoRect: { left: 4.79, top: 42.7, width: 87.23, height: 39.33 },
    popupCopy: "Copy pendiente del cliente para Ci Magnum",
  },
  {
    id: "xtra-multinverter",
    name: "Xtra Multi Inverter",
    logo: xtraLogo,
    image: xtraMultinverter,
    logoRect: { left: 12.23, top: 12.92, width: 72.87, height: 24.72 },
    photoRect: { left: 8.51, top: 49.44, width: 82.98, height: 37.08 },
    popupCopy: "Copy pendiente del cliente para Xtra Multi Inverter",
  },
  {
    id: "m22-magnum",
    name: "Magnum 22",
    logo: m22MagnumLogo,
    image: m22MinisplitColombia,
    logoRect: { left: 12.77, top: 24.72, width: 73.4, height: 15.17 },
    photoRect: { left: 9.57, top: 51.69, width: 80.85, height: 33.15 },
    popupCopy: "Copy pendiente del cliente para Magnum 22",
  },
  {
    id: "boiler-turbo-flux",
    name: "Turbo Flux",
    logo: boilerTurboFluxLogo,
    image: boilerTurboFlux,
    logoRect: { left: 27.13, top: 5.06, width: 51.06, height: 30.34 },
    photoRect: { left: 32.45, top: 39.89, width: 30.32, height: 55.06 },
    popupCopy: "Copy pendiente del cliente para Turbo Flux",
  },
];
