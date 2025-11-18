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
        // Design system from instructions.md
        primary: {
          DEFAULT: '#b2ac88',
          dark: '#4b6e48'
        },
        secondary: {
          DEFAULT: '#898989'
        },
        background: {
          DEFAULT: '#f2f0ef',
          dark: '#1a1a1a'
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#2d2d2d'
        },
        accent: {
          DEFAULT: '#4b6e48'
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
