/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf5',
          100: '#d7f7e7',
          200: '#b2ead0',
          300: '#84d9b2',
          400: '#52bf8f',
          500: '#2ba16f',
          600: '#1d825b',
          700: '#18684a',
          800: '#16533d',
          900: '#134336'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.18)'
      }
    },
  },
  plugins: [],
};
