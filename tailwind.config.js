/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          50: '#edfdf3',
          100: '#d3f9e0',
          200: '#a8f0c4',
          300: '#71e4a2',
          400: '#3fd37d',
          500: '#25d366',
          600: '#1aa954',
          700: '#148544',
          800: '#0f6836',
          900: '#0b4f2a',
        },
        luxury: {
          50: '#f7f7fb',
          100: '#ececf5',
          200: '#d9dae9',
          300: '#b7b8d2',
          400: '#8e91b2',
          500: '#666a8b',
          600: '#4c506c',
          700: '#373a50',
          800: '#26293a',
          900: '#141722',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.18)',
        glow: '0 18px 45px rgba(37,211,102,0.22)',
      },
    },
  },
  plugins: [],
};
