/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07070c",
          900: "#0b0b13",
          800: "#12121d",
          700: "#1b1b2a",
          600: "#282840",
        },
        line: "#22223a",
        violet: {
          DEFAULT: "#a855f7",
          soft: "#2a1a45",
        },
        magenta: "#ec4899",
        amber: {
          DEFAULT: "#fbbf24",
          soft: "#3a2a10",
        },
        mint: "#34d399",
        ruby: "#f43f5e",
        kasta: {
          admin: "#fbbf24",
          donatur: "#a855f7",
          rakyat: "#6b7280",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
        "glow-radial": "radial-gradient(circle at 50% 0%, rgba(168,85,247,0.15), transparent 70%)",
      },
      borderRadius: {
        box: "14px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(168,85,247,0.25), 0 8px 24px -8px rgba(168,85,247,0.35)",
        "glow-sm": "0 0 0 1px rgba(168,85,247,0.2)",
      },
    },
  },
  plugins: [],
};
