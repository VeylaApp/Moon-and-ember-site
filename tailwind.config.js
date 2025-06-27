const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'purple-moon': '#32174d',
        'green-forest': '#204e39',
        'orange-ember': '#ff781f',
        'gold-aura': '#d1a857',
        'ash-light': '#f0f0f0',
        'black-veil': '#0b0b0f',
      },
      fontFamily: {
        'header': ['"Cinzel Decorative"', 'serif'],
        'body': ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}
