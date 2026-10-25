/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1E40AF', dark: '#1E3A8A' },
        safe: { DEFAULT: '#059669', dark: '#047857', soft: '#ECFDF5' },
        surface: '#F8FAFC',
        ink: '#0F172A',
      },
      fontFamily: { sans: ['Figtree', 'system-ui', 'sans-serif'] },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        pop: { '0%': { opacity: 0, transform: 'translateY(-8px) scale(.97)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { float: 'float 1.4s ease-in-out infinite', pop: 'pop .2s ease-out' },
    },
  },
  plugins: [],
};
