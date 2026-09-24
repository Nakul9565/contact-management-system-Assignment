/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        beige: {
          50: '#FAF8F5',   // Canvas / page background
          100: '#F5F2EB',  // Surface secondary / inputs
          200: '#E8E4DC',  // Primary borders
          300: '#DFD8CC',  // Darker borders
          400: '#C2B9A7',
          500: '#9E937F',
        },
        clay: {
          50: '#FDF5F2',
          100: '#F7EDE8',  // Light terracotta chip background
          500: '#D97757',  // Claude primary terracotta
          600: '#C96442',  // Button hover terracotta
          700: '#A94E31',
        },
        charcoal: {
          900: '#23211E',  // Primary text
          700: '#524D46',  // Secondary text
          500: '#857D73',  // Muted text
          400: '#A69E94',  // Light placeholder
        },
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(35, 33, 30, 0.05), 0 1px 2px rgba(35, 33, 30, 0.03)',
        'warm-md': '0 4px 14px rgba(35, 33, 30, 0.07), 0 1px 3px rgba(35, 33, 30, 0.04)',
        'warm-lg': '0 10px 30px rgba(35, 33, 30, 0.08), 0 2px 6px rgba(35, 33, 30, 0.04)',
        'clay-glow': '0 4px 18px rgba(217, 119, 87, 0.28)',
      },
    },
  },
  plugins: [],
};
