/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        melo: {
          bg: '#F7F7F2',
          surface: '#FFFFFF',
          soft: '#F1F3EF',
          heading: '#26232B',
          body: '#55545C',
          secondary: '#85828A',
          muted: '#A9A6AD',
          plum: '#321044',
          'plum-light': '#481961',
          purple: '#7137A8',
          'purple-light': '#9B51CA',
          orange: '#FF9B32',
          'orange-hover': '#F28B20',
          lavender: '#F1EAF8',
          'lavender-light': '#F9F5FC',
          peach: '#FFF1E3',
          'peach-light': '#FFF8F0',
          sage: '#6D8B75',
          'sage-light': '#EAF0E9',
          border: '#E8E7E2',
        },
        brand: {
          50: '#F1EAF8',
          100: '#E2D4F2',
          200: '#C7AEE6',
          300: '#AC87DA',
          400: '#9B51CA',
          500: '#7137A8', // Primary MELO Purple
          600: '#5F2D8E',
          700: '#481961',
          800: '#321044', // Deep Plum
          900: '#230B30',
        },
        accent: {
          50: '#FFF8F0',
          100: '#FFF1E3',
          200: '#FFE1C2',
          300: '#FFCE9B',
          400: '#FFB366',
          500: '#FF9B32', // MELO Accent Orange
          600: '#E6821F',
          700: '#B8610F',
        },
        sage: {
          50: '#F4F7F4',
          100: '#EAF0E9',
          200: '#D5E2D4',
          300: '#B0C9AE',
          400: '#8DAF8C',
          500: '#6D8B75', // MELO Supporting Sage Green
          600: '#56715E',
          700: '#415748',
        },
        sunset: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      boxShadow: {
        'soft': '0 8px 32px rgba(40, 30, 50, 0.06)',
        'melo': '0 12px 36px -4px rgba(50, 16, 68, 0.08)',
        'glow-purple': '0 0 25px -4px rgba(113, 55, 168, 0.3)',
        'glow-orange': '0 0 25px -4px rgba(255, 155, 50, 0.35)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
