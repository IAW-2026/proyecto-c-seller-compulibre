/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#485696",
        secondary: "#E7E7E7",
        accent: "#F9C784",
        highlight: "#FC7A1E",
      },
    },
  },
  plugins: [],
};