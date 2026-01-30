/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        black: "#000000",
        violet: "#7D39EB",
        lime: "#C6FF33",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
