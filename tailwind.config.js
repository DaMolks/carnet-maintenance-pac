/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1fe',
          100: '#cce3fd',
          200: '#99c7fb',
          300: '#66aaf9',
          400: '#338ef7',
          500: '#006ef5',
          600: '#0058c4',
          700: '#004293',
          800: '#002c62',
          900: '#001631',
        },
        success: {
          50: '#e6f7ed',
          100: '#ccefdb',
          200: '#99dfb7',
          300: '#66cf93',
          400: '#33bf6f',
          500: '#00af4b',
          600: '#008c3c',
          700: '#00692d',
          800: '#00471e',
          900: '#00230f',
        },
        danger: {
          50: '#fce6e6',
          100: '#f9cccc',
          200: '#f39999',
          300: '#ed6666',
          400: '#e73333',
          500: '#e10000',
          600: '#b40000',
          700: '#870000',
          800: '#5a0000',
          900: '#2d0000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        cardHover: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      },
    },
  },
  plugins: [],
}
