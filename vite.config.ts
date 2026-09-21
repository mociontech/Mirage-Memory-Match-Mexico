import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Kiosk build: small bundle, no legacy browser targets to keep polyfill weight out.
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
  },
  test: {
    environment: "jsdom",
    watch: false,
  },
});
