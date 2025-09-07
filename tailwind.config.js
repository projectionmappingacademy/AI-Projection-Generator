/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { // For headings and important text
          DEFAULT: 'hsl(210, 30%, 95%)',
          foreground: 'hsl(210, 20%, 85%)'
        },
        secondary: { // For backgrounds
          DEFAULT: 'hsl(222, 22%, 12%)',
          foreground: 'hsl(210, 20%, 85%)'
        },
        accent: {
          DEFAULT: '#bd10e0',
          foreground: '#FFFFFF'
        },
        card: {
          DEFAULT: 'hsl(222, 22%, 18%)',
          foreground: 'hsl(210, 20%, 85%)',
        },
        'brand-green': '#417505',
      },
      keyframes: {
        'fade-in-up': {
            '0%': {
                opacity: '0',
                transform: 'translateY(10px)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            },
        },
      },
      animation: {
          'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
