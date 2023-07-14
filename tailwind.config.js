/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        transparent: "transparent",
        primary: "#4A54EB",
        dark: {
          DEFAULT: "#020202",
          secondary: "#090909",
          tertiary: "#0f0f0f",
        },
        light: {
          DEFAULT: "#ffffff",
          secondary: "#f7f7f7",
        },
        gray: {
          dark: {
            DEFAULT: "#1a1b1a",
            secondary: "#1C1C1C",
          },
          light: {
            DEFAULT: "#f1f1f1",
            secondary: "#E5e5e5",
          },
        },
      },
    },
  },
  plugins: [],
};
