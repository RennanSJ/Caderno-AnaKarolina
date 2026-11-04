/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        blue: { DEFAULT: "var(--blue)", soft: "var(--blue-soft)" },
        violet: { DEFAULT: "var(--violet)", soft: "var(--violet-soft)" },
        alta: { DEFAULT: "var(--alta)", soft: "var(--alta-soft)" },
        media: { DEFAULT: "var(--media)", soft: "var(--media-soft)" },
        sup: { DEFAULT: "var(--sup)", soft: "var(--sup-soft)" }
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "Avenir Next", "Segoe UI", "system-ui", "sans-serif"],
        body: ["Figtree", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};
