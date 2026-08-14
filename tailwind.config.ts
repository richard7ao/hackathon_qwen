import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "oklch(1.000 0.000 0)",
        surface: "oklch(0.985 0.003 220)",
        ink: "oklch(0.150 0.020 220)",
        muted: "oklch(0.500 0.015 220)",
        primary: {
          DEFAULT: "oklch(0.520 0.170 145)",
          hover: "oklch(0.440 0.180 145)",
          subtle: "oklch(0.950 0.035 145)",
        },
        accent: "oklch(0.650 0.110 75)",
        success: "oklch(0.600 0.150 145)",
        warning: "oklch(0.700 0.130 85)",
        error: "oklch(0.550 0.180 25)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["SF Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
