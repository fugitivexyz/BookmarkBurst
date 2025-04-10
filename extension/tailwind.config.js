/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './popup/**/*.{ts,tsx,html}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F7DF3',
          dark: '#3060E0',
          light: '#7299F6'
        },
        secondary: {
          DEFAULT: '#38BDF8',
          dark: '#0EA5E9'
        },
        accent: {
          DEFAULT: '#F43F5E',
          dark: '#E11D48'
        },
        background: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0, 0, 0, 0.8)',
        'brutal-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.8)',
        'brutal-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}; 