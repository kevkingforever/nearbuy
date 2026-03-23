import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NearBuy Design System
        background: "var(--bg)",
        foreground: "var(--ink)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--ink)",
        },
        primary: {
          DEFAULT: "var(--g)",
          foreground: "#ffffff",
          light: "var(--gl)",
          xlight: "var(--gxl)",
          dark: "var(--g2)",
        },
        secondary: {
          DEFAULT: "var(--ink)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--border2)",
          foreground: "var(--ink3)",
        },
        accent: {
          DEFAULT: "var(--gl)",
          foreground: "var(--g2)",
        },
        destructive: {
          DEFAULT: "var(--red)",
          foreground: "#ffffff",
          light: "var(--redl)",
        },
        warning: {
          DEFAULT: "var(--amber)",
          foreground: "#ffffff",
          light: "var(--ambl)",
        },
        info: {
          DEFAULT: "var(--blue)",
          foreground: "#ffffff",
          light: "var(--bluel)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--goldl)",
        },
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--g)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink2)",
          3: "var(--ink3)",
          4: "var(--ink4)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--r)",
        md: "var(--rs)",
        sm: "var(--rx)",
        full: "var(--rf)",
      },
      boxShadow: {
        sm: "var(--sh)",
        md: "var(--shm)",
        lg: "var(--shl)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%": { opacity: "0.8", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(2.2)" },
        },
        "rider-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(27,107,58,.4), var(--shm)",
          },
          "50%": {
            boxShadow: "0 0 0 10px rgba(27,107,58,0), var(--shm)",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.3s ease-out both",
        "slide-up": "slide-up 0.4s ease-out both",
        shimmer: "shimmer 1.4s infinite",
        pulse: "pulse 1.8s ease-out infinite",
        "rider-pulse": "rider-pulse 2s ease infinite",
      },
    },
  },
  plugins: [],
}

export default config
