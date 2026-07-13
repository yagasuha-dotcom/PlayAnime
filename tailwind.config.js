/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#08090c",
          900: "#0c0e13",
          800: "#12151c",
          700: "#1a1e28",
          600: "#242938",
        },
        line: "#232838",
        accent: {
          DEFAULT: "#f6a623", // amber/orange terminal-style, sama semangat kotak rfloys
          soft: "#3a2f1a",
        },
        mint: "#39d98a", // status "tersedia" / sukses
        ruby: "#ef4444", // status locked/error
        kasta: {
          admin: "#f6a623",
          donatur: "#7c9dff",
          rakyat: "#6b7280",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        box: "10px",
      },
    },
  },
  plugins: [],
};
