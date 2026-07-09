/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Ocean palette — subdued blues/greens with bright coral/yellow/green pops.
        // Base greys use Tailwind `neutral` (true grey, no blue tint).
        ocean: {
          300: "#7cc4dd",
          400: "#4aa3c4",
          500: "#2c7da0",
          600: "#22637f",
          700: "#1b4d63",
          ink: "#0a2833",
        },
        kelp: {
          400: "#5aa892",
          500: "#3f8f7d",
          600: "#2f6f61",
          ink: "#0d332a",
        },
        coral: {
          400: "#ff8a7a",
          500: "#ff6f61",
          600: "#e8503f",
          ink: "#5c1a12",
        },
        sun: {
          300: "#ffdd8f",
          400: "#ffd166",
          500: "#f4b942",
          ink: "#5c4212",
        },
        reef: {
          400: "#3ddc97",
          500: "#20c997",
          600: "#12a880",
          ink: "#083126",
        },
      },
      fontFamily: {
        display: ["ui-rounded", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
