import { vitePlugin as remix } from "@remix-run/dev";
  import { defineConfig } from "vite";
  import tsconfigPaths from "vite-tsconfig-paths";
  import "dotenv/config";
import path from "path";
import { routes } from "./app/routeConfig";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  envPrefix: ['VITE_', 'FIREBASE_'], // Allow both VITE_ and FIREBASE_ prefixes
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
  server: {
    watch: {
      ignored: [
        "**/build/**",
        "**/.git/**",
        "**/node_modules/**",
        "**/prisma/migrations/**",
      ],
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: false,
      },
      routes,
    }),
    tsconfigPaths(),
  ],
});
