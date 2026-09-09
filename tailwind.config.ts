import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        harbor: "#9290C3",   // primary - headers, buttons
        seafoam: "#76ABAE",  // accent - positive/teal highlights
        cream: "#EEEEEE",    // background
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
