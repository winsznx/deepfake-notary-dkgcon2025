/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand color
        brand: {
          DEFAULT: '#A35E47',
          primary: '#A35E47'
        },
        primary: {
          DEFAULT: '#A35E47',
          dark: '#8A4E3A'
        },
        secondary: {
          DEFAULT: '#898989',
          light: '#9C9A9A',
          dark: '#464646'
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#000000'
        },
        surface: {
          DEFAULT: '#F2F2F2',
          dark: '#1F1F1F'
        },
        accent: {
          DEFAULT: '#A35E47'
        },
        text: {
          primary: '#000000',
          secondary: '#464646',
          'primary-dark': '#EAEAEA',
          'secondary-dark': '#9C9A9A'
        },
        border: {
          DEFAULT: '#9C9A9A',
          dark: '#464646'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif']
      }
    }
  },
  plugins: []
};
