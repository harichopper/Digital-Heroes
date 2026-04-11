import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#a04223",
        "on-primary": "#fff7f5",
        "primary-container": "#ffad94",
        tertiary: "#845500",
        "tertiary-container": "#feb64c",
        background: "#f7f9fb",
        "on-surface": "#2d3337",
        "on-surface-variant": "#596063",
        "surface-container-low": "#f1f4f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e3e9ec",
        "outline-variant": "#acb3b7",
        surface: "#f7f9fb",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      fontFamily: {
        headline: ["var(--font-headline)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        label: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
