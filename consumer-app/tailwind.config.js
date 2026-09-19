/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "var(--bg-main)",
          card: "var(--bg-card)",
          surface: "var(--bg-surface)",
          text: "var(--text-primary)",
          muted: "var(--text-muted)",
          border: "var(--border-color)",
        },
        judicial: {
          950: "#030712",
          900: "#0B1220",
          800: "#0F172A",
          700: "#1E293B",
          600: "#334155",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        cobalt: {
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        azure: {
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
        },

      },
      fontFamily: {
        serif: ["var(--font-serif)", "Newsreader", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
