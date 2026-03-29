/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ivory: '#FAF6EE',
          navy: '#1A2744',
          gold: '#C49A1A',
          goldLight: '#E8BF4A',
          goldDark: '#9A7410',
          text: '#3D3826',
        },
        primary: {
          DEFAULT: '#765b00',
          container: '#c49a1a',
        },
        surface: {
          DEFAULT: '#FAF6EE',
          container: '#f7edd3',
        },
        "on-surface": "#1f1b0c",
      },
      fontFamily: {
        headline: ["Noto Serif", "serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
