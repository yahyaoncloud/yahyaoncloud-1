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
  optimizeDeps: {
    include: [
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "react-markdown",
      "remark-gfm",
      "prism-react-renderer",
      "mermaid",
      "framer-motion",
      "sonner",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "marked",
      "use-debounce",
      "firebase/auth",
      "firebase/app",
      "firebase/database",
      "@supabase/supabase-js",
      "qrcode",
      "zustand",
      "zustand/middleware",
      "react-icons/lu",
      "react-icons/fa",
      "react-icons/vsc",
      "react-icons/di",
      "react-icons/si",
    ],
  },

  build: {
    chunkSizeWarningLimit: 1000,
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
