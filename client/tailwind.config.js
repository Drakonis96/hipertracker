/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-fg': 'rgb(var(--accent-fg-rgb) / <alpha-value>)',
      },
      borderRadius: {
        el: '8px',
        card: '12px',
        modal: '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease',
        'fade-in-down': 'fade-in-down 200ms ease',
        'scale-in': 'scale-in 200ms cubic-bezier(.2,.8,.2,1)',
        'sheet-up': 'sheet-up 200ms cubic-bezier(.2,.8,.2,1)',
        'pop-in': 'pop-in 200ms cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [],
};
