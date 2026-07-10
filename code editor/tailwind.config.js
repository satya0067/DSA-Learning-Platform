/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: "#1a1a2e",
        bgPanel: "#16213e",
        bgEditor: "#0d1117",
        difficulty: {
          easy: "#00b8a3",
          medium: "#ffc01e",
          hard: "#ff375f"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
