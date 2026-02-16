/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
           50: '#fef2f2',
           100: '#fee2e2',
           500: '#ef4444',
           600: '#dc2626',
           900: '#7f1d1d',
        },
        dark: {
           bg: '#111827', // Gray-900
           card: '#1f2937', // Gray-800
           text: '#f3f4f6', // Gray-100
        },
        light: {
           bg: '#f9fafb', // Gray-50
           card: '#ffffff', // White
           text: '#1f2937', // Gray-800
        }
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}