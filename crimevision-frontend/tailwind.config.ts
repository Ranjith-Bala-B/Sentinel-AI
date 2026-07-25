import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#F0F4F8", // Page background: Silver White
          900: "#0F3DA3", // Sidebar background: Deep Royal Blue
          850: "#FFFFFF", // Card background: Pure White
          800: "#E2E8F0", // Border color: Muted Light Gray
          700: "#F8FAFC", // Section / Table header background: Off-White
          600: "#CBD5E1", // Accent / Divider lines
          500: "#64748B", // Muted text: Slate Gray
          400: "#475569", // Subtitle text: Slate Gray Dark
          300: "#334155", // Main body text: Slate Navy
          200: "#1E293B", // Heading text: Dark Slate
          100: "#0F172A", // Bold titles: Deep Navy
          50: "#0B1224",  // KPI metrics: Bold Midnight Blue
        },
        signal: {
          500: "#0F3DA3", // Primary Theme Color: Royal Blue
          600: "#0A2D80", // Primary Hover / Dark Accent
          400: "#2563EB", // Bright Active State / Accent Blue
        },
        alert: {
          amber: "#F59E0B", // Warning / Pending
          red: "#EF4444",   // Critical / Alerts
          blue: "#3B82F6",  // Info / Solved
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "grid-overlay":
          "linear-gradient(rgba(15,61,163,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(15,61,163,0.02) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
      boxShadow: {
        glass: "0 2px 8px rgba(15, 23, 42, 0.04), 0 4px 20px rgba(15, 23, 42, 0.03)",
        glow: "0 0 0 1px rgba(15,61,163,0.08), 0 4px 16px rgba(15,61,163,0.04)",
      },
      borderRadius: {
        xl2: "0.75rem", // More modern rounded layout
      },
    },
  },
  plugins: [],
} satisfies Config;
