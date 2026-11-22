/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sand: 'rgb(var(--sand) / <alpha-value>)',
        ink: '#12203A',
        primary: {
          50: '#F4F7FB',
          100: '#E6EDF6',
          200: '#C5D4E8',
          300: '#93A9C9',
          400: '#5C7399',
          500: '#2C4A73',
          600: '#1B3358',
          700: '#152848',
          800: '#10203C',
          900: '#0B1730',
        },
        secondary: {
          50: '#F4F6F8',
          100: '#E8EDF2',
          200: '#D0D8E2',
          300: '#A8B6C8',
          400: '#6E829A',
          500: '#4A6278',
          600: '#3A5166',
          700: '#2C4052',
          800: '#1E2E3C',
          900: '#121C28',
        },
        accent: {
          50: '#FBF6E8',
          100: '#F6EBC4',
          200: '#EED48A',
          300: '#E4C15A',
          400: '#D4A72C',
          500: '#C8961A',
          600: '#A67C12',
          700: '#7D5E0E',
        }
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      }
    },
  },
  plugins: [],
}

