/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: '#F7F3EC',
        ink: '#1A2B2B',
        primary: {
          50: '#F3FAFA',
          100: '#E5F4F4',
          200: '#C5E6E6',
          300: '#B7DDDD',
          400: '#3D9A9A',
          500: '#0E8080',
          600: '#0A6E6E',
          700: '#085A5A',
          800: '#064848',
          900: '#043636',
        },
        secondary: {
          50: '#F3FAF6',
          100: '#E3F5EB',
          200: '#C3E8D2',
          300: '#8FCFAB',
          400: '#3D8B5A',
          500: '#2E7D4F',
          600: '#256B43',
          700: '#1C5534',
          800: '#143F26',
          900: '#0C2818',
        },
        accent: {
          50: '#FDF4F1',
          100: '#FBE6E0',
          200: '#F6C7BB',
          300: '#F0A08E',
          400: '#E8927C',
          500: '#E07A5F',
          600: '#C9654C',
          700: '#A84E38',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      }
    },
  },
  plugins: [],
}

