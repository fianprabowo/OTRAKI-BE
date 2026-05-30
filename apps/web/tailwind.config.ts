import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e7efff",
          200: "#cfddff",
          300: "#a9c1ff",
          400: "#7fa0ff",
          500: "#4F7DF3",
          600: "#3567f0",
          700: "#2a54d3",
          800: "#2447ad",
          900: "#223b86"
        },
        sun: {
          50: "#fff9e6",
          100: "#fff1c2",
          200: "#ffe28a",
          300: "#ffd257",
          400: "#ffc233",
          500: "#ffb400",
          600: "#db9200",
          700: "#b67200",
          800: "#925a00",
          900: "#774900"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
