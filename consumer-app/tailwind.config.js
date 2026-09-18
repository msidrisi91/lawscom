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
          950: "#060911",
          900: "#0B1120",
          800: "#131C31",
          700: "#1E293B",
          600: "#334155",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        gold: {
          300: "#FDE68A",
          400: "#FBBF24",
          500: "#D97706",
          600: "#B45309",
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
