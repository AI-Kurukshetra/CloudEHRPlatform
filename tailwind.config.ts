import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#112330",
        mist: "#edf6f4",
        tide: "#d6ebe8",
        teal: "#0f766e",
        coral: "#d97757",
        sand: "#f7f0e7"
      },
      boxShadow: {
        card: "0 20px 40px rgba(17, 35, 48, 0.08)"
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;

