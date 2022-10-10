/** @type {import('tailwindcss').Config} */

// 'Sepia' palette: https://aidanweltner.com/fcod/a-warm-gray-color-palette-for-tailwindcss/
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      'ibm-mono': ['IBM Plex Mono', 'monospace'],
    },
    extend: {
      colors: {
        // Sepia
        'sepia-900': '#2B2718',
        'sepia-800': '#474030',
        'sepia-700': '#695F4D',
        'sepia-600': '#968A75',
        'sepia-500': '#BFB4A3',
        'sepia-400': '#E0DACE',
        'sepia-300': '#F0EBE4',
        'sepia-200': '#F7F5F2',
        'sepia-100': '#FCFBFA',
        // Carbon
        'carbon-900': '#131212',
        'carbon-800': '#1f1e1e',
        'carbon-700': '#424141',
        'carbon-600': '#5a5959',
        'carbon-500': '#717171',
        'carbon-400': '#898989',
        'carbon-300': '#a1a0a0',
        'carbon-200': '#b8b8b8',
        'carbon-100': '#e7e7e7',
      },
    },
  },
  plugins: [],
};
