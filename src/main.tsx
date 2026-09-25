import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/animations.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Cache-first para imagenes/fuentes propias del build (ver public/sw.js) -
// registrado despues del render para no competir con el primer paint.
// serviceWorker no existe si la app corre por http:// plano (no localhost),
// de ahi el chequeo explicito en vez de dejar que tire.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
