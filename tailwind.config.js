/** @type {import('tailwindcss').Config} */

// 'Sepia' palette: https://aidanweltner.com/fcod/a-warm-gray-color-palette-for-tailwindcss/
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'sepia-900': '#2B2718',
        'sepia-800': '#474030',
        'sepia-700': '#695F4D',
        'sepia-600': '#968A75',
        'sepia-500': '#BFB4A3',
        'sepia-400': '#E0DACE',
        'sepia-300': '#F0EBE4',
        'sepia-200': '#F7F5F2',
        'sepia-100': '#FCFBFA',
      },
    },
  },
  plugins: [],
};
