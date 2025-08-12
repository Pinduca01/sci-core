/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        'radiant-orange': '#FF4F18',
        'pure-white': '#FFFFFF',
        'fog-gray': '#F2F4F7',
        'coal-black': '#141517',
      },
      animation: {
        'gradient-slow': 'gradient-shift 25s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { 
            'background-position': '0% 50%' 
          },
          '50%': { 
            'background-position': '100% 50%' 
          },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slideUp': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)' 
          },
        },
        'slideDown': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          },
        },
        'scaleIn': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.9)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)' 
          },
        },
      },
    },
  },
  plugins: [],
}