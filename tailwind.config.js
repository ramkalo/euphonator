/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Functional palette — non-functional blue (ocean), purple Tonic (coral),
        // and two greens for PD (kelp) / D (reef), with a bright yellow pop (sun).
        // Token names are kept for continuity; coral now renders purple.
        // Base greys use Tailwind `neutral` (true grey, no blue tint).
        // `mist` is the neutral UI-chrome accent (buttons/toggles/tabs/checkboxes/
        // selectors) — deliberately NOT a note-function colour, so UI colour never
        // reads as harmonic meaning.
        mist: {
          300: "#b9c6df",
          400: "#a4b5d5",
          500: "#8fa3cc",
          600: "#738cbf",
          ink: "#19202e",
        },
        ocean: {
          300: "#8fa3cc",
          400: "#6984ba",
          500: "#48639b",
          600: "#384e7a",
          700: "#2b3c5e",
          ink: "#141b29",
        },
        kelp: {
          // Pre-Dominant (PD) — subdued green
          400: "#59c977",
          500: "#3ab159",
          600: "#2d8b46",
          ink: "#14341c",
        },
        coral: {
          // Tonic (T) — now purple
          400: "#a14a9b",
          500: "#7a3876",
          600: "#5e2b5b",
          ink: "#321b30",
        },
        sun: {
          300: "#ffdd8f",
          400: "#ffd166",
          500: "#f4b942",
          ink: "#5c4212",
        },
        reef: {
          // Dominant (D) — bright green
          400: "#76db82",
          500: "#4ed05d",
          600: "#2da93c",
          ink: "#123616",
        },
      },
      fontFamily: {
        display: ["ui-rounded", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
