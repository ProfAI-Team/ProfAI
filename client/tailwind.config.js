/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A1A2E',
          light: '#16213E',
          dark: '#0F0F1A',
        },
        accent: {
          DEFAULT: '#0F3460',
          light: '#1A5276',
          blue: '#4A90D9',
          cyan: '#00D2FF',
        },
      },
    },
  },
  plugins: [],
};
