/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#FAF8FF',
          100: '#F3EEFF',
          200: '#E8DEFF',
          300: '#D5C4FF',
          400: '#BA9EFF',
          500: '#9D73FF',
          600: '#8248F6',
          700: '#6C2BD9',
          800: '#561EAF',
          900: '#46178F',
        },
        periwinkle: {
          50: '#F5F7FF',
          100: '#EBF0FE',
          200: '#D6E0FE',
          300: '#B8CBFC',
          400: '#8FAEF9',
          500: '#688DF5',
          600: '#476DEE',
          700: '#3254DB',
          800: '#2642B5',
          900: '#22388F',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 16px -2px rgba(124, 58, 237, 0.06), 0 1px 4px rgba(0, 0, 0, 0.02)',
        'glass': '0 12px 32px -4px rgba(124, 58, 237, 0.08), 0 4px 12px rgba(15, 23, 42, 0.03)',
        'glass-lg': '0 20px 48px -8px rgba(124, 58, 237, 0.12), 0 8px 24px rgba(15, 23, 42, 0.04)',
        'glass-glow': '0 0 32px -4px rgba(139, 92, 246, 0.3)',
        'bubble-user': '0 10px 25px -5px rgba(124, 58, 237, 0.35)',
        'bubble-ai': '0 8px 25px -5px rgba(148, 163, 184, 0.15)',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
