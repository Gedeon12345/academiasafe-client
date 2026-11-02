/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1E40AF', dark: '#172E7D', soft: '#EFF4FF' },        // bleu universitaire (confiance)
        safe: { DEFAULT: '#059669', dark: '#047857', soft: '#ECFDF5' },          // vert émeraude (sécurité, certification)
        taxi: { DEFAULT: '#FBBF24', deep: '#B45309' },                           // jaune des taxis : trajets, prix, appel à l'action
        surface: '#F8FAFC',
        ink: '#0F172A',
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Figtree', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.05), 0 10px 28px -16px rgba(15,23,42,.18)',
        lift: '0 2px 4px rgba(15,23,42,.06), 0 22px 40px -18px rgba(15,23,42,.30)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        pop: { '0%': { opacity: 0, transform: 'translateY(-8px) scale(.97)' }, '100%': { opacity: 1, transform: 'none' } },
        route: { to: { strokeDashoffset: '-40' } },
      },
      animation: { float: 'float 1.4s ease-in-out infinite', pop: 'pop .2s ease-out', route: 'route 2.4s linear infinite' },
    },
  },
  plugins: [],
};
