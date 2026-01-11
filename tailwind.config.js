export default {
  darkMode: 'class',
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "345px", 
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
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
      typography: (theme) => ({
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
      width: {
        xs: "18rem", // 288px, 
        sm: "24rem", // 384px
        md: "28rem", // 448px
        lg: "32rem", // 512px
        xl: "36rem", // 576px
        "2xl": "42rem", // 672px
        "screen-xs": "100vw", // Full width for mobile
        "screen-sm": "100vw",
        "screen-md": "100vw",
        "screen-lg": "100vw",
        "screen-xl": "100vw",
        "screen-2xl": "100vw",
      },
      minWidth: {
        xs: "18rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
      },
      maxWidth: {
        xs: "18rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "screen-xs": "375px", // Matches mobile xs breakpoint
        "screen-sm": "640px",
        "screen-md": "768px",
        "screen-lg": "1024px",
        "screen-xl": "1280px",
        "screen-2xl": "1536px",
      },
      height: {
        xs: "18rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "screen-xs": "100vh", // Full height for mobile
        "screen-sm": "100vh",
        "screen-md": "100vh",
        "screen-lg": "100vh",
        "screen-xl": "100vh",
        "screen-2xl": "100vh",
      },
      minHeight: {
        xs: "18rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
      },
      maxHeight: {
        xs: "18rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "screen-xs": "100vh",
        "screen-sm": "100vh",
        "screen-md": "100vh",
        "screen-lg": "100vh",
        "screen-xl": "100vh",
        "screen-2xl": "100vh",
      },
    },
  },
  plugins: [],
};
