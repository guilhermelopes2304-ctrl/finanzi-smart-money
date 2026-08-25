// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The approved FINANZZI logo is stored as base64 so GitHub can version it as text.
// Materialize the exact binary asset before Vite serves/builds public files.
const brandSource = "public/finanzzi-approved.webp.b64";
const brandTarget = "public/finanzzi-approved.webp";
try {
  const base64 = readFileSync(brandSource, "utf8").trim();
  writeFileSync(brandTarget, Buffer.from(base64, "base64"));
} catch {
  // Keep local/dev startup resilient if the optional brand source is unavailable.
}

export default defineConfig({
  vite: {
    server: {
      allowedHosts: [".manus.computer"],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
