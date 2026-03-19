import type { Config } from "tailwindcss";

const config: Config = {
  // Class-based dark mode
  darkMode: "class",

  // Tell Tailwind where to scan for class names
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./store/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        // Light mode surfaces
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f9f9f9",
          tertiary: "#f3f3f3",
          border: "#e5e5e5",
        },
        // Dark mode surfaces
        dark: {
          DEFAULT: "#0a0a0a",
          secondary: "#111111",
          tertiary: "#1a1a1a",
          quaternary: "#222222",
          border: "#2a2a2a",
        },
        // Text shades
        ink: {
          DEFAULT: "#0a0a0a",
          secondary: "#525252",
          tertiary: "#737373",
          muted: "#a3a3a3",
        },
      },

      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },

      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
        "pulse-dot": "pulseDot 1.4s infinite ease-in-out",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },

  plugins: [],
};

export default config;
