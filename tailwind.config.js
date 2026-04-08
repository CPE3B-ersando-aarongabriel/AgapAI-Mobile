/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        agap: {
          950: "#041027",
          900: "#081A3A",
          850: "#0C2350",
          800: "#10306A",
          700: "#184D9B",
          600: "#2A72E8",
          500: "#4A8CFF",
          300: "#90BCFF",
          100: "#D9E8FF",
        },
        calm: {
          950: "#070C1C",
          900: "#101B36",
          800: "#15254A",
          700: "#223A6C",
          600: "#31558F",
          500: "#4B79BF",
          400: "#7EA3D9",
          300: "#A9C2E8",
          200: "#D3E0F5",
        },
        lavender: {
          600: "#6F6BE8",
          500: "#8B86F4",
          400: "#A7A2FB",
          300: "#C3BEFF",
        },
        slateBlue: "#283754",
        moon: "#E7EFFC",
      },
      borderRadius: {
        card: "20px",
        panel: "16px",
      },
      boxShadow: {
        card: "0px 10px 24px rgba(2, 12, 32, 0.45)",
        elevated: "0px 14px 32px rgba(7, 15, 35, 0.38)",
      },
      fontFamily: {
        sans: ["Inter", "System"],
        heading: ["Inter", "System"],
      },
    },
  },
  plugins: [],
};
