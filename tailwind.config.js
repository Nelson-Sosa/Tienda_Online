/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '390px',
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          light: '#EEF2FF',
          soft: '#E0E7FF',
          dark: '#4338CA',
        },
        danger: '#EF4444',
        border: '#E5E7EB',
        'background-secondary': '#F9FAFB',
      },
    },
  },
  plugins: [],
}
