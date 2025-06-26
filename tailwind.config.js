/**
 * Project: yahyaoncloud Official Blog Platform
 * File: tailwind.config.js
 * Description: TailwindCSS configuration with dark mode and copper/navy theme colors
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark mode: Copper theme
        copper: {
          50: "#fef7f0",
          100: "#feecdc",
          200: "#fcd5b4",
          300: "#fab882",
          400: "#f7934e",
          500: "#f57528",
          600: "#e65a1e",
          700: "#be441a",
          800: "#97371c",
          900: "#7a2f1a",
          950: "#42160c",
        },
        // Light mode: Navy blue theme
        navy: {
          50: "#f0f4f8",
          100: "#d9e6f2",
          200: "#b7d0e8",
          300: "#8bb2db",
          400: "#5b8ecb",
          500: "#3870ba",
          600: "#2a5aa0",
          700: "#234883",
          800: "#203e6b",
          900: "#1e3559",
          950: "#14223b",
        },
        // Primary colors (dynamic based on theme)
        primary: {
          // Light mode: Navy blue
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          50: "rgb(var(--color-primary-50) / <alpha-value>)",
          100: "rgb(var(--color-primary-100) / <alpha-value>)",
          200: "rgb(var(--color-primary-200) / <alpha-value>)",
          300: "rgb(var(--color-primary-300) / <alpha-value>)",
          400: "rgb(var(--color-primary-400) / <alpha-value>)",
          500: "rgb(var(--color-primary-500) / <alpha-value>)",
          600: "rgb(var(--color-primary-600) / <alpha-value>)",
          700: "rgb(var(--color-primary-700) / <alpha-value>)",
          800: "rgb(var(--color-primary-800) / <alpha-value>)",
          900: "rgb(var(--color-primary-900) / <alpha-value>)",
          950: "rgb(var(--color-primary-950) / <alpha-value>)",
        },
        // Keep existing secondary colors for compatibility
        secondary: {
          DEFAULT: "#64748b", // slate
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        // Dark theme specific colors
        dark: {
          DEFAULT: "#1e293b", // slate-800
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        text: {
          DEFAULT: "rgb(30 41 59)", // slate-800 for light mode
          dark: "rgb(255 255 255)", // white for dark mode
        },
        subtext: {
          DEFAULT: "rgb(100 116 139)", // slate-500
          dark: "rgb(148 163 184)", // slate-400
        },
        background: {
          DEFAULT: "rgb(248 250 252)", // slate-50
          dark: "rgb(15 23 42)", // slate-900
        },
        card: {
          DEFAULT: "rgb(255 255 255)", // white
          dark: "rgb(30 41 59)", // slate-800
        },
        border: {
          DEFAULT: "rgb(226 232 240)", // slate-200
          dark: "rgb(51 65 85)", // slate-700
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.dark.700"),
            a: {
              color: theme("colors.navy.600"),
              "&:hover": {
                color: theme("colors.navy.700"),
              },
            },
            h1: {
              color: theme("colors.dark.800"),
            },
            h2: {
              color: theme("colors.dark.800"),
            },
            h3: {
              color: theme("colors.dark.800"),
            },
            code: {
              color: theme("colors.navy.600"),
              backgroundColor: theme("colors.navy.50"),
              padding: "0.2rem 0.4rem",
              borderRadius: "0.25rem",
              fontWeight: "400",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.dark.200"),
            a: {
              color: theme("colors.copper.400"),
              "&:hover": {
                color: theme("colors.copper.300"),
              },
            },
            h1: {
              color: theme("colors.dark.100"),
            },
            h2: {
              color: theme("colors.dark.100"),
            },
            h3: {
              color: theme("colors.dark.100"),
            },
            code: {
              color: theme("colors.copper.400"),
              backgroundColor: theme("colors.dark.800"),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // Plugin to add CSS custom properties for dynamic theming
    function ({ addBase }) {
      addBase({
        ":root": {
          // Light mode: Navy blue
          "--color-primary": "56 112 186", // navy-500
          "--color-primary-50": "240 244 248",
          "--color-primary-100": "217 230 242",
          "--color-primary-200": "183 208 232",
          "--color-primary-300": "139 178 219",
          "--color-primary-400": "91 142 203",
          "--color-primary-500": "56 112 186",
          "--color-primary-600": "42 90 160",
          "--color-primary-700": "35 72 131",
          "--color-primary-800": "32 62 107",
          "--color-primary-900": "30 53 89",
          "--color-primary-950": "20 34 59",
        },
        ".dark": {
          // Dark mode: Copper
          "--color-primary": "245 117 40", // copper-500
          "--color-primary-50": "254 247 240",
          "--color-primary-100": "254 236 220",
          "--color-primary-200": "252 213 180",
          "--color-primary-300": "250 184 130",
          "--color-primary-400": "247 147 78",
          "--color-primary-500": "245 117 40",
          "--color-primary-600": "230 90 30",
          "--color-primary-700": "190 68 26",
          "--color-primary-800": "151 55 28",
          "--color-primary-900": "122 47 26",
          "--color-primary-950": "66 22 12",
        },
      });
    },
  ],
};
