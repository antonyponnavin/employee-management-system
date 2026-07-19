/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        sand: "#f6f4ef",
        gold: "#fca311",
        mist: "#e5ecf4",
        pine: "#0d5c63"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(20, 33, 61, 0.08)"
      }
    }
  },
  plugins: []
};
