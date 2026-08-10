import type { Config } from "tailwindcss";

/**
 * Every colour resolves to a CSS variable, and those variables are injected at
 * runtime in app/layout.tsx from the admin Site Settings. That means a colour
 * change is a settings edit, not a deploy — so never hardcode a hex in a
 * component; use the token (bg-surface, text-muted, border-hairline, ...).
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: "var(--accent)",
        background: "var(--background)",
        surface: "var(--surface)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        hairline: "var(--border)",
        success: { DEFAULT: "var(--success)", bg: "var(--success-bg)" },
        warning: { DEFAULT: "var(--warning)", bg: "var(--warning-bg)" },
        danger: { DEFAULT: "var(--danger)", bg: "var(--danger-bg)" },
        info: { DEFAULT: "var(--info)", bg: "var(--info-bg)" },
      },
      // Makes every bare `border`, `border-t`, `divide-y` etc. use the theme
      // hairline instead of Tailwind's default gray-200 — one line instead of
      // hunting down hundreds of call sites.
      borderColor: { DEFAULT: "var(--border)" },
      divideColor: { DEFAULT: "var(--border)" },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
