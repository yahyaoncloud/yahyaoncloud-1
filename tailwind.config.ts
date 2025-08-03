import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / 1)",
        foreground: "hsl(var(--foreground) / 1)",
        card: {
          DEFAULT: "hsl(var(--card) / 1)",
          foreground: "hsl(var(--card-foreground) / 1)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / 1)",
          foreground: "hsl(var(--primary-foreground) / 1)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / 1)",
          foreground: "hsl(var(--accent-foreground) / 1)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / 1)",
          foreground: "hsl(var(--secondary-foreground) / 1)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / 1)",
          foreground: "hsl(var(--muted-foreground) / 1)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / 1)",
          foreground: "hsl(var(--destructive-foreground) / 1)",
        },
        border: "hsl(var(--border) / 1)",
        input: "hsl(var(--input) / 1)",
        ring: "hsl(var(--ring) / 1)",
        teal: "hsl(var(--teal) / 1)",
        amber: "hsl(var(--amber) / 1)",
        fuchsia: "hsl(var(--fuchsia) / 1)",
        emerald: "hsl(var(--emerald) / 1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.slate.800"),
            h1: { color: theme("colors.slate.900") },
            h2: { color: theme("colors.slate.900") },
            h3: { color: theme("colors.slate.900") },
            h4: { color: theme("colors.slate.900") },
            p: { color: theme("colors.slate.900") },
          },
        },
        dark: {
          css: {
            color: theme("colors.slate.100"),
            h1: { color: theme("colors.slate.100") },
            h2: { color: theme("colors.slate.100") },
            h3: { color: theme("colors.slate.100") },
            h4: { color: theme("colors.slate.100") },
            p: { color: theme("colors.slate.100") },
          },
        },
      }),
    },
  },
  plugins: [],
} satisfies Config;
