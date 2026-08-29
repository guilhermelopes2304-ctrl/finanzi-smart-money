import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.finanzzi.app",
  appName: "FINANZZI",
  webDir: "dist/client",
  server: { androidScheme: "https", iosScheme: "https" },
  plugins: { StatusBar: { style: "DARK", backgroundColor: "#111111" } },
};

export default config;
