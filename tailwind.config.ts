import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        harbor: "#30475E",   // primary - headers, buttons
        seafoam: "#4D4C7D",  // accent - positive/teal highlights
        cream: "#EEEEEE",    // background
        lilac: "#787A91"     // secondary accent - highlights, badges
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
