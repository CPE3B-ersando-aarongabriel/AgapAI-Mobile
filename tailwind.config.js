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
        slateBlue: "#283754",
        moon: "#E7EFFC",
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        card: "0px 10px 24px rgba(2, 12, 32, 0.45)",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
