import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        harbor: "#5782BB",   // primary - headers, buttons
        seafoam: "#64D7D6",  // accent - positive/teal highlights
        cream: "#FFFEEC",    // background
        lilac: "#C4AFF0"     // secondary accent - highlights, badges
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
